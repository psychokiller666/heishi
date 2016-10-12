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
  init.wx_share(false);
  //加载初始化
  var pagestr=$(".hs-main").html();
  var str='<div class="not-express-icon"><img src="/tpl/heishiv2_mobile/Public/img/express_loading.gif"></div><div class="not-express-chech">加载中</div>';
  $(".hs-main").css({"display":"block","background":"rgba(76,76,76,0.6)"}).html(str);

  //物流信息
  $.post("/index.php?g=restful&m=HsExpress&a=express_query",{
    name: $(".express_name").val(),
    number: $(".express_number").val()
  },function(data){
    if(data.status == 1){
      var strs="";
      for(var i = 0;i< data.data.list.length; i++){
          strs+= '<li><span></span><div><p>'+data.data.list[i]["status"]+'</p><p>'+data.data.list[i]["time"]+'</p></div></li>';
      }
       $(".hs-main").html(pagestr);
       $(".express-check").html(strs);
       $(".hs-main").css("background","white");
    }else{
       var str='<div class="not-express-icon" ><img src="/tpl/heishiv2_mobile/Public/img/recruitment.png"></div><div class="not-express-chech">没有查到物流信息</div>'
       $(".hs-main").css("background","white").html(str);
    }
  })
  // 确认收货
  page.on('click', '.logistique_submit_deliver', function () {
    var _this = $(this);
    var order_number = _this.data('ordernumber');
    $('.logistique-footer').find('button').attr('disabled', 'disabled');
    $.confirm('你确定收货吗？', '确认收货', function () {
      $.post("/index.php?g=user&m=HsOrder&a=comfirm_received", {
        order_number:order_number
      }, function (data) {
        if (data.status == 1) {
          $.alert('收货成功', function () {
            window.location.href='/User/HsOrder/my_bought';
          });
        } else {
          $.toast(data.info);
        }
      });
    }, function () {
      $('.logistique-footer').find('button').removeAttr('disabled', 'disabled');
    });
  });
  // 联系卖家
  page.on('click','.contact_btn',function(){
    var _this = $(this);
    var userid = _this.data('uid');
    var buttons1;
    var buttons2 = [
    {
      text: '取消',
      bg: 'danger'
    }
    ];
    $.post('/index.php?g=restful&m=HsMobile&a=ajax_get_moblie',{
      uid:userid
    },function(data){
      if(data.status == '1'){
        buttons1 = [
        {
          text: '请选择',
          label: true
        },
        {
          text: '私信卖家',
          bold: true,
          color: 'danger',
          onClick: function() {
            $.router.load('/User/HsMessage/detail/from_uid/'+userid+'.html', true);
          }
        },
        {
          text: '卖家电话',
          onClick: function() {
            // $.router.load('tel:'+data.data, true);
            window.open('tel:'+data.data);
          }
        }
        ];

      } else {
        buttons1 = [
        {
          text: '请选择',
          label: true
        },
        {
          text: '私信卖家',
          bold: true,
          color: 'danger',
          onClick: function() {
            $.router.load('/User/HsMessage/detail/from_uid/'+userid+'.html', true);
          }
        }];

      }
      $.actions([buttons1,buttons2]);
    })
  });
});