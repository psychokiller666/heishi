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

  // this.cnzz_dplus();

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
  console.log('已使用IM即时通讯');
  // $.getJSON('/index.php?g=user&m=HsMessage&a=new_messages',{},function(data){
  //   if(data.status == '1'){
  //     if(data.data.messages >= 1){
  //       // 修改新消息提示位置 0315
  //       if(data.data.messages > 99){
  //         $('.center').find('.newMessages').css("display","inline-block").text('99');
  //         $('.information').css('display','block').text('99');
  //       }else{
  //         $('.center').find('.newMessages').css("display","inline-block").text(data.data.messages);
  //         $('.information').css("display","block").text(data.data.messages);
  //       }
  //     }
  //     // if(data.data.posts >= 1){
  //     //   if($('.center').length){
  //     //     $('.activate').next('span').addClass('new');
  //     //   }
  //     //   $('.hs-footer').find('.me').addClass('new');
  //     // }
  //   } else {
  //     $.toast(data.info);
  //   }
  // });
}
// 检查是否关注公众号
common.prototype.checkfollow = function(type){
  // 默认隐藏
  $.ajax({
    url: '/index.php?g=user&m=HsWeixin&a=userinfo',
    data: {
      type:type
    },
    type: 'POST',
    async: true
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
        'showAllNonBaseMenuItem',
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
          // 腾讯统计
          MtaH5.clickStat('wx_onMenuShareTimeline',{'title': options.title});
        }
      });
      wx.onMenuShareAppMessage({
        title: $.trim(options.title),
        desc: $.trim(options.desc),
        link: options.link,
        imgUrl: options.img,
        success:function(){
          // 用户确认分享后执行的回调函数
          // 腾讯统计
          MtaH5.clickStat('wx_onMenuShareAppMessage',{'title': options.title});
        }
      });
      wx.ready(function(){
        wx.showOptionMenu();
      });
    });
    // wx.error(function(res){
    //   $.toast(JSON.stringify(res), 50000);
    // });
    } else {
      wx.config({
        debug: false,
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: [
        'checkJsApi',
        'scanQRCode'
        ]
      });
      wx.ready(function(){
        wx.hideOptionMenu();
      });
    }
  });

}
// dplus统计
// common.prototype.cnzz_dplus = function(){
//   !function(a,b){if(!b.__SV){var c,d,e,f;window.dplus=b,b._i=[],b.init=function(a,c,d){function g(a,b){var c=b.split(".");2==c.length&&(a=a[c[0]],b=c[1]),a[b]=function(){a.push([b].concat(Array.prototype.slice.call(arguments,0)))}}var h=b;for("undefined"!=typeof d?h=b[d]=[]:d="dplus",h.people=h.people||[],h.toString=function(a){var b="dplus";return"dplus"!==d&&(b+="."+d),a||(b+=" (stub)"),b},h.people.toString=function(){return h.toString(1)+".people (stub)"},e="disable track track_links track_forms register unregister get_property identify clear set_config get_config get_distinct_id track_pageview register_once track_with_tag time_event people.set people.unset people.delete_user".split(" "),f=0;f<e.length;f++)g(h,e[f]);b._i.push([a,c,d])},b.__SV=1.1,c=a.createElement("script"),c.type="text/javascript",c.charset="utf-8",c.async=!0,c.src="https://w.cnzz.com/dplus.php?id=1255604809",d=a.getElementsByTagName("script")[0],d.parentNode.insertBefore(c,d)}}(document,window.dplus||[]),dplus.init("1255604809", {
//     loaded: function() {
//       function GetQueryString(name) {
//         var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
//         var r = window.location.search.substr(1).match(reg);
//         if(r!=null)return  unescape(r[2]); return null;
//       }
//       var user_id = $('#cnzz_user_id').val();
//       var source = GetQueryString('from');
//       var source_list = {
//         "timeline":"微信朋友圈",
//         "singlemessage":"微信好友",
//         "groupmessage":"微信群",
//         "ontheroad":"公路商店_输入框按钮",
//         "ontheroadstore":"公路商店_微信文章",
//         "heishi":"黑市_输入框按钮",
//         "nbheishi":"黑市_微信文章"
//       }
//       for(var key in source_list) {
//         if(source == key) {
//           source = source_list[key];
//         }
//       }
//       dplus.register({
//         '来源入口' : source,
//         '用户ID' : user_id
//       });
//       // 标记id
//       if(!dplus.get_property("来源入口")){
//         dplus.identify(user_id);
//       }
//       // 点击头部导航栏
//       $('.hs-header a').on('click',function(e){
//         var title = $.trim($(this).text());
//         var href = $(this).attr('href');
//         // e.preventDefault();
//         // setTimeout(function(){
//         //   location.href = href;
//         // },300)
//         dplus.track("点击头部导航栏" , {
//           '按钮名称' : title
//         });
//       });
//       // 点击底部导航栏
//       $('.hs-footer a').on('click',function(e){
//         var title = $.trim($(this).text());
//         var href = $(this).attr('href');
//         // e.preventDefault();
//         // setTimeout(function(){
//         //   location.href = href;
//         // },300)
//         dplus.track("点击底部导航栏" , {
//           '按钮名称' : title
//         });
//       });
//       //点击商品页视频
//       $('.store-show').on('click',".video",function(e){
//         var title = $.trim($('.frontcover .title').text());
//         // console.log(title);
//         // e.preventDefault();
//         // setTimeout(function(){
//         //   location.href = href;
//         // },300)
//         dplus.track("点击商品页视频" , {
//           '商品标题' : title
//         });
//       });
//       dplus.track('页面浏览',{
//         '受访页面' : window.location.href
//       });
//     }
//   });
  // common.prototype.cnzz_push = function(pushdata){
  //   dplus.track(pushdata);
  // }
// }
module.exports = common;
