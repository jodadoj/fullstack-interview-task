const app = require("./app")
const config = require("config")

const userLogger = require("./util/logger")

app.listen(config.port, (err) => {
    if (err) {
      console.error("Error occurred starting the server", err)
      userLogger.log("error", `Error \"${err}\" occured starting the server`)
      process.exit(1)
    }
    console.log(`Server running on port ${config.port}`)
    
    userLogger.log("info", `Server began running on port ${config.port}`);
  })
  
