// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.discovery_index', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  // 调用微信分享sdk
  var share_data = {
    title: '公路商店 — 为你不着边际的企图心',
    desc: '这里能让好事自然发生',
    link: window.location.href,
    url: window.location.href,
    img: 'http://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
  };
  init.wx_share(share_data);
  init.checkfollow(1);

  page.find('.swiper-container').swiper({
    lazyLoading: true
  });
})
