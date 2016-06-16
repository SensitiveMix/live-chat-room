var express = require('express');
var router = express.Router();
var http = require('http').Server(express);
var io = require('socket.io')(http);
var formidable = require('formidable');
var fs = require('fs');
var db = require('../model/index');
var r = [];
var u = [];
var leverlist = [];
/* GET users listing. */

//在线用户
var onlineUsers = {};
//当前在线人数
var onlineCount = 0;
//通信处理
io.on('connection', function (socket) {
    console.log('a user connected');

    //监听新用户加入
    socket.on('login', function (obj) {
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = obj._id;
        //检查在线列表，如果不在里面就加入
        if (!onlineUsers.hasOwnProperty(obj._id)) {
            onlineUsers[obj._id] = {nick_name: obj.nick_name, level: obj.level};
            //在线人数+1
            onlineCount++;
        }

        //向所有客户端广播用户加入
        io.emit('login', {onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj});
        console.log(obj.username + '加入了聊天室');
    });

    //监听用户退出
    socket.on('disconnect', function () {
        //将退出的用户从在线列表中删除
        if (onlineUsers.hasOwnProperty(socket.name)) {
            //退出用户的信息
            var obj = {userid: socket.name, username: onlineUsers[socket.name]};

            //删除
            delete onlineUsers[socket.name];
            //在线人数-1
            onlineCount--;

            //向所有客户端广播用户退出
            io.emit('logout', {onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj});
            console.log(obj.username + '退出了聊天室');
        }
    });

    //发布公告
    socket.on('fabugonggao', function (obj) {
        io.emit('fabugonggao', obj);
        console.log(obj.gonggao);
    });
    //发布喊单
    socket.on('fabuhandan', function (obj) {
        io.emit('fabuhandan', obj);
        console.log(obj);
    });

    //发布审核
    socket.on('checkmessage',function(obj)
    {
        var robot = new db.messages(obj);
        robot.save(function (err) {
            if (err)
                console.log('meow');
        });
        io.emit('checkmessages', obj);
        console.log(obj);
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
        console.log("机器人列表" + result);
        if (result.length == 0)
            return;
        for (key in result) {
            if (!onlineUsers.hasOwnProperty(key._id)) {
                onlineUsers[result[key]._id] = {nick_name: result[key].nick_name, level: result[key].level};
                //在线人数+1
                onlineCount++;
            }
        }
    });

};
//后台登录界面
router.get('/adminlogin', function (req, res, next) {
    db.options.find({'option_name': 'sysset'}, function (err, result) {
        console.log("登录界面");
        r = result;
        leverlist = result[0].level;
        // console.log(leverlist);
        res.render('room/login', {title: r[0].option_value[0].room_name, mes: '', scji: ''});
    });
});
var checkLogin = function (req, res, next) {
    if (u.length == 0) {
        res.render("404");
    }
    next();
};
//后台登陆处理
router.post('/doadminlogin', function (req, res, next) {
    var query = {name: req.body.name, password: req.body.password};
    db.users.find(query, function (err, result) {
        if (result.length == 1 && result[0].level == 66) {
            console.log(result[0].nick_name + ":登录成功" + new Date());
            u = result[0];
            res.render('admin/index', {username: result[0].nick_name, sysset: r[0]});
        } else {
            console.log(query.name + ":登录失败" + new Date());
            res.render('room/login', {
                title: r[0].option_value,
                mes: '账号密码错误',
                scji: '$("#ErrTip").text("账号密码错误").show();'
            });
        }
    });
});

//基本设置-直播室名称
router.post('/dosysset', checkLogin);
router.post('/dosysset', function (req, res, next) {
    db.options.findOneAndUpdate({option_name: 'sysset'}, {
        $set: {
            option_value: [{room_name: req.body.room_name}],
            room_logo: req.body.imgoflogo,
            gundonggonggao: req.body.gundonggonggao,
            jianjie: req.body.jianjie
        }
    }, function (err, result) {
        // r=result;
        res.end();
    });

});
//跳转页面-基本设置
router.get('/mainset', checkLogin);
router.get('/mainset', function (req, res, next) {
    console.log("基本设置页面" + new Date());
    db.options.find({'option_name': 'sysset'}, function (err, result) {
        //  console.log("登录界面");
        r = result;
        res.render('admin/index', {username: u.nick_name, sysset: result[0]});
        //   leverlist=result[0].level;
        // console.log(leverlist);
        //  res.render('room/login_2', { title: r[0].option_value[0].room_name,mes:'',scji:''});
    });
    console.log("基本设置成功" + r);
});
//跳转页面-机器人设置
router.get('/robotlist', checkLogin);
router.get('/robotlist', function (req, res, next) {
    console.log("机器人设置" + new Date());
    console.log(leverlist);
    res.render('admin/robotlist', {username: u.nick_name, sysset: r[0], lvlist: leverlist});
});
//修改机器人
router.post('/dochangeRobot', checkLogin);
router.post('/dochangeRobot', function (req, res, next) {
    console.log("机器人修改" + new Date());
    console.log(req.body.levelname);
    db.users.update({_id: req.body.robotid}, {
        $set: {
            nick_name: req.body.robotnamne,
            level: req.body.level,
            levelname: req.body.levelname,
            usertype: 0
        }
    }, function (err) {
        res.end();
    });
});
//删除机器人
router.post('/dodelRobote', checkLogin);
router.post('/dodelRobote', function (req, res, next) {
    console.log("机器人删除" + new Date());
    db.users.remove({_id: req.body.roboteid}, function (err) {
        res.end();
    });
});
//添加机器人
router.post('/doaddRobot', function (req, res, next) {
    console.log("机器人添加" + req.body.addName + new Date());
    var doc = {nick_name: req.body.addName, level: req.body.addLevel, levelname: req.body.addLevelName, usertype: 0};
    var robot = new db.users(doc);
    robot.save(function (err) {
        if (err) // ...
            console.log('meow');
        res.end();
    });
});
//显示所有机器人
router.get('/dorobotelist', function (req, res, next) {
    console.log("当前分页" + req.query.iDisplayStart);
    db.users.find({usertype: '0'}, function (err, result) {
        var lista = {
            "draw": 2,
            "recordsTotal": "",
            "recordsFiltered": "",
            "data": []
        };
        lista.recordsTotal = result.length;
        lista.recordsFiltered = lista.recordsTotal;
        lista.data = result;
        res.send(lista);
        res.end();
    });

});
//跳转页面-用户管理
router.get('/userlist', function (req, res, next) {
    console.log("用户设置" + new Date());
    console.log(leverlist);
    res.render('admin/userlist', {username: u.nick_name, sysset: r[0], lvlist: leverlist});
});
//显示所有用户
router.get('/douserlist', function (req, res, next) {
    console.log("当前分页" + req.query.iDisplayStart);
    db.users.find({usertype: '1'}, function (err, result) {
        var lista = {
            "draw": 2,
            "recordsTotal": "",
            "recordsFiltered": "",
            "data": []
        };
        lista.recordsTotal = result.length;
        lista.recordsFiltered = lista.recordsTotal;
        lista.data = result;
        res.send(lista);
        res.end();
    });

});
//删除用户
router.post('/dodeluser', checkLogin);
router.post('/dodeluser', function (req, res, next) {
    console.log("用户删除" + new Date());
    db.users.remove({_id: req.body.userid}, function (err) {
        res.end();
    });
});
//添加用户
router.post('/doadduser', function (req, res, next) {
    console.log("用户添加" + req.body.addName + new Date());
    var doc = {
        name: req.body.addname,
        password: req.body.addpassword,
        mobile: req.body.addmobile,
        nick_name: req.body.addnickname,
        level: req.body.addLevel,
        levelname: req.body.addLevelName,
        usertype: 1
    };
    var robot = new db.users(doc);
    robot.save(function (err) {
        if (err) // ...
            console.log('meow');
        res.end();
    });
});
//修改用户
router.post('/', checkLogin);
router.post('/dochangeUser', function (req, res, next) {
    console.log("用户修改" + new Date());
    console.log(req.body.levelname);
    db.users.update({_id: req.body.robotid}, {
        $set: {
            password:req.body.updpass,
            mobile: req.body.updmobile,
            nick_name:req.body.updnicname,
            level:req.body.level,
            levelname:req.body.levelname
        }
    }, function (err) {
        res.end();
    });
});
//課程表顯示
router.get('/lessonlist', function (req, res, next) {
    console.log("基本设置页面" + new Date());
    db.options.find({'option_name': 'sysset'}, function (err, result) {
        //  console.log("登录界面");
        r = result;
        res.render('admin/lessonlist', {username: u.nick_name, sysset: result[0]});
        //   leverlist=result[0].level;
        // console.log(leverlist);
        //  res.render('room/login_2', { title: r[0].option_value[0].room_name,mes:'',scji:''});
    });
    console.log("基本设置成功" + r);
});
//课程表
router.post('/dochangelesson', checkLogin);
router.post('/dochangelesson', function (req, res, next) {
    db.options.update({option_name: 'sysset'}, {$set: {lesson: req.body.lesson}}, function (err) {
    });
    res.end();
});
//喊单
router.get('/addhandan', checkLogin);
router.get('/addhandan', function (req, res, next) {
    res.render('admin/addhandan', {username: u.nick_name, sysset: r[0]});
});
router.post('/dohandan', function (req, res, next) {
    db.options.update({option_name: 'sysset'}, {
        $set: {
            newhandan: [{
                dkqs: req.body.dkqs,
                kcdw: req.body.kcdw,
                pcdw: req.body.pcdw,
                zsdw: req.body.zsdw,
                zydw: req.body.zydw,
                bz: req.body.bz,
                hduser: req.body.hduser,
                hdtime:req.body.hdtime
            }]
        }
    }, function (err) {
        // r=result;

    });
    res.end();
});
//审核消息
router.get('/messages', checkLogin);
router.get('/messages', function (req, res, next) {
    //未审核消息
    db.messages.find({type:'0'},function(err,result){

        console.log(result);
        res.render('admin/messages', {messagevalue: result,username: u.nick_name, sysset: r[0]});
    })

});

module.exports = router;


