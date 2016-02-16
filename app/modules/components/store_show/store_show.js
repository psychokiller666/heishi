// 微信jssdk
var wx = require('weixin-js-sdk');

// 微信预览图片
// 微信jssdk 预览图片
// http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html#.E9.A2.84.E8.A7.88.E5.9B.BE.E7.89.87.E6.8E.A5.E5.8F.A3
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

// 点赞
// 更多点赞列表

// 更多按钮
var praise_more_tpl = '<li><button type="button" class="praise_more">更多</button></li>';

$('.show .praise ul li').each(function(index,item){
  console.log(index);
  if(index <= 7) {
    $('.show .praise ul').height('1.14rem');
  } else if (index >= 16){
    $('.show .praise ul li').eq(15).before(praise_more_tpl);
  } else {
    $('.show .praise ul').height('2.64rem');
  }
});

$('.praise_more').live('click',function(){

  if($(this).hasClass('active')) {
    $(this).parent().remove();
    $('.show .praise ul li').eq(15).before(praise_more_tpl);
    $('.show .praise ul').height('2.64rem');
  } else {
    // $(this).addClass('active');
    $(this).parent().remove();
    $('.show .praise ul').height('auto');
    $('.show .praise ul').append(praise_more_tpl);
    $('.praise_more').addClass('active');
    $('.praise_more').text('回收');
  }
// $('.praise_more').parent().remove();


})
