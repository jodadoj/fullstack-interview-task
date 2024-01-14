const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")
const R = require("ramda")
const userLogger = require("./util/logger")

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

const getInvestment = R.pipeWith(
  (func, input) => Promise.resolve(input).then(func), 
  [R.pipe(R.prop('params'), R.prop('id'),fetchInvestment)]
)

const getCompany = R.pipeWith(
  (func, input) => Promise.resolve(input).then(func), 
  [R.pipe(R.prop('id'), fetchCompany)]
)

function getNameID(company){
  console.table(company)
  console.table({id: company.id, name: company.name})
  return {id: company.id, name: company.name}
}

function fetchInvestment(id){
  return new Promise((resolve, reject) => {
  request.get(
    {
      url: `${config.investmentsServiceUrl}/investments/${id}`, 
      json: true
    }, (e, r, investmentBody) => {
    if (e) {
      console.error(e)
      res.send(500)
      reject(e)
    }
      const investmentResponse = investmentBody
      resolve(investmentResponse[0])
    })
  })
}

function fetchCompany(id){
  return new Promise((resolve, reject) => {
    request.get(
    {
      url: `${config.financialCompaniesServiceUrl}/companies/${id}`, 
      json: true
    }, (e, r, companyBody) => {
    if (e) {
      console.error(e)
      res.send(500)
      reject(e)
    }
    const companyResponse = companyBody
    resolve(companyResponse)
  })
})
}

function sendCSV(investments, companyData){
  const headers = (
    "User,FirstName,LastName,Date,Holding,Value\n"
  )

  request.post(
  {
    url: `${config.investmentsServiceUrl}/investments/export`, 
    json: true,
    body: {csv: exportCSVBody}
  }, (e, r, body) => {
    if (e) {
      console.error(e)
      res.send(500)
    }
  })

  return {csv: exportCSVBody}
}

app.get("/investments/:id", async (req, res) => {
  userLogger.log("info", "Begining to attempt to fetch investment data");
  const investments = await getInvestment(req)

  const rowStrings = []

  for (const holding of investments.holdings){
    const holdingPercentage = holding.investmentPercentage
    const investmentValue = holdingPercentage * investments.investmentTotal
    const company = await getCompany(holding)
    
    const holdingCSV = (
      `${investments.userId},` +
      `${investments.firstName},` +
      `${investments.lastName},` +
      `${investments.date},` +
      `${company.name},` + 
      `${investmentValue}\n`
    )
    
    rowStrings.push(holdingCSV)
  }

  const headers = (
    "User,FirstName,LastName,Date,Holding,Value\n"
  )

  const exportCSVBody = [headers, rowStrings.join("")].join("")

  request.post(
  {
    url: `${config.investmentsServiceUrl}/investments/export`, 
    json: true,
    body: {csv: exportCSVBody}
  }, (e, r, body) => {
    if (e) {
      console.error(e)
      res.send(500)
    }
  })

  res.json({csv: exportCSVBody})
})

module.exports = {fetchInvestment}
module.exports = app