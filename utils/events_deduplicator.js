var logger;
exports.setLogger = function(log) {
    logger = log;
}

const duplicator = [];

function presentOnSeveralGuild(bot,newMember) {
    var result = false;
    const guilds = bot.guilds.cache;
    guilds.forEach(guild => {
        if(!result && guild.id != newMember.guild.id && guild.member(newMember.user)){
            result = true;
        }
    });
    return result;
}

function isEventDuplicate(data) {
    const jsonData = JSON.stringify(data);
    if(duplicator.includes(jsonData)){
        duplicator.splice(duplicator.indexOf(jsonData),1);
        return true;
    }else{
        duplicator.push(jsonData);
        return false;
    }
}

exports.presenceUpdateEvent = function(bot,oldMember, newMember,next) {
    const data = {... newMember};
    delete data.guild;
    if(!presentOnSeveralGuild(bot,newMember) || !isEventDuplicate(data)){
        next();
    }
}