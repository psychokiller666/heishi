// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.order_info', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  init.checkfollow();
  var system_query = init.system_query();
  if(system_query == 'android'){
    var system_query_url = GV.app_url;
  	$('.open_app').find('.open_app_btn').attr('href', system_query_url);
  }else if(system_query == 'ios'){
  	var order_view_status = $('.order_view_status').val();
  	var system_query_url = GV.api_url + '/ios/ordersinfo/' + order_view_status;
    $('.open_app').find('.open_app_btn').attr('href', system_query_url);
  }
  // 退款 售后
	$('.batch_refund').attr('href', system_query_url);
	$('.refund_status').attr('href', system_query_url);
	$('.after_sale').attr('href', system_query_url);

  // 立即购买
  $('.payment_order').click(function(){
	 location.href = GV.pay_url+'hsjsapi.php?order_number=' + $(this).attr('data-order_number');
  })
  // 取消订单
  $('.cancel_order').click(function(){
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
          $(that).siblings('.payment_order').remove();
          $(that).siblings('.delete_order').show();
          $(that).remove();
      	}
      })
    });
  })
  // 提醒发货
  $('.remind_deliver').click(function(){
    $.toast('提醒发货');
  })
  // 确认收货
  $('.affirm_order').click(function(){
    var that = this;
    var order_number = $(this).attr('data-order_number');
    $.confirm('你确定收货吗', function () {
      $.post("/index.php?g=user&m=HsOrder&a=comfirm_received", {
        order_number:order_number
      }, function (data) {
        if (data.status == 1) {
          $.toast('收货成功');
          $(that).siblings('.delete_order').show();
          $(that).remove();
        } else {
          $.toast(data.info);
        }
      });
    });
  })
  // 删除订单
  $('.delete_order').click(function(){
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
            setTimeout(function(){
              history.go(-1);
            },1000)
          }
          $.toast(data.info);
      	}
      })
    });
  })

  // 联系卖家
  $('.relation_seller').click(function(){
  	var tel = $(this).attr('data-tel');
  	var user_id = $(this).attr('data-uid');
  	var buttons2 = [{
  		text: '取消',
  		bg: 'danger'
    }];
  	var buttons1 = [{
  		text: '请选择',
  		label: true
  	},{
  		text: '私信卖家',
  		bold: true,
  		color: 'danger',
  		onClick: function() {
  			location.href = '/User/HsMessage/detail/from_uid/'+user_id+'.html';
  		}
  	}];
  	if(tel){
  		buttons1.push({
  			text: '卖家电话',
  			onClick: function() {
  				window.open('tel:' + tel);
  			}
  		})
  	}
    $.actions([buttons1,buttons2]);
  })
});
