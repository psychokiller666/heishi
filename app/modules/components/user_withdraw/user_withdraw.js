// 提现
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','#withdraw', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  $.showPreloader();
  var alipay_account = $('#alipay_account');
  var alipay_name = $('#alipay_name');
  var telphone = $('#telphone');
  // 检查是否有默认值
  $.ajax({
    type: 'POST',
    url: '/index.php?g=user&m=center&a=get_my_connects',
    dataType: 'json',
    timeout: 4000,
    success: function(data){
      if(data.status == 1){
        alipay_account.val(data.data.alipay_acount);
        alipay_name.val(data.data.alipay_name);
        telphone.val(data.data.telphone);
      }
      $.hidePreloader();
    },
    error: function(xhr, type){
      $.toast('网络错误 code:'+xhr);
      $.hidePreloader();
    }
  });
  // 提现
  var user_withdraw = $('.user_withdraw');
  if(parseInt($('.amount_submit').data('amount')) < 1){
    $('.amount_submit').attr('disabled','disabled');
  }
  page.on('click','.amount_submit',function(){
    var _this = $(this);
    var amount = Math.floor(parseInt($(this).data('amount')));
    $.confirm('确认提现？',
      function() {
        $.ajax({
          type: 'POST',
          url: '/index.php?g=user&m=center&a=withdraw',
          data: {
            amount: amount,
            alipay_name: alipay_name.val(),
            alipay_account: alipay_account.val(),
            alipay_tel: telphone.val()
          },
          dataType: 'json',
          timeout: 4000,
          success: function(res){
            if(res.status == 1){
              $.toast(res.info);
              _this.attr('data-amount',res.data);
              $('.money span').text(res.data);
              $('.user_withdraw strong').text(res.data);
            } else {
              $.toast(res.info);
            }
            setTimeout(function(){
              $.router.load('/User/Center/index.html', true);
              // $.router.back('#center');
            },2000);
          },
          error: function(xhr, type){
            $.toast('网络错误 code:'+xhr);
          }
        });
      }),
    function(){
      page.off('click','..amount_submit');
    }

  });
});
