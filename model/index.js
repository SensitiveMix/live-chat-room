/**
 * Created by XYJ on 2016/2/26 0026.
 */
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://220.248.125.102:27017/live',function(err){console.log(err)});//���������ݿ�
exports.users = mongoose.model('users', require('./user'));
exports.options = mongoose.model('options', require('./options'));
exports.handan = mongoose.model('handan', require('./handan'));
exports.messages = mongoose.model('messages', require('./messages'));