// 发货页
// 页面初始化
var common = require('../common/common.js');
// 微信sdk
var wx = require('weixin-js-sdk');

$(document).on('pageInit','.deliver', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  var deliver_bd = $('.deliver_bd');
  // 扫一扫
  deliver_bd.on('click','.scanning_btn',function(){
    wx.scanQRCode({
      desc: '快递单号',
      needResult: 0,
      scanType: ["qrCode","barCode"],
      success: function(data){
        deliver_bd.find('input').val(data.resultStr.split(',')[1]);
      }
    });
  });
  // 确认发货
  page.on('click','.deliver_submit_deliver',function(){
    var _this = $(this);
    $.post("/index.php?g=user&m=HsOrder&a=deliver",{
      uid:_this.data('uid'),
      order_number:_this.data('ordernumber'),
      express_name:deliver_bd.find('.express .name input').val(),
      express_number:deliver_bd.find('.express .number input').val()
    },function(data){
      if(data.status == 1){
        $.toast('发货成功，2秒自动返回');
        setTimeout(function(){
          $.router.back();
        },1800);
      } else {
        $.toast(data.info);
      }
    });
  })

})
