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
  // 提交
  page.find('.submit').on('click',function(){
    var _this = $(this);
    // $.showPreloader();
    _this.attr('disabled','disabled');
    $.confirm('你确定要退款吗？', '申请退款',
      function(){
        $.post('/index.php?g=user&m=HsRefund&a=apply_for_post',{
          order_number:page.find('[name="order_number"]').val(),
          refund_reason:page.find('[name="refund_reasons"]').val(),
          refund_desc:page.find('[name="refund_desc"]').val()
        },function(res){
          if(res.status == 1){
            $.alert(res.info,function(){
              $.router.load('/User/HsRefund/details/id/'+res.data, true)
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
});
