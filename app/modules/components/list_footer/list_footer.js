var notice_btn = $('.notice_btn');
var notice_box = $('.notice_box');

notice_btn.on('click',function(e) {
  if(!notice_btn.hasClass('active')){
    $(this).addClass('active');
    notice_box.show();
    notice_box.css('bottom',$('.hs-footer').height()-2);
  } else {
    $(this).removeClass('active');
    notice_box.hide();
  }
})
