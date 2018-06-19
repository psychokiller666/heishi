// 卖家动态
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');
$(document).on('pageInit','.seller_list', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  // 检查是否有新的消息
  init.msg_tip();
  // 列表首页_通用底部发布
  var hs_footer = $('.hs-footer');
  var notice_box = $('.notice_box');
  var notice_bd = $('.notice_bd');
  var old_active;
  // 记录位置
  hs_footer.find('li').each(function(index,item) {
    if($(item).find('a').hasClass('active')) {
      old_active = index
    }
  })
  hs_footer.on('click','.notice_btn',function() {
    if(!$(this).find('a').hasClass('active')){
      hs_footer.find('li a').removeClass('active');
      $(this).find('a').addClass('active');
      notice_box.show();
      notice_box.css('bottom',hs_footer.height()-2);
    } else {
      $(this).find('a').removeClass('active');
      hs_footer.find('li').eq(old_active).find('a').addClass('active');
      notice_box.hide();
    }
  })
  notice_bd.on('click','a',function(e){
    var typeid = $(this).data('typeid');
    e.preventDefault();
    $.showPreloader();
    $.post('/index.php?g=restful&m=HsMobile&a=ajax_mobile_checking','',function(data){
      if(data.status == 1){
        $.hidePreloader();
        $('.phone_verify').find('.submit').attr('href','/user/HsPost/notice/type/'+typeid+'.html');
        $('.phone_verify').show();
      } else {
        // $.toast(data.info);
        $.hidePreloader();
        $.router.load('/user/HsPost/add/type/'+typeid+'.html', true);
      }
    })

    $('.notice_btn').find('a').removeClass('active');
    hs_footer.find('li').eq(old_active).find('a').addClass('active');
    notice_box.hide();
  })
  $('.phone_verify').on('click','.modal-overlay',function(){
    $('.phone_verify').hide();
  })

  var seller_list_bd = $('.seller_list_bd');
  // 判断是否有数据
  if(seller_list_bd.find('.no_data').length){
    // 注销下拉滑动事件
    $.destroyPullToRefresh($('.pull-to-refresh-content'));
    $.pullToRefreshDone('.pull-to-refresh-content');
    // 删除加载提示符
    $('.pull-to-refresh-layer').remove();
  } else {
    $.refreshScroller();
    // setTimeout(function(){
    //   $('.content').scrollTop($('.content ul').height());
    // },500);
  }

  // 上拉加载更多
  var loading = false;
  var seller_list_tpl = handlebars.compile($("#seller_list_tpl").html());
  // 加入判断方法
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  // 添加数据
  function add_data(page_number){
    $.ajax({
      type: 'POST',
      url: '/index.php?g=user&m=HsFellows&a=ajax_fellows_activate',
      data: {
        page: page_number
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          if(page_number == data.pages+1){
            $.detachInfiniteScroll($('.infinite-scroll'));
            $('.infinite-scroll-preloader').remove();
            $.toast('没有更多内容了');
          } else {
            seller_list_bd.find('ul').append(seller_list_tpl(data));
            seller_list_bd.attr('data-pagenum',seller_list_bd.data('pagenum')+1);
            init.loadimg();
          }
        } else {
          $.toast(data.info);
        }
        $.refreshScroller();
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+xhr);
      }
    });
  }

  // 监听下拉
  page.on('infinite', '.content',function(e) {
   if (loading ) return;
    // 设置flag
    loading = true;
    setTimeout(function() {
      // 重置加载flag
      loading = false;
      add_data(seller_list_bd.data('pagenum'));
    }, 500);
  });
});
