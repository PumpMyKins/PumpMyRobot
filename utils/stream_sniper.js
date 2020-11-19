var logger;
exports.setLogger = function(log) {
    logger = log;
}

var isStalking = false;
var stalkedUserId = "none";

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

exports.stalk = function(config,pumpmymongoose,bot,newMember) {
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
            bot.user.setAvatar(config.bot.stalking.avatar_url).catch(console.error);

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
            setup(config,pumpmymongoose,bot,function(stalking) {
                if(!stalking){ // after setup if not
                    bot.user.setUsername(config.bot.default.name);
                    bot.user.setAvatar(config.bot.default.avatar_url).catch(console.error);
                    bot.user.setActivity(config.bot.default.activity.name,{type: config.bot.default.activity.type});
                }
            }); // checking other streamer
        }
    }
};

exports.setup = function(config,pumpmymongoose,bot,next) {
    next(isStalking);
};