const chai = require("chai")
const chaiHttp = require("chai-http")
const expect = chai.expect
chai.use(chaiHttp)


describe("Activate server", () => {
  it("Sets the server to listen to responses on the given port", (done) => {
    //arrange
    const adminUrl = "localhost:8083"
    //act
    chai.request(adminUrl)
    .get("/")
    .end( (err, res) => {
      //assert
      expect(res).to.have.status(200)
      expect(res.text).to.equal("")
      done()
    })
  })
})

//should be a test in investments but works as a basic idea
describe("Fetch investments", () => {
  it("Retrieves a random users investment data", (done) => {
    //arrange
    const adminUrl = "localhost:8081"
    const randomId = parseInt(Math.ceil(Math.random()*7))
    //act
    chai.request(adminUrl)
    .get(`/investments/${randomId}`)
    .end( (err, res) => {
      //assert
      expect(res).to.have.status(200)
      expect(res).to.have.header('content-type', 'application/json; charset=utf-8')
      expect(res.body[0]).to.have.property("id")
      expect(res.body[0].id).to.be.a("string")
      expect(res.body[0]).to.have.property("userId")
      expect(res.body[0].userId).to.be.a("string")
      expect(res.body[0]).to.have.property("firstName")
      expect(res.body[0].firstName).to.be.a("string")
      expect(res.body[0]).to.have.property("lastName")
      expect(res.body[0].lastName).to.be.a("string")
      expect(res.body[0]).to.have.property("investmentTotal")
      expect(res.body[0].investmentTotal).to.be.a("number")
      expect(res.body[0]).to.have.property("date")
      expect(res.body[0].date).to.have.length(10)
      expect(res.body[0]).to.have.property("holdings")
      expect(res.body[0].holdings).to.be.an("array").that.is.not.empty
      done()
    })
  })
})