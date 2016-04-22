// 粉丝列表
$(document).on('pageInit','.fans_list', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

  var fans_list_bd = $('.fans_list_bd');
  // 下拉加载更多
  var loading = false;
  // 初始化下拉
  var pages = 2;
  var fans_list_bd_tpl = handlebars.compile($("#fans_list_bd_tpl").html());
  var post_url = '/index.php?g=user&m=HsFellows&a=ajax_myfans_more';
  if($('.my_fellows').length){
    post_url = '/index.php?g=user&m=HsFellows&a=ajax_myfellows_more';
  }
  if(fans_list_bd.find('li').length != 10){
    $.detachInfiniteScroll($('.infinite-scroll'));
    // 删除加载提示符
    $('.infinite-scroll-preloader').remove();
    return false;
  }
  // 添加数据
  function add_data(pages){
    $.ajax({
      type: 'POST',
      url: post_url,
      data: {
        page: pages
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1) {
          if(data.next_page == pages){
            $.detachInfiniteScroll($('.infinite-scroll'));
            // 删除加载提示符
            $('.infinite-scroll-preloader').remove();
          }
          fans_list_bd.find('ul').append(fans_list_bd(data.data));
          pages++;
          init.loadimg();
        } else if(data.status == 0) {
          $.detachInfiniteScroll($('.infinite-scroll'));
          // 删除加载提示符
          $('.infinite-scroll-preloader').remove();
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+xhr);
      }
    });
  }
  page.on('infinite', function() {
    // 如果正在加载，则退出
    if (loading) return;
    // 设置flag
    loading = true;
    // 模拟1s的加载过程
    setTimeout(function() {
      // 重置加载flag
      loading = false;
      add_data(pages);

    }, 1000);
  });
});
