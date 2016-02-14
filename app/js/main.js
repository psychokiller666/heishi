'use strict';
// 手淘 flexble布局
require('../modules/components/flexible/flexible.js');
// Zepto
require('../../bower_components/zepto/src/zepto.js').$;
require('../../bower_components/zepto/src/event.js');
require('../../bower_components/zepto/src/touch.js');
require('../../bower_components/zepto/src/fx.js');
// frozenUI
require('../../node_modules/frozenui/js/frozen.js');
// 图片延时加载
var Layzr = require('../../node_modules/layzr.js/dist/layzr.js');

// 上拉加载更多
// 百度上传组建

// 通用
// .hs-main 漂浮位置
$('.hs-main').css('padding-top',$('.hs-header').height());
$('.hs-main').css('padding-bottom',$('.hs-footer').height());

// 图片加载
new Layzr({
  threshold: 50
});

// 商品列表
var showList = $('.show-list .hs-main ');
if (showList.length) {
}
// 商品
// 内容页
require('../modules/components/store_show/store_show.js');
// 评论
require('../modules/components/dialog_comment/dialog_comment.js');

// 用户
// 提现
require('../modules/components/user_withdraw/user_withdraw.js');
// 私信列表
require('../modules/components/chat_list_group/chat_list_group.js');
