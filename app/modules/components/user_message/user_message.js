// 通知
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.user_message', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  $("input").blur(function(){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });
  var init = new common(page);
  init.checkfollow();
  init.sensorsFun.bottomNav();
  var ApiBaseUrl = init.getApiBaseUrl();
  let H5BaseUrl = ''
  if(ApiBaseUrl.indexOf('api.')>0){
    H5BaseUrl=`https://h5.ontheroadstore.com/`
  }else{
    H5BaseUrl=`https://h5test.ontheroadstore.com/`
  }
  $('.jump_contact').click(function(){
    location.href=`${H5BaseUrl}custServe`
  })

})
