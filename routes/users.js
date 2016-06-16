var express = require('express');
var router = express.Router();
var http = require('http').Server(express);

var formidable = require('formidable');
var fs = require('fs');
var db = require('../model/index');
var r, u,leverlist = [];

var https = require('https');
var querystring = require('querystring');


/* GET home page. */
router.get('/', function(req, res, next) {
    db.options.find({'option_name': 'sysset'}, function (err, result) {
        console.log(result[0].option_value[0].room_name);
        r = result;
        var id=Math.floor(Math.random()*900);
        var zdyuser={
            nick_name:"",
            _id:"",
            level:"77"
        };
        //跳过
        res.render('room/index_1', {user: zdyuser, sysset: result[0]});
       // res.render('room/login_1', {title: r[0].option_value[0].room_name, mes: '', scji: ''});
    });
});
//上传文件
router.post('/doupload', function (req, res) {
    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = 'public' + '/upload/';	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小
    form.parse(req, function (err, fields, files) {

        if (err) {
            res.locals.error = err;
            res.end();
            return;
        }

        var extName = '';  //后缀名
        switch (files.fulAvatar.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }

        if (extName.length == 0) {
            res.locals.error = '只支持png和jpg格式图片';
            res.end();
            return;
        }

        var avatarName = Math.random() + '.' + extName;
        var newPath = form.uploadDir + avatarName;
        var savePath = '/upload/' + avatarName;
        res.json(savePath);
        res.end();
        console.log(savePath);
        fs.renameSync(files.fulAvatar.path, newPath);  //重命名
    });

    res.locals.success = '上传成功';
});
//获取机器人列表
function getRobot() {
    db.users.find({usertype: '0'}, function (err, result) {
        console.log("机器人列表" + "getRobot");
        if (result.length == 0)
            return;
        for (key in result) {
            if (!global.onlineUsers.hasOwnProperty(key._id)) {
                global.onlineUsers[result[key]._id] = {nick_name: result[key].nick_name, level: result[key].level};
                //在线人数+1
                global.onlineCount++;
            }
        }
    });
};
//前台登录界面
router.get('/login', function (req, res, next) {
    db.options.find({'option_name': 'sysset'}, function (err, result) {
        console.log(result[0].option_value[0].room_name);
        r = result;
        res.render('room/login_1', {title: r[0].option_value[0].room_name, mes: '', scji: ''});
    });
});

//前台注册页面
router.get('/register', function (req, res, next) {
    db.options.find({'option_name': 'sysset'}, function (err, result) {
        console.log(result[0].option_value[0].room_name);
        r = result;
        res.render('room/register_1', {title: r[0].option_value[0].room_name, mes: '', scji: ''});
    });
});

//登录处理
router.post('/dologin', function (req, res, next) {
    var query = {name: req.body.name, password: req.body.password};
    db.users.find(query, function (err, result) {
        if (err) {
            res.locals.success = '注册失败';
        }
        if (result.length == 1) {
            db.options.find({'option_name': 'sysset'}, function (err, results) {
                //getRobot();
                r = results;
                res.render('room/index_1', {user: result[0], sysset: results[0]});
            });
            console.log(result[0].nick_name + ":登录成功" + r);
            //  res.render('room/index_1', { user:u,sysset: r[0]});
        } else {
            console.log(query.name + ":登录失败" + new Date());
            res.locals.success = '注册成功';
            res.render('room/login_1', {
                //title: r[0].room_name,
                mes: '账号密码错误',
                scji: '$("#ErrTip").text("账号密码错误").show();'
            });
        }
    });
});

//用户注册
router.post('/doregister', function (req, res, next) {
    var doc = {
        name: req.body.name,
        nick_name:req.body.name,
        password: req.body.password,
        mobile:req.body.mobile,
        levelname:"会员",
        level:0,
        usertype:0
    };
    var new_User = new db.users(doc);
    new_User.save(function (err) {
        if (err) // ...
            console.log('failed');
        res.render('room/login_1', {
            title: r[0].room_name,
            mes: '账号密码错误',
            scji: '$("#ErrTip").text("账号密码错误").show();'
        });
    });

});

//验证注册用户名
router.post('/docheckregister', function (req, res, next) {
    db.users.find({'name':req.body.name},function(err,data)
    {
        console.log("注册"+data);
        if (err) {
            res.render("404");
        }
        res.json(data);
        res.end();
    })
});

//短信验证
router.post('/sendMessage', function (req, res, next) {
    console.log("验证"+req.body.phone);
    console.log("验证"+req.body.code);

    //发送短信
    var postData = {
        mobile:req.body.phone,
        message:req.body.code+'【阅沃实业】'
    }
    var content = querystring.stringify(postData);

    var options = {
        host:'sms-api.luosimao.com',
        path:'/v1/send.json',
        method:'POST',
        auth:'api:key-3d1f61308bd9f43fb90cb67ffb852b9d',
        agent:false,
        rejectUnauthorized : false,
        headers:{
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length' :content.length
        }
    };

    var req1 = https.request(options,function(res1){
        res1.setEncoding('utf8');
        res1.on('data', function (chunk) {
            console.log(JSON.parse(chunk));
        });
        res1.on('end',function(){
            console.log('over');
        });
    });

    req1.write(content);
    req1.end();


//获取
    var options1 = {
        host:'sms-api.luosimao.com',
        path:'/v1/status.json',
        method:'GET',
        auth:'api:key-3d1f61308bd9f43fb90cb67ffb852b9d',
        agent:false,
        rejectUnauthorized : false
    };

    var req2 = https.request(options1,function(res3){
        res3.setEncoding('utf8');
        res3.on('data', function (chunk) {
            console.log(chunk);
        });
    });

    req2.on('error',function(e){
        console.log(e.message);
    });

    req2.end();

});

exports.getroblist =getRobot();
module.exports = router;