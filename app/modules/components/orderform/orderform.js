// 生成订单页
// 微信jssdk
var wx = require('weixin-js-sdk');
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','#orderform', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

  var orderform = $('.orderform');
  var orderform_bd = $('.orderform_bd');
  // 生成订单数量操作
  var add_btn = $('#add');
  var min_btn = $('#min');
  var order_number = $('#number');
  var max_remain = orderform_bd.data('remain');
  var total = orderform_bd.find('.total span i');
  var price = orderform_bd.find('.price span i');
  //初始化数量为1,并失效减
  order_number.val(1);
  total.text(parseInt(order_number.val())*parseInt(price.text()));
  min_btn.attr('disabled',true);
  //数量增加操作
  add_btn.on('click',function(){
    order_number.val(parseInt(order_number.val())+1)
    if (parseInt(order_number.val())!=1){
      min_btn.removeAttr('disabled');
    }
    if(parseInt(order_number.val()) >= max_remain){
      add_btn.attr('disabled',true);
    }
    total.text(parseInt(order_number.val())*parseInt(price.text()));
  })
  //数量减少操作
  min_btn.on('click',function(){
   add_btn.removeAttr('disabled');
   if(parseInt(order_number.val())==1){
     min_btn.attr('disabled',true);
   } else {
    order_number.val(parseInt(order_number.val())-1);
  }
  total.text(parseInt(order_number.val())*parseInt(price.text()));
})
  // 生成订单
  var hs_footer = $('.hs-footer');
  hs_footer.on('click','button',function(){
    var _this = $(this);
    var post_data = {
      'order[object_id]': $(this).data('id'),
      'order[object_owner_id]': $(this).data('ownerid'),
      'order[object_title]': $(this).data('title'),
      'order[counts]': order_number.val(),
      'order[price]': parseInt(price.text()),
      'order[total_fee]': parseInt(total.text()),
      'order[type]': $(this).data('type'),
      'order[payment_type]': 0,
      'order[attach]': $('#attach').val()
    };
    console.log(post_data);
    $.showPreloader();
    $.post('/index.php?g=restful&m=HsOrder&a=add',post_data,function(data){
      if(data.status == 1){
        var ok_url = GV.pay_url+'hsjsapi.php?order_number=' + data.order_number +
        '&object_id=' + _this.data('id') +
        '&quantity=' + order_number.val() +
        '&seller_username=' + _this.data('username');
        $.hidePreloader();
        window.location.href = ok_url;
      } else {
        $.toast(data.info);
      }
      $.hidePreloader();
    })
  })

  // 添加地址
  $('.addr').tap(function(){
    console.log('sds');
  });
})
