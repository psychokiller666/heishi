//下载app

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.download', function(e, id, page) {
  if (page.selector == '.page') {
    return false;
  }

  var pageTitle = $(page).find('.page_title').attr('title') || '公路商店';

  document.title = pageTitle;

  var init = new common(page);

  var lazyload = init.lazyLoad;

  var ApiBaseUrl = init.getApiBaseUrl();

  var PHPSESSID = init.getCookie('PHPSESSID');
  var ajaxHeaders = {
    'phpsessionid': PHPSESSID
  };

  //判断是否是app
  var isApp = false;
  var $isApp = $('.is_app');
  var Authorization = $isApp.attr('authorization');
  var uid = $isApp.attr('uid');
  var deviceType = $isApp.attr('device_type');//值：IOS ANDROID WECHAT NO
  // var version = $isApp.attr('version');

  var loginStatus = true;

  if(Authorization && Authorization.length>0){
    //有Authorization值肯定是登录的状态
    isApp = true;
    ajaxHeaders = {
      'Authorization' : Authorization,
    };
  }else{
    //如果不是app，通过uid判断是否登录
    loginStatus = init.ifLogin();
  }

  var u = navigator.userAgent;
  var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
  var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

  var androidUrl = "https://img8.ontheroadstore.com/download/ontheroadstore_v4.2.4_officialRelease_20181229_release.apk";

  if(isiOS){
    $('.down_wrap .ios').show();
  }else{
    $('.down_wrap .android').show();
  }



  if(deviceType==='WECHAT' || deviceType==='NO'){
    $(page).find('.return_home_page').show();
  }

  $('.down_wrap .android').on('click',function(){
    location.href = androidUrl;
  })


  getAppUrl();
  //https://api.ontheroadstore.com/appv3_1/upgrade/check/android?client_version=1000
  //获取安卓下载app url
  function getAppUrl($btn,ids){

    var url = 'https://api.ontheroadstore.com/appv3_1/upgrade/check/android?client_version=1000';
    $.ajax({
      type: "GET",
      url: url,
      dataType: 'json',
      data: {},
      headers: ajaxHeaders,

      success: function(data){
        if(data.status==1){
          androidUrl = data.data.updateUrl;
        }
      },
      error: function(xhr){

      }

    });
  }


});


