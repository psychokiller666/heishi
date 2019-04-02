// 初始化 确认订单页选择地址跳转过来
var common = require('../common/common.js');
// 微信sdk
var wx = require('weixin-js-sdk');
$(document).on('pageInit','.address_order', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  if(sessionStorage.getItem('UPDATEADDRESS')=='1'){
    sessionStorage.setItem('UPDATEADDRESS','')
    location.reload();
    return;
  }
  var init = new common(page);
  $.ajax({
    url: '/index.php?g=restful&m=HsJsapi&a=jssign',
    type: 'POST',
    data: {
      url: encodeURIComponent(window.location.href)
    }
  }).done(function(data){
      wx.config({
        debug: false,
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: [
        'checkJsApi',
        'openAddress'
        ]
    })
  })
 
  //原本的逻辑是选择一个地址后设置为默认地址，然后跳回确认订单页并使用默认地址
  //现改为选择一个地址，保存到sessionStorage里，然后跳回确认订单页，并使用
  $('.address_info').click(function(){
    var that = this;
    var $this = $(this);
    var addr = {};
    // res.provinceName + res.cityName + res.countryName + res.detailInfo + res.userName + res.telNumber
    addr.id = $this.attr('id')
    addr.provinceName = $this.attr('provinceName')
    addr.cityName = $this.attr('cityName')
    addr.countryName = $this.attr('countryName')
    addr.detailInfo = $this.attr('detailInfo')
    addr.userName = $this.attr('userName')
    addr.telNumber = $this.attr('telNumber')

    var addrTxt = JSON.stringify(addr);
    addrTxt = escape(addrTxt);
    sessionStorage.setItem('ADDRESS',addrTxt);
    var object_id = $this.attr('data-object_id');
/*    if(object_id){
      window.location.href = $this.attr('data-href');
    }else{
      window.location.href = $this.attr('data-chart_buy');
    }*/
    sessionStorage.setItem('UPDATEADDRESS','1')
    window.history.go(-1);



/*    废弃

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
    */
  })
  $('.open_wx_address').click(function(){
    wx.checkJsApi({
      jsApiList: ['openAddress'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
      success: function(res) {
      // 以键值对的形式返回，可用的api值true，不可用为false
      // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
      console.log(res)
      }
    });
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
         //选择微信地址后设置缓存
       // sessionStorage.setItem('ADDRESS',JSON.stringify(post_data));
        $.ajax({
          url: '/index.php?g=user&m=HsAddress&a=address_post',
          type: 'POST',
          data: post_data,
          success: function(data) {
            if(data.status == 1){
              post_data.id = data.data
              var addrTxt_wx = JSON.stringify(post_data);
              addrTxt_wx = escape(addrTxt_wx);
              sessionStorage.setItem('ADDRESS',addrTxt_wx);
              sessionStorage.setItem('UPDATEADDRESS','1')
              window.history.go(-1);
            
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
            sessionStorage.setItem('UPDATEADDRESS','1')
            history.go(-1);
            // location.href = $(that).attr('data-href');
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
