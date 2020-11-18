const mongoose = require('mongoose'), Schema = mongoose.Schema
mongoose.set('useCreateIndex', true);

var RoleSchema = new Schema({
    _guild : {type: Schema.ObjectId, ref: 'Guild'},
    role_id : { type: String, required : true},
    weight : { type: Number, required : true}
});

var RoleReacSchema = new Schema({
    _guild : {type: Schema.ObjectId, ref: 'Guild'},
    channel_id : { type: String, required : true},
    message_id : { type: String, required : true},
    reac_id : { type: String, required : true},
    remove_on_leave : { type: Boolean, required : true},
    roles : [RoleSchema]
});

var GuildSchema = new Schema({
    _gid : { type: String, unique : true, index : true, required : true}, 
    command_prefix : { type: String, required : true},
    special_channels : {
        welcome_channel_id : { type: String, default: 'none'},
        rules_channel_id : { type: String, default: 'none'}
    },
    log : {
        log_channel_id : { type: String, default: 'none'},
        untrack_channels_id : [String],
        untrack_categories_id : [String]
    },
    roles : {
        roles_reac : [{type: Schema.ObjectId, ref: 'RoleReac'}],
        roles : [RoleSchema]
    },
    archives : {
        public_categorie_id : { type: String, default: 'none'},
        private_categorie_id : { type: String, default: 'none'},
    }
});

const GuildModel = mongoose.model('guilds', GuildSchema);
const RoleReacModel = mongoose.model('rolereacs', RoleReacSchema);
const RoleModel = mongoose.model('roles', RoleSchema);

function Connection(url) {
    mongoose.connect(url,{ useNewUrlParser: true,  useUnifiedTopology: true });
    return mongoose.connection
}

exports.mongoose = mongoose
exports.connection = Connection
exports.Guild = GuildModel
exports.RoleReac = RoleReacModel
exports.Role = RoleModel
