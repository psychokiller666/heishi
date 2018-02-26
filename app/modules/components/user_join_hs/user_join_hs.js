// 发布规则页
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.join_hs', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  var system_query = init.system_query();
  if(system_query == 'android'){
    var system_query_url = GV.app_url;
    $('.join_hs_open_app').attr('href', system_query_url);
  }else if(system_query == 'ios'){
    var system_query_url = GV.api_url + '/ios/ucenter';
    $('.join_hs_open_app').attr('href', system_query_url);
  }

  function getcode(btn){
    var second = 60;
    var timer = null;
    timer = setInterval(function(){
      second -= 1;
      if(second >0 ){
        btn.text(second+'重新发送');
        btn.attr('disabled','disabled');
      }else{
        clearInterval(timer);
        btn.text('获取验证码');
        btn.removeAttr('disabled');
      }
    },1000);
  }
  //验证手机号码
  function checkPhone(phone){
    var pattern = /^1[0-9]{10}$/;
    var isPhone = true;
    if(phone == '') {
      $.toast('请输入手机号码');
      isPhone = false;
      return;
    }
    if(!pattern.test(phone)){
      $.toast('请输入正确的手机号码');
      isPhone = false;
      return;
    }
    return isPhone;
  }
  page.on('click','.btn_get',function(){
    var _this = this;
    var phone_number = $('.tel_number').val();
    if(checkPhone(phone_number)){
      $.post('/index.php?g=restful&m=HsMobile&a=ajax_mobile_verify_code',{
        mobile:$('.tel_number').val()
      },function(data){
        if(data.status == 1){
          getcode($(_this));
          $.toast('发送成功');
        } else {
          $.toast(data.info);
        }
      })
    }
  })
  page.on('click','.submit',function(){
    if(checkPhone($('.tel_number').val()) && $('.verify_number').val() != ''){
      $.post('/index.php?g=restful&m=HsMobile&a=ajax_mobile_verify',{
        mobile:$('.tel_number').val(),
        verify:$('.verify_number').val()
      },function(data){
        if(data.status == 1){
          $('.verify_tel_pass').css('display', 'block');
        } else {
          $.toast(data.info);
        }
      });
    } else {
      $.toast('不验证爸爸不让你发帖');
    }
  })
})
