// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.login', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  // $('.get_pass').on('click', function(){
  //   $.toast('获取验证码');
  //   $(this).attr('disabled', 'disabled');
  //   count_down(this);
  // })
  // function count_down(that){
  //   var clearTime = null;
  //   var num = 59;
  //   clearTime = setInterval(function(){
  //     if(num == 0){
  //       clearInterval(clearTime);
  //       $(that).removeAttr('disabled');
  //     }else{
  //       $(that).text(num);
  //     }
  //     num--;
  //   },1000)
  // }
});
