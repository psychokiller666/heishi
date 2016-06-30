// 页面初始化
// 图片延时加载
var lazyload = require('../../../../bower_components/jieyou_lazyload/lazyload.min.js');
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
  this.cnzz_dplus();
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
  var _this = this;

  $.ajax({
    url: '/index.php?g=restful&m=HsJsapi&a=jssign',
    type: 'POST',
    data: {
      url: encodeURIComponent(location.href.split('#')[0])
    }
  }).done(function(data){
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
          _this.cnzz_push('分享微信朋友圈',{
            '标题':$.trim(options.title)
          });
        }
      });
      wx.onMenuShareAppMessage({
        title: $.trim(options.title),
        desc: $.trim(options.desc),
        link: options.link,
        imgUrl: options.img,
        success:function(){
          // 用户确认分享后执行的回调函数
          _this.cnzz_push('分享微信好友',{
            '标题':$.trim(options.title)
          });
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
// dplus统计
common.prototype.cnzz_dplus = function(){
  !function(a,b){if(!b.__SV){var c,d,e,f;window.dplus=b,b._i=[],b.init=function(a,c,d){function g(a,b){var c=b.split(".");2==c.length&&(a=a[c[0]],b=c[1]),a[b]=function(){a.push([b].concat(Array.prototype.slice.call(arguments,0)))}}var h=b;for("undefined"!=typeof d?h=b[d]=[]:d="dplus",h.people=h.people||[],h.toString=function(a){var b="dplus";return"dplus"!==d&&(b+="."+d),a||(b+=" (stub)"),b},h.people.toString=function(){return h.toString(1)+".people (stub)"},e="disable track track_links track_forms register unregister get_property identify clear set_config get_config get_distinct_id track_pageview register_once track_with_tag time_event people.set people.unset people.delete_user".split(" "),f=0;f<e.length;f++)g(h,e[f]);b._i.push([a,c,d])},b.__SV=1.1,c=a.createElement("script"),c.type="text/javascript",c.charset="utf-8",c.async=!0,c.src="//w.cnzz.com/dplus.php?token=d415a771be06ep9c7df4",d=a.getElementsByTagName("script")[0],d.parentNode.insertBefore(c,d)}}(document,window.dplus||[]),dplus.init("d415a771be06ep9c7df4", {
    loaded: function() {
      function GetQueryString(name) {
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
      }
      var user_id = $('#cnzz_user_id').val();
      var source = GetQueryString('from');
      var source_list = {
        "timeline":"微信朋友圈",
        "singlemessage":"微信好友",
        "groupmessage":"微信群",
        "ontheroad":"公路商店_输入框按钮",
        "ontheroadstore":"公路商店_微信文章",
        "heishi":"黑市_输入框按钮",
        "nbheishi":"黑市_微信文章"
      }
      for(var key in source_list) {
        if(source == key) {
          source = source_list[key];
        }
      }
      dplus.register({
        '来源入口' : source,
        '用户ID' : user_id
      });
      // 标记id
      if(!dplus.get_property("来源入口")){
        dplus.identify(user_id);
      }
      // 点击头部导航栏
      $('.hs-header a').on('click',function(e){
        var title = $.trim($(this).text());
        var href = $(this).attr('href');
        e.preventDefault();

        dplus.track("点击头部导航栏" , {
          '按钮名称' : title
        },function(){
          if(href){
            location.href = href;
          }
        },300);
      });
      // 点击底部导航栏
      $('.hs-footer a').on('click',function(e){
        var title = $.trim($(this).text());
        var href = $(this).attr('href');
        e.preventDefault();

        dplus.track("点击头部导航栏" , {
          '按钮名称' : title
        },function(){
          if(href){
            location.href = href;
          }
        },300);
      });
      dplus.track('页面浏览');
    }
  });
  common.prototype.cnzz_push = function(pushdata){
    dplus.track(pushdata);
  }
}
module.exports = common;
