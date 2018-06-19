// 提现
// 页面初始化
var common = require('../common/common.js');
// 百度上船
var WebUploader = require('../../../../node_modules/tb-webuploader/dist/webuploader.min.js');

$(document).on('pageInit','.complaints_page', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

});
