// 文化列表
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.culture', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  var share_data = {
    title: '黑市 | 美好而操蛋的东西',
    desc: '这里能让好事自然发生',
    link: GV.HOST+location.pathname,
    img: 'http://hs.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
  };
  init.wx_share(share_data);
  // 搜索按钮
  var search_box = $('.search_box');
  $('.search_btn').on('click',function(){
    search_box.show();
    search_box.find('input').trigger('focus');
    search_box.on('click','button',function(){
      search_box.off('click','button');
      if(search_box.find('input').val().length){
        search_box.hide();
      } else {
        window.location.href = '/index.php?g=portal&m=HsSearch&keyword='+serialize(search_box.find('input').val());
      }
    });
    search_box.on('click',function(e){
      $(this).off('click');
      if(e.srcElement.className == 'search_box'){
        search_box.hide();
      }
    });
  });
  // 列表首页_通用底部发布
  var hs_footer = $('.hs-footer');
  var notice_box = $('.notice_box');
  hs_footer.on('click','.notice_btn',function() {
    if(!$(this).hasClass('active')){
      $(this).addClass('active');
      notice_box.show();
      notice_box.css('bottom',hs_footer.height()-2);
    } else {
      $(this).removeClass('active');
      notice_box.hide();
    }
  })

  var culture_list = $('.culture_list');
  // 下拉加载更多
  var loading = false;
  // 初始化下拉
  var page_num;
  if(culture_list.attr('pagenum')){
    page_num = culture_list.attr('pagenum');
  } else {
    page_num = 2;
  }
  var pages;
  if(culture_list.attr('pages')){
    pages = culture_list.attr('pages');
  }
  var page_size = 20;
  var ctype;
  // 判断当前页面 推荐or全部
  if($('.culture_all').length){
    ctype = 3;
  } else {
    ctype = 1;
  }
  var culture_list_tpl = handlebars.compile($("#culture_list_tpl").html());

  function add_data(page){
    $.ajax({
      type: 'POST',
      url: '/index.php?g=restful&m=HsArticle&a=ajax_index_list',
      data: {
        page:page_num,
        page_size: page_size,
        ctype:ctype,
        is_culture: 1
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          culture_list.find('ul').append(culture_list_tpl(data.data));
          // 更新最后加载的序号
          page_num++;
          pages = data.pages;
          culture_list.attr('pagenum',page_num);
          culture_list.attr('pages',data.pages);
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
  // 监听加载
  page.on('infinite', function() {
    // 如果正在加载，则退出
    if (loading) return;
    // 设置flag
    loading = true;
    // 模拟1s的加载过程
    setTimeout(function() {
      // 重置加载flag
      loading = false;
      if (page_num >= pages) {
        // 加载完毕，则注销无限加载事件，以防不必要的加载
        $.detachInfiniteScroll($('.infinite-scroll'));
        // 删除加载提示符
        $('.infinite-scroll-preloader').remove();
        $.toast('😒 没有了');
        return;
      }
      add_data(pages);
      $.refreshScroller();
    }, 1000);
  });
});
