// 页面初始化
var common = require('../common/common.js');
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');

$(document).on('pageInit','#user_people', function (e, id, page) {
  require('../../../../node_not/SUI-Mobile/dist/js/sm-extend.min.js');
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

  var commodity_list_tpl = handlebars.compile($('#commodity_list_tpl').html());
  var loading = false;


  // 请求数据
  function add_data(pages){
    $.get('/Api/HsAd/ajax_get_page',{
      page:pages
    },function(res){
      if(res.status == 1){
        page.find('.infinite-scroll-preloader').before(commodity_list_tpl(res));
        init.loadimg();
        page.find('.content').attr('data-page',page.find('.content').data('page') + 1);
      } else if(res.status == 0){
        page.find('.infinite-scroll-preloader').remove();
        $.detachInfiniteScroll($('.infinite-scroll'));
        $.toast(res.info);
      }
    })
  }
  if(page.find('.first_six_goods_list ul li').length == 6){
    page.on('infinite','.infinite-scroll', function(e) {
      if (loading) return;
      loading = true;
      setTimeout(function() {
        loading = false;
        add_data(page.find('.content').data('page'));
        $.refreshScroller();
      },500);
    })
  } else {
    page.find('.infinite-scroll-preloader').remove();
    $.detachInfiniteScroll($('.infinite-scroll'));
  }
  // 幻灯片
  // $(".swiper-container").swiper({
  //   autoplay:2000
  // });

});
