// 商品列表
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');
$(document).on('pageInit','.seller_list', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  // 调用微信分享sdk
  init.wx_share(false);
  // 检查是否有新的消息
  init.msg_tip();
});
