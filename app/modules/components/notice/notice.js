// 发布规则页
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.notice', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

  $('.detailed_btn').on('click',function(){
    $.popup('.detailed_popup');
  });
  $('.agree').on('click',function(){
    $.closeModal('.detailed_popup');
  })

})
