const request = require("request");
const config = require("config");
const { fetchInvestment } = require("../src/app");

jest.mock("request", () => ({
  get: jest.fn(),
}));
jest.mock("config", () => ({
  investmentsServiceUrl: "",
  financialCompaniesServiceUrl: "",
}));

describe("Fetch investment", () => {
  it("Gets the data of a given investment via a given id", () => {
    //arrange
    const expectedResponse = {};
    const givenId = 0;
    //act
    request.get.mockImplementation(async () => {
      callback(expectedResponse);
      const fetchResponse = await fetchInvestment(givenId);
      //assert
      expect(fetchResponse).toEqual(expectedResponse);
    });
  });
  it("Returns an error when issues occur during the request", () => {
    //arrange
    const mockedError = "boo";
    const givenId = 0;
    //act
    request.get.mockRejectedValue(async () => {
      callback(new Error(mockedError));
      //assert
      expect(fetchInvestment(givenId)).rejects.toThrow(mockedError);
    });
  });
});
