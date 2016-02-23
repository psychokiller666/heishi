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

// frozenUI
require('../../node_modules/frozenui/js/frozen.js');
// 图片延时加载
var Layzr = require('../../node_modules/layzr.js/dist/layzr.js');

// 通用
// alert(lib.flexible.dpr);
$(window).on('load',function(e){
  // .hs-main 漂浮位置
  if($('.hs-page').length){
    if($('header').length){
      $('.hs-main').css('top',$('header').height());
    } else {
      $('.hs-main').css('top','0');
    }
    if($('footer').length){
      $('.hs-main').css('bottom',$('footer').height());
    } else {
      $('.hs-main').css('bottom','0');
    }
  }
  // 图片加载
  new Layzr({
    threshold: 50,
    bgAttr: 'data-layzr-bg'
  });
});


// 提示框
require('../modules/components/prompt/prompt.js');
// 底部通用导航
require('../modules/components/list_footer/list_footer.js');

// 商品
// 列表页
require('../modules/components/store_list/store_list.js');
// 内容页
require('../modules/components/store_show/store_show.js');
// 评论
require('../modules/components/dialog_comment/dialog_comment.js');
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

// 发布页
require('../modules/components/add/add.js');
