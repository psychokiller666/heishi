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

  var ApiBaseUrl = init.getApiBaseUrl();

  var PHPSESSID = init.getCookie('PHPSESSID');
  var ajaxHeaders = {
      'phpsessionid': PHPSESSID
  };

  //限购，加减数量判断
  function limitGoodsNum(num){
    var maxBuyNum = parseInt($('.countNum').attr('data-max-buy-num'));
    //限购
    if(maxBuyNum>0 && num > maxBuyNum){
        $.toast('数量超过限购范围');
        return maxBuyNum;
    }else{
      return num;
    }
  }

  $('.min').click(function(){
    var num = parseInt($('.countNum').attr('data-num'));
    if(num <= 1){
      return $.toast('最少选择1个');
    }
    num = num - 1;
    num = limitGoodsNum(num);
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
    num = limitGoodsNum(num);
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
    var addressid = $(this).attr('data-address_id');

    if(addressid==0){
        return $.toast('请先选择地址');
    }
    if(number <= 0){
      return $.toast('请输入正确的数量');
    }
    if(payment_status){
      return $.toast('订单正在生成中');
    }
    payment_status = true;
/*    var post_data = {
      'order[orders][0][seller_name]':$(this).data('username'),
      'order[orders][0][attach]': $('.attach').val(),
      'order[orders][0][seller_uid]': $(this).data('seller_uid'),
      'order[orders][0][goods][0][object_id]': $(this).data('id'),
      'order[orders][0][goods][0][counts]': number,
      'order[orders][0][goods][0][mid]':$(this).data('mid'),
      'order[type]': 1,
      'order[payment_type]': 0,
      'order[address_id]':$(this).attr('data-address_id'),

    };
    $.post('/index.php?g=restful&m=HsOrder&a=union_add',post_data,function(data){
      payment_status = false;
      if(data.status == 1){
        var ok_url = GV.pay_url+'hsjsapi.php?order_number=' + data.order_number + '&digital_goods=0';
        window.location.href = ok_url;
      } else {
        $.toast(data.info);
      }
    })*/

      //    创建订单api接口
      var orderData = {
          "address_id":addressid,
          "orders":[
              {
                  "attach":$('.attach').val(),//备注
                  "items":[
                      {
                          "counts":number,
                          "item_id":$(this).data('id'),//商品id
                          "mid":$(this).data('mid'),//款式id
                      }
                  ],
                  "seller_name":$(this).data('username'),
                  "seller_uid":$(this).data('seller_uid'),
              }
          ],
          "type":1, //类型 1商品订单 0打赏
          // "user_coupon_id":""
      };

      $.ajax({
          type: "POST",
          url: ApiBaseUrl + '/appv6/createorder',
          dataType: 'json',
          data: orderData,
          headers: ajaxHeaders,

          success: function(data){
              if(data.status==1){
                  // console.log(data.data)
                  /*var tmp = {
                      "status":1,
                      "code":1,
                      "info":"Success",
                      "data":"VR20180820151512ZST5UV"
                  }*/
                  var ok_url = GV.pay_url+'hsjsapi.php?order_number=' + data.data + '&digital_goods=0';
                  window.location.href = ok_url;
              }else{
                  $.toast(data.info);
              }
              payment_status = false;

          },
          error: function(e){
              payment_status = false;
              $.toast('网络故障，请稍后重试');
              console.log('createOrder err: ',e);
          }
      });

  })


});
