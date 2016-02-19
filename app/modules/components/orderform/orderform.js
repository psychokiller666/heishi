// 微信jssdk
var wx = require('weixin-js-sdk');

if($('.orderform').length) {
  // 生成订单数量操作
  var add_btn = $('#add');
  var min_btn = $('#min');
  var order_number = $('#number');

  console.log('ds');

  //初始化数量为1,并失效减
  order_number.val(1);
  min_btn.attr('disabled',true);
  //数量增加操作
  add_btn.on('click',function(){
    order_number.val(parseInt(order_number.val())+1)
    if (parseInt(order_number.val())!=1){
      min_btn.attr('disabled',false);
    }
  })
  //数量减少操作
  min_btn.on('click',function(){
    if (parseInt(order_number.val())==1){
      min_btn.attr('disabled',true);
    } else {
      order_number.val(parseInt(order_number.val())-1);
    }
  })

  // 添加地址
  $('.addr').tap(function(){
    console.log('sds');
  });
}
