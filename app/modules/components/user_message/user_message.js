// 通知
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.user_message', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  $("input").blur(function(){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });
  var init = new common(page);
  init.checkfollow();
  init.sensorsFun.bottomNav();

})
