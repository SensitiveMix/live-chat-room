var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var app = express();
var db = require('./model/index');
var http = require('http').Server(express);
var io = require('socket.io')(http);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs-mate'));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', users);
app.use('/users', users);
app.use('/admin', admin);
//在线用户
global.onlineUsers = {};
//当前在线人数
global.onlineCount = 0;

//通信处理
io.on('connection', function (socket) {
    console.log('a user connected');

    //监听新用户加入
    socket.on('login', function (obj) {
        //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
        socket.name = obj._id;
        //检查在线列表，如果不在里面就加入
        if (!global.onlineUsers.hasOwnProperty(obj._id)) {
            global.onlineUsers[obj._id] = {nick_name: obj.nick_name, level: obj.level, userid : obj._id};
            //在线人数+1
            global.onlineCount++;
        }


        //向所有客户端广播用户加入
        io.emit('login', {onlineUsers: global.onlineUsers, onlineCount: global.onlineCount, user: obj});
        console.log(obj.username + '加入了聊天室');
    });

    //监听用户退出
    socket.on('disconnect', function () {
        //将退出的用户从在线列表中删除
        if (onlineUsers.hasOwnProperty(socket.name)) {
            //退出用户的信息
            var obj = {userid: socket.name, nick_name: onlineUsers[socket.name].nick_name};

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

    //消息通过
    socket.on('passmessage', function (obj) {

        //通过消息 type置1
        console.log("pass");
        db.messages.update({'msgid': obj}, {
            $set: {
                type: 1
            }
        }, function (err) {
        });

        //查询本条消息并发送
        db.messages.find({'msgid': obj}, function (err, result) {
            var pass= {
                level:result[0].level,
                content:result[0].content,
                msgid:result[0].msgid,
                type:4,   //游客审核
                ip:result[0].ip,
                date:result[0].date,
                sendTo:result[0].sendTo,
                sendToName:result[0].sendToName,
                username:result[0].username,
                userid:result[0].userid
            }
            io.emit('message', pass);
            console.log(pass);
    })

});

//删除消息
socket.on('delmessage', function (obj) {

    //删除消息 type置2
    console.log("delete");
    db.messages.update({'msgid': obj}, {
        $set: {
            type: 2
        }
    }, function (err) {
    });

    io.emit('delmessage', obj);
    console.log(obj);
});

//发布审核
socket.on('checkmessage', function (obj) {
    var robot = new db.messages(obj);
    robot.save(function (err) {
        if (err) // ...
            console.log('meow');
    });

    if (obj.level == "66") {
        console.log("pass");
        db.messages.update({'msgid': obj.msgid}, {
            $set: {
                type: 1
            }
        }, function (err) {
        });

        io.emit('message', obj);
    }
    else {
        io.emit('check_message', obj);
        //io.emit('checkmessages', obj);
    }
    //console.log(obj);
});

//监听用户发布聊天内容
socket.on('message', function (obj) {
    //向所有客户端广播发布的消息
    // obj.username = u.nick_name;
    // obj.level = u.level
    //type 0 审核
    //type 1 通过;
    //type 2 驳回
    //if (obj.level == 78) {
    //    console.log("cancel");
    //    db.messages.update({'msgid': obj.msgid}, {
    //        $set: {
    //            type: 2
    //        }
    //    }, function (err) {
    //    });
    //
    //}
    //else {
    //    console.log("pass");
    //    db.messages.update({'msgid': obj.msgid}, {
    //        $set: {
    //            type: 1
    //        }
    //    }, function (err) {
    //    });
    //    console.log(obj.msgid);
    //    console.log(obj.level);
    //    io.emit('message', obj);
    //    console.log(obj.username + '说：' + obj.content);
    //}

    //保存消息
    var robot = new db.messages(obj);
    robot.save(function (err) {
        if (err) // ...
            console.log('meow');
    });

    //消息默认通过 type/1
    //console.log("pass");
    //db.messages.update({'msgid': obj.msgid}, {
    //    $set: {
    //        type: 0
    //    }
    //}, function (err) {
    //});
    io.emit('message', obj);
    console.log(obj.username + '说：' + obj.content);
});

})
;

http.listen(3000, function () {
    console.log('listening on *:3001');
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
