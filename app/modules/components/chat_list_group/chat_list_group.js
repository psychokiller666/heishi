// 私信列表
var dropload = require('../../../../bower_components/dropload/dist/dropload.min.js');

if($('.chat_list_group').length){
  // 从右往左滑
  $('.chat_list_group_bd ul li').height($('.chat_list_group_bd ul li').height());
  $('.chat_list_group_bd ul li').find('.delete').height($('.chat_list_group_bd ul li').height());
  $('.chat_list_group_bd ul li').swipeLeft(function(){
    $('.delete').hide();
    $('.chat_list_group_bd ul li').removeClass('active');
    $('.delete',this).animate({
      display: 'block'
    }, 500, 'ease-in');
    $(this).addClass('active');
    $('.delete').on('click',function(){
      $(this).parent().animate({
        opacity: 0
      }, 500, 'ease-in',function(){
        $(this).remove();
      });

    });
  });
  // 从左往右滑
  $('.chat_list_group_bd ul li').swipeRight(function(){
    $('.delete').hide();
    $('.chat_list_group_bd ul li').removeClass('active');
  })


  // 下拉加载更多
  var chat_list_group_bd = $('.chat_list_group_bd');
  chat_list_group_bd.dropload({
    domUp : {
      domClass : 'dropload-up',
      domRefresh : '<div class="dropload-refresh">🌚 往下拉。</div>',
      domUpdate : '<div class="dropload-update">😒 松手就加载。</div>',
      domLoad : '<div class="dropload-load">😏 我要加载拉。</div>'
    },
    domDown : {
      domClass : 'dropload-down',
      domRefresh: '<div class="dropload-refresh">🌚 往上拉。</div>',
      domLoad : '<div class="dropload-load">😏 加载呢。</div>',
      domNoData : '<div class="dropload-noData">😢 没有咯。</div>'
    },
    scrollArea : chat_list_group_bd,
    loadUpFn : function(e){
      e.resetload();
      location.reload();
    },
    loadDownFn : function(e){

      e.noData();
      e.resetload();

    }
  })
}
