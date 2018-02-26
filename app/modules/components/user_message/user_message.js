// 通知
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.user_message', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  init.checkfollow();

  // 打开ios对应页面
  var system_query = init.system_query();
  if(system_query == 'android'){
    var system_query_url = GV.app_url;
  }else if(system_query == 'ios'){
    var system_query_url = GV.api_url + '/ios/notice';
  }
  $('.open_app').find('.open_app_btn').attr('href', system_query_url);

})
