
// 初始化
var common = require('../common/common.js');
// 微信jssdk
var wx = require('weixin-js-sdk');

$(document).on('pageInit','.ghost_market_pay_success', function(e, id, page) {

    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);
    $('.return_index_btn').click(function(){
        location.href = '/Portal/GhostMarket/home.html'
    });
    $('.return_order_list').click(function(){
        // $.toast('查看公路鬼市订单请移步公路商店App')
        $.confirm('查看公路鬼市订单请移步公路商店App')
    })
});