(function () {
    var d = document,
        w = window,
        p = parseInt,
        dd = d.documentElement,
        db = d.body,
        dc = d.compatMode == 'CSS1Compat',
        dx = dc ? dd : db,
        ec = encodeURIComponent;

    var flag = 0;
    var t;


    w.CHAT = {
        msgObj: d.getElementById("message"),
        screenheight: w.innerHeight ? w.innerHeight : dx.clientHeight,
        username: null,
        userid: null,
        socket: null,
        level: null,
        ip: null,
        allowChat: null,
        //让浏览器滚动条保持在最低部
        scrollToBottom: function () {
            w.scrollTo(0, this.msgObj.clientHeight);
        },
        //退出，本例只是一个简单的刷新
        logout: function () {
            //this.socket.disconnect();
            location.reload();
        },

        replace_em: function (str) {
            str = str.replace(/\</g, '<;');
            str = str.replace(/\>/g, '>;');
            str = str.replace(/\n/g, '<;br/>;');
            str = str.replace(/\[em_([0-9]*)\]/g, '<img src="/face/$1.gif" border="0" />');
            return str;
        },

        //提交聊天消息内容
        submit: function () {

            var str = $("#Y_iSend_Input").val();

            $("#Y_iSend_Input").val(CHAT.replace_em(str));

            var message_text = d.getElementById("Y_iSend_Input").value;

            if (message_text != '' && flag == 0) {

                //查看自己的聊天

                var myDate = new Date();

                var msgId = new Date().getTime() + "" + Math.floor(Math.random() * 899 + 100);

                var time = myDate.getFullYear() + "年" + (myDate.getMonth() + 1) + "月" + myDate.getDate() + "日" + myDate.getHours() + ":" + myDate.getMinutes();

                var url = 'http://chaxun.1616.net/s.php?type=ip&output=json&callback=?&_=' + Math.random();

                //区分是否为level 66消息
                var contents;

                var types;

                if (message_text != '') {

                    if (this.level != 66) {
                        //contents = str;
                        contents = message_text;
                        types = 0;
                    }
                    else {
                        contents = message_text;
                        types = 1;
                    }
                    var obj = {
                        userid: this.userid,
                        username: this.username,
                        date: time,
                        ip: $('#ip').val(),
                        type: types,
                        sendTo: $("#sel").find("option:selected").val(),
                        sendToName: $("#sel").find("option:selected").text(),
                        msgid: msgId,
                        content: contents,
                        level: this.level
                    };
                }

                //发送消息
                //var myDate = new Date();
                //
                //var isme = (obj.userid == CHAT.userid) ? true : false;
                ////var islocal = (obj.ip == obj.localip) ? true : false;
                //var timeSpan = '<span class="a">' + myDate.getHours() + ':' + myDate.getMinutes() + '</span>';
                //var imgoflevel = '<img class="Role Manager2" src="/images/' + obj.level + '.png">';
                //var contentDiv = '<a class="u">' + obj.username + '：</a>';
                //var usernameDiv = '<span class="b" name="b">' + message_text + '</span>';
                //
                //if(CHAT.level==66){
                //    var ojjb = msgId;
                //    usernameDiv+="<img src='/images/laji.png' onclick=CHAT.delmesli('"+msgId+"') value=''/>";
                //}
                //else{
                //    var ojjb = msgId;
                //    usernameDiv+="<img src='/images/laji.png' onclick=CHAT.delmesli('"+msgId+"') value=''/><img src='/images/laji.png' onclick=CHAT.passmesli('"+msgId+"') value=''/>";
                //}
                //
                //var section = d.createElement('li');
                //section.title=msgId;
                //if (isme) {
                //    section.className = 'user';
                //    $(section).html(timeSpan + imgoflevel + contentDiv + usernameDiv);
                //   // section.innerHTML = timeSpan + imgoflevel + contentDiv + usernameDiv;
                //} else {
                //    section.className = 'service';
                //    $(section).html(timeSpan + imgoflevel + contentDiv + usernameDiv);
                //    //section.innerHTML = timeSpan + imgoflevel + contentDiv + usernameDiv;
                //}
                //CHAT.msgObj.appendChild(section);
                //$("#Y_PubMes_Div").mCustomScrollbar('update');
                //$("#Y_PubMes_Div").mCustomScrollbar("scrollTo", "last");

                //this.socket.emit('message', obj);
                this.socket.emit('checkmessage', obj);


                d.getElementById("Y_iSend_Input").value = '';

                flag = 1;

                t = setTimeout(function () {
                    flag = 0;
                }, 7000);

            } else if (flag == 1) {
                d.getElementById("Y_iSend_Input").value = '';
                alert('发言过快!请稍后再试。');
            } else {
                alert('发送内容不能为空！');
            }


            return false;
        },
        genUid: function () {
            return new Date().getTime() + "" + Math.floor(Math.random() * 899 + 100);
        },
        //更新系统消息，本例中在用户加入、退出的时候调用
        updateSysMsg: function (o, action) {
            //当前在线用户列表
            var onlineUsers = o.onlineUsers;
            //当前在线人数
            var onlineCount = o.onlineCount;
            //新加入用户的信息
            var user = o.user;

            //更新在线人数
            var userhtml = '';
            var separator = '';
            var userAp = '';
            for (key in onlineUsers) {
                if (onlineUsers.hasOwnProperty(key)) {
                    userAp += '<li><a><img width="25px" src="/images/' + onlineUsers[key].level + '.png"/><span class="' + onlineUsers[key].userid + '">' + onlineUsers[key].nick_name + '</span></a></li>';
                    //userAp += '<li><div class="UBase"><img class="USoundStatus" src="/images/pixel.gif"><img class="US_Pic" src="/images/201509070905306991.jpg"><span title="" class="UName" href="javascript:void(0)">'+onlineUsers[key].nick_name+'</span><img class="RoomUserRole RoomUser2" title="普通客户：可文字发言" src="/images/'+onlineUsers[key].level+'.png"></div></li>';
                }
            }// d.getElementById("onlinecount").innerHTML = '当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml;
            var selUser = '<option value="all">所有人</option>';
            $('#sel').html(selUser);

            $('#User_List').html(userAp);
            $("#userlist").mCustomScrollbar('update');
            $("#userlist").mCustomScrollbar("scrollTo", "last");
            //添加系统消息
            var html = '';
            html += '<li class="chatli"><span class="b">'
            html += o.user.nick_name;
            html += (action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室';
            html += '</span></li>';
            var li = d.createElement('li');
            var a = this.genUid();
            li.className = 'system J-mjrlinkWrap J-cutMsg';
            // $(li).html(html);
            // this.msgObj.appendChild(li);
        },
        //第一个界面用户提交用户名
        usernameSubmit: function () {
            var username = this.genUid();
            if (username != "") {
                /*d.getElementById("username").value = '';
                 d.getElementById("loginbox").style.display = 'none';
                 d.getElementById("chatbox").style.display = 'block';*/
                this.init(username);
            }
            return false;
        },

        delmesli: function (str) {
            this.socket.emit('delmessage', str);
            //  $("#message").find("li[title="+str+"]").remove();
        },

        passmesli: function (str) {
            this.socket.emit('passmessage', str);
        },

        checkCookie: function () {
            var userid = getCookie('userid')
            if (userid != null && userid != "")
                setCookie('userid', this.userid);

        },

        getCookie: function (c_name) {
            if (document.cookie.length > 0) {
                var c_start = document.cookie.indexOf(c_name + "=")
                if (c_start != -1) {
                    c_start = c_start + c_name.length + 1
                    var c_end = document.cookie.indexOf(";", c_start)
                    if (c_end == -1)
                        c_end = document.cookie.length;
                    return unescape(document.cookie.substring(c_start, c_end));
                }
            }
            return "";
        },

        setCookie: function (c_name, value) {
            document.cookie = c_name + "=" + escape(value);
        },

        init: function (username) {

            //判断cookie
            if ($("#userlevel").val() == "77") {
                var userid = CHAT.getCookie('userid');
                var id = CHAT.getCookie('id');


                if (userid != null && userid != "" && id != "" && id != null) {
                    $("#dd2").text("游客_" + userid);
                    $("#userid").val(id);
                    this.username = "游客_" + userid;
                }
                else {
                    var ddid = new Date().getTime() + "" + Math.floor(Math.random() * 899 + 100);
                    var userid = Math.floor(Math.random() * 900);
                    $("#dd2").text("游客_" + userid);
                    $("#userid").val(ddid);
                    this.username = "游客_" + userid;
                    document.cookie = 'userid' + "=" + userid;
                    document.cookie = 'id' + "=" + ddid;
                }
            }

            //  CHAT.checkCookie;

            /*
             客户端根据时间和随机数生成uid,这样使得聊天室用户名称可以重复。
             实际项目中，如果是需要用户登录，那么直接采用用户的uid来做标识就可以
             */
            this.userid = $("#userid").val();
            this.username = $('#regBt span').text();
            this.level = $('#userlevel').val();
            this.allowChat = $('#allowChat').html();


            // alert(this.level);
            //d.getElementById("showusername").innerHTML = this.username;
            //this.msgObj.style.minHeight = (this.screenheight - db.clientHeight + this.msgObj.clientHeight) + "px";
            this.scrollToBottom();

            //连接websocket后端服务器
            this.socket = io.connect('ws://localhost:3000');

            //告诉服务器端有用户登录
            this.socket.emit('login', {_id: this.userid, nick_name: this.username, level: this.level});

            //监听新用户登录
            this.socket.on('login', function (o) {
                CHAT.updateSysMsg(o, 'login');
            });

            //监听用户退出
            this.socket.on('logout', function (o) {
                CHAT.updateSysMsg(o, 'logout');
            });
            //監聽公告
            this.socket.on('fabugonggao', function (obj) {
                //alert(obj.gonggao);
                $("#gonggao").html(obj.gonggao);
                $("#gundongspan").html(obj.gonggao);
            });
            //监听喊单
            this.socket.on('fabuhandan', function (obj) {
                //alert(obj.dkqs);
                $("#dkqs").html(obj.dkqs);
                $("#kcdw").html(obj.kcdw);
                $("#pcdw").html(obj.pcdw);
                $("#zsdw").html(obj.zsdw);
                $("#zydw").html(obj.zydw);
                $("#bz").html(obj.bz);
                $("#hduser").html(obj.hduser);
                $("#hdtime").html(obj.hdtime);
            });

            //删除发送消息
            this.socket.on('delmessage', function (obj) {
                $("#message").find("li[title=" + obj + "]").remove();
            });

            //前台消息审核
            this.socket.on('check_message', function (obj) {
                var myDate = new Date();
                var isme = (obj.userid == CHAT.userid) ? true : false;

                var newdate = obj.date.substring(obj.date.indexOf("日") + 1, obj.date.length);

                // var islocal = (obj.ip == serverip) ? false : true;
                var timeSpan = '<span class="a">' + newdate + '</span>';
                var imgoflevel = '<img class="Role Manager2" src="/images/' + obj.level + '.png">';
                var contentDiv = '<a class="u">' + obj.username + '</a>';

                //审核默认所有人可见
                contentDiv += '<img src="/images/r-middle-pic_chat.png"/><a>' + obj.sendToName + '</a>';


                var usernameDiv = '<p class="b">' + obj.content;

                if (CHAT.level == 66) {
                    usernameDiv += "<img src='/images/Delete.png' onclick=CHAT.delmesli('" + obj.msgid + "') value=''/><img id='" + obj.msgid + "' src='/images/pass.png' onclick=CHAT.passmesli('" + obj.msgid + "') value=''/>";
                }

                usernameDiv += '</p>';

                //   alert(usernameDiv);
                var section = d.createElement('li');
                section.title = obj.msgid;
                {
                    if (isme) {
                        section.className = 'user';
                        section.innerHTML = timeSpan + imgoflevel + contentDiv + usernameDiv;

                    } else {
                        section.className = 'service';
                        section.innerHTML = timeSpan + imgoflevel + contentDiv + usernameDiv;

                    }
                }

                //消息只能管理员和自己所见
                if (CHAT.level == 66 || isme) {
                    CHAT.msgObj.appendChild(section);
                }

                $("#Y_PubMes_Div").mCustomScrollbar('update');
                $("#Y_PubMes_Div").mCustomScrollbar("scrollTo", "last");
            });

            //监听消息发送
            this.socket.on('message', function (obj) {


                var myDate = new Date();
                var isme = (obj.userid == CHAT.userid) ? true : false;

                var newdate = obj.date.substring(obj.date.indexOf("日") + 1, obj.date.length);


                // var islocal = (obj.ip == serverip) ? false : true;
                var timeSpan = '<span class="a">' + newdate + '</span>';
                var imgoflevel = '<img class="Role Manager2" src="/images/' + obj.level + '.png">';
                var contentDiv = '<a class="u">' + obj.username + '：</a>';
                var usernameDiv = '<p class="b">' + obj.content;
                //var usernameDiv="";

                if (obj.sendToName != "")
                    contentDiv += '<img src="/images/r-middle-pic_chat.png"/><a>' + obj.sendToName + '</a>';



                var usernameDiv = '<p class="b">' + obj.content;

                if (CHAT.level == 66) {
                    var ojjb = obj.msgId;
                    usernameDiv += "<img src='/images/Delete.png' onclick=CHAT.delmesli('" + obj.msgid + "') value=''/>";
                }

                usernameDiv += '</p>';
                if (obj.type == 4 && CHAT.level == 66) {
                    $("#" + obj.msgid).remove();
                }

                var section = d.createElement('li');
                section.title = obj.msgid;
                {
                    if (isme) {
                        if (CHAT.level == 66) {
                            section.className = 'teacher';
                            section.innerHTML = timeSpan + imgoflevel + contentDiv + usernameDiv;
                            CHAT.msgObj.appendChild(section);
                        }
                        else {
                            section.className = 'user';
                            section.innerHTML = timeSpan + imgoflevel + contentDiv + usernameDiv;
                        }
                    }
                    else {
                        if (CHAT.level != 66) {
                            if (obj.sendToName == CHAT.username || obj.sendToName == "所有人") {
                                section.className = 'service';
                                section.innerHTML = timeSpan + imgoflevel + contentDiv + usernameDiv;
                                CHAT.msgObj.appendChild(section);
                            }
                        }
                    }
                }

                $("#Y_PubMes_Div").mCustomScrollbar('update');
                $("#Y_PubMes_Div").mCustomScrollbar("scrollTo", "last");
            });

        }
    };

    //通过“回车”提交信息
    d.getElementById("Y_iSend_Input").onkeydown = function (e) {
        e = e || event;
        if (e.keyCode === 13) {
            CHAT.submit();
        }
    };
})();