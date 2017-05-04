// 申请退款
// 初始化
var common = require('../common/common.js');
$(document).on('pageInit','.refund', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  // 调用微信分享sdk
  init.wx_share(false);
  // 选择商品
  //初始化列表
  $('.select ul').empty();
  page.find('.order_numbers').each(function(){
    var orderNumber = $(this).val(),
    styles = $(this).data('styles'),
    object_title = $(this).data('object_title'),
    price = $(this).data('price');
    var str='<li data-order_number="'+orderNumber+'" data-price="'+price+'" data-object_title="'+object_title+'" data-styles="'+styles+'">'
    +'<strong>'+object_title+'</strong><span>'+styles+'</span><div></div></li>';
    $('.select ul').append(str);
  })
  page.find('.commodity_title').on('click',function(){
    $('.select').css('display','block');
  })
  page.find('.select').on("click",".close_select",function(){
      $(".select").css('display','none');
      $(".select_main li").find("div").removeClass('pitch_on');
  })
  page.find('.select').on("click",function(e){
    var ev = e.target;
    if(ev == this){
      $(this).css("display","none");
      $(".select_main li").find("div").removeClass('pitch_on');
    }
  })
  page.find('.select_main').on("click","li",function(){
    $(".select_main li").find("div").removeClass('pitch_on');
    $(this).find("div").addClass('pitch_on');
  })
  page.find('.now_buy').on('click',function(){
    var li = $(this).parents('.select_main').find('.pitch_on').parents('li')[0];
    $('.object_title').val($(li).data('object_title'));
    $('.styles').val($(li).data('styles'));
    $('.price').val($(li).data('price'));
    $('.order_number').val($(li).data('order_number'));
    $('.select').css('display','none');
    var status = decideType();
    if(status){
      var n = parseInt($('.money').data('refund_amount')) + parseInt($(li).data('price'));
      $('.money').val(n+' (含邮费'+parseInt($('.money').data('refund_amount'))+'元)');
      $('.item_info span').text(n);
    }else{
      var m = $(li).data('price');
      $('.money').val(m);
      $('.item_info span').text(m);
    }
  })
  //提交
  page.find('.submit').on('click',function(){
    var _this = $(this);
    // $.showPreloader();
    // refund_amount 退款金额
    // union_order_number 虚拟订单号
    if($('.orderNumber').val() == ""){
      $.toast("请选择订单再提交");
      return false;
    }
    $.confirm('你确定要退款吗？', '申请退款',
      function(){
        var data = {
          order_number:page.find('.order_number').val(),
          refund_reason:page.find('[name="refund_reasons"]').val(),
          refund_desc: page.find('[name="refund_desc"]').val(),
          refund_amount:parseInt(page.find('.money').val())
        }
        if($('.union_order_number').val()){
          data['union_order_number'] = $('.union_order_number').val();
        }
        var status = decideType();
        if(status){
          data['postage_order_number'] = $('.postage_order_number').val();
        }
        var object_title = $('.object_title').val();
        if(!object_title){
          $.toast('没选东西，退个鬼',1000);
          return false;
        }
        $.post('/index.php?g=user&m=HsRefund&a=apply_for_post',data,function(res){
          if(res.status == 1){
            $.alert(res.info,function(){
              $.router.load('/User/HsOrder/my_bought.html', true)
            });
          } else {
            $.toast(res.info);
            _this.removeAttr('disabled');
          }
        })
      },
      function(){
        _this.removeAttr('disabled');
      }
      );
  })
  //判断是否是购物车中最后一个订单
  function decideType(){
    var type = $('#apply_for_post').data('type');
    var order_numbers = $('.order_numbers').length;
    if(type == 2 && order_numbers == 1){
      return true;
    }else{
      return false;
    }
  }
});
