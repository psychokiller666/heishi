// 特卖
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.sale', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.checkfollow();
  init.wx_share(false);
  
  // 打开ios对应页面
  var system_query = init.system_query();
  if(system_query == 'android'){
    var system_query_url = GV.app_url;
  }else if(system_query == 'ios'){
    var system_query_url = GV.api_url + '/ios/index/3';
  }
  $('.open_app').find('.open_app_btn').attr('href', system_query_url);
  $('.openapp_btn').attr('href', system_query_url);
  
});
