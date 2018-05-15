// 点赞用户列表
// 初始化
var common = require('../common/common.js');
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');

$(document).on('pageInit','.like_user_list', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

  var loading = false;
  var pagenum = 1;
  var id = $('.like_list').attr('data-id');
  var like_list_tpl = handlebars.compile($("#like_list_tpl").html());
  add_like_list(id, 1);
  function add_like_list(id, pagenum){
    $.ajax({
      type: 'GET',
      url: '/index.php?g=Portal&m=HsArticle&a=page_likes',
      data: {
        id: id,
        page: pagenum,
        pagesize: 20
      },
      success: function(data){
        if(data.data){
            $('.like_list').append(like_list_tpl(data.data));
        }else{
            $('.infinite-scroll-preloader').remove();
            $('.bottom_alert').css('display', 'block');
            $.detachInfiniteScroll($('.infinite-scroll'));
        }
        if(data.data.length != 20){
            $('.infinite-scroll-preloader').remove();
            $('.bottom_alert').css('display', 'block');
            $.detachInfiniteScroll($('.infinite-scroll'));
        }
        loading = false;
      },
      error: function(xhr, type){
        console.log(type);
      }
    });
  }
  page.on('infinite', function() {
    if (loading) {
      return false;
    } else {
      // 设置flag
      loading = true;
      pagenum = pagenum + 1;
      add_like_list(id,  pagenum);
      $.refreshScroller();
    }
  });
});
