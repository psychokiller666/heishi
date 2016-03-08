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
        deliver_bd.find('input').val(data);
      }
    });
  });

})
