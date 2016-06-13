'use strict';
// 手淘 flexble布局
require('../modules/components/flexible/flexible.js');
// Zepto
require('../../bower_components/zepto/src/zepto.js');
var $ = window.Zepto;
require('../../bower_components/zepto/src/event.js');
require('../../bower_components/zepto/src/touch.js');
require('../../bower_components/zepto/src/fx.js');
require('../../bower_components/zepto/src/deferred.js');
require('../../bower_components/zepto/src/callbacks.js');
require('../../bower_components/zepto/src/ajax.js');
// SUI
// SUI 自动初始化
$.config = {
    autoInit: true
};
require('../../bower_components/SUI-Mobile/dist/js/sm.min.js');

// 首页(商品列表页)
require('../modules/components/store_list/store_list.js');

// 文化列表
require('../modules/components/culture_list/culture_list.js');

// 发布规则页面
require('../modules/components/notice/notice.js');
// 发布商品
require('../modules/components/add/add.js');

// 私信列表
require('../modules/components/chat_list_group/chat_list_group.js');

// 私信页
require('../modules/components/chat_list/chat_list.js');

// 用户中心
require('../modules/components/user_index/user_index.js');
// 提现
require('../modules/components/user_withdraw/user_withdraw.js');
// 卖家动态
require('../modules/components/seller_list/seller_list.js');
// 买过的东西
require('../modules/components/bought/bought.js');
// 卖过的东西
require('../modules/components/already_list/already_list.js');
// 发货
require('../modules/components/deliver/deliver.js');
// 发过的东西
require('../modules/components/posts/posts.js');
// 粉丝列表
require('../modules/components/fans_list/fans_list.js');
// 提现列表
require('../modules/components/user_withdraw_list/user_withdraw_list.js');
// 投诉
require('../modules/components/user_complaints/user_complaints.js');

// 商品内容页
require('../modules/components/store_show/store_show.js');
require('../modules/components/orderform/orderform.js');

// 跳转页
require('../modules/components/success/success.js');


