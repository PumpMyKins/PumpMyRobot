process.on('unhandledRejection', (reason) => {
    console.error(reason);
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
});

try {
    const config = require('./utils/config').getConfig();

    const PumpMyMongoose = require('./utils/pmmongoose');
    const connection = PumpMyMongoose.connection(config.mongoUrl); 
    connection.on('error', console.error.bind(console, "Mongo connexion ERROR")); 
    connection.once('open', function (){
        console.log("Mongo OK..."); 


        const discord = require('discord.js');
        const bot = new discord.Client();

        console.log("Starting " + config.bot.name);
        console.log("Node version: " + process.version);
        console.log("Discord.js version: " + discord.version);
    
        bot.on("ready", function () {
            bot.user.setUsername(config.bot.name);
            bot.user.setPresence({
                activity: {
                    name: config.bot.default_activity
                }
            });
            
            setupBot(config,PumpMyMongoose,bot);
    
        });
    
        bot.on("disconnected", function () {
    
            console.log("Disconnected!");
            process.exit(1);
        
        });
    
        bot.login(config.TOKEN);

    }); 
} catch (e){
	console.log(e.stack);
	console.log(process.version);
	process.exit();
}

function setupBot(config,pumpmymongoose,bot) {

    const GuildManager = require('./utils/guild_manager');
    GuildManager.setupAll(config,pumpmymongoose,bot);
    //joined a server
    bot.on("guildCreate", guild => {
        console.log("Joined a new guild[" + guild.id + "] : " + guild.name);
        GuildManager.setup(config,pumpmymongoose,guild);
    });

    const StreamSniper = require('./utils/stream_sniper');
    StreamSniper.setup(config,pumpmymongoose,bot);

    bot.on("presenceUpdate", function(oldMember, newMember) {
        console.log(newMember.user.username + " went " + newMember.user.presence.status);
        StreamSniper.stalk(config,pumpmymongoose,bot,newMember);
    });

}