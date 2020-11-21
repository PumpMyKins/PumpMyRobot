var logger;
exports.setLogger = function(log) {
    logger = log;
}

function setupGuild(config,pumpmymongoose,guild) {
    if(!leaveGuildIfUnallowed(config,guild)){
        // setup guild
        pumpmymongoose.Guild.findOne({'_gid': guild.id}, function(err, g) {
            if(g && !err){
                logger.info("GuildConfig[" + g._gid + "] find...");
            }else{
                logger.warn("GuildConfig not find...");
                var GuildConfig = new pumpmymongoose.Guild();
                GuildConfig._gid = guild.id;
                GuildConfig.command_prefix = config.bot.default_command_prefix;
                GuildConfig.save(function(err1){
                    if(err1){
                        logger.error("new GuildConfig save ERROR");
                        logger.error(err1.stack);
                    }else{
                        logger.info("new GuildConfig saved !");
                    }
                });
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
    logger.info("DEBUG guild[" + guild.id + "] allowed !");
    return false;
    
}

exports.setupAll = function(config,pumpmymongoose,bot) {
    const guilds = bot.guilds.cache;
    guilds.forEach(guild => {
        setupGuild(config,pumpmymongoose,guild);
    });
};
exports.setup = setupGuild;
