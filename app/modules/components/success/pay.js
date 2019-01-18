//选择支付方式

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit', '.pay', function (e, id, page) {
  if (page.selector == '.page') {
    return false;
  }

  var pageTitle = $(page).find('.page_title').attr('title') || '公路商店';

  document.title = pageTitle;

  var init = new common(page);

  var BaseUrl = init.getBaseUrl();//todo

  var PHPSESSID = init.getCookie('PHPSESSID');
  var ajaxHeaders = {
    'phpsessionid': PHPSESSID
  };

  var $isApp = $('.is_app');
  var deviceType = $isApp.attr('device_type');//值：IOS ANDROID WECHAT NO

  var loginStatus = init.ifLogin(true);

  var order_number = init.getUrlParam('order_number')
  if (!order_number) {
    $.toast('参数错误')
    history.go(-1);
    return
  }

  var loading = false;
  var payFunList = {
    wx: getWxPayUrl,
    // ali: getAliPayUrl,
  }

  var checkCount = 0;

  var $confirm_popup = $('.confirm_popup');

  if(location.hash.indexOf('pay')>-1){
    $confirm_popup.show();
    loading = true;
    location.hash = '#';
  }

  $('.pay_type').on('click', function (ev) {
    if (loading) {
      return;
    }
    loading = true;
    var $this = $(this);
    var type = $this.attr('type');
    $this.addClass('active');
    if (typeof payFunList[type] === "function") {
      payFunList[type](order_number);
      $.toast('正在前往支付', 10000);
    } else {
      getPayUrlFail();
    }
  })

  $confirm_popup.on('click', '.confirm_close', function () {
    $confirm_popup.hide();
    loading = false;
  })
  $confirm_popup.on('click', '.confirm_ok', function () {
    checkPay();
    loading = false
    $confirm_popup.hide();
    $.toast('正在确认订单支付状态，请稍后')
  })

  if(deviceType==='WECHAT' || deviceType==='NO'){
    $(page).find('.return_home_page').show();
  }

  //获取支付宝支付链接
  function getAliPayUrl() {

  }

  //获取微信支付链接
  function getWxPayUrl(orderid) {
    var url = '/payment/test_pay/mwebapi.php?order_number=' + orderid;
    $.ajax({
      type: "GET",
      url: url,
      dataType: 'json',
      data: {},
      headers: ajaxHeaders,

      success: function (data) {
        if (typeof data.url === "string" && data.url.length > 10) {
          location.href = data.url;
          setTimeout(function(){
            loading = false
          },1000)
        } else {
          getPayUrlFail();
        }
      },
      error: function (xhr) {
        if (xhr.status == 0) {
          if (init.ifLogin(true) == false) {
            return;
          }
        }
        getPayUrlFail();
        console.log('getPayUrl err: ', e);
      }

    });
  }

  //获取url失败
  function getPayUrlFail() {
    loading = false;
    $.toast('调起支付失败,请稍后重试');
    $('.pay_type').removeClass('active');
  }

  //检查支付结果
  function checkPay(orderid) {
    var url = '/Portal/HsPayment/check_pay.html?order_number=' + orderid;
    $.ajax({
      type: "GET",
      url: url,
      dataType: 'json',
      data: {},
      headers: ajaxHeaders,

      success: function (data) {
        if(data.status==1){
          if(data.data.order_status == 1){
            //支付成功
            location.href = '/Portal/HsPayment/success.html?order_number='+orderid;
          }else{
            //未支付成功,再次检测
            checkCount++;
            setTimeout(function(){
              checkPay(orderid);
            },1000 * Math.ceil(checkCount/5));
          }
        }else{
          $.toast(data.info)
        }
      },
      error: function (xhr) {
        if (xhr.status == 0) {
          if (init.ifLogin(true) == false) {
            return;
          }
        }
        $.toast('网络故障，请稍后重试')
        console.log('check_pay err: ', e);
      }

    });
  }


});


