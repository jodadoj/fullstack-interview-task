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

// function getNameID(company){
//   console.table(company)
//   console.table({id: company.id, name: company.name})
//   return {id: company.id, name: company.name}
// }

function fetchInvestment(id){
  const hostUrl = config.investmentsServiceUrl
  userLogger.log("info", `Attempting to fetch user ${id} investment data from ${hostUrl}`)
  return new Promise((resolve, reject) => {
  request.get(
    {
      url: `${hostUrl}/investments/${id}`, 
      json: true
    }, (err, r, investmentBody) => {
    if (err) {
      userLogger.log("error",`Failed to fetch user ${id} data from ${hostUrl} due to error "${err}"`)
      console.error(err)
      res.send(500)
      reject(err)
    }
      userLogger.log("info", `Successfully fetched user ${id} investment data from ${hostUrl}`)
      const investmentResponse = investmentBody
      resolve(investmentResponse[0])
    })
  })
}

function fetchCompany(id){
  const hostUrl = config.financialCompaniesServiceUrl
  userLogger.log("info", `Attempting to fetch company ${id} data from ${hostUrl}.`)
  return new Promise((resolve, reject) => {
    request.get(
    {
      url: `${hostUrl}/companies/${id}`, 
      json: true
    }, (err, r, companyBody) => {
    if (err) {
      userLogger.log("error",`Failed to fetch company ${id} data from ${hostUrl} due to error "${err}"`)
      console.error(err)
      res.send(500)
      reject(err)
    }
      userLogger.log("info", `Successfully fetched company ${id} data from ${hostUrl}`)
      const companyResponse = companyBody
      resolve(companyResponse)
    })
  })
}

async function getCSVString(investments){
  const headers = (
    "User,FirstName,LastName,Date,Holding,Value\n"
  )
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

  return [headers, rowStrings.join("")].join("")
}

function sendCSV(CSVString){
  const hostUrl = config.investmentsServiceUrl
  userLogger.log("info", `Attempting to send user CSV data ${CSVString} to ${hostUrl}`)
  return new Promise((resolve, reject) => {
  request.post(
    {
      url: `${hostUrl}/investments/export`, 
      json: true,
      body: {csv: CSVString}
    }, (err, r, body) => {
    if (err) {
      userLogger.log("error",`Failed to send user CSV data ${CSVString} to  ${hostUrl} due to error "${err}"`)
      console.error(err)
      res.send(500)
      reject(err)
    }
      userLogger.log("info", `Successfully sent user CSV data ${CSVString} to ${hostUrl}`)
      const CSVResponse = {csv: CSVString}
      resolve(CSVResponse)
    })
  })
}

const exportCSV = R.pipeWith(
  (func, input) => Promise.resolve(input).then(func), 
  [R.pipe(getInvestment, getCSVString, sendCSV)]
)

app.get("/investments/:id", async (req, res) => {
  userLogger.log("info", "Begining to attempt to fetch investment data");
  // const investments = await getInvestment(req)
  // const exportCSVBody = await getCSVString(investments)
  // res.json(await sendCSV(exportCSVBody))

  //may attempt to put everything into one statement
  // res.json(exportCSV(req))

  res.json(await sendCSV(await getCSVString(await getInvestment(req))))

})

module.exports = {fetchInvestment}
module.exports = app