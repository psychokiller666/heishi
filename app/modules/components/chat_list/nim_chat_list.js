// 私信聊天
// 微信jssdk
var wx = require('weixin-js-sdk');
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 过滤关键词
var esc = require('../../../../node_modules/chn-escape/escape.js');
// 百度上传组件
var WebUploader = require('../../../../node_modules/tb-webuploader/dist/webuploader.min.js');
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.detail', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  // 回复私信
  var chat_list = $('.chat_list');
  var update_img_btn = $('.update_img_btn');
  var update_img_box = $('.update_img_box');
  var chat_content = $('.chat_content');
  var chat_footer = $('.chat-footer');
  var image_list = update_img_box.find('.image_list');
  var chat_footer_bd = $('.chat-footer-bd');

  update_img_btn.on('click',function(e) {
    if(!$(this).hasClass('active')){
      $(this).addClass('active');
      update_img_box.show();
    } else {
      $(this).removeClass('active');
      update_img_box.hide();
    }
  })
  var interval;
  var bfscrolltop = document.body.scrollTop;//获取软键盘唤起前浏览器滚动部分的高度
  chat_content.focus(function(){
      update_img_box.hide();
      update_img_btn.removeClass('active');
      interval = setInterval(function(){//设置一个计时器，时间设置与软键盘弹出所需时间相近
      document.body.scrollTop = document.body.scrollHeight;//获取焦点后将浏览器内所有内容高度赋给浏览器滚动部分高度
      },100)
  }).blur(function(){//设定输入框失去焦点时的事件
      clearInterval(interval);//清除计时器
      document.body.scrollTop = bfscrolltop;
  });
  update_img_box.on("change",'.webuploader-element-invisible', function(e) {
    var uid = $('.submit').data('touid'),
    that = this;
    nim.previewFile({
      type: 'image',
      fileInput: that,
      uploadprogress: function(obj) {
          $('.updata_image_btn').find('button').text(obj.percentage);
          chat_content.attr('disabled','disabled');
          chat_footer_bd.find('button').attr('disabled','disabled');
      },
      done: function(error, file) {
          chat_footer_bd.find('button').removeAttr('disabled','disabled');
          chat_content.val('').attr('placeholder','文字和图片只能选一个');
          chat_footer.find('.submit').attr('data-status',1);
          update_img_box.find('.updata_image_btn').hide();
          // 添加关闭按钮
          image_list.css('height','3.16rem');
          image_list.append('<button class="close"></button>');
          image_list.append('<img src="'+file.url+'"/>');
      }
    });
  });
  image_list.on('click','.close',function(){
    update_img_box.find('.updata_image_btn').show();
    chat_content.removeAttr('disabled','disabled').removeAttr('placeholder','文字和图片只能选一个');
    chat_footer.find('.submit').attr('data-status',0);
    chat_footer_bd.find('button').removeAttr('disabled','disabled');
    image_list.empty();
    $('.updata_image_btn').find('button').text('+');
    image_list.css('height','0');
  })
  // 提交私信
  chat_footer.find('.submit').on('click',function(){
    // 过滤关键词
    var text_list = [
    '燃料',
    '大麻',
    '叶子',
    '淘宝',
    'taobao.com',
    '共产党',
    '有飞',
    '想飞',
    '要飞',
    '微信',
    '加我',
    '大妈',
    '飞吗',
    '飞嘛',
    'qq',
    '拿货',
    'weed',
    '机长',
    'thc',
    'V信',
    'wechat',
    'VX',
    '蘑菇',
    '邮票',
    'LSD',
    'taobao',
    'tb',
    '操你妈',
    '草你妈',
    '🍃'
    ];
    esc.init(text_list);
    var content;
    var that = this;
    var status_message_status = $(this).data('status');
    content = chat_content.val();
    if(esc.find(chat_content.val()).length){
      $.toast('🚔 我要报警了');
      return;
    }
    if($(that).data('touid') == $(that).data('id')){
      $.toast('自己玩呢?');
      return false;
    }
    if(status_message_status){
      nim.sendFile({
          scene: 'p2p',
          to: $(that).data('touid'),
          type: 'image',
          fileInput: $('.webuploader-element-invisible')[0],
          beginupload: function(upload) {
              // - 如果开发者传入 fileInput, 在此回调之前不能修改 fileInput
              // - 在此回调之后可以取消图片上传, 此回调会接收一个参数 `upload`, 调用 `upload.abort();` 来取消文件上传
          },
          uploadprogress: function(obj) {
              //在上传
          },
          uploaddone: function(error, file) {
            //完成回调
          },
          beforesend: function(msg) {
            //接受消息
          },
          done: sendMsgDoneFile
      });
      function sendMsgDoneFile(error, msg){
        //如果用户不存在 则注册用户 
        if(error){
          if(error.code){
            var url = '/index.php?g=api&m=HsNeteasyIM&a=register_new_user&user_id=' + $(that).data('touid');
            $.ajax({
              type: 'GET',
              url: url,
              timeout: 4000,
              success: function(data){
                console.log(data);
              }
            });
            return $.toast('发送失败,请重新发送');
          }else{
            return $.toast(error);
          }
        }
        //用户存在，没有错误
        if(msg.status == 'success'){
          var str = '<li class="me" data-id="'+$(that).data('id')+'"><span class="date">'+messageTime(msg['time'])+'</span><span class="avatar"></span><div class="content_bd">'
          +'<div class="image" data-layzr="'+msg['file']['url']+'" data-preview="'+msg['file']['url']+'"></div></div></li>';
          chat_list.find('ul').append(str);
          //如果用户没有消息，则清空提示
          $('.no_session').hide();
          getUserImg($(that).data('id'));
          chat_content.val('').removeAttr('disabled','disabled');
          update_img_box.hide();
          chat_footer.find('.submit').attr('data-status',0);
          chat_footer_bd.find('button').removeAttr('disabled','disabled');
          image_list.empty();
          $('.updata_image_btn').css('display','block').find('button').text('+');
          image_list.css('height','0');
          init.loadimg();
          $('.content').scrollTop($('.content ul').height());
        }else if(msg.status == 'fail'){
          $.toast('发送失败');
        }else if(msg.status == 'sending'){
          $.toast('发送中');
        }
      }
    }else{
      if(!content){
        chat_content.attr('placeholder','😒 内容不能为空');
        return;
      }
      var msg = nim.sendText({
        scene: 'p2p',
        to: $(that).data('touid'),
        text: content,
        done: sendMsgDone
      });
      function sendMsgDone(error, msg) {
        //如果用户不存在 则注册用户 
        if(error){
          if(error.code){
            var url = '/index.php?g=api&m=HsNeteasyIM&a=register_new_user&user_id=' + $(that).data('touid');
            $.ajax({
              type: 'GET',
              url: url,
              timeout: 4000,
              success: function(data){
                console.log(data);
              }
            });
            return $.toast('发送失败,请重新发送');
          }else{
            return $.toast(error);
          }
        }
        //用户存在，没有错误
        if(msg.status == 'success'){
          var str = '<li class="me" data-id="'+$(that).data('id')+'"><span class="date">'+messageTime(msg['time'])+'</span><span class="avatar"></span><div class="content_bd">'+msg.text+'</div></li>';
          chat_list.find('ul').append(str);
          //如果用户没有消息，则清空提示
          $('.no_session').hide();
          getUserImg($(that).data('id'));
          chat_content.val('');
          $('.content').scrollTop($('.content ul').height());
        }else if(msg.status == 'fail'){
          $.toast('发送失败,请重新发送');
        }else if(msg.status == 'sending'){
          $.toast('发送中');
        }
      }
    }
  });

  // 最后一次购买
  var chat_header_bd = $('.chat-header-bd');
  var recent_box = $('.recent_box');
  var recent_tpl = handlebars.compile($("#recent_tpl").html());
  recent_box.css('top',$('.chat-header').height());
  var recent_btn = $('.recent_btn');
  recent_btn.on('click',function(e) {
    var _this = $(this);
    if(!$(this).hasClass('active')){
      $(this).addClass('active');
      $.ajax({
        type: 'POST',
        url: '/index.php?g=User&m=HsMessage&a=ajax_query_order',
        data: {
          object_owner_uid: $(this).data('id'),
          user_id: $(this).data('uid')
        },
        dataType: 'json',
        timeout: 4000,
        success: function(data){
          if(data.status == 1){
            recent_box.html(recent_tpl(data.data));
            recent_box.show();
            chat_header_bd.css('background-color','#ededed');
          } else {
            $.toast(data.info);
            recent_btn.off('click');
            _this.remove();
          }

        },
        error: function(xhr, type){
          $.toast('网络错误 code:'+xhr);
        }
      });
    } else {
      $(this).removeClass('active');
      recent_box.hide();
      chat_header_bd.css('background-color','#fff');
    }
  })
  // 预览图
  page.on('click','.image',function(){
    wx.previewImage({
      current: $(this).data('preview'),
      urls: [$(this).data('preview')]
    });
  });

  // 初始化下拉
  var loading = false,
  idServer = 0,
  updateTime = 0;
  $('.pull-to-refresh-layer').css('display','none');
  // 监听下拉
  setTimeout(function() {
  page.on('refresh', '.pull-to-refresh-content',function(e) {
   if (loading ) return;
    // 设置flag
    loading = true;
    setTimeout(function() {
      // 重置加载flag
      loading = false;
      // 添加数据
      add_data(idServer);
    }, 500);
  });
  }, 500);

  function add_data(idServerdef){
    var uid = $('.submit').data('touid'),
    myId = $('.submit').data('id');
    nim.getHistoryMsgs({
        scene: 'p2p',
        to: uid,
        limit: 20,
        reverse: false,
        endTime: parseInt(updateTime),
        lastMsgId: parseInt(idServerdef),
        done: getHistoryMsgsDone
    });
    function getHistoryMsgsDone(error, obj) {
        if(error){
          return $.toast(error);
        }
        var data = obj.msgs;
        if(data.length == 0){
          $.toast('找不到更多记录了',500);
          $.pullToRefreshDone('.pull-to-refresh-content');
          $.destroyPullToRefresh('.pull-to-refresh-content');
          $('.pull-to-refresh-layer').css('display','none');
          return false;
        }
        for(var i in data){
          if(myId == data[i]['from']){
            if(data[i]['type'] == 'text'){
              var str = '<li class="me" data-id="'+myId+'"><span class="date">'+messageTime(data[i]['time'])+'</span><span class="avatar"></span><div class="content_bd">'+data[i]['text']+'</div></li>';
            }else if(data[i]['type'] == 'image'){
              var str = '<li class="me" data-id="'+myId+'"><span class="date">'+messageTime(data[i]['time'])+'</span><span class="avatar"></span><div class="content_bd">'
              +'<div class="image" data-layzr="'+data[i]['file']['url']+'" data-preview="'+data[i]['file']['url']+'"></div></div></li>';
            }
          }else{
            if(data[i]['type'] == 'text'){
              var str = '<li class="user" data-id="'+uid+'"><span class="date">'+messageTime(data[i]['time'])+'</span><span class="avatar"></span><div class="content_bd">'+data[i]['text']+'</div></li>';
            }else if(data[i]['type'] == 'image'){
              var str = '<li class="user" data-id="'+uid+'"><span class="date">'+messageTime(data[i]['time'])+'</span><span class="avatar"></span><div class="content_bd">'
              +'<div class="image" data-layzr="'+data[i]['file']['url']+'" data-preview="'+data[i]['file']['url']+'"></div></div></li>';
            }
          }
          chat_list.find('ul').prepend(str);
          //设置下次获取聊天记录的参数idServer updateTime
          idServer = data[i]['idServer'];
          updateTime = data[i]['time'];
        }
        getUserImg(uid);
        getUserImg(myId);
        $.pullToRefreshDone('.pull-to-refresh-content');
        init.loadimg();
    }
  }


  //重置会话 初始参数
  var reset_session = false,
  mineId = $('#cnzz_user_id').val(),
  nim;
  function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
      "SymbianOS", "Windows Phone",
      "iPad", "iPod"
    ];
    var flag = false;
    for(var v = 0; v < Agents.length; v++) {
      if(userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = true;
        break;
      }
    }
    return flag;
  }
  var statusDb = IsPC();
  $.ajax({
    type: 'POST',
    url: '/index.php?g=api&m=HsNeteasyIM&a=get_token',
    timeout: 4000,
    success: function(data){
      var token = JSON.parse(data).data.token;
      nim = NIM.getInstance({
          appKey: '3ee032ac53f77af2dd508b941d091f60',
          account: mineId,
          token: token,
          syncSessionUnread: true,
          onconnect: onConnect,
          onwillreconnect: onWillReconnect,
          ondisconnect: onDisconnect,
          onerror: onError,
          onsessions: onSessions,
          onupdatesession: onUpdateSession,
          onpushevents: onPushEvents,
          db: statusDb
      });
    },
    error: function(xhr, type){
        // $.toast(xhr.info);
        console.log(type);
      // $.toast('网络错误 code:'+xhr);
    }
  });
  //获取用户在线状态
  function onPushEvents (param) {
    //ios只有在退出登录才会离线
    var touid = $('.submit').data('touid');
    var status = true;
    if (param.msgEvents) {
      param.msgEvents.forEach(function(data){
        var touid = $('.submit').data('touid');
        if(data.account == touid){
          status = false;
        }
      })
    }
    if(status){
      //使用微信推送
      console.log('这sb不在线');
    }
  }
  function onConnect() {
      console.log('连接成功');
  }
  // 重连
  function onWillReconnect(obj) {
      // 此时说明 SDK 已经断开连接, 请开发者在界面上提示用户连接已断开, 而且正在重新建立连接
      // console.log('即将重连');
      // console.log(obj.retryCount);
      // console.log(obj.duration);
  }
  // 断开
  function onDisconnect(error) {
      // 此时说明 SDK 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
      // console.log('丢失连接');
      if (error) {
          switch (error.code) {
          // 账号或者密码错误, 请跳转到登录页面并提示错误

          case 302:
              $.ajax({
                  type: 'POST',
                  url: '/index.php?g=api&m=HsNeteasyIM&a=refresh_token',
                  data:{
                      user_id: myId
                  },
                  timeout: 4000,
                  success: function(data){
                      console.log(data);
                  },
                  error: function(xhr, type){
                      // $.toast(xhr.info);
                      console.log(type);
                  }
              });
              break;
          // 重复登录, 已经在其它端登录了, 请跳转到登录页面并提示错误
          case 417:
              break;
          // 被踢, 请提示错误后跳转到登录页面
          case 'kicked':
              break;
          default:
              break;
          }
      }
  }
  // 错误
  function onError(error) {
        // console.log(error);
  }
  //初始加载
  function onSessions(sessions) {
    var uid = $('.submit').data('touid'),
    myId = $('.submit').data('id');
        nim.getHistoryMsgs({
            scene: 'p2p',
            to: uid,
            limit: 20,
            lastMsgId:0,
            reverse: false,
            done: getHistoryMsgsDone
        });
    //获取历史消息
    function getHistoryMsgsDone(error, obj) {
        if(error){
          return $.toast(error);
        }
        var data = obj.msgs;
        //如果用户没有消息
        if(!data.length){
          $('.no_session').text('暂时没有消息');
          return false;
        }
        $('.pull-to-refresh-layer').css('display','block');
        //如果用户有历史消息
        $('.no_session').hide();
        for(var i in data){
          if(myId == data[i]['from']){
            if(data[i]['type'] == 'text'){
              var str = '<li class="me" data-id="'+myId+'"><span class="date">'+messageTime(data[i]['time'])+'</span><span class="avatar"></span><div class="content_bd">'+data[i]['text']+'</div></li>';
            }else if(data[i]['type'] == 'image'){
              var str = '<li class="me" data-id="'+myId+'"><span class="date">'+messageTime(data[i]['time'])+'</span><span class="avatar"></span><div class="content_bd">'
              +'<div class="image" data-layzr="'+data[i]['file']['url']+'" data-preview="'+data[i]['file']['url']+'"></div></div></li>';
            }
          }else{
            if(data[i]['type'] == 'text'){
              var str = '<li class="user" data-id="'+uid+'"><span class="date">'+messageTime(data[i]['time'])+'</span><span class="avatar"></span><div class="content_bd">'+data[i]['text']+'</div></li>';
            }else if(data[i]['type'] == 'image'){
              var str = '<li class="user" data-id="'+uid+'"><span class="date">'+messageTime(data[i]['time'])+'</span><span class="avatar"></span><div class="content_bd">'
              +'<div class="image" data-layzr="'+data[i]['file']['url']+'" data-preview="'+data[i]['file']['url']+'"></div></div></li>';
            }
          }
          chat_list.find('ul').prepend(str);
          //设置下次获取聊天记录的参数idServer updateTime
          idServer = data[i]['idServer'];
          updateTime = data[i]['time'];
        }
        //获取自己和别人的用户头像
        getUserImg(uid);
        getUserImg(myId);
        //图片初始化
        init.loadimg();
        // 设置页面高度到最新聊天位置
        $('.content').scrollTop($('.content ul').height());
        //重置未读数
        resetSession(uid);
    }
  }
  // 收到数据调用
  function onUpdateSession(session) {
    // //若是清空消息调用接口时的处理
    if(reset_session){
      reset_session = false;
      return false;
    }
    if(session['unread'] == 0){
      return false;
    }
    //收到会话处理
    var uid = $('.submit').data('touid'),
    myId = $('.submit').data('id');
    if(session['lastMsg']['from'] == uid){
      if(session['lastMsg']['type'] == 'text'){
        var str = '<li class="user" data-id="'+session['lastMsg']['from']+'"><span class="date">'+messageTime(session['lastMsg']['time'])+'</span><span class="avatar"></span><div class="content_bd">'
        +session['lastMsg']['text']+'</div></li>';
      }else if(session['lastMsg']['type'] == 'image'){
        var str = '<li class="user" data-id="'+session['lastMsg']['from']+'"><span class="date">'+messageTime(session['lastMsg']['time'])+'</span><span class="avatar"></span><div class="content_bd">'
          +'<div class="image" data-layzr="'+session['lastMsg']['file']['url']+'" data-preview="'+session['lastMsg']['file']['url']+'"></div></div></li>';
      }
      chat_list.find('ul').append(str);
      getUserImg(uid);
      $('.content').scrollTop($('.content ul').height());
      init.loadimg();
      //清除未读数
      resetSession(uid);
    }
  }
  //获取自己头像
  function getUserImg(id){
    nim.getUser({
        account: id,
        done: getUserDone
    });
    function getUserDone(error, user) {
      var str = 'url('+user['avatar']+') no-repeat';
      $('.chat_list li').each(function(){
        var userId = $(this).data('id');
        if(id == userId){
          $(this).find('.avatar').css('background',str).css('background-size','100%');
        }
      })
    }
  }
  //时间戳格式化
  Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,  // 月份
        "d+": this.getDate(),   // 日
        "h+": this.getHours(),    // 小时
        "m+": this.getMinutes(),  // 分
        "s+": this.getSeconds(),  // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds() // 毫秒
    };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
  }
  //时间戳格式优化
  function messageTime(times){
    var time = new Date() - times;
    var setTime = new Date(times);
    if(time >= 86400000){
      return setTime.Format('MM-dd');
    }else if(time < 86400000){
      return setTime.Format('hh:mm');
    }
  }
  //清除未读数
  function resetSession(uid){
    var session_id = 'p2p-'+uid;
    nim.resetSessionUnread(session_id);
    reset_session = true;
  }
});
