//抽奖活动规则

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.lottery_rule', function(e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    document.title = '抽奖规则';

    var init = new common(page);

    var ApiBaseUrl = init.getApiBaseUrl();

    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };

    // 调用微信分享sdk
    var share_data = {
        title: '公路商店 — 抽奖活动',
        desc: '为你不着边际的企图心',
        link: window.location.href,
        img: 'https://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
    };
    init.wx_share(share_data);




});


