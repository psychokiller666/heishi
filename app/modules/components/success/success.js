// 成功or失败页
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.jump', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  var status_pay = $('.status_pay').val();
  //支付成功
  if($('.success').length && status_pay == 0){
    $.showPreloader('确认支付中');
    setTimeout(function(){
      $.hidePreloader();
      $('.no_data').text('支付成功');
    },1000);
    setTimeout(function(){
      window.location.href = $('.no_data').data('url');
    },2000);
  }
  //支付错误
  if($('.error').length) {
    if($('.no_data').attr('data-url')){
      setTimeout(function(){
        window.location.href = $('.no_data').data('url');
      },1800);
    } else {
      setTimeout(function(){
        history.go(-1);
      },3000);
    }

  }

  //活动 支付成功
  if(status_pay == 1){
    $.hidePreloader();
    $.ajax({
      type: "GET",
      url: '/index.php?g=api&m=HsDigitalGoods&a=generate_digital_code&order_number=' + $(page).data('ordernumber'),
      success: function(data){
        $('.no_data').text(2);
        var digital = JSON.parse(data);
        var str = '<div><p>爸爸</p><p>您已启动黑市秘籍</p><p>游戏过后可直接观看成功视频</p></div><a href="//amuseddie.com/HeiShi/?hcode='+digital.data+'">前往体验</a>'
        $('.no_data').html(str);
      }
    })
  }
});
