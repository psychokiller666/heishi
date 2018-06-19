// 特卖
// 初始化
var common = require('../common/common.js');
// 搜索
var SearchInit = require('../search_list/search_list.js');

$(document).on('pageInit','.sale', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.checkfollow();
  $(".openapp_btn").click(function(){
    location.href = GV.app_url;
  })
  // 搜索初始
  SearchInit();
});
