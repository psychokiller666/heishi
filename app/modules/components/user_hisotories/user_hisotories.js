// 发布规则页
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.user_hisotories', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
})
