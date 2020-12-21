var logger = null;
module.exports = exports = function(log) {
    logger = log;

    var Config = {};
    try {
        Config = require("../config.json");
        logger.info("Config OK !")
        Config.mongoUrl = "mongodb+srv://" + Config.mongo.username + ":" + Config.mongo.password + "@" + Config.mongo.host + "/" + Config.mongo.database + "?retryWrites=true&w=majority";
    } catch (e){
        logger.error("Please create a copy of config.example.json named config.json");
        logger.error(e.stack)
    }
    return Config;
}