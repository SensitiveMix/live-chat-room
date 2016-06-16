/**
 * Created by XYJ on 2016/2/26 0026.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var Schema = mongoose.Schema;   //  ����ģ��
var userScheMa = new Schema({
    name: String,
    password: String,
    mobile: String,
    nick_name: String,
    email_address: String,
    level: String,
    levelname: String,
    usertype: String
});
module.exports = userScheMa;