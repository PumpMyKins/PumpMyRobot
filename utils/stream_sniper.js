var logger;
exports.setLogger = function(log) {
    logger = log;
}

var isStalking = false;
var stalkedUserId = "none";
var avatar = "default";

function startStalking(id){
    isStalking = true;
    stalkedUserId = id;
}

function stopStalking(){
    isStalking = true;
    stalkedUserId = "none";
}

function getStreamActivity(activities) {
    for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        if(activity.type == "STREAMING"){
            return activity;
        }
    }
    return null;
}

function setPresence(bot,activity){
    //bot.user.setPresence({streamActivity})
    // OR
    bot.user.setPresence({
        activity: {
            name: streamActivity.name,
            type: 'STREAMING',
            url: streamActivity.url,
            details: streamActivity.details,
            state: streamActivity.state
        }
    });
}

exports.isStreamer = function(pumpmymongoose,member,next){
    pumpmymongoose.Stalker.exists({streamer_id: member.user.id},function (err, result) {
        if (err) {
            logger.error("StreamSniper isStreamer : stalker findOne..."); // throw error
            throw err; 
        }
        if(result){
            next();
        }
    });   
}

exports.stalk = function(config,bot,newMember) {
    const userId = newMember.user.id;
    const activities = newMember.user.presence.activities;
    const streamActivity = getStreamActivity(activities);
    if(streamActivity){
        console.log(streamActivity);
        if(stalkedUserId == userId){
            
            setPresence(bot,activity);

        }else if(!isStalking){
            // start or update stalking
            startStalking(newMember.user.id)

            bot.user.setUsername(config.bot.stalking.name);
            if(avatar != "stalk"){
                //bot.user.setAvatar(config.bot.stalking.avatar_url).catch(console.error);
                avatar = "stalk";
            }
            setPresence(bot,activity);

        }else{
            // already stalking user
            console.log("already stalking user " + stalkedUserId);
        }
    }else{
        // if stalking user stop streaming
        if(stalkedUserId == userId){
            // stop stalking
            console.log("stop stalking");

            stopStalking(); // reset value
            exports.setup(config,pumpmymongoose,bot,function(stalking) {
                if(!stalking){ // after setup if not
                    bot.user.setUsername(config.bot.default.name);
                    if(avatar != "default"){
                        //bot.user.setAvatar(config.bot.default.avatar_url).catch(console.error);
                        avatar = "default";
                    }
                    bot.user.setActivity(config.bot.default.activity.name,{type: config.bot.default.activity.type});
                }
            }); // checking other streamer
        }
    }
};

exports.setup = function(config,pumpmymongoose,bot,next) {
    const guilds = bot.guilds.cache;
    pumpmymongoose.Stalker.find(null, function (err, streamers) { // get all streamer in GuildConfig
        if (err) {
            logger.error("StreamSniper setup : stalker find..."); // throw error
            throw err; 
        }

        const FindException = {}; // exception to throw if streamer found
        try {
            streamers.forEach(streamer => {
                guilds.forEach(guild => {
                    const member = guild.members.get(streamer.streamer_id);
                    if(member){
                        exports.stalk(config,bot,member)
                        if(isStalking){
                            throw FindException;
                        }
                    }
                });
            });  
        } catch (e) {
            if (e !== FindException) throw e;
        }
        if(!isStalking){
            next();
        }
    });
};