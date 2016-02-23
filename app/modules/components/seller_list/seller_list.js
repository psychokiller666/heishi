var dropload = require('../../../../bower_components/dropload/dist/dropload.min.js');

if($('.seller_list').length){
  var seller_list_bd = $('.seller_list_bd');
  seller_list_bd.scrollTop(seller_list_bd.height());
  seller_list_bd.dropload({
    domDown : {
      domClass : 'dropload-down',
      domRefresh: '<div class="dropload-refresh">🌚 往上拉。</div>',
      domLoad : '<div class="dropload-load">😏 加载呢。</div>',
      domNoData : '<div class="dropload-noData">😢 没有咯。</div>'
    },
    scrollArea : seller_list_bd,
    loadDownFn : function(e){
      e.noData();
      e.resetload();
    }
  })
}
