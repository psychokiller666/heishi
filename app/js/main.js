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
// 由于sui自带的轮播不兼容移动端，直接引入
require('../../bower_components/zepto/src/swiper.min.js');
// SUI
// SUI 自动初始化
$.config = {
    autoInit: true
};
require('../../node_not/SUI-Mobile/dist/js/sm.min.js');
// sm-extend中使用的轮播在移动端不兼容，现在使用了swiper,导致商品详情页中的图片预览无法使用
// require('../../node_not/SUI-Mobile/dist/js/sm-extend.min.js');

// 首页(商品列表页)
require('../modules/components/store_list/store_list.js');
// 首页(热门列表页)
require('../modules/components/store_list/showall.js');
// 首页(特卖)
require('../modules/components/store_list/sale.js');
// 首页(关注)
require('../modules/components/store_list/atten.js');

// 分类
require('../modules/components/categories/categories.js');


// 文化列表
require('../modules/components/culture_list/culture_list.js');
require('../modules/components/culture_list/culture_details.js');

// 发布规则页面
require('../modules/components/notice/notice.js');
// 发布商品
require('../modules/components/add/add.js');

// 私信列表
// require('../modules/components/chat_list_group/chat_list_group.js');
require('../modules/components/chat_list_group/nim_chat_list_group.js');

// 私信页
// require('../modules/components/chat_list/chat_list.js');
require('../modules/components/chat_list/nim_chat_list.js');
//通用底部
require('../modules/components/list_footer/list_footer.js');

// 用户中心
require('../modules/components/user_index/user_index.js');
// 评论列表
require('../modules/components/user_comment/user_comment.js');
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
// 退款
require('../modules/components/refund/refund.js');
// 退款详情
require('../modules/components/refund_detail/refund_detail.js');
// 修改资料
require('../modules/components/user_personal/user_personal.js');
// 别人的个人中心
require('../modules/components/user_people/user_people.js');
// 赞过的商品
require('../modules/components/user_favorite/user_favorite.js');

// 商品内容页
require('../modules/components/store_show/store_show.js');
require('../modules/components/orderform/orderform.js');

// 跳转页
require('../modules/components/success/success.js');

// 发现页
require('../modules/components/discovery_index/discovery_index.js');
require('../modules/components/discovery_show/discovery_show.js');
require('../modules/components/discovery_seller/discovery_seller.js');
require('../modules/components/discovery_classify/discovery_classify.js');
// 大专题
require('../modules/components/big_project/big_project.js');


//物流查询
require('../modules/components/user_recruitment/express_query.js');

//购物车
require('../modules/components/user_mychart/user_mychart.js');

//注册 登录
require('../modules/components/login/login.js');


//应用横栏
require('../modules/components/streamer/streamer.js');
//买家订单
require('../modules/components/user_buyOrder/user_buyOrder.js');
require('../modules/components/user_buyOrder/user_buyOrderInfo.js');
//评论
require('../modules/components/comment/comment.js');
//点赞用户列表
require('../modules/components/like_list/like_list.js');
//收货地址
require('../modules/components/user_address/user_address.js');
require('../modules/components/user_address/user_address_order.js');
// 加入城市选择器
require('../../node_not/SUI-Mobile/dist/js/sm-city-picker.js');
//搜索模块
require('../modules/components/search_list/search_list.js');
//加入黑市
require('../modules/components/user_join_hs/user_join_hs.js');
//浏览记录
require('../modules/components/user_hisotories/user_hisotories.js');
//浏览记录
require('../modules/components/user_message/user_message.js');
