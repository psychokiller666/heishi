// 生成订单页
// 微信jssdk
var wx = require('weixin-js-sdk');
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.orderform', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);


  var orderform_bd = $('.orderform_bd');
  // 生成订单数量操作
  var add_btn = $('#add');
  var min_btn = $('#min');
  var order_number = $('#number');
  var max_remain = orderform_bd.data('remain');

  //初始化数量为1,并失效减
  count_total(1);
  order_number.val(1);
  min_btn.attr('disabled',true);

  //数量增加操作
  add_btn.on('click',function(){
    var num = parseInt(order_number.val()) + 1;
    if (num != 1){
      min_btn.removeAttr('disabled');
    }
    if(num >= max_remain){
      $.toast('当前库存为：'+ max_remain);
      add_btn.attr('disabled',true);
    }
    count_total(num);
  })
  //数量减少操作
  min_btn.on('click',function(){
    add_btn.removeAttr('disabled');
    var num = parseInt(order_number.val());
    if(num == 1){
      min_btn.attr('disabled',true);
    }else{
      count_total(num - 1);
    }
  })

  // 生成订单
  $('.orderform_submit').on('click', function(){
    $(this).attr('disabled','disabled');
    var that = this;
    // 订单数据
    var post_data = {
      'order[orders][0][seller_name]':$(this).data('username'),
      'order[orders][0][attach]': $('#attach').val(),
      'order[orders][0][seller_uid]': $(this).data('seller_uid'),
      'order[orders][0][goods][0][object_id]': $(this).data('id'),
      'order[orders][0][goods][0][counts]': order_number.val(),
      'order[orders][0][goods][0][mid]':$(this).data('mid'),
      'order[type]': 1,
      'order[payment_type]': 0
    };
    if($('.add_address').length == 1){
      return $.toast('请选择收货地址');
    }
    $.post('/index.php?g=restful&m=HsOrder&a=union_add',post_data,function(data){
      if(data.status == 1){
        //  关联订单收货地址
        var address_data = {
          'order_number': data.order_number,
          'address_id': $('.select_address').attr('data-id')
        };
        $.ajax({
          url: '/index.php?g=user&m=HsOrder&a=order_address',
          data: address_data,
          type: "POST",
          success: function(res){
            if(res.status == 1) {
              window.location.href = GV.pay_url+'hsjsapi.php?order_number=' + data.order_number + '&digital_goods=' + $('.goods_type').val();
            }
          }
        });
      } else {
        $.toast(data.info);
      }
      $(that).removeAttr('disabled','disabled');
    })
  })

  // 随着数量变化调整conunt  total_prices_num
  function count_total(num){
    order_number.val(num);
    $('.conunt span').text(num);
    var total = parseInt($('.price').attr('data-price')) * num + parseInt($('.postage span').text());
    $('.total_prices_num').text(total);
  }
})
