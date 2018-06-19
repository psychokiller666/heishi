// 页面初始化
var common = require('../common/common.js');
// 过滤关键词
var esc = require('../../../../node_modules/chn-escape/escape.js');

$(document).on('pageInit','#personal', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

});
$(document).on('pageInit','#revise_username', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  // 过滤关键词
  var text_list = [
  '燃料',
  '大麻',
  '叶子',
  '淘宝',
  'taobao.com',
  '共产党',
  '有飞',
  '想飞',
  '要飞',
  '微信',
  '加我',
  '大妈',
  '飞吗',
  '飞嘛',
  'qq',
  '拿货',
  'weed',
  '机长',
  'thc',
  'V信',
  'wechat',
  'VX',
  '蘑菇',
  '邮票',
  'LSD',
  'taobao',
  'tb',
  '操你妈',
  '草你妈'
  ];
  esc.init(text_list);
  page.find('.hs-footer button').on('click',function(){
    var _this = this;
    $(_this).attr('disabled','disabled');
    if(!page.find('[name=username]').val().length){
      $.toast('用户名不能为空');
      $(_this).removeAttr('disabled','disabled');
    } else if (esc.find(page.find('[name=username]').val()).length){
      $.toast('拒绝黄赌毒！！！');
      $(_this).removeAttr('disabled','disabled');
    } else {
      $(_this).removeAttr('disabled','disabled');
      $.confirm('你确定吗？用户名只他妈能改一次！！！', function () {
        $.post('/Api/HsChangeUserInfo/ajax_change_name',{
          newname:page.find('[name=username]').val()
        },function(res){
          if(res.status == 1){
            $.alert(res.info,function(){
              window.location.href= '/User/Center/change_info';
            })
          } else {
            $.alert(res.info,function(){
              window.location.href= '/User/Center/change_info';
            })
          }
        })
      });
    }
  });
});
$(document).on('pageInit','#revise_telphone', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  function getcode(btn){
    var second = 120;
    var timer = null;
    timer = setInterval(function(){
      second -= 1;
      if(second >0 ){
        btn.text(second+'s');
        btn.attr('disabled','disabled');
      }else{
        clearInterval(timer);
        btn.text('获取验证码');
        btn.removeAttr('disabled');
      }
    },1000);
  }
  page.find('.hs-footer button').on('click',function(){
    $.post('/Api/HsChangeUserInfo/ajax_mobile_verify',{
      mobile:page.find('[name=mobile]').val(),
      verify_code:page.find('[name=verify_code]').val()
    },function(res){
      if(res.status == 1){
        $.alert(res.info,function(){
          window.location.href= '/User/Center/change_info';
        })
      } else {
        $.alert(res.info,function(){
          window.location.href= '/User/Center/change_info';
        })
      }
    })
  })
  $('.verification button').on('click',function(){
    var _this = this;
    $.post('/Api/HsChangeUserInfo/ajax_change_mobile',{
      mobile:page.find('[name=mobile]').val()
    },function(res){
      if(res.status == 1){
        $.toast(res.info);
        getcode($(_this));
      } else {
        $.toast(res.info);
      }
    });
  })
});
