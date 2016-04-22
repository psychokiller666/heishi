// 成功or失败页
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.jump', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

  if(!$('.error').length) {
    setTimeout(function(){
      window.location.href = $('.no_data').data('url');
    },3000)
  } else {
    setTimeout(function(){
      history.go(-1);
    },3000)
  }


});
