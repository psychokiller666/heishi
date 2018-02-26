// 快递查询
// 页面初始化
var common = require('../common/common.js');
// 微信sdk
var wx = require('weixin-js-sdk');
$(document).on('pageInit', '.logistique', function (e, id, page) {
  if (page.selector == '.page') {
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  //加载初始化
  //物流信息
  $.post("/index.php?g=restful&m=HsExpress&a=express_query",{
    name: $(".expressname").val(),
    number: $(".expressnumber").val()
  },function(data){
    if(data.status == 1){
      var strs="";
      for(var i = 0;i< data.data.list.length; i++){
          strs+= '<li><span></span><div><p>'+data.data.list[i]["status"]+'</p><p>'+data.data.list[i]["time"]+'</p></div></li>';
      }
       $(".express-check").html(strs);
       $(".hs-main").css("background","white");
    }else{
      $('.not-express-icon').empty();
      $('.not-express-icon').append('<img src="/tpl/heishiv2_mobile/Public/img/recruitment.png">');
      $('.not-express-chech').text('没有查到物流信息');
    }
  })
});