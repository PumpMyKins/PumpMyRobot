const mongoose = require('mongoose'), Schema = mongoose.Schema
mongoose.set('useCreateIndex', true);

var RoleSchema = new Schema({
    guild : {type: Schema.ObjectId, ref: 'Guild'},
    role_id : { type: String, required : true},
    weight : { type: Number, required : true}
});

var GuildSchema = new Schema({
    _id : { type: String, required : true}, 
    command_prefix : { type: String, default: '.p'},
    special_channels : {
        welcome_channel_id : { type: String, default: 'none'},
        rules_channel_id : { type: String, default: 'none'}
    },
    log : {
        log_channel_id : { type: String, default: 'none'},
        untrack_channels_id : [String],
        untrack_categories_id : [String],
    },
    archives : {
        public_categorie_id : { type: String, default: 'none'},
        private_categorie_id : { type: String, default: 'none'}
    },
});

var RoleReacSchema = new Schema({
    guild_id : {type : String, ref: 'Guild', required : true},
    channel_id : { type: String, required : true},
    message_id : { type: String, required : true},
    reac_id : { type: String, required : true},
    role_ids : {type: [String], required: true}
}).index({ guild_id: 1, channel_id: 1, message_id: 1, reac_id: 1 },{ unique: true });

var StreamerSchema = new Schema({
    streamer_id : { type: String, unique : true, index : true, required : true}
});

const StreamerModel = mongoose.model('stalkers', StreamerSchema);
const GuildModel = mongoose.model('guilds', GuildSchema);
const RoleReacModel = mongoose.model('rolereacs', RoleReacSchema);
const RoleModel = mongoose.model('roles', RoleSchema);

function Connection(url) {
    mongoose.connect(url,{ useNewUrlParser: true,  useUnifiedTopology: true });
    return mongoose.connection
}

exports.mongoose = mongoose
exports.connection = Connection
exports.Streamer = StreamerModel
exports.Guild = GuildModel
exports.RoleReac = RoleReacModel
exports.Role = RoleModel
