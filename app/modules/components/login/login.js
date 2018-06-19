// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.login', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  $('.hs-main').css('height',"100%");
  //  登录初始化
  $('.get_pass').attr('disabled','disabled');
  $('.get_pass').on('click', function(){
    var that = this;
    $.post('/Api/HsChangeUserInfo/ajax_change_mobile',{
      mobile: $('.tel').val()
    },function(res){
      if(res.status == 1){
        $.toast('验证码已发送');
        $(that).attr('disabled', 'disabled');
        count_down(that);
      } else {
        $.toast(res.info);
      }
    });
  })

  $('.login_in').click(function(){
    var mobile = $('.tel').val();
    var verify = $('.pass_num').val();
    if(mobile == '' || verify == ''){
      $.toast('请填写帐号密码');
      return false;
    }
    $.ajax({
      url: '/index.php?g=restful&m=HsMobile&a=ajax_mobile_verify',
      type: 'POST',
      data: {
        newbie: 1,
        mobile: mobile,
        verify: verify
      },
      success: function(res) {
        if(res.status == 1){
          var str = $('.redirect_uri').val() + '&' + $('.response_type').val() + '=' + res.code;
          location.href = str;
        } else {
          $.toast(res.info);
          console.log(res);
        }
      }
    })
  })

  // 倒计时
  function count_down(that){
    var clearTime = null;
    var num = 59;
    clearTime = setInterval(function(){
      if(num == 0){
        clearInterval(clearTime);
        $(that).removeAttr('disabled');
        $(that).text('获取验证码');
      }else{
        $(that).text(num + 's');
      }
      num--;
    },1000)
  }

  // 滑动验证
  var speedOffsetLeft = null;
  var speedWidth = null;
  var verifyWidth = null;
  var touchLast = 0;
  var statusMove = false;
  window.onload = function(){
    speedOffsetLeft = $('.speed').offset().left;
    speedWidth = $('.speed').width();
    verifyWidth = $('.verify').width();
  }
  if(IsPC()){   
    $('.verify').on('mousedown', '.speed', mousedown);
    $('.verify').on('mousemove', mousemove);
    $('body').on('mouseup', mouseup);
  }else{
    $('.verify').on('touchmove', '.speed', touchmove);
    $('.verify').on('touchend', '.speed', touchend);
  }

  function mousedown(e){
    statusMove = true;
  }
  function mousemove(e){
    if(statusMove){
      var num = e.clientX - speedOffsetLeft + 40;
      touchLast = num;
      if(num >= speedWidth && num < verifyWidth){
        $('.speed').width(num);
      }else if(num >= verifyWidth){
        $('.speed').width(verifyWidth);
        speed_pass();
      }else if(num < speedWidth){
        $('.speed').width(speedWidth);
      }
    }
  }
  function mouseup(e){
    if(touchLast >= speedWidth && touchLast < verifyWidth && statusMove == true){
      statusMove = false;
      $('.verify').off('mousedown', '.speed', mousedown);
      $('.verify').off('mousemove', mousemove);
      $('body').off('mouseup', mouseup);
      speed_error();
    }
  }

  function touchmove(e){
    var num = e.originalEvent.targetTouches[0].clientX - speedOffsetLeft;
    touchLast = num;
    if(num >= speedWidth && num < verifyWidth){
      $('.speed').width(num);
    }else if(num >= verifyWidth){
      $('.speed').width(verifyWidth);
      speed_pass();
    }else if(num < speedWidth){
      $('.speed').width(speedWidth);
    }
  }
  function touchend(e) {
    if(touchLast >= speedWidth && touchLast < verifyWidth){
      $('.verify').off('touchmove', '.speed', touchmove);
      $('.verify').off('touchend', '.speed', touchend);
      speed_error();
    }
  }
  function speed_pass(){
    $('.verify').off('touchmove', '.speed', touchmove);
    $('.verify').off('touchend', '.speed', touchend);
    $('.verify').off('mousedown', '.speed', mousedown);
    $('.verify').off('mousemove', mousemove);
    $('body').off('mouseup', mouseup);
    $('.speed').addClass('speed_pass').attr('disabled','disabled').css({'background': '#63b083', 'opacity': '1'});
    $('.get_pass').removeAttr('disabled');
  }
  function speed_error() {
    $('.speed').removeClass('speed_pass').removeAttr('disabled','disabled').css('background', '#fff').animate({'width': speedWidth + 'px'}, 400,function(){
      if(IsPC()){   
        $('.verify').on('mousedown', '.speed', mousedown);
        $('.verify').on('mousemove', mousemove);
        $('body').on('mouseup', mouseup);
      }else{
        $('.verify').on('touchmove', '.speed', touchmove);
        $('.verify').on('touchend', '.speed', touchend);
      }
    });
  }
  function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
                "SymbianOS", "Windows Phone",
                "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
  }
});
