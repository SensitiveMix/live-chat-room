var express = require('express');
var router = express.Router();

//router.get('/', function(req, res, next) {
//  res.render('room/login_1n', { title: 'login' });
//});

router.get('/adminlogin', function(req, res, next) {
  res.render('admin/adminlogin', { title: 'adminlogin' });
});
module.exports = router;
