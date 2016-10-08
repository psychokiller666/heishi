// 商品列表
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');
// 手势
// var Hammer = require('hammerjs');

$(document).on('pageInit','.user_hslike', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);


  var store_list = page.find('.content');
  // 下拉加载更多
  var loading = false;
  // 初始化下拉

  var user_hslike_tpl = handlebars.compile($("#user_hslike_tpl").html());
  // 增加handlebars判断
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  // function add_data
  function add_data(ajax_data) {
    $.ajax({
      type: 'POST',
      url: '/index.php?g=user&m=HsLike&a=ajax_more',
      data: {
        page:ajax_data
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          store_list.find('ul').append(user_hslike_tpl(data));
          page.attr('data-pages',page.data('pages')+1);
          // 图片加载
          init.loadimg();
          // 刷新
          $.refreshScroller();
        } else if(data.status == 0) {
          $.toast(data.info);
          $.detachInfiniteScroll($('.infinite-scroll'));
          $('.infinite-scroll-preloader').remove();
        }
      },
      error: function(xhr, type){
        // $.toast('网络错误 code:'+type);
      }
    });
  }
  // 监听滚动
  page.on('infinite','.infinite-scroll', function(e) {
    // 如果正在加载，则退出
    if (loading) return;
    // 设置flag
    loading = true;
    setTimeout(function() {
      loading = false;
      add_data(page.data('pages'));
    },500);
  });
  add_data(page.data('pages'))
  //取消点赞
  page.find('.user_hslike .classify').on("click",function(e){
      e.preventDefault();
      var _that=this;
      var id=this.getAttribute("data-title");
      $.post('/index.php?g=user&m=HsLike&a=cancel_like', {
        id: id
      }, function (data) {
        if (data.status == 1) {
          $.toast("取消成功");
          _that.parentNode.parentNode.parentNode.parentNode.style.display="none";
        } else {
          $.toast(data.info);
        }
      });
  })
  
  // var hammertime = new Hammer(page.find('.content li'));
  //为该dom元素指定触屏移动事件
  // console.log(hammertime);
  // hammertime.on('panright', function (ev) {
  //   //控制台输出
  //   console.log(ev);
  // });

});
