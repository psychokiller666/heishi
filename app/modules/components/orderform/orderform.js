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

  $('.min').click(function(){
    var num = parseInt($('.countNum').attr('data-num'));
    if(num <= 1){
      return $.toast('最少选择1个');
    }
    num = num - 1;
    $('.countNum').attr('data-num', num);
    $('.countNum').text(num);
    $('.good_num').attr('data-num', num);
    $('.good_num').find('span').text(num);
    all_price();
  })
  $('.add').click(function(){
    var num = parseInt($('.countNum').attr('data-num'));
    var remain = $(this).attr('data-remain');
    if(num >= remain){
      return $.toast('当前库存为' + remain + '件');
    }
    num = num + 1;
    $('.countNum').attr('data-num', num);
    $('.countNum').text(num);
    $('.good_num').attr('data-num', num);
    $('.good_num').find('span').text(num);
    all_price();
  })
  all_price();
  function all_price() {
    var good_price = parseInt($('.good_price').attr('data-price'));
    var countNum = parseInt($('.countNum').attr('data-num'));
    var postage = parseInt($('.all_postage_num').attr('data-postage'));
    var m = good_price * countNum + postage;
    $('.all_price_num').text(m);
  }
  // 生成订单
  var payment_status = false;
  $('.payment').click(function(){
    var number = $('.countNum').attr('data-num');
    if(number <= 0){
      return $.toast('请输入正确的数量');
    }
    if(payment_status){
      return $.toast('订单正在生成中');
    }
    payment_status = true;
    var post_data = {
      'order[orders][0][seller_name]':$(this).data('username'),
      'order[orders][0][attach]': $('.attach').val(),
      'order[orders][0][seller_uid]': $(this).data('seller_uid'),
      'order[orders][0][goods][0][object_id]': $(this).data('id'),
      'order[orders][0][goods][0][counts]': number,
      'order[orders][0][goods][0][mid]':$(this).data('mid'),
      'order[type]': 1,
      'order[payment_type]': 0
    };
    $.post('/index.php?g=restful&m=HsOrder&a=union_add',post_data,function(data){
      payment_status = false;
      if(data.status == 1){
        var ok_url = GV.pay_url+'hsjsapi.php?order_number=' + data.order_number + '&digital_goods=0';
        window.location.href = ok_url;
      } else {
        $.toast(data.info);
      }
    })
  })
})
