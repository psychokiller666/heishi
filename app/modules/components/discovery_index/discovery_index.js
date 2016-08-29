// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.discovery_index', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

  page.find('.swiper-container').swiper({
    lazyLoading: true
  });
})
