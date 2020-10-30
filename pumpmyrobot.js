process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
});

try {
    const discord = require('discord.js');
    const bot = new discord.Client();
    
    console.log("Starting PumpMyRobot\nNode version: " + process.version + "\nDiscord.js version: " + discord.version);

    const config = require('./config').getConfig();

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