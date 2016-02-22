// 私信聊天
var dropload = require('../../../../bower_components/dropload/dist/dropload.min.js');

if($('.chat').length) {
  // 顶部
  require('../chat_header/chat_header.js');
  require('../chat_footer/chat_footer.js');
  var chat_list = $('.chat_list');
  // 进来跳到底部
  chat_list.scrollTop(chat_list.height());

  // 下拉加载更多
  chat_list.dropload({
    domUp : {
      domClass : 'dropload-up',
      domRefresh : '<div class="dropload-refresh">🌚 往下拉。</div>',
      domUpdate : '<div class="dropload-update">😒 松手就加载。</div>',
      domLoad : '<div class="dropload-load">😏 我要加载拉。</div>'
    },
    domDown : {
      domClass : 'dropload-down',
      domRefresh: '<div class="dropload-refresh">🌚 往上拉。</div>',
      domUpdate : '<div class="dropload-update">😒 松手就加载。</div>',
      domLoad : '<div class="dropload-load">😏 加载呢。</div>',
      domNoData : ''
    },
    scrollArea : chat_list,
    loadUpFn : function(e){
      e.resetload();
    },
    loadDownFn : function(e){
      // e.noData();
      // e.resetload();
    }
  })
}
