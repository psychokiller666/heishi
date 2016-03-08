// 页面初始化
// 图片延时加载
var Layzr = require('../../../../node_modules/layzr.js/dist/layzr.js');
// 微信sdk
var wx = require('weixin-js-sdk');

var common = function(page){
  this.page = page;
  if (page.selector == '.page'){
    return false;
  }
  // 页面初始化
  // 控制.hs-page高度
  if($(this.page).find('.hs-page').length){
    if($(this.page).find('header').length){
      $(this.page).find('.hs-main').css('top',$(this.page).find('header').height());
    } else {
      $(this.page).find('.hs-main').css('top','0');
    }
    if($(this.page).find('footer').length){
      $(this.page).find('.hs-main').css('bottom',$(this.page).find('footer').height());
    } else {
      $(this.page).find('.hs-main').css('bottom','0');
    }
  }
  console.log(page,'页面初始化');
  // 图片加载
  var layzr = new Layzr({
    threshold: 10000,
  });
};
// 图片延时加载
common.prototype.loadimg = function(){
  var layzr = new Layzr({
    threshold: 10000,
  });
  layzr.update();
}
// 检测新消息
common.prototype.msg_tip = function(){
  $.getJSON('/index.php?g=user&m=HsMessage&a=new_messages',{},function(data){
    if(data.status == '1'){
      console.log(data.data);
    } else {
      $.toast(data.info);
    }
  });
}
// 检查是否关注公众号
common.prototype.checkfollow = function(){

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
    console.log(data,'微信sdk初始化');
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
