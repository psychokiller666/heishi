// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.discovery_classify', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

})
