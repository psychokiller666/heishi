// 微信jssdk
var wx = require('weixin-js-sdk');

// 微信预览图片
$('.images ul li').tap(function(){
  var preview_list = [];
  $.each($('.images ul li'),function(index,item){
    preview_list.push($('.images ul li').eq(index).data('preview'));
  });
  wx.previewImage({
    current: $(this).data('preview'), // 当前显示图片的http链接
    urls: preview_list // 需要预览的图片http链接列表
  });
})

