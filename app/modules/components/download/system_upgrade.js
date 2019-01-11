//系统升级页

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.system_upgrade', function(e, id, page) {
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



    if(deviceType==='WECHAT' || deviceType==='NO'){
        $(page).find('.return_home_page').show();
    }




});


