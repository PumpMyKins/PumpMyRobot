process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
});

try {
    const discord = require('discord.js');
    const client = new discord.Client();
    
    console.log("Starting PumpMyRobot\nNode version: " + process.version + "\nDiscord.js version: " + discord.version);

    const config = require('./config').getConfig();

    client.login(config.TOKEN);

} catch (e){
	console.log(e.stack);
	console.log(process.version);
	process.exit();
}