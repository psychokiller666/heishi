// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.already_list', function (e, id, page) {
  console.log('dssddsds');
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  console.log('dssddsds');

})
