// 发过的东西
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.posts', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

  var already_list = $('.already_list');
  var stock_box = $('.stock_box');
  // 判断是否有数据
  if(already_list.find('.no_data').length){
    // 注销上拉
    $.detachInfiniteScroll($('.infinite-scroll'));
  }

  already_list.find('li').on('click','.office_btn',function(e) {
    var stock_number = $(this).parent().parent().find('.username span');
    var object_id = $(this).data('id');
    stock_box.show();
    stock_box.find('input').val(stock_number.text());

    stock_box.find('input').trigger('focus');
    stock_box.find('input').focus(function(){

    }).blur(function(e){
      stock_box.on('click','.submit_remain',function(){
        stock_box.off('click','.submit_remain');
        $.post('/index.php?g=user&m=Center&a=ajax_update_goods',{
          object_id:object_id,
          numbers: stock_box.find('input').val()
        },function(data){
          if(data.status == 1){
            $.toast('🙂 修改成功');
            stock_number.text(stock_box.find('input').val());
            stock_box.hide();
          } else {
            $.toast(data.info);
          }
        });
      })
    });
    stock_box.on('click',function(){
      stock_box.hide();
    });
  });
  var loading = false;
  // 初始化下拉
  var page_num = 2;
  var page_size = 20;
  var pages;
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
      url: '/index.php?g=user&m=Center&a=ajax_more_articles',
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
