// 提现列表页
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 页面初始化
var common = require('../common/common.js');
$(document).on('pageInit','.user_withdraw_list', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

  var user_withdraw_list_bd = $('.user_withdraw_list_bd');
  var user_withdraw_list_tpl = handlebars.compile($("#user_withdraw_list_tpl").html());
  var loading = false;
  var page_num = 1;
  var pages_num;
  var page_size = 20;
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  // 初始化页面数据
  add_data(page_num,pages_num,page_size,true);
  user_withdraw_list_bd.find('ul').empty();
  // 添加数据
  function add_data(pagess,pages,pagesize,init){
    $.ajax({
      type: 'POST',
      url: '/index.php?g=restful&m=HsWithdraw&a=ajax_withdraw_list',
      data: {
        page:pagess,
        pages:pages,
        pagesize:pagesize
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == '1'){
          user_withdraw_list_bd.find('ul').append(user_withdraw_list_tpl(data.data));
          if(init){
            pages_num = data.pages;
            if(pages_num == 1){
              $.detachInfiniteScroll($('.infinite-scroll'));
              // 删除加载提示符
              $('.infinite-scroll-preloader').remove();
            }
          }
          page_num++;
        } else if(data.data == null) {
          user_withdraw_list_bd.append('<div class="no_data">毛都没找到</div>');
          // 加载完毕，则注销无限加载事件，以防不必要的加载
          $.detachInfiniteScroll($('.infinite-scroll'));
          // 删除加载提示符
          $('.infinite-scroll-preloader').remove();
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+type);
      }
    });
  }
  page.on('infinite','.infinite-scroll', function(e) {
    // 如果正在加载，则退出
    if (loading) return;
    // 设置flag
    loading = true;
    setTimeout(function() {
      loading = false;
      add_data(page_num,pages_num,page_size,false);
    },500);
    // new control_dom().remove_first();
    $.refreshScroller();
  });

});
