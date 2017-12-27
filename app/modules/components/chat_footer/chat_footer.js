// 提示框
var prompt = require('../prompt/prompt.js');

var update_img_btn = $('.update_img_btn');
var update_img_box = $('.update_img_box');
var chat_content = $('.chat_content');
var chat_footer = $('.chat-footer');
var chat_list = $('.chat_list');

var _chattpl = '<li class="me">'+
'<span class="date">刚刚</span>'+
'<span class="avatar" style="background-image:url(//placeholder.qiniudn.com/108x108)"></span>'+
'<div class="content"><%=content%></div>'+
'</li>';

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
chat_footer.find('.submit').on('click',function(){

  if(chat_content.val().length){
    chat_list.find('ul').append($.tpl(_chattpl,{content:chat_content.val()}));
    prompt('🌚 发送成功');
    chat_list.scrollTop(chat_list.height());
    chat_content.val('');
  }else {
    prompt('😒 内容不能为空');
  }

})
