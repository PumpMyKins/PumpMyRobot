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

exports.setupAll = function(config,pumpmymongoose,bot) {
    const guilds = bot.guilds.cache;
    guilds.forEach(guild => {
        setupGuild(config,pumpmymongoose,guild);
    });
};
exports.setup = setupGuild;
