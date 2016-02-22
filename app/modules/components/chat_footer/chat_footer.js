var update_img_btn = $('.update_img_btn');
var update_img_box = $('.update_img_box');
var chat_content = $('.chat_content');

update_img_btn.on('click',function(e) {
  if(!$(this).hasClass('active')){
    $(this).addClass('active');
    update_img_box.show();
  } else {
    $(this).removeClass('active');
    update_img_box.hide();
  }
})

chat_content.on('focus',function(){
  update_img_box.hide();
  update_img_btn.removeClass('active');
})
