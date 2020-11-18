var Config = {};
try {
    Config = require("../config.json");
    Config.mongoUrl = "mongodb+srv://" + Config.mongo.username + ":" + Config.mongo.password + "@" + Config.mongo.host + "/" + Config.mongo.database + "?retryWrites=true&w=majority";
} catch (e){
    console.log("Please create a copy of config.example.json named config.json");
    console.log(e.stack)
}

exports.getConfig = () => {
    return Config;
}