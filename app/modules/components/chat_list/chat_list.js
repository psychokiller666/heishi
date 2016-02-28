// 私信聊天
// 初始化
var common = require('../common/common.js');
require('../chat_footer/chat_footer.js');
require('../chat_header/chat_header.js');
$(document).on('pageInit','.chat', function (e, id, page) {
  var init = new common(page);
  var chat_list = $('.chat_list');
  chat_list.scrollTop(99999);

  page.on('refresh', '.chat_list',function(e) {
    setTimeout(function() {



        // 加载完毕需要重置
        $.pullToRefreshDone('.chat_list');
      }, 2000);
  });
});
