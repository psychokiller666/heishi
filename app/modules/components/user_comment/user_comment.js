// 评论列表页
var common = require('../common/common.js');
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');

$(document).on('pageInit','.user_message_list', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  page.on('click', '.openComment', function(){
    var id = $(this).attr('data-id');
    $(this).find('.avatar').removeClass('new');
    $.ajax({
        type: 'GET',
        url: '/user/HsComment/ajax_update_comment_status?cid=' + id,
        success: function(res){
        },
        error: function(xhr, type){
          console.log(type);
        }
    });
  })
  // 监听加载
  var user_message_list_tpl = handlebars.compile($("#user_message_list_default").html());
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  var loading = false;
  var pages = 1;
  var total_pages = $('.total_pages').val();
  page.on('infinite', function() {
    // 如果正在加载，则退出
    if (loading) return;
    // 设置flag
    loading = true;
    // 模拟1s的加载过程
    setTimeout(function() {
      // 重置加载flag
      loading = false;
      if (pages >= total_pages) {
        // 加载完毕，则注销无限加载事件，以防不必要的加载
        $.detachInfiniteScroll($('.infinite-scroll'));
        // 删除加载提示符
        $('.infinite-scroll-preloader').remove();
        $.toast('😒 没有了');
        return;
      }
      pages += 1;
      add_data(pages);
      $.refreshScroller();
    }, 200);
  });
  function add_data(page_num){
    $.ajax({
      type: 'POST',
      url: '/user/HsComment/ajax_more_comment',
      data: {
        page: page_num,
      },
      success: function(data){
        if(data.status == 1){
          $.each(data.data, function(i, item){
            item.user_avatar = data.head_imgs[item['from_uid']];
          })
          page.find('ul').append(user_message_list_tpl(data.data));
        } else {
          $.toast('请求错误');
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+type);
      }
    });
  }
});
