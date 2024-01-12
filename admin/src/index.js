const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/:id", async (req, res) => {
  const {id} = req.params
  const investments = await new Promise((resolve, reject) => {
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
  
  console.table(investments)
  console.table(investments.holdings)

  const companyData = []

  for (const holding of investments.holdings){
    console.table(holding)
    const currentId = holding.id
    const company = await new Promise((resolve, reject) => {
      request.get(
        {
          url: `${config.financialCompaniesServiceUrl}/companies/${currentId}`, 
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
      console.table(company)
      companyData.push(company)
    }

    console.table(companyData)

    //want {csv: 'user, first name, last name, date, holding, value} in csv format

    const headers = (
      "User, First Name, Last Name, Date, Holding, Value\n"
    )

    for (const holding in investments.holdings){
      const currentHolding = investments.holdings[holding]
      const holdingPercentage = currentHolding.investmentPercentage
      console.log(holdingPercentage)
      const investmentValue = holdingPercentage * investments.investmentTotal
      console.log(investmentValue)

      const holdingCSV = (
        `${investments.userId},` +
        `${investments.firstName},` +
        `${investments.lastName},` +
        `${investments.date},` +
        //holdings will enter the companyData list at the same index as originally found
        //this method is therefore safer than manipulation using index asuuming awaits work as intended
        `${companyData[holding].name},` + 
        `${investmentValue}\n`
      )

      console.log(holdingCSV)
    }

  //may need await
  request.post(
  {
    url: `${config.investmentsServiceUrl}/investments/export`, 
    json: true,
    body: {csv: headers}
  }, (e, r, body) => {
    if (e) {
      console.error(e)
      res.send(500)
    }
  })


  res.send(investments)
})

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})
