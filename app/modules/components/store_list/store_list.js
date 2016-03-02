// 商品列表
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.show-list', function (e, id, page) {
  var init = new common(page);
  // 列表首页_通用底部发布
  var notice_btn = $('.notice_btn');
  var notice_box = $('.notice_box');

  notice_btn.on('click',function(e) {
    if(!notice_btn.hasClass('active')){
      $(this).addClass('active');
      notice_box.show();
      notice_box.css('bottom',$('.hs-footer').height()-2);
    } else {
      $(this).removeClass('active');
      notice_box.hide();
    }
  });

  var store_list = $('.store_list');
  // 下拉加载更多
  var loading = false;
  // 初始化下拉
  var page_num = 2;
  var page_size = 2;
  var pages;
  var ctype = 1;
  if($('.showall').length){
    ctype = 3;
  }
  var store_list_tpl = handlebars.compile($("#store_list_tpl").html());
  function add_data(page_size,page) {
    if (page.selector == '.page'){
      return false;
    }

    $.ajax({
      type: 'POST',
      url: '/index.php?g=restful&m=HsArticle&a=ajax_index_list',
      data: {
        page:page_num,
        page_size:page_size,
        ctype:ctype
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          store_list.find('ul').append(store_list_tpl(data.data));
          // 更新最后加载的序号
          pages = data.pages;
          page_num++;
          init.loadimg();
        } else {
          $.toast('请求错误');
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+type);
      }
    });
  }
  page.on('infinite', function() {
    // 如果正在加载，则退出
    if (loading) return;
    // 设置flag
    loading = true;
    setTimeout(function() {
      loading = false;
      if (page_num >= pages+1) {
        // 加载完毕，则注销无限加载事件，以防不必要的加载
        $.detachInfiniteScroll($('.infinite-scroll'));
        // 删除加载提示符
        $('.infinite-scroll-preloader').remove();
        $.toast('😒 没有了');
        return;
      }
      // 请求数据
      add_data(page_size,page);
    },500);
    $.refreshScroller();
  });
});
