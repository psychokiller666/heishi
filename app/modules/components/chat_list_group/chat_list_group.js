// 私信列表
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.chat_list_group', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

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
    // 删除聊天
    $('.chat_list_group_bd ul li').on('click','.delete',function(){
      $.post('/index.php?g=User&m=HsMessage&a=ajax_delete_list',{
        mid: $(this).data('mid')
      },function(data){
        if(data.status == 1) {
          $(this).parent().remove();
          $.toast(data.info);
        } else {
          $.toast(data.info);
        }
      });
    });
  });
  // 从左往右滑
  $('.chat_list_group_bd ul li').swipeRight(function(){
    $('.delete').hide();
    $(this).removeClass('active');
  });

  // 下拉加载
  var chat_list_group_bd = $('.chat_list_group_bd');
  // 下拉加载更多
  var loading = false;
  // 初始化下拉
  var pages = 1;
  var chat_list_group_bd_tpl = handlebars.compile($("#chat_list_group_bd_tpl").html());

  function add_data(pages){
    // 如果不够10个不加载
    if(chat_list_group_bd.find('li').length < 10){
      $.detachInfiniteScroll($('.infinite-scroll'));
      // 删除加载提示符
      $('.infinite-scroll-preloader').remove();
      return false;
    }
    $.ajax({
      type: 'POST',
      url: '/index.php?g=user&m=HsComment&a=ajax_lists',
      data: {
        page: pages
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(pages >= data.page){
          $.detachInfiniteScroll($('.infinite-scroll'));
          // 删除加载提示符
          $('.infinite-scroll-preloader').remove();
          $.toast('😒 没有更多了');
        } else {
          chat_list_group_bd.find('ul').append(chat_list_group_bd_tpl(data.data));
          pages++;
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+xhr);
      }
    });
  }

  // 初始化加载1页
  add_data(pages);

  page.on('infinite', function() {
    // 如果正在加载，则退出
    if (loading) return;
    // 设置flag
    loading = true;
    // 模拟1s的加载过程
    setTimeout(function() {
      // 重置加载flag
      loading = false;
      if (pages >= page_size) {
        // 加载完毕，则注销无限加载事件，以防不必要的加载
        $.detachInfiniteScroll($('.infinite-scroll'));
        // 删除加载提示符
        $('.infinite-scroll-preloader').remove();
        $.toast('😒 没有了');
        return;
      }
      chat_list_group_bd.find('ul').append(chat_list_group_bd_tpl(data));
      // 更新最后加载的序号
      pages++;
      init.loadimg();
      $.refreshScroller();
    }, 1000);
  });

});
