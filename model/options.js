/**
 * Created by XYJ on 2016/2/26 0026.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var optionsScheMa = new Schema({
    option_name: String,
    option_value: [{room_name: String, room_dec: String, room_ico: String, room_bg: String}],
    room_logo: String,
    lesson: String,
    gundonggonggao: String,
    jianjie: String,
    level: [],
    newhandan: [{
        hduser: String,
        hdtime: String,
        bz: String,
        zydw: String,
        zsdw: String,
        pcdw: String,
        kcdw: String,
        dkqs: String
    }]
});
module.exports = optionsScheMa;