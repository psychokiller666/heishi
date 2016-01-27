// 添加评论
var comment_btn = $('#comment-btn');
var footer_nav = $('.footer_nav');
var dialog_comment = $('.dialog_comment');

comment_btn.on('click',function(e){
  $(this).addClass('active');
  dialog_comment.addClass('hs-show').removeClass('hs-hide');
  footer_nav.addClass('hs-hide').removeClass('hs-show');
  dialog_comment.find('input').focus();
});

dialog_comment.find('input').on('focus', function(e) {
  dialog_comment.parent('.hs-show-footer').addClass('input-fixfixed');
});

dialog_comment.find('input').on('blur', function(e) {
  comment_btn.removeClass('active');
  dialog_comment.addClass('hs-hide').removeClass('hs-show');
  footer_nav.addClass('hs-show').removeClass('hs-hide');
});

