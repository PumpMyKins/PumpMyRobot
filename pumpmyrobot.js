const logger = require('./libs/logger').logger;

process.on('unhandledRejection', (err) => {
    logger.error(err.stack);
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
        const bot = new discord.Client({partials : ['MESSAGE', 'GUILD_MEMBER',  'CHANNEL', 'REACTION']});

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

    // role reac assign module
    const RoleReac = require('./utils/role_reac');
    RoleReac.setLogger(logger)
    RoleReac.setupAll(pumpmymongoose,GuildManager,bot); // checking reactions to add role

    //leaved a server
    bot.on("guildDelete", guild => {
        logger.info("Leaved guild[" + guild.id + "] : " + guild.name);
        logger.warn("Deleting guild[" + guild.id + "]'s data : " + guild.name);
        // remove data function
        GuildManager.delete(pumpmymongoose,guild);
        RoleReac.delete(pumpmymongoose,guild);
    });

    //Role Reac messageReactionAdd
    // autoremove member reaction after role assign
    // if user already have role, juste remove it
    bot.on("messageReactionAdd", async (messageReaction, user) => {

        if (messageReaction.partial) {
            // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
            try {
                await messageReaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message: ', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }

        logger.info("Message Reaction Add : " + messageReaction + "\n" + user.id);
        // LOG
        RoleReac.userReacAdd(pumpmymongoose,messageReaction,user)
    });

    //Role Reac messageReactionRemove
    // if bot reaction removed, add again
    bot.on("messageReactionRemove", async (messageReaction, user) => {

        if (messageReaction.partial) {
            // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
            try {
                await messageReaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message: ', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }

        logger.info("Message Reaction Remove : " + messageReaction + "\n" + user.id);
        // LOG
        //RoleReac.userRemoveReac(pumpmymongoose,messageReaction,user)
    });

    //Role Reac messageReactionRemoveAll
    // if bot reaction removed, add again
    bot.on("messageReactionRemoveAll", async (message) => {

        if (message.partial) {
            // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
            try {
                await message.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message: ', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }

        logger.info("Message Reaction Remove All : " + message);
        // LOG
        //RoleReac.messageRemoveAllReac(pumpmymongoose,message)
    });

    //Role Reac messageReactionRemoveEmoji
    // if bot reaction removed, add again
    bot.on("messageReactionRemoveEmoji", async (messageReaction) => {
        
        if (messageReaction.partial) {
            // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
            try {
                await messageReaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message: ', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }
        
        logger.info("Message Reaction Remove Emoji : " + messageReaction);
        // LOG
        //RoleReac.messageRemoveEmojiReac(messageReaction)
    });

    //Role Reac messageDelete
    // if message delete, warn admin & remove message data

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

    //Commands setup
    client.commands = new Discord.Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
	    const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
        logger.info("CommandsManager : command \"" +command.name + "\" added")
    }

}