const request = require("request")
const config = require("config")
const {fetchInvestment} = require("../src/index")

jest.mock("request", () => ({get: jest.fn()}))
jest.mock("config", () => ({investmentsServiceUrl: "http://localhost:8081"}))

describe("Fetch investment", () => {
    it("Gets the data of a given investment via a given id", () => {
        //arrange
        const expectedResponse = {
            "id": "2",
            "userId": "2",
            "firstName": "Sheila",
            "lastName": "Aussie",
            "investmentTotal": 20000,
            "date": "2020-01-01",
            "holdings": [{"id": "1", "investmentPercentage": 0.5}, {"id": "2", "investmentPercentage": 0.5}]
        }
        //act
        request.get.mockImplementation(async () => {
        callback(expectedResponse);

        const givenId = 2
        const fetchResponse = await fetchInvestment(givenId)

        //assert
        expect(fetchResponse).toEqual(expectedResponse)
        
    })
    })
})