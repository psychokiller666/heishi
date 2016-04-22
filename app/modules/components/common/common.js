// 页面初始化
// 图片延时加载
var lazyload = require('../../../../bower_components/lazyload/lazyload.min.js');
// 微信sdk
var wx = require('weixin-js-sdk');

var common = function(page){
  this.page = page;
  // if (page.selector == '.page'){
  //   return false;
  // }
  // 页面初始化
  // 控制.hs-page高度
  if($(this.page).find('.hs-page').length){
    if($(this.page).find('header').length){
      $(this.page).find('.hs-main').css('top',lib.flexible.px2rem($(this.page).find('header').height())+'rem');
    } else {
      $(this.page).find('.hs-main').css('top','0');
    }
    if($(this.page).find('footer').length){
      $(this.page).find('.hs-main').css('bottom',lib.flexible.px2rem($(this.page).find('footer').height())+'rem');
    } else {
      $(this.page).find('.hs-main').css('bottom','0');
    }
  }
  // console.log(page,'页面初始化');
  // 图片加载
  // 头部
  if($(this.page).find('header').length){
    $('[data-layzr]').lazyload({
      data_attribute:'layzr',
      container: $("header")
    });
  }
  // 内容部分
  $('[data-layzr]').lazyload({
    data_attribute:'layzr',
    container: $(".content")
  });

};
// 图片延时加载
common.prototype.loadimg = function(){
  $('[data-layzr]').lazyload({
    data_attribute:'layzr',
    container: $(".content")
  });
}
// 检测新消息
common.prototype.msg_tip = function(){
  $.getJSON('/index.php?g=user&m=HsMessage&a=new_messages',{},function(data){
    if(data.status == '1'){
      if(data.data.messages >= 1){
        $('.hs-footer').find('.messages').addClass('new');
      }
      if(data.data.posts >= 1){
        if($('.center').length){
          $('.activate').next('span').addClass('new');
        }
        $('.hs-footer').find('.me').addClass('new');
      }
    } else {
      $.toast(data.info);
    }
  });
}
// 检查是否关注公众号
common.prototype.checkfollow = function(type){
  $.ajax({
    url: '/index.php?g=user&m=HsWeixin&a=userinfo',
    data: {
      type:type
    },
    type: 'POST',
    async:false
  }).done(function (res) {
    if(res.data == 0) {
      $('.follow_me').show();
    }
  });
  $(this.page).on('click','.bitch_close',function(){
    $('.follow_me').hide();
  })
}
// 微信jssdk分享
common.prototype.wx_share = function(options){
  $.ajax({
    url: '/index.php?g=restful&m=HsJsapi&a=jssign',
    type: 'POST',
    data: {
      url: encodeURIComponent(location.href.split('#')[0])
    }
  }).done(function(data){
    // console.log(data,'微信sdk初始化');
    // 判断是否分享
    if(options) {
      wx.config({
        debug: false,
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: [
        'checkJsApi',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'showMenuItems',
        'showAllNonBaseMenuItem'
        ]
      });
      wx.ready(function(){
      // 分享
      wx.onMenuShareTimeline({
        title: $.trim(options.title),
        link: options.link,
        imgUrl: options.img,
        success: function(){
          // 用户确认分享后执行的回调函数
        }
      });
      wx.onMenuShareAppMessage({
        title: $.trim(options.title),
        desc: $.trim(options.desc),
        link: options.link,
        imgUrl: options.img,
        success:function(){
          // 用户确认分享后执行的回调函数
        }
      });
      wx.showMenuItems({
        menuList: [
        'menuItem:addContact',
        'menuItem:profile',
        'menuItem:share:appMessage',
        'menuItem:share:timeline',
        'menuItem:copyUrl',
        'menuItem:favorite'
        ]
      });
    });
    } else {
      wx.config({
        debug: false,
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: [
        'checkJsApi',
        'hideMenuItems',
        'scanQRCode'
        ]
      });
      wx.ready(function(){
        wx.hideMenuItems({
          menuList: [
          'menuItem:share:appMessage',
          'menuItem:share:timeline',
          'menuItem:share:qq',
          'menuItem:share:weiboApp',
          'menuItem:favorite',
          'menuItem:share:facebook',
          'menuItem:share:QZone',
          'menuItem:copyUrl',
          'menuItem:openWithSafari',
          'menuItem:readMode'
          ]
        });
      });
    }
  });
}
module.exports = common;
