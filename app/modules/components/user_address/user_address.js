// 初始化
var common = require('../common/common.js');
// 微信sdk
var wx = require('weixin-js-sdk');
$(document).on('pageInit','.shipping_address', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  // $.ajax({
  //   url: '/index.php?g=restful&m=HsJsapi&a=jssign',
  //   type: 'POST',
  //   data: {
  //     url: encodeURIComponent(options.link.split('#')[0])
  //   }
  // }).done(function(data){
  //     wx.config({
  //       debug: false,
  //       appId: data.appId,
  //       timestamp: data.timestamp,
  //       nonceStr: data.nonceStr,
  //       signature: data.signature,
  //       jsApiList: [
  //       'checkJsApi',
  //       'openAddress'
  //       ]
  //   })
  // })
  $('.wx_address').click(function(){
    wx.openAddress({
      success: function (res) {
        console.log(res);
      },
      fail: function(res) {
        // console.log(JSON.stringify(res));
      }
    })
  })


  $('title').text('管理收货地址');
  $('.delete_address').click(function(){
    var that = this;
    $.confirm('你确定要删除吗？', function(){
        $.ajax({
          url: '/index.php?g=user&m=HsAddress&a=del_address',
          type: 'GET',
          data: {
            id: $(that).attr('data-id')
          },
          success: function(data) {
            if(data.status == 1){
              $(that).parents('li').remove();
            }
          },
          error: function(data) {
            $.toast(data.info);
          }
        })
      }
    );
  })

  $('.default_address').on('click', '.select_address', function(){
    var that = this;
    $.ajax({
      url: '/index.php?g=user&m=HsAddress&a=set_default',
      type: 'POST',
      data: {
        id: $(this).attr('data-id'),
        default_address: 1
      },
      success: function(data) {
        if(data.status == 1){
          $('.select_address').removeClass('active');
          $(that).addClass('active');
        }
      },
      error: function(data) {
        $.toast(data.info);
      }
    })
  })

  if($('.creat_address').length == 1 || $('.up_address').length == 1){
    var address = $('.creat_address').length == 1 ? $('.creat_address') : $('.up_address');
    address.on('click', '.select_address', function(){
      if($(this).hasClass('active')){
        $(this).removeClass('active');
      }else{
        $(this).addClass('active');
      }
    })
    address.on('click', '.preserve', function(){
      var num = 0;
      if(address.find('.select_address').hasClass('active')){
        num = 1;
      }
      if(!tel_regexp(address.find('.user_tel input').val())){
        return $.toast('手机号格式错误');
      }
      var address_region = $('#picker').val();
      var address_region_arr = address_region.split(' ');
      var post_data = {
        username: address.find('.user_name input').val(),
        telNumber: address.find('.user_tel input').val(),
        addressPostalCode: address.find('.postcode input').val(),
        addressDetailInfo: address.find('.detailed_address textarea').val(),
        default_address: num,
        proviceFirstStageName: address_region_arr[0],
        addressCitySecondStageName: address_region_arr[1],
        addressCountiesThirdStageName: address_region_arr[2],
      }
      if(address.hasClass('up_address')){
        post_data['id'] = $(this).attr('data-id');
      }
      $.ajax({
        url: '/index.php?g=user&m=HsAddress&a=address_post',
        type: 'POST',
        data: post_data,
        success: function(data) {
          console.log(data)
          if(data.status == 1){
            location.href = '/user/HsAddress/index.html';
          }else{
            $.toast(data.info);
          }
        },
        error: function(data) {
          $.toast(data.info);
        }
      })
    })
    $("#picker").cityPicker({
      toolbarTemplate: '<div class="bar bar-nav"><span class="close-picker">完成</span></div>'
    });
  }
  function tel_regexp(val){
    var myreg=/^[1][3,4,5,6,7,8,9][0-9]{9}$/;  
    if(myreg.test(val)){  
      return true;
    }else{
      return false;
    }
  }
});
