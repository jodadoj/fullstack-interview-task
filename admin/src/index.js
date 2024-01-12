const express = require("express")
const bodyParser = require("body-parser")
const config = require("config")
const request = require("request")

const app = express()

app.use(bodyParser.json({limit: "10mb"}))

app.get("/investments/:id", async (req, res) => {
  const {id} = req.params
  const investments = await new Promise((resolve, reject) => {
    request.get(`${config.investmentsServiceUrl}/investments/${id}`, (e, r, investments) => {
    if (e) {
      console.error(e)
      res.send(500)
      reject(e)
    }
      const investmentResponse = JSON.parse(investments)
      resolve(investmentResponse[0])
    })
  })

  res.send(investments)

  console.table(investments)
  console.table(investments.holdings)

  const companyData = []

  for (const holding of investments.holdings){
    console.table(holding)
  }
})

app.listen(config.port, (err) => {
  if (err) {
    console.error("Error occurred starting the server", err)
    process.exit(1)
  }
  console.log(`Server running on port ${config.port}`)
})
