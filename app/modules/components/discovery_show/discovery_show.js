// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.discovery_show', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  // 调用微信分享sdk
  var share_data = {
    title: page.data('desc'),
    desc: '这里能让好事自然发生',
    link: GV.HOST+location.pathname,
    img: 'http://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
  };
  init.wx_share(share_data);
  init.checkfollow(1);

})
