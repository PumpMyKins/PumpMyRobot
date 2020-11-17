process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
  });

try {
    const discord = require('discord.js');
    const bot = new discord.Client();
    
    const config = require('./utils/config.js').getConfig();

    console.log("Starting " + config.bot.name);
    console.log("Node version: " + process.version);
    console.log("Discord.js version: " + discord.version);

    bot.on("ready", function () {
        bot.user.setUsername(config.bot.name)
        bot.user.setPresence({
            activity: {
                name: config.bot.default_activity
            }
        });  
        
        leaveUnallowedGuilds(config,bot)
        
        //after checking, register all others events
        registerAllOthersEvents(config,bot)

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

function registerAllOthersEvents(config,bot) {
    
    //joined a server
    bot.on("guildCreate", guild => {
        console.log("Joined a new guild[" + guild.id + "] : " + guild.name);
        leaveGuildIfUnallowed(config,guild)
    })

}

function leaveUnallowedGuilds(config,bot) {
    // allowed guilds checking
    const guilds = bot.guilds.cache
    guilds.forEach(guild => {
        leaveGuildIfUnallowed(config,guild)
    });
}

function leaveGuildIfUnallowed(config,guild) {
    if(!config.security.allowed_guilds_id.includes(guild.id)){
        console.log("guild[" + guild.id + "] not allowed ! leaving...");
        guild.leave()
    }else{
        //debug
        console.log("DEBUG guild[" + guild.id + "] allowed !");
    }
}