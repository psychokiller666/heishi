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
  $(".openapp_btn").click(function(){
    location.href = GV.app_url;
  })
  
});
