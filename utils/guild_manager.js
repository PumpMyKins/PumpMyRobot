var logger;
exports.setLogger = function(log) {
    logger = log;
}

function setupGuild(config,pumpmymongoose,guild) {
    if(!leaveGuildIfUnallowed(config,guild)){
        // setup guild
        pumpmymongoose.Guild.exists({'_id': guild.id}, function(err, result) {
            if(err){
                logger.error("GuildConfig[" + guild.id + "] setup checking error...");
                logger.error(err.stack);
                throw err;
            }else{
                if(result){
                    logger.info("GuildConfig[" + guild.id + "] found...");
                }else{
                    logger.warn("GuildConfig[" + guild.id + "] not found...");
                    var GuildConfig = new pumpmymongoose.Guild();
                    GuildConfig._id = guild.id;
                    GuildConfig.command_prefix = config.bot.default_command_prefix;
                    GuildConfig.save(function(err1){
                        if(err1){
                            logger.error("GuildConfig[" + guild.id + "] creating error...");
                            logger.error(err1.stack);
                        }else{
                            logger.info("GuildConfig[" + guild.id + "] created...");
                        }
                    });
                }
            }
        })
    }
}

function leaveGuildIfUnallowed(config,guild) {
    if(!config.security.allowed_guilds_id.includes(guild.id)){
        logger.warn("guild[" + guild.id + "] not allowed ! leaving...");
        guild.leave();
        return true;
    }
    
    //debug
    logger.debug("guild[" + guild.id + "] allowed !");
    return false;
    
}

exports.setupAll = function(config,pumpmymongoose,bot) {
    const guilds = bot.guilds.cache;
    guilds.forEach(guild => {
        setupGuild(config,pumpmymongoose,guild);
    });
};
exports.setup = setupGuild;
