
// 初始化
var common = require('../common/common.js');
// 微信jssdk
var wx = require('weixin-js-sdk');

$(document).on('pageInit','.ghost_market_payment', function(e, id, page) {

    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);
    init.ifLogin(true);
    var ApiBaseUrl = init.getApiBaseUrl();
    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };
    var goodsId = init.getUrlParam('id');
});