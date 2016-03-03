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

// 商品内容页
require('../modules/components/store_show/store_show.js');

// 文化列表
require('../modules/components/culture_list/culture_list.js');

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

// 文章页

    // 底部通用导航
    // require('../modules/components/list_footer/list_footer.js');
    // 商品列表和商品页面
    // require('../modules/components/app/app.js');

    // 生成订单
    // require('../modules/components/orderform/orderform.js');

    // // 文化
    // // 列表页
    // require('../modules/components/culture_list/culture_list.js');

    // // 用户
    // // 提现
    // require('../modules/components/user_withdraw/user_withdraw.js');
    // // 私信列表
    // require('../modules/components/chat_list_group/chat_list_group.js');
    // // 私信聊天
    // require('../modules/components/chat_list/chat_list.js');
    // // 卖家动态
    // require('../modules/components/seller_list/seller_list.js');
    // // 已发布
    // require('../modules/components/posts/posts.js');
    // // 发布页
    // require('../modules/components/add/add.js');

