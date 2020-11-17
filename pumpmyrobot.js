process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
});

try {
    const discord = require('discord.js');
    const bot = new discord.Client();
    
    console.log("Starting PumpMyRobot");
    console.log("Node version: " + process.version);
    console.log("Discord.js version: " + discord.version);

    const config = require('./utils/config.js').getConfig();

    bot.on("ready", function () {
        bot.user.setPresence({
            activity: {
                name: "PumpMyKins"
            }
        });        
    });

    bot.on("disconnected", function () {

        console.log("Disconnected!");
        process.exit(1);
    
    });

    bot.login(config.TOKEN);

} catch (e){
	console.log(e.stack);
	console.log(process.version);
	process.exit();
}