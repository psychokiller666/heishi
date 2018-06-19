// 私信聊天
// 微信jssdk
var wx = require('weixin-js-sdk');
// 过滤关键词
var esc = require('../../../../node_modules/chn-escape/escape.js');
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.detail', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  // 初始底部
  $('.hs-main').css('bottom', $('.reply_content').height() + 'px');


  var uploadingStatus = false;
  $('.uploading').click(function(){
    if(uploadingStatus){
      uploadingStatus = false;
      $('.more').css('height', '0');
      $('.hs-main').css('top', '0');
    }else{
      uploadingStatus = true;
      $('.more').css('height', '5.73rem');
      $('.hs-main').css('top', '-5.73rem');
    }
  })
  $('.more').on('click', '.order', function(){
    location.href = '/user/HsBuyorder/order_all.html';
  })
  $('.more').on('click', '.history', function(){
    location.href = '/user/History/index.html';
  })
  $('.more').on('click', '.complain', function(){
    $('.report_form').show();
  })
  $('.chat_list').click(function(){
    uploadingStatus = false;
    $('.more').css('height', '0');
    $('.hs-main').css('top', '0');
  })

  // 投诉
  $('.report_form_sub').click(function(){
    var content = $('.report_form_content').val();
    var uid = $(this).attr('data-uid');
    if(!content){
      return $.toast('请填写举报原因');
    }
    $.ajax({
      type: 'POST',
      url: '/index.php?g=restful&m=HsUserReporting&a=reporting',
      data: {
        be_reported_uid: uid,
        content: content
      },
      success: function(data){
        if(data.status == 1){
          $.toast('举报成功');
        }else{
          $.toast(data.info);
        }
        $('.report_form').css('display', 'none');
      }
    })
  })
  $('.report_form_close').click(function(){
    $('.report_form').css('display', 'none');
  })
  $('.report_form_keyword').click(function(){
    $('.report_form_content').val($(this).text());
  })

  // 关闭更多
  var navigator_activity = navigator.userAgent;
  var isiOS = !!navigator_activity.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  var replyTextChange = false;
  $('.reply_text').focus(function(){
    $('.content').css('overflow-y', 'hidden');
    uploadingStatus = false;
    $('.more').css('height', '0');
    $('.hs-main').css('top', '0');
    if(replyTextChange && isiOS){
      $('.reply_input').css('padding-bottom', '1.2rem');
      replyTextChange = false;
    }
  })
  $('.reply_text').blur(function(){
    $('.content').css('overflow-y', 'auto');
    $('.reply_input').css('padding-bottom', '0');
  })
  if(isiOS){
    $('.reply_text').change(function(){
      replyTextChange = true;
    })
  }







  // 回复私信
  var chat_list = $('.chat_list');

  var myId = $('#my_id').val();
  var IMmyId = $('#my_id').val();

  var userId = $('#user_id').val();
  var IMuserId = $('#user_id').val();

  // 用户头像
  var myAvatar = $('#my_avatar').val();
  var userAvatar = $('#user_avatar').val();

  var IMnim = null;
  //重置会话 初始参数
  var reset_session = false;
  // 获取用户在线状态
  var user_line_status = true;
  // 默认用户ID 为网易IM ID
  // 测试环境 网易id加hstest
  if(GV.HOST != 'http://hs.ontheroadstore.com/'){
    IMmyId = 'hstest' + IMmyId;
    IMuserId = 'hstest' + IMuserId;
  }
  $.ajax({
    type: 'POST',
    url: '/index.php?g=api&m=HsNeteasyIM&a=get_token_by_user_id',
    data: {
      user_id: myId
    },
    success: function(res){
      var data = JSON.parse(res);
      if(data.status == 1){
        var token = data.data.token;
        var appKey = data.data.app_key;
        IMnim = NIM.getInstance({
          appKey: appKey,
          account: IMmyId,
          token: token,
          syncSessionUnread: true,
          onconnect: onConnect,
          ondisconnect: onDisconnect,
          onsessions: onSessions,
          onupdatesession: onUpdateSession,
          onpushevents: onPushEvents,
          db: true
        });
      }else{
        $.toast('登录失败');
      }
    },
    error: function(xhr, type){
      $.toast('登录失败');
    }
  });




  // 图片回复
  $('.uploader').on("change", function(e) {
    var that = this;
    if(myId == userId){
      $.toast('自己玩呢?');
      return false;
    }
    $.showPreloader("图片发送中");
    IMnim.previewFile({
      type: 'image',
      fileInput: that,
      done: function(error, file) {
        $.hidePreloader();
        if(error){
          return $.toast(error);
        }
        // 上传成功直接发送给用户
        IMnim.sendFile({
          scene: 'p2p',
          to: IMuserId,
          type: 'image',
          fileInput: $('.uploader')[0],
          done: sendMsgDoneFile
        });
        function sendMsgDoneFile(error, msg){
          uploadingStatus = false;
          $('.more').css('height', '0');
          $('.hs-main').css('top', '0');
          $('.reply_text').val('');
          //发送图片时，如果用户不存在 则注册用户 
          if(error){
            if(error.code == 404){
              registerUser();
              return false;
            }else{
              return $.toast(error);
            }
          }
          $.toast('发送成功');
          //用户存在，没有错误
          if(msg.status == 'success'){
            var str = '<li class="me"><span class="avatar" style="background-image: url('+myAvatar+')"></span><div class="content_bd">'
            +'<div class="image" data-layzr="'+msg['file']['url']+'" data-preview="'+msg['file']['url']+'"></div></div><span class="date">'+messageTime(msg['time'])+'</span></li>';
            chat_list.find('ul').append(str);
            init.loadimg();
            $('.content').scrollTop($('.content ul').height());
            //用户不在线发推送
            if(user_line_status){
              messagePush(userId,'[图片]',1);
              offlineMessage(userId);
            }
          }else if(msg.status == 'fail'){
            $.toast('发送失败');
          }else if(msg.status == 'sending'){
            $.toast('发送中');
          }
        }
      }
    });
  });









  // 登录成功
  function onConnect() {
    //订阅用户
    IMnim.subscribeEvent({
      type: 1,
      accounts: [IMuserId],
      subscribeTime: 3600,
      sync: true,
      done: function(err, res){
        // console.log(res)
      }
    });
  }
  // 断开
  function onDisconnect(error) {
    // 此时说明 SDK 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
    if (error) {
      switch (error.code) {
      // 账号或者密码错误, 重置token 密码
      case 302:
          $.ajax({
              type: 'POST',
              url: '/index.php?g=api&m=HsNeteasyIM&a=refresh_token',
              data:{
                  user_id: myId
              },
              timeout: 4000,
              success: function(data){
                // console.log(data);
                $.toast('登录过期，请刷新页面重新登录');
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
  // 初始加载
  function onSessions(sessions) {
    IMnim.getHistoryMsgs({
        scene: 'p2p',
        to: IMuserId,
        limit: 20,
        lastMsgId:0,
        reverse: false,
        done: getHistoryMsgsDone
    });
    //获取历史消息
    function getHistoryMsgsDone(error, obj) {
      // 添加下拉事件
      setRefresh();
      // 错误直接返回
      if(error){
        return $.toast(error);
      }
      var data = obj.msgs;
      //如果用户没有消息
      if(data.length == 0){
        return $.toast('近期没有聊天记录，请下拉查看历史记录');
      }
      //如果用户有消息
      for(var i in data){
        if(IMmyId == data[i]['from']){
          if(data[i]['type'] == 'text'){
            var str = '<li class="me"><span class="avatar" style="background-image: url('+myAvatar+')"></span><div class="content_bd">'+data[i]['text']+'</div><span class="date">'+messageTime(data[i]['time'])+'</span></li>';
          }else if(data[i]['type'] == 'image'){
            var str = '<li class="me"><span class="avatar" style="background-image: url('+myAvatar+')"></span><div class="content_bd">'
            +'<div class="image" data-layzr="'+data[i]['file']['url']+'" data-preview="'+data[i]['file']['url']+'"></div></div><span class="date">'+messageTime(data[i]['time'])+'</span></li>';
          }
        }else{
          if(data[i]['type'] == 'text'){
            var str = '<li class="user"><span class="avatar" style="background-image: url('+userAvatar+')"></span><div class="content_bd">'+data[i]['text']+'</div><span class="date">'+messageTime(data[i]['time'])+'</span></li>';
          }else if(data[i]['type'] == 'image'){
            var str = '<li class="user"><span class="avatar" style="background-image: url('+userAvatar+')"></span><div class="content_bd">'
            +'<div class="image" data-layzr="'+data[i]['file']['url']+'" data-preview="'+data[i]['file']['url']+'"></div></div><span class="date">'+messageTime(data[i]['time'])+'</span></li>';
          }
        }
        chat_list.find('ul').prepend(str);
        //设置下次获取聊天记录的参数idServer updateTime
        idServer = data[i]['idServer'];
        updateTime = data[i]['time'];
      }
      //图片初始化
      init.loadimg();
      // 设置页面高度到最新聊天位置
      $('.content').scrollTop($('.content ul').height());
      //重置未读数
      resetSession(IMuserId);
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
    if(session['lastMsg']['from'] == IMuserId){
      if(session['lastMsg']['type'] == 'text'){
        var str = '<li class="user"><span class="date">'+messageTime(session['lastMsg']['time'])+'</span><span class="avatar" style="background-image: url('+userAvatar+')"></span><div class="content_bd">'
        +session['lastMsg']['text']+'</div></li>';
      }else if(session['lastMsg']['type'] == 'image'){
        var str = '<li class="user"><span class="date">'+messageTime(session['lastMsg']['time'])+'</span><span class="avatar" style="background-image: url('+userAvatar+')"></span><div class="content_bd">'
          +'<div class="image" data-layzr="'+session['lastMsg']['file']['url']+'" data-preview="'+session['lastMsg']['file']['url']+'"></div></div></li>';
      }
      chat_list.find('ul').append(str);
      $('.content').scrollTop($('.content ul').height());
      init.loadimg();
      //清除未读数
      resetSession(IMuserId);
    }
  }
  //获取用户在线状态
  function onPushEvents (param) {
    //ios只有在退出登录才会离线
    if (param.msgEvents) {
      param.msgEvents.forEach(function(data){
        if(data.account == IMuserId && data.value == 1){
          user_line_status = false;

        }else if(data.account == IMuserId && data.value != 1){
          user_line_status = true;
        }
      })
    }
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
    IMnim.resetSessionUnread(session_id);
    reset_session = true;
  }
    //如果用户不在线则发微信推送
  function messagePush(id,content,type){
    // 用户id
    $.ajax({
      type: 'POST',
      url: '/index.php?g=restful&m=HsMessage&a=push_message',
      data:{
        to_user_id: id,
        message: content,
        message_type: type
      },
      timeout: 4000,
      success: function(data){
        console.log(data);
      }
    });
  }
  // 用户不在线时拿到卖家离线留言显示
  function offlineMessage(id){
    // 用户id
    $.ajax({
      type: 'GET',
      url: '/index.php?g=User&m=HsMessage&a=Offline_reply&id=' + id,
      success: function(res){
        if(res.status == 1 && res['data']['content'] != null){
          var str = '<li class="user"><span class="date"></span><span class="avatar" style="background-image: url('+userAvatar+')"></span><div class="content_bd">'+res['data']['content']+'</div></li>';
          chat_list.find('ul').append(str);
          $('.content').scrollTop($('.content ul').height());
        }
      }
    });
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
  // 注册网易用户
  function registerUser() {
    var url = '/index.php?g=api&m=HsNeteasyIM&a=register_new_user&user_id=' + userId;
    $.ajax({
      type: 'GET',
      url: url,
      success: function(data){
        $.toast('发送失败,请重新发送');
      }
    });
  }
  

  
  // 提交私信
  $('.submit').on('click',function(){
    var that = this;
    var submitStatus = $(that).hasClass('underway');
    var replyText = $('.reply_text').val();
    if(submitStatus){
      return $.toast('正在发送消息，请稍等');
    }
    $(that).addClass('underway');
    // 过滤关键词
    var text_list = ['燃料','大麻','叶子','淘宝','taobao.com','有飞','想飞','要飞','加我','大妈','飞吗','飞嘛','qq','拿货','weed','机长','thc','蘑菇','邮票','LSD','taobao','tb','操你妈','草你妈','🍃'];
    esc.init(text_list);
    if(esc.find(replyText).length){
      $.toast('🚔 请文明用语');
      $('.submit').removeClass('underway');
      return false;
    }
    if(myId == userId){
      $.toast('自己玩呢?');
      $('.submit').removeClass('underway');
      return false;
    }
    if(!replyText){
      $.toast('内容不能为空');
      $('.submit').removeClass('underway');
      return false;
    }
    var msg = IMnim.sendText({
      scene: 'p2p',
      to: IMuserId,
      text: replyText,
      done: sendMsgDone
    });
    function sendMsgDone(error, msg) {
      //发送文字时，如果用户不存在 则注册用户
      $('.submit').removeClass('underway');
      if(error){
        if(error.code == 404){
          registerUser();
          return false;
        }else{
          return $.toast(error);
        }
      }
      //用户存在，没有错误
      if(msg.status == 'success'){
        var str = '<li class="me"><span class="avatar"></span><div class="content_bd">'+msg.text+'</div><span class="date">'+messageTime(msg['time'])+'</span></li>';
        chat_list.find('ul').append(str);
        $('.reply_text').val('');
        $('.content').scrollTop($('.content ul').height());
        //用户不在线发推送
        if(user_line_status){
          messagePush(userId, msg.text, 0);
          offlineMessage(userId);
        }
      }else if(msg.status == 'fail'){
        $.toast('发送失败,请重新发送');
      }else if(msg.status == 'sending'){
        $.toast('发送中');
      }
    }
  });

  // 预览图
  page.on('click','.image',function(){
    wx.previewImage({
      current: $(this).data('preview'),
      urls: [$(this).data('preview')]
    });
  });

  // 初始化下拉
  var loading = false;
  var idServer = 0;
  var updateTime = 0;
  // 监听下拉 数据获取完成后添加 
  function setRefresh() {
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
  }

  function add_data(){
    IMnim.getHistoryMsgs({
      scene: 'p2p',
      to: IMuserId,
      limit: 20,
      reverse: false,
      endTime: parseInt(updateTime),
      lastMsgId: parseInt(idServer),
      done: getHistoryMsgsDoneAll
    });
    function getHistoryMsgsDoneAll(error, obj) {
      if(error){
        return $.toast(error);
      }
      var data = obj.msgs;
      if(data.length == 0){
        $.toast('找不到更多记录了');
        $('.no_more').css('height', '1rem');
        $.pullToRefreshDone('.pull-to-refresh-content');
        $.destroyPullToRefresh('.pull-to-refresh-content');
        $('.pull-to-refresh-layer').css('display','none');
        return false;
      }
      for(var i in data){
        if(IMmyId == data[i]['from']){
          if(data[i]['type'] == 'text'){
            var str = '<li class="me"><span class="avatar" style="background-image: url('+myAvatar+')"></span><div class="content_bd">'+data[i]['text']+'</div><span class="date">'+messageTime(data[i]['time'])+'</span></li>';
          }else if(data[i]['type'] == 'image'){
            var str = '<li class="me"><span class="avatar" style="background-image: url('+myAvatar+')"></span><div class="content_bd">'
            +'<div class="image" data-layzr="'+data[i]['file']['url']+'" data-preview="'+data[i]['file']['url']+'"></div></div><span class="date">'+messageTime(data[i]['time'])+'</span></li>';
          }
        }else{
          if(data[i]['type'] == 'text'){
            var str = '<li class="user"><span class="avatar" style="background-image: url('+userAvatar+')"></span><div class="content_bd">'+data[i]['text']+'</div><span class="date">'+messageTime(data[i]['time'])+'</span></li>';
          }else if(data[i]['type'] == 'image'){
            var str = '<li class="user"><span class="avatar" style="background-image: url('+userAvatar+')"></span><div class="content_bd">'
            +'<div class="image" data-layzr="'+data[i]['file']['url']+'" data-preview="'+data[i]['file']['url']+'"></div></div><span class="date">'+messageTime(data[i]['time'])+'</span></li>';
          }
        }
        chat_list.find('ul').prepend(str);
        //设置下次获取聊天记录的参数idServer updateTime
        idServer = data[i]['idServer'];
        updateTime = data[i]['time'];
      }
      $.pullToRefreshDone('.pull-to-refresh-content');
      init.loadimg();
    }
  }

});
