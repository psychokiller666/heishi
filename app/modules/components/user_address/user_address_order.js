// 初始化
var common = require('../common/common.js');
// 微信sdk
var wx = require('weixin-js-sdk');
$(document).on('pageInit','.address_order', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

  $('.address_info').click(function(){
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
          window.location.href = $(that).attr('data-href');
        }else{
          $.toast(data.info);
        }
      },
      error: function(data) {
        $.toast(data.info);
      }
    })
  })
  $('.open_wx_address').click(function(){
    wx.openAddress({
      success: function (res) {
        var post_data = {
          'username': res.userName,
          'telNumber': res.telNumber,
          'proviceFirstStageName': res.provinceName,
          'addressCitySecondStageName': res.cityName,
          'addressCountiesThirdStageName': res.countryName,
          'addressDetailInfo': res.detailInfo,
          'addressPostalCode': res.nationalCode,
          'default_address': 1
        }
        $.ajax({
          url: '/index.php?g=user&m=HsAddress&a=address_post',
          type: 'POST',
          data: post_data,
          success: function(data) {
            if(data.status == 1){
              location.href = $('.address_info').attr('data-href');
            }else{
              $.toast(data.info);
            }
          },
          error: function(data) {
            // $.toast(data.info);
          }
        })
      },
      fail: function(res) {
        // alert(JSON.stringify(res));
      },
      cancel: function () {
        // alert('填个地址好吗？');
      }
    });
  })

  if($('.creat').length == 1 || $('.update').length == 1){
    var address = $('.creat').length == 1 ? $('.creat') : $('.update');

    address.on('click', '.preserve', function(){
      var that = this;
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
        default_address: 1,
        proviceFirstStageName: address_region_arr[0],
        addressCitySecondStageName: address_region_arr[1],
        addressCountiesThirdStageName: address_region_arr[2],
      }
      if(address.hasClass('update')){
        post_data['id'] = $(that).attr('data-id');
      }
      $.ajax({
        url: '/index.php?g=user&m=HsAddress&a=address_post',
        type: 'POST',
        data: post_data,
        success: function(data) {
          if(data.status == 1){
            location.href = $(that).attr('data-href');
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
