//鬼市商品详情页

// 初始化
var common = require('../common/common.js');
var gsHome = require('../comment/gs_home.js');
// 微信jssdk
var wx = require('weixin-js-sdk');

$(document).on('pageInit','.ghost_market_comment_list_home', function(e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    var option ={};
    var init = new common(page);
    option.ga_id = init.getUrlParam('ga_id');
    gsHome(option)
});
