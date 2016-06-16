/**
 * Created by jackSun on 2016/5/9.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var messageScheMa = new Schema({
    userid: String,
    username:String,
    content: String,
    level: String,
    date:String,
    ip:String,
    sendTo:String,
    sendToName:String,
    msgid:String,
    type: String
});
module.exports = messageScheMa;