/*!live-0.0.0.js 2016-06-15*/
!function(){var a=document,b=window;parseInt,a.documentElement,a.body,"CSS1Compat"==a.compatMode,encodeURIComponent;window.CHAT={msgObj:a.getElementById("message"),scrollToBottom:function(){b.scrollTo(0,this.msgObj.clientHeight)},logout:function(){location.reload()},messsgesubmit1:function(){this.socket=io.connect("ws://139.196.203.21:3000");var a={date:$(this).parent().children("span").eq(0).text(),content:$(this).parent().children("span").eq(1).html(),level:$(this).parent().children("input").eq(0).val(),ip:$(this).parent().children("input").eq(1).val(),userid:$(this).parent().children("input").eq(2).val().trim(),msgid:$(this).parent().children("input").eq(3).val(),username:$(this).parent().children("a").text()};return $(this).parent().remove(),this.socket.emit("message",a),!1},messsgecancel:function(){this.socket=io.connect("ws://139.196.203.21:3000");var a={msgid:$(this).parent().children("input").eq(3).val(),level:78};return $(this).parent().remove(),this.socket.emit("message",a),!1},replace_em:function(a){return a=a.replace(/\</g,"<;"),a=a.replace(/\>/g,">;"),a=a.replace(/\n/g,"<;br/>;"),a=a.replace(/\[em_([0-9]*)\]/g,'<img src="/face/$1.gif" border="0" />')},init:function(){this.socket=io.connect("ws://139.196.203.21:3000"),this.socket.on("checkmessages",function(b){var c=CHAT.replace_em(b.content),d=(new Date,!0),e='<span class="a" width="400px">'+b.date+"</span>&nbsp&nbsp&nbsp",f='<img class="l" src="/images/'+b.level+'.png">&nbsp&nbsp',g='<a class="u" name="u" >'+b.username+"</a>&nbsp&nbsp&nbsp&nbsp",h='<span class="b" name="b" >'+c+"</span>&nbsp&nbsp",i='<input class="le" value="'+b.level+'" type="hidden" name="le" ></input>',j='<input class="le1" value="'+b.ip+'" type="hidden" name="le1" ></input>',k='<input class="id" value="'+b.userid+'" type="hidden" name="id" ></input>',l='<input class="msgid" value="'+b.msgid+'" type="hidden" name="msgid" ></input>',m=a.createElement("div");m.className="direct-chat-info clearfix";var n=a.createElement("input");n.className="btn btn-info pull-right",n.onclick=CHAT.messsgesubmit1,n.setAttribute("type","button"),n.setAttribute("value","通过");var o=a.createElement("input");o.className="btn btn-default pull-right",o.onclick=CHAT.messsgecancel,o.setAttribute("type","button"),o.setAttribute("value","驳回");var p=a.createElement("li");d?(p.className="user direct-chat-text",p.innerHTML=e+f+g+h+i+j+k+l):(p.className="service direct-chat-text",p.innerHTML=e+f+g+h+i+j+k+l),p.appendChild(n),p.appendChild(o),CHAT.msgObj.appendChild(m),CHAT.msgObj.appendChild(p)})}}}();