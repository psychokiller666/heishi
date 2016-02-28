// 发布页

$(document).on('pageInit','.add', function (e, id, page) {
  // 选择标签
  var tags = $('.tags');
  var tags_num = tags.find('button.active').length;
  // 返回选中标签
  function get_tags(tags_list){
    var tags_list = [];
    tags.find('button.active').each(function(index,item){
      JSON.stringify(tags_list.push($(item).text()));
    });
    return tags_list;
  }
  tags.find('button').on('click',function(e) {
    if(tags_num >= 2){
      if($(this).hasClass('active')){
        $(this).removeClass('active');
        tags_num--;
      } else {
        $.toast("😕 标签最多选2个");
      }
    } else {
      if(!$(this).hasClass('active')){
        $(this).addClass('active');
        tags_num++;
      } else {
        $(this).removeClass('active');
        tags_num--;
      }
    }
  })

  // 提交
  $('.submit').on('click',function(){
    console.log(get_tags());
  })

});
$.init();

