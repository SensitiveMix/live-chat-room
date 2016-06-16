/**
 * Created by XYJ on 2016/2/26 0026.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var optionsScheMa = new Schema({
    dkqs :String,
    kcdw : String,
    pcdw : String,
    zsdw : String,
    zydw : String,
    bz : String,
    hduser : String,
    hdtime : String
});
module.exports = optionsScheMa;