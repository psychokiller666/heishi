// 商品列表
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');
$(document).on('pageInit','.seller_list', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  // 调用微信分享sdk
  init.wx_share(false);
  // 检查是否有新的消息
  init.msg_tip();
  $.refreshScroller();
  setTimeout(function(){
    $('.content').scrollTop($('.content ul').height());
  },100);

  // 上拉加载更多
  var loading = false;
  // 初始化下拉
  var pages = 2;
  var seller_list_bd = $('.seller_list_bd');
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
        page: pages
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(pages >= data.pages  || data.info == "没有更多数据了"){
          $.toast(data.info);
          // 加载完毕，则注销无限加载事件，以防不必要的加载
          $.destroyPullToRefresh($('.pull-to-refresh-content'));
          $.pullToRefreshDone('.pull-to-refresh-content');
          // 删除加载提示符
          $('.pull-to-refresh-layer').remove();
        } else if(data.status == 1){
          seller_list_bd.find('ul').prepend(seller_list_tpl(data));
          console.log(seller_list_tpl(data.data));
          pages++;
          init.loadimg();
        }
        $.pullToRefreshDone('.pull-to-refresh-content');
        $.refreshScroller();
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+xhr);
      }
    });
  }

  // 监听下拉
  page.on('refresh', '.pull-to-refresh-content',function(e) {
   if (loading ) return;
    // 设置flag
    loading = true;
    setTimeout(function() {
      // 重置加载flag
      loading = false;
      add_data(pages);
    }, 500);
  });
});
