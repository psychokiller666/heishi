'use strict';
// 手淘 flexble布局
require('../modules/components/flexible/flexible.js');
// Zepto
require('../../bower_components/zepto/src/zepto.js');
require('../../bower_components/zepto/src/event.js');
require('../../bower_components/zepto/src/touch.js');
require('../../bower_components/zepto/src/fx.js');
require('../../bower_components/zepto/src/deferred.js');
require('../../bower_components/zepto/src/callbacks.js');
require('../../bower_components/zepto/src/ajax.js');
// SUI
require('../../bower_components/SUI-Mobile/dist/js/sm.min.js');
// 控制.hs-main高度
// require('../modules/common.js');

// 图片延时加载
// var Layzr = require('../../node_modules/layzr.js/dist/layzr.js');

// 通用
// $(document).on("pageInit", function (e, id, page) {
//   // .hs-main 漂浮位置
//   if($('.hs-page').length){
//     if($('header').length){
//       $('.hs-main').css('top',$('header').height());
//     } else {
//       $('.hs-main').css('top','0');
//     }
//     if($('footer').length){
//       $('.hs-main').css('bottom',$('footer').height());
//     } else {
//       $('.hs-main').css('bottom','0');
//     }
//   }
//   // 图片加载
//   new Layzr({
//     threshold: 50,
//     bgAttr: 'data-layzr-bg'
//   });

// 底部通用导航
require('../modules/components/list_footer/list_footer.js');
// 商品列表和商品页面
require('../modules/components/app/app.js');

// 生成订单
require('../modules/components/orderform/orderform.js');

// 文化
// 列表页
require('../modules/components/culture_list/culture_list.js');

// 用户
// 提现
require('../modules/components/user_withdraw/user_withdraw.js');
// 私信列表
require('../modules/components/chat_list_group/chat_list_group.js');
// 私信聊天
require('../modules/components/chat_list/chat_list.js');
// 卖家动态
require('../modules/components/seller_list/seller_list.js');
// 已发布
require('../modules/components/posts/posts.js');
// 发布页
require('../modules/components/add/add.js');

