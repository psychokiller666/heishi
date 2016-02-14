// 从右往左滑
$('.chat_list_group_bd ul li').swipeLeft(function(){
  $('.delete').hide();
  $('.chat_list_group_bd ul li').removeClass('active');

  $('.delete',this).animate({
    display: 'block'
  }, 500, 'ease-in');
  $(this).addClass('active');
});
// 从左往右滑
$('.chat_list_group_bd ul li').swipeRight(function(){
  $('.delete').hide();
  $('.chat_list_group_bd ul li').removeClass('active');
})

