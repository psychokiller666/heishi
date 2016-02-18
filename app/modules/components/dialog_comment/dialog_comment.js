// 添加评论
var comment_btn = $('#comment-btn');
var footer_nav = $('.footer_nav');
var dialog_comment = $('.dialog_comment');
var father_comment = $('.father');
var son_comment = $('.son');
// 弹出回复框
function comment_box(id,username) {
  dialog_comment.dialog("show");
  if (username) {
    $('#comment_input').attr('placeholder','回复：'+username);
  }
  $('#comment_input').focus();
  // 禁止滑动
  dialog_comment.on('touchmove',function(e){
    e.stopPropagation();
  });
  // 控制关闭
  dialog_comment.find('.cancel').on('click',function(){
    dialog_comment.dialog("hide");
  });
  // 提交评论
  dialog_comment.find('.submit').on('click',function(){
    dialog_comment.find('button').attr('disabled','disabled');
  });

  // 上传图片

}


// 点击写评论
comment_btn.on('click',function(e){
  $(this).addClass('active');
  comment_box('a');
});


// 点击评论框
father_comment.on('click',function(){
  var comment_id = $(this).data('id');
  var username = $(this).find('.username .hs-fl').text();
  comment_box(comment_id,username);
})

// 点击回复框
son_comment.on('click',function(){
  var comment_id = $(this).data('id');
  var username = $(this).find('.span').text();
  comment_box(comment_id,username);
})
