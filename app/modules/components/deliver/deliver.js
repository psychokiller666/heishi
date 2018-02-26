// 发货页
// 页面初始化
var common = require('../common/common.js');
// 微信sdk
var wx = require('weixin-js-sdk');

$(document).on('pageInit','.deliver', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  var deliver_bd = $('.deliver_bd');
  // 扫一扫
  deliver_bd.on('click','.scanning_btn',function(){
    wx.scanQRCode({
      desc: '快递单号',
      needResult: 1,
      scanType: ["qrCode","barCode"],
      success: function(data){
        deliver_bd.find('.number input').val(data.resultStr.split(',')[1]);
      }
    });
  });
  //选择快递公司
  //初始化
  page.on("focus",".express_name",function(){
      if(!$(".express_name").val()){
      $.post("/index.php?g=restful&m=HsExpress&a=express_name_query",function(data){
          if(data.status == 1){
            var str="";
            $(".select").html("").css("height","auto");
            if(data.data.length>4){
              $(".select").css({'overflow-y':'auto','height':'3.37rem',"width":"7.24rem"})
            }
            for(var i = 0;i < data.data.length; i++){
              str+='<div class="input"><input type="text" class="express_select" value="'+data.data[i]+'" readonly="readonly" /></div>';
            }
            $(".select").html(str);
          }
      })
    }
  })
  page.on("blur",".express_name",function(){
    setTimeout(function(){
          $(".select").html("").css("height","auto");
        },300)
  })
  $('.express_name')[0].oninput = function(){
    var _this = $(this);
    var val = $(this).val();
    $.post("/index.php?g=restful&m=HsExpress&a=express_name_query",{
      name:val
    },function(data){
        if(data.status == 1){
          var str="";
          $(".select").html("").css("height","auto");
          if(data.data.length>4){
            $(".select").css({'overflow-y':'auto','height':'3.37rem',"width":"7.24rem"})
          }
          for(var i = 0;i < data.data.length; i++){
            str+='<div class="input"><input type="text" class="express_select" value="'+data.data[i]+'" readonly="readonly" /></div>';
          }
          $(".select").html(str);
        }else{
          $(".select").html("").css("height","auto");
        }
    });
  }
  //下拉选项
  page.on("click",".express_select",function(){
    var str=$(this).val();
    $(".express_name").val(str);
    $(".select").html("").css("height","auto");
  })
  // 确认发货
  page.on('click','.deliver_submit_deliver',function(){
    var _this = $(this);

    $('.deliver-footer').find('button').attr('disabled','disabled');
    $.confirm('你确定发货吗？', '确认发货',
      function () {
        $.post("/index.php?g=user&m=HsOrder&a=deliver",{
          uid:_this.data('uid'),
          order_number:_this.data('ordernumber'),
          express_name:deliver_bd.find('.express .name input').val(),
          express_number:deliver_bd.find('.express .number input').val()
        },function(data){
          if(data.status == 1){
            $.alert('发货成功',function(){
              window.parent.location.href='/user/HsOrder/untreated.html';
            });
          } else {
            $.toast(data.info);
          }
        });
      },function(){
        $('.deliver-footer').find('button').removeAttr('disabled','disabled');
      }
      );

  })
  // 联系卖家
  page.on('click','.msg_btn',function(){
    var _this = $(this);
    var features_btn = [
    {
      text: '请选择',
      label: true
    },
    {
      text: '买家电话',
      bold: true,
      color: 'danger',
      onClick: function() {
        window.open('tel:'+_this.data('tel'));
      }
    },
    {
      text: '私信买家',
      onClick: function() {
        $.router.load('/User/HsMessage/detail/from_uid/'+_this.data('uid')+'.html', true);
      }
    }
    ];
    var cancel_btn = [
    {
      text: '取消',
      bg: 'danger'
    }
    ];
    var groups = [features_btn, cancel_btn];
    $.actions(groups);
  })
  // 联系卖家
  // page.on('click','.msg_btn',function(){
  //   var _this = $(this);
  //   var features_btn = [
  //   {
  //     text: '请选择',
  //     label: true
  //   },
  //   {
  //     text: '买家电话',
  //     bold: true,
  //     color: 'danger',
  //     onClick: function() {
  //       window.open('tel:'+_this.data('tel'));
  //     }
  //   },
  //   {
  //     text: '私信买家',
  //     onClick: function() {
  //       $.router.load('/User/HsMessage/detail/from_uid/'+_this.data('uid')+'.html', true);
  //     }
  //   }
  //   ];
  //   var cancel_btn = [
  //   {
  //     text: '取消',
  //     bg: 'danger'
  //   }
  //   ];
  //   var groups = [features_btn, cancel_btn];
  //   $.actions(groups);
  // })

})
