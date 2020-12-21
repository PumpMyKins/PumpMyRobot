var logger;
exports.setLogger = function(log) {
    logger = log;
}

function addRolesToUser(user, roles, next) {
    // parcours roles
        // si user a le role, continue
        // set user role
    // return next si role set
}

exports.setupAll = function(pumpmymongoose,bot) {   // setup all at start
    // parcours list RoleReac
        // check si reaction
            // si non, ajoute
        // parcours les réactions
            // si bot réaction continue
            // addRolesToUser
            // delete user reaction
}

exports.delete = function(pumpmymongoose,guild) {   // delete data, on guild leave
    pumpmymongoose.RoleReac.deleteMany({guild_id: guild.id},function(err) {
        if(err){
            logger.error("RoleReacConfigs[" + guild.id + "] deleting error...");
            logger.error(err.stack);
            throw err;
        }
        logger.debug("RoleReacConfigs[" + guild.id + "] deleted...");
    });
} 

exports.userReacAdd = function(pumpmymongoose,messageReaction, user) {
    pumpmymongoose.RoleReac.findOne({message_id: messageReaction.message.id, reac_id : messageReaction.emoji.id}, function(err, result) {
        if (err) {
            logger.error("RoleReac userReacAdd : RoleReac findOne..."); // throw error
            throw err; 
        }

        if(!result || messageReaction.me || !(messageReaction.message.guild)){return;}
        console.info("RoleReac data")

        if(!user.bot){
            messageReaction.message.member.roles.add(result.role_ids)
        }
        messageReaction.users.remove(user.id)

    });
}

function reacRemove(pumpmymongoose,message) {
    
}
