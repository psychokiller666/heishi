// 初始化
var common = require('../common/common.js');
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');


$(document).on('pageInit','.buyOrder', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.checkfollow();

  // 立即购买
  $('.order_list').on( 'click', '.payment_order', function (){
    location.href = '/user/HsBuyorder/pay_order.html?order_number=' + $(this).attr('data-order_number');
  })
  // 取消订单
  $('.order_list').on( 'click', '.cancel_order', function (){
    var that = this;
  	var order_id = $(this).attr('data-order_id');
    $.confirm('确定取消订单吗', function () {
      $.ajax({
        type: 'GET',
        url: '/index.php?g=user&m=HsBuyorder&a=order_cancel',
        data: {
          id: order_id
        },
        success: function(data){
          $.toast(data.info);
          $(that).parents('.order_item').remove();
      	}
      })
    });
  })
  // 提醒发货
  $('.order_list').on( 'click', '.remind_deliver', function() {
    var order_id = $(this).attr('data-order_id');
    $.ajax({
      type: 'GET',
      url: '/index.php?g=user&m=HsBuyorder&a=order_remind',
      data: {
        id: order_id
      },
      success: function(data){
        $.toast(data.info);
      }
    })
  })
  // 确认收货
  $('.order_list').on( 'click', '.affirm_order', function() {
    var that = this;
    var order_id = $(this).attr('data-order_id');
    $.confirm('你确定收货吗', function () {
      $.post("/index.php?g=user&m=HsBuyorder&a=order_receipt", {
        id: order_id
      }, function (data) {
        if (data.status == 1) {
          $.toast('收货成功');
          $(that).parents('.order_item').remove();
        } else {
          $.toast(data.info);
        }
      });
    });
  })
  // 删除订单
  $('.order_list').on( 'click', '.delete_order', function() {
    var that = this;
  	var order_id = $(this).attr('data-order_id');
    $.confirm('确定删除订单吗', function () {
      $.ajax({
        type: 'GET',
        url: '/index.php?g=user&m=HsBuyorder&a=order_delete',
        data: {
          id: order_id
        },
        success: function(data){
          if(data.status == 1){
            $(that).parents('.order_item').remove();
          }
          $.toast(data.info);
      	}
      })
    });
  })

  // 退款跳转到下载app
  $('.order_list').on('click', '.refund_status', function(){
    location.href = GV.server_url;
  })
  // 下拉加载
  var loading = false;
  var orderType =  parseInt($('.order_view_status').val()) + 1;
  var pageSize = 1;
  var goods_info_length = $('.goods_info').length;
  if(goods_info_length < 20){
    $('.infinite-scroll-preloader').remove();
    $.detachInfiniteScroll($('.infinite-scroll'));
  }
  var orders_tpl = handlebars.compile($("#orders_tpl").html());
  // 加入判断方法
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  page.on('infinite', function() {
    // 如果正在加载，则退出
    if (loading) {
      return false;
    }
    // 设置flag
    loading = true;
    pageSize = pageSize + 1;
    ajax_orders(pageSize);
    $.refreshScroller();
  });

  function ajax_orders(pageSize){
    $.ajax({
      type: 'GET',
      url: '/index.php?g=user&m=HsBuyorder&a=get_pageOrders',
      data: {
        type: orderType,
        page: pageSize
      },
      success: function(data){
        if(data.status == 1){
          $('.order_list').append(orders_tpl(data.data));
          init.loadimg();
          loading = false;
        }else{
          $(data.info);
          $('.infinite-scroll-preloader').remove();
          $.detachInfiniteScroll($('.infinite-scroll'));
        }
      }
    })
  }
});
