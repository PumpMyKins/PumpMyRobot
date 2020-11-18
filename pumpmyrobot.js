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
    var connection = PumpMyMongoose.connection(config.mongoUrl); 
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

    setupGuilds(config,pumpmymongoose,bot);

    //joined a server
    bot.on("guildCreate", guild => {
        console.log("Joined a new guild[" + guild.id + "] : " + guild.name);
        setupGuild(config,pumpmymongoose,guild);
    })

}

function setupGuilds(config,pumpmymongoose,bot) {
    const guilds = bot.guilds.cache;
    guilds.forEach(guild => {
        setupGuild(config,pumpmymongoose,guild);
    });
}

function setupGuild(config,pumpmymongoose,guild) {
    if(!leaveGuildIfUnallowed(config,guild)){
        // setup guild
        pumpmymongoose.Guild.findOne({'_gid': guild.id}, function(err, g) {
            if(g && !err){
                console.log("GuildConfig[" + g._gid + "] find...");
            }else{
                console.log("GuildConfig not find...");
                var GuildConfig = new pumpmymongoose.Guild();
                GuildConfig._gid = guild.id;
                GuildConfig.command_prefix = config.bot.default_command_prefix;
                GuildConfig.save(function(err1){
                    if(err1){
                        console.log("new GuildConfig save ERROR");
                        console.log(err1);
                    }else{
                        console.log("new GuildConfig saved !");
                    }
                });
            }
        })
    }
}

function leaveGuildIfUnallowed(config,guild) {
    if(!config.security.allowed_guilds_id.includes(guild.id)){
        console.log("guild[" + guild.id + "] not allowed ! leaving...");
        guild.leave();
        return true;
    }
    
    //debug
    console.log("DEBUG guild[" + guild.id + "] allowed !");
    return false;
    
}