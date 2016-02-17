// 添加评论
var comment_btn = $('#comment-btn');
var footer_nav = $('.footer_nav');
var dialog_comment = $('.dialog_comment');
var father_comment = $('.father');
var son_comment = $('.son');
// 弹出回复框
function comment_box(id,height) {
  dialog_comment.addClass('hs-show').removeClass('hs-hide');
  footer_nav.addClass('hs-hide').removeClass('hs-show');
  // dialog_comment.parent('.hs-show-footer').addClass('input-fixfixed');


  $('main').scrollTop(height);
  $('#comment_input').focus();
  // console.log(height);
}

comment_btn.on('click',function(e){
  $(this).addClass('active');
  comment_box();
});

// dialog_comment.find('input').on('focus', function(e) {
//   dialog_comment.parent('.hs-show-footer').addClass('input-fixfixed');
// });

dialog_comment.find('input').on('blur', function(e) {
  comment_btn.removeClass('active');
  dialog_comment.addClass('hs-hide').removeClass('hs-show');
  footer_nav.addClass('hs-show').removeClass('hs-hide');
});


father_comment.on('click',function(){
  var comment_id = $(this).data('id');
  comment_box(comment_id,$(this).find('.username').offset().top);
  console.log($(this).find('.username').offset().top);
})
son_comment.on('click',function(){
  var comment_id = $(this).data('id');
  comment_box(comment_id,$(this).offset().top);
})

