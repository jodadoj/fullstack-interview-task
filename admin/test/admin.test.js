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