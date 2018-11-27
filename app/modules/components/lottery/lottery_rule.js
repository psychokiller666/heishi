//抽奖活动规则

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.lottery_rule', function(e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    document.title = '抽奖规则';

    var init = new common(page);

    var $page = $(page);

    var ApiBaseUrl = init.getApiBaseUrl();

    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };

    //判断是否是app，如果是app，url都需要做处理，ajax headers携带身份不一样
    var isApp = false;
    var $isApp = $('.is_app');
    var Authorization = $isApp.attr('authorization');
    var loginStatus = true;

    if(Authorization && Authorization.length>0){
        isApp = true;
        ajaxHeaders = {
            'Authorization' : Authorization,
            // 'version' : version,//跨域不能加version
        };
    }else{
        //如果不是app，通过uid判断是否登录，如果未登录，点击领取和关注按钮需要跳转到登录页3
        loginStatus = init.ifLogin();
    }

    var pretendApp = init.getUrlParam('pretendApp');//假装是app
    if(pretendApp==1){
        isApp = true;
    }else if(pretendApp==2){
        isApp = false;
    }



    // 调用微信分享sdk
    var share_data = {
        title: '公路商店 — 抽奖活动',
        desc: '为你不着边际的企图心',
        link: window.location.href,
        img: 'https://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
    };
    init.wx_share(share_data);


    show_lottery_apple_tip();
    //显示苹果声明
    function show_lottery_apple_tip(){
        if(isApp){
            var u = navigator.userAgent;
            var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
            if(isIOS){
                $page.find('.lottery_apple_tip').show();
            }
        }
    }

});


