// 私信聊天顶部
var chat_header_bd = $('.chat-header-bd');
var recent_box = $('.recent_box');
recent_box.css('top',$('.chat-header').height());

var recent_btn = $('.recent_btn');
recent_btn.on('click',function(e) {
  if(!$(this).hasClass('active')){
    $(this).addClass('active');
    recent_box.show();
    chat_header_bd.css('background-color','#ededed');
  } else {
    $(this).removeClass('active');
    recent_box.hide();
    chat_header_bd.css('background-color','#fff');
  }
})
