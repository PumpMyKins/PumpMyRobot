var logger;
exports.setLogger = function(log) {
    logger = log;
}

var streamersList = null;

var isStalking = false;
var streamerUserId = "none";
var avatar = "default";

function startStalking(id){
    isStalking = true;
    streamerUserId = id;
}

function stopStalking(){
    isStalking = true;
    streamerUserId = "none";
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

function setPresence(bot,streamActivity){
    bot.user.setPresence({
        activity: {
            name: streamActivity.url.replace("https://www.",""),
            type: 'WATCHING',
            url: streamActivity.url,
            details: streamActivity.details,
            state: streamActivity.state
        }
    });
}

function getStreamersList(pumpmymongoose,next) {
    if(streamersList){
        next(null,streamersList);
    }else {
        pumpmymongoose.Streamer.find(null,function (err, result) {
            if (err) {
                logger.error("StreamSniper getStreamersList : streamer find..."); // throw error 
                throw err
            }else{
                streamersList = [];
                result.forEach(streamer => {
                    streamersList.push(streamer.streamer_id);
                });
            }
            next(err,streamersList);
        }); 
    }
}

exports.isStreamer = function(pumpmymongoose,user,next){
    getStreamersList(pumpmymongoose, function(err,streamers) {
        if (err) {
            logger.error("StreamSniper isStreamer : getStreamersList..."); // throw error
            throw err; 
        }
        
        if(streamers.includes(user.id)){
            next();
        }

    });
}

exports.stalk = function(config,pumpmymongoose,bot,user) {
    const userId = user.id;
    const activities = user.presence.activities;
    const streamActivity = getStreamActivity(activities);
    if(streamActivity){
        console.log(streamActivity);
        if(streamerUserId == userId){
            
            setPresence(bot,streamActivity);

        }else if(!isStalking){
            // start or update stalking
            startStalking(user.id)

            bot.user.setUsername(config.bot.stalking.name);
            if(avatar != "stalk"){
                //bot.user.setAvatar(config.bot.stalking.avatar_url).catch(console.error);
                avatar = "stalk";
            }
            setPresence(bot,streamActivity);

        }else{
            // already stalking user
            console.log("already stalking user " + streamerUserId);
        }
    }else{
        // if stalking user stop streaming
        if(streamerUserId == userId){
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
    getStreamersList(pumpmymongoose, function(err,streamers) { // get all streamer in GuildConfig
        if (err) {
            logger.error("StreamSniper setup : streamer find..."); // throw error
            throw err; 
        }

        const guilds = bot.guilds.cache;

        const FindException = {}; // exception to throw if streamer found
        try {
            streamers.forEach(streamer => {
                guilds.forEach(guild => {
                    if(guild.available){
                        guild.members.fetch({user: streamer, withPresences: true}).then(function(user) {
                            if(user){
                                exports.stalk(config,bot,pumpmymongoose,user)
                                if(isStalking){
                                    throw FindException;
                                }
                            }
                        });                        
                    }
                });
            });  
        } catch (e) {
                if (e !== FindException) throw e;
        }

        if(!isStalking){
            if(next) next(); // go next if no streamer streaming
        }
    
    });
};