var Config = {};
try {
    Config = require("./config.json");
} catch (e){
	console.log("Please create a copy of config.example.json named config.json" + e.stack);
}

exports.getConfig = () => {
    return Config;
}