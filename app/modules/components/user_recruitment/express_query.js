'use strict';

// 发货页
// 页面初始化
var common = require('../common/common.js');
// 微信sdk
var wx = require('weixin-js-sdk');
$(document).on('pageInit', '.logistique', function (e, id, page) {
  if (page.selector == '.page') {
    return false;
  }
  var init = new common(page);
  var ApiBaseUrl = init.getApiBaseUrl();
  var PHPSESSID = init.getCookie('PHPSESSID');
  var ajaxHeaders = {
      'phpsessionid': PHPSESSID
  };
  function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return decodeURI(r[2]);
    return null;
  }
  if(getQueryString("isbaoguan")){
    // https://apitest.ontheroadstore.com/appv2_1/express?order_id=HB20201217172116GSOQFR
    let _orderid = getQueryString('isbaoguan')
    var infourl = ApiBaseUrl + '/appv2_1/express?order_id='+_orderid;
    $.ajax({
        type: "get",
        url: infourl,
        dataType: 'json',
        data: {},
        headers: ajaxHeaders,
        success: function (data) {
          // console.log(data.data)
          let list  = data.data.data
          $('.receipt').hide()
          $('.goods').hide()
          $('.baoguan').show()
          let str = ''
          list.forEach(v => {
            str+=`<div>
            <span class="time">${v.time}</span>
            <img src="${v.icon}">
            <span class="txt">${v.context}</span>
            </div>`
          });
          str+=`<div class="line"></div>`
          $('.baoguan').html(str)
          if(list.length==1){
            $('.line').hide()
          }

        }
  
    });
  
  }else{
    $('.receipt').show()
  }
  
});