// 私信列表
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.chat_list_group', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  // 检查是否有新的消息
  init.msg_tip();
  // 列表首页_通用底部发布
  var hs_footer = $('.hs-footer');
  var notice_box = $('.notice_box');
  var notice_bd = $('.notice_bd');
  var old_active;
  //初始化侧拉高度
  // $('.chat_list_group_bd ul li').height($('.chat_list_group_bd ul li').height());
  // 记录位置
  hs_footer.find('li').each(function(index,item) {
    if($(item).find('a').hasClass('active')) {
      old_active = index
    }
  })
  hs_footer.on('click','.notice_btn',function() {
    if(!$(this).find('a').hasClass('active')){
      hs_footer.find('li a').removeClass('active');
      $(this).find('a').addClass('active');
      notice_box.show();
      notice_box.css('bottom',hs_footer.height()-2);
    } else {
      $(this).find('a').removeClass('active');
      hs_footer.find('li').eq(old_active).find('a').addClass('active');
      notice_box.hide();
    }
  })
  notice_bd.on('click','a',function(e){
    var typeid = $(this).data('typeid');
    e.preventDefault();
    $.showPreloader();
    $.post('/index.php?g=restful&m=HsMobile&a=ajax_mobile_checking','',function(data){
      if(data.status == 1){
        $.hidePreloader();
        $('.phone_verify').find('.submit').attr('href','/user/HsPost/notice/type/'+typeid+'.html');
        $('.phone_verify').show();
      } else {
        // $.toast(data.info);
        $.hidePreloader();
        $.router.load('/user/HsPost/add/type/'+typeid+'.html', true);
      }
    })

    $('.notice_btn').find('a').removeClass('active');
    hs_footer.find('li').eq(old_active).find('a').addClass('active');
    notice_box.hide();
  })
  $('.phone_verify').on('click','.modal-overlay',function(){
    $('.phone_verify').hide();
  })
  //置顶 删除按钮 记录touch位置
  var touchclientX = 0,
  touchclientY = 0;
  $('.chat_list_group_bd ul').on('touchstart','li',function(e){
    e.stopPropagation();
    touchclientX = e.originalEvent.targetTouches[0].clientX;
    touchclientY = e.originalEvent.targetTouches[0].clientY;
  })
  $('.chat_list_group_bd ul').on('touchmove','li',function(e){
    
    var num = e.originalEvent.targetTouches.length;
    if(num == 1){
      var x = Math.abs(touchclientX - e.originalEvent.targetTouches[0].clientX);
      var y = Math.abs(touchclientY - e.originalEvent.targetTouches[0].clientY);
      //判断上下  还是左右
      if(x < y) return;
      e.preventDefault();
      e.stopPropagation();
      var n = (touchclientX - e.originalEvent.targetTouches[0].clientX)/100;
      if(n <= 4 && n>=0){
        if($(this).find('.btn-box').width() != 0){
          return;
        }
        if(n > 1){
          $(this).find('.btn-box').css('width',"2.45rem");
          $(this).find('a').css('transform',"translateX(-2.45rem)");
          $(this).find('a').css('webkitTransform',"translateX(-2.45rem)");
        }else{
          $(this).find('.btn-box').css('width',"0");
          $(this).find('a').css('transform',"translateX(0)");
          $(this).find('a').css('webkitTransform',"translateX(0)");
        }
      }else if(n < 0 && n>=-4){
        var m = 4+n;
        if($(this).find('.btn-box').width() == 0){
          return;
        }
        if(m <= 3){
          $(this).find('.btn-box').css('width',"0");
          $(this).find('a').css('transform',"translateX(0)");
          $(this).find('a').css('webkitTransform',"translateX(0)");
        }else{
          $(this).find('.btn-box').css('width',"2.45rem");
          $(this).find('a').css('transform',"translateX(-2.45rem)");
          $(this).find('a').css('webkitTransform',"translateX(-2.45rem)");
        }
      }
    }
  })
  // 删除聊天
  var deleteSession = false;
  page.on('click','.delete',function(){
    var uid = 'p2p-'+$(this).data('uid');
    nim.resetSessionUnread(uid);
    deleteSession = true;
  });
  var chat_list_group_bd_tpl_default = handlebars.compile($("#chat_list_group_bd_tpl_default").html());
  var chat_list_group_bd_tpl_update = handlebars.compile($("#chat_list_group_bd_tpl_update").html());
  // 增加handlebars判断
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });


  //IM即时通讯
  var myId = $('#cnzz_user_id').val(),
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
              account: myId,
              token: token,
              onconnect: onConnect,
              onwillreconnect: onWillReconnect,
              ondisconnect: onDisconnect,
              onerror: onError,
              onsessions: onSessions,
              syncSessionUnread: true,
              onupdatesession: onUpdateSession,
              db: statusDb
          });
        },
        error: function(xhr, type){
            // $.toast(xhr.info);
            console.log(type);
          // $.toast('网络错误 code:'+xhr);
        }
    });
    
    function onConnect() {
        console.log('连接成功');
        setTimeout(function(){
          if($('.no_session').length){
            $('.no_session').text('暂无消息');
          }
        },2000)
    }
    function onWillReconnect(obj) {
        // 此时说明 SDK 已经断开连接, 请开发者在界面上提示用户连接已断开, 而且正在重新建立连接
        $.toast('即将重连');
        console.log(obj.retryCount);
        console.log(obj.duration);
    }
    function onDisconnect(error) {
        // 此时说明 SDK 处于断开状态, 开发者此时应该根据错误码提示相应的错误信息, 并且跳转到登录页面
        $.toast('丢失连接');
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
    function onError(error) {
        $.toast(error);
    }
    function onSessions(sessions) {
      console.log('sessions');
      var data = sessions;
      $('.no_session').remove();
      var userIds = [];
      for(var i in data){
        userIds.push(data[i]['to']);
        //时间转换
        var time = new Date() - data[i]['lastMsg']['time'];
        var setTime = new Date(data[i]['lastMsg']['time']);
        if(time >= 86400000){
          data[i]['lastMsg']['create_time'] = setTime.Format('MM-dd');
        }else{
          data[i]['lastMsg']['create_time'] = setTime.ResidueTime();
        }
        if(data[i]['lastMsg']['type'] == 'image'){
          data[i]['lastMsg']['text'] = '[照片]';
        }
      }
      //添加数据
      $('.chat_list_group_bd').find('ul').append(chat_list_group_bd_tpl_default(data));
      $('.chat_list_group_bd ul li').find('.btn-box').height($('.chat_list_group_bd ul li').height());
      for(var i in data){
        getUserImg(data[i]['to']);
      }
      //获取用户在线状态
      nim.subscribeEvent({
        type: 1,
        accounts: userIds,
        subscribeTime: 60,
        sync: true,
        done: function(err, res){
          if (err) {
            // console.error('订阅好友事件失败', err);
          } else {
            // console.info('订阅好友事件', res);
          }
        }
      });
      //删除自己和自己的私信
      // $('.chat_list_group_bd').find('li').each(function(){
      //   var uid = $(this).data('id');
      //   var myId = $('#cnzz_user_id').val();
      //   if(uid == myId){
      //     $(this).remove();
      //   }
      // })
    }
    function onUpdateSession(session) {
        //删除会话使用代码
        if(deleteSession){
          nim.deleteSession({
            scene: 'p2p',
            to: session.to,
            done: deleteSessionDone
          });
          function deleteSessionDone(error, obj) {
            if(error) return;
            $('.chat_list_group_bd').find('ul li').each(function(){
              var id = $(this).data('id');
              var dataId = session.to;
              if(id == dataId){
                $(this).remove();
                return false;
              }
            })
          }
          deleteSession = false;
          return false;
        }
        //收到消息使用代码
        $('.chat_list_group_bd').find('ul li').each(function(){
          var id = $(this).data('id');
          var dataId = session.to;
          if(id == dataId){
            $(this).remove();
            return false;
          }
        })
        var data = session;
        //时间转换
        var time = new Date() - data['lastMsg']['time'];
        var setTime = new Date(data['lastMsg']['time']);
        if(time >= 86400000){
          data['lastMsg']['create_time'] = setTime.Format('MM-dd');
        }else{
          data['lastMsg']['create_time'] = setTime.ResidueTime();
        }
        if(data['lastMsg']['type'] == 'image'){
          data['lastMsg']['text'] = '[照片]';
        }
        $('.chat_list_group_bd').find('ul').prepend(chat_list_group_bd_tpl_update(data));
        $('.chat_list_group_bd ul li').find('.btn-box').height($('.chat_list_group_bd ul li').height());
        getUserImg(data['to']);

    }






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
    Date.prototype.ResidueTime = function () {
      var data = new Date();
      var time = data-this;

      if(time>=3600000){
        var h = Math.floor(time/1000/3600);
        return h+"小时前";
      }else if(time < 3600000 && time >= 60000){
        var m = Math.floor(time/1000/60);
        return m+"分前";
      }else if(time < 60000){
        var s = Math.floor(time/1000);
        return s+"秒前";
      }
   }
   function getUserImg(id,i){
    nim.getUser({
        account: id,
        done: getUserDone
    });
    function getUserDone(error, user) {
      $('.chat_list_group_bd').find('li').each(function(){
        var uid = $(this).data('id');
        var str = 'url('+user['avatar']+') no-repeat';
        if(uid == id){
          $(this).find('.avatar').css('background',str).css('background-size','100%');
          $(this).find('h3').text(user['nick']);
        }
      })
    }
   }
});
