// 商品列表
var dropload = require('../../../../bower_components/dropload/dist/dropload.min.js');

if($('.store_list').length){
  var store_list = $('.store_list');
  console.log('sdd');
  store_list.dropload({
    domDown : {
      domClass : 'dropload-down',
      domRefresh: '<div class="dropload-refresh">🌚 往上拉。</div>',
      domLoad : '<div class="dropload-load">😏 加载呢。</div>',
      domNoData : '<div class="dropload-noData">😢 没有咯。</div>'
    },
    scrollArea : store_list,
    loadDownFn : function(e){
      console.log('sddddddddd');
      e.noData();
      e.resetload();

    }
  })

}
