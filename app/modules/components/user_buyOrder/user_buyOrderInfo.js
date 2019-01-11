// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.order_info', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.checkfollow();

  // 立即购买
  $('.payment_order').click(function(){
    location.href = '/user/HsBuyorder/pay_order.html?order_number=' + $(this).attr('data-order_number');
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
  $('.affirm_order').click(function(){
    var that = this;
    var order_id = $(this).attr('data-order_id');
    $.confirm('你确定收货吗', function () {
      $.post("/index.php?g=user&m=HsBuyorder&a=order_receipt", {
        id: order_id
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

  // 退款 售后 预售 跳转到下载app
  $('.order_info').on('click', '.refund_underway', function(){
    $.confirm('申请退款请移步App', function () {
      location.href = GV.server_url;
    });
  })
  $('.order_info').on('click', '.presell', function(){
    $.confirm('申请退款请移步App', function () {
      location.href = GV.server_url;
    });
  })
  $('.order_info').on('click', '.batch_refund', function(){
    $.confirm('申请退款请移步App', function () {
      location.href = GV.server_url;
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
