// 成功or失败页
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.jump', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

  if($('.success').length){
    $.showPreloader('确认支付中');
    init.cnzz_push('完成订单',{
      '订单ID': $(page).data('ordernumber'),
      'value': $(page).data('price'),
      '订单类型': $(page).data('actiontype')
    });
    zhuge.track('完成订单',{
      '订单ID': $(page).data('ordernumber'),
      'value': $(page).data('price'),
      '订单类型': $(page).data('actiontype')
    });
    setTimeout(function(){
      $.hidePreloader();
      $('.no_data').text('支付成功');
    },1800);
    setTimeout(function(){
      window.location.href = $('.no_data').data('url');
    },3000);
  }

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

});
