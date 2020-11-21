const logger = require('./libs/logger').logger;

process.on('unhandledRejection', (err) => {
    logger.error(e.stack);
    process.exit(1);
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received.');
});

try {
    const config = require('./libs/config')(logger);

    const PumpMyMongoose = require('./libs/pmmongoose');
    const connection = PumpMyMongoose.connection(config.mongoUrl); 
    connection.on('error', function() {logger.error("Mongo connexion ERROR")}); 
    connection.once('open', function (){
        logger.info("Mongo OK..."); 


        const discord = require('discord.js');
        const bot = new discord.Client();

        logger.info("Starting " + config.bot.name);
        logger.info("Node version: " + process.version);
        logger.info("Discord.js version: " + discord.version);
    
        bot.on("ready", function () {
            setupBot(config,PumpMyMongoose,bot);
        });
    
        bot.on("disconnected", function () {
    
            logger.info("Disconnected!");
            process.exit(1);
        
        });
    
        bot.login(config.TOKEN);

    }); 
} catch (e){
	logger.error(e.stack);
	logger.error(process.version);
	process.exit();
}

function setupBot(config,pumpmymongoose,bot) {

    // guild manager module
    const GuildManager = require('./utils/guild_manager');
    GuildManager.setLogger(logger);
    GuildManager.setupAll(config,pumpmymongoose,bot);

    // stream detector module
    const StreamSniper = require('./utils/stream_sniper');
    StreamSniper.setLogger(logger);
    StreamSniper.setup(config,pumpmymongoose,bot, function(stalking) {
        if(!stalking){ // after setup if not stalking set default bot profile
            bot.user.setUsername(config.bot.default.name);
            //bot.user.setAvatar(config.bot.default.avatar_url).catch(console.error);
            bot.user.setActivity(config.bot.default.activity.name,{type: config.bot.default.activity.type});
        }
    });

    //joined a server
    bot.on("guildCreate", guild => {
        logger.info("Joined a new guild[" + guild.id + "] : " + guild.name);
        GuildManager.setup(config,pumpmymongoose,guild);
        StreamSniper.setup(config,pumpmymongoose,bot);
    });

    // events deduplicator module
    const EventsDeduplicator = require('./libs/events_deduplicator');
    EventsDeduplicator.setLogger(logger);
    bot.on("presenceUpdate", function(oldMember, newMember) {
        EventsDeduplicator.presenceUpdateEvent(bot,oldMember,newMember,function() {
            const user = newMember.user;
            logger.info(user.username + " went " + user.presence.status);
            StreamSniper.isStreamer(pumpmymongoose,user,function() {
                StreamSniper.stalk(config,pumpmymongoose,bot,user);
            });
        });        
    });

}