// 用户中心页
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.center', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  // 列表首页_通用底部发布
  var hs_footer = $('.hs-footer');
  var notice_box = $('.notice_box');
  hs_footer.on('click','.notice_btn',function() {
    if(!$(this).hasClass('active')){
      $(this).addClass('active');
      notice_box.show();
      notice_box.css('bottom',hs_footer.height()-2);
    } else {
      $(this).removeClass('active');
      notice_box.hide();
    }
  })
});
