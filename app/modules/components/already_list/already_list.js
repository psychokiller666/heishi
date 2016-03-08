// 卖过的东西_未发货
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 页面初始化
var common = require('../common/common.js');
var deliver_data = {
  title:'ffff'
}
$(document).on('pageInit','.untreated', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

  var already_list = $('.already_list');
  var loading = false;
  // 初始化下拉
  var page_num = 2;
  var page_size = 20;
  var pages;
  var ajax_url = '/index.php?g=user&m=HsOrder&a=ajax_untreated';
  // 判断是已发货还是未发货
  if($('.delivered').length){
    ajax_url = '/index.php?g=user&m=HsOrder&a=ajax_delivered';
  }
  var already_list_tpl = handlebars.compile($("#already_list_tpl").html());
  // 加入判断方法
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  // 添加数据
  function add_data(page_size,page) {
    $.ajax({
      type: 'POST',
      url: ajax_url,
      data: {
        page:page_num,
        page_size:page_size
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          already_list.find('ul').append(already_list_tpl(data.data));
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
  // 收货地址按钮
  already_list.on('click','.address_btn',function(){
    var _this = $(this);
    var addressid = _this.data('addressid');
    var userid = _this.data('userid');
    var ordernumber = _this.data('ordernumber');
  });
  if(already_list.find('li').length < 20){
    $.detachInfiniteScroll($('.infinite-scroll'));
    // 删除加载提示符
    $('.infinite-scroll-preloader').remove();
    $.refreshScroller();
    return false;
  };
  // 监听滚动
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


})
