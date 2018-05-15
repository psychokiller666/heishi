// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.pay_order', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  init.checkfollow();
  $('.pay_btn').on( 'click',function() {
    if($('.is_normal').val() != 1){
      return $.toast('当前商品库存不足，请重新下单购买');
    }
    var order_number = $(this).data('order_number');
    var attach = $('.desc_content').val();
    $.ajax({
      type: 'GET',
      url: '/index.php?g=user&m=HsBuyorder&a=save_pay_order',
      data: {
        order_number: order_number,
        attach: attach
      },
      success: function(data){
        $('.pay_btn').off('click');
        if(data.status == 1){
          var ok_url = GV.pay_url+'hsjsapi.php?order_number=' + data.info;
          window.location.href = ok_url;
        }else{
          $.toast(data.info);
        }
      }
    })
  })
});
