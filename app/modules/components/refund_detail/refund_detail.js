// 申请退款
// 初始化
var common = require('../common/common.js');
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');

$(document).on('pageInit','#refund_detail', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  // 调用微信分享sdk
  init.wx_share(false);
  // 退款倒计时
  function TimeTo(date){
    var t = new Date(date),
    n = new Date().getTime(),
    c = t - n;
    if(c<=0){
      //如果差小于等于0  也就是过期或者正好过期，则推出程序
      $('.details_date').html('结束');
      return;
    }
    var ds = 60*60*24*1000,//一天共多少毫秒
      d = parseInt(c/ds),//总毫秒除以一天的毫秒 得到相差的天数
      h = parseInt((c-d*ds)/(3600*1000)),//然后取完天数之后的余下的毫秒数再除以每小时的毫秒数得到小时
      m = parseInt((c - d*ds - h*3600*1000)/(60*1000)),//减去天数和小时数的毫秒数剩下的毫秒，再除以每分钟的毫秒数，得到分钟数
      s = parseInt((c-d*ds-h*3600*1000-m*60*1000)/1000);//得到最后剩下的毫秒数除以1000 就是秒数，再剩下的毫秒自动忽略即可
      $('.details_date').html('还剩<b>'+d+'</b>天<b>'+h+'</b>小时<b>'+m+'</b>分');//最后这句讲定义好的显示 更新到 ID为 timer的 div中
    }
    function addDate(date,days){
      var hiredate = new Date(date);
      hiredate.setDate(hiredate.getDate()+days);
      var m=hiredate.getMonth()+1;
      return hiredate.getTime();
    }
    if($('.details_date').data('status') == 0){
      TimeTo(addDate($('.details_date').data('date'),2));
    }
    // 商品详情
    var chat_header_bd = $('.refund_header_bd');
    var recent_box = $('.recent_box');
    recent_box.css('top',$('.refund_header').height());
    var recent_tpl = handlebars.compile($("#recent_tpl").html());
    var recent_btn = $('.recent_btn');
    chat_header_bd.on('click',function(e) {
      var recent_btn = $(this).find('.recent_btn');
      var _this = $(this);
      if(!recent_btn.hasClass('active')){
        recent_btn.addClass('active');
        $.ajax({
          type: 'POST',
          url: '/index.php?g=restful&m=HsOrder&a=ajax_order_details',
          data: {
            order_number: recent_btn.data('ordernumber')
          },
          dataType: 'json',
          timeout: 4000,
          success: function(data){
            if(data.status == 1){
              recent_box.html(recent_tpl(data.data));
              recent_box.show();
              _this.css('background-color','#ededed');
            } else {
              $.toast(data.info);
            }

          },
          error: function(xhr, type){
            $.toast('网络错误 code:'+xhr);
          }
        });
      } else {
        recent_btn.removeClass('active');
        recent_box.hide();
        $(this).css('background-color','#fff');
      }
    })
    //卖家操作 同意/拒绝退款
    page.find('.seller_btn').on('click',function(){
      var _this = $(this);
      var buttons1;
      if(_this.data('status') == 0) {
        buttons1 = [
        {
          text: '请选择',
          label: true
        },
        {
          text: '同意退款',
          bold: true,
          color: 'danger',
          onClick: function() {
            $.alert('你确定同意退款吗？', '请核实退款金额是否正确', function () {
              $.confirm('确定退款', function () {
                $.post('/index.php?g=User&m=HsRefund&a=seller_process_post',{
                  id:_this.data('id'),
                  action:'allow',
                  order_number:_this.data('ordernumber')
                },function(res){
                  $.toast(res.info);
                  if(res.status == 1){
                    location.reload();
                  }
                })
              });
            });
          }
        },
        {
          text: '拒绝退款',
          color: 'danger',
          onClick: function() {
            $.router.load("#reason",true);
          }
        },
        ];
      }
      var buttons2 = [
      {
        text: '取消',
        bg: 'danger'
      }
      ];
      var groups = [buttons1, buttons2];
      $.actions(groups);
    })
    //卖家联系买家
    page.find('.msg_btn').on('click',function(){
      var _this = $(this);
      var buttons1;
      if(_this.data('status') == 0) {
        buttons1 = [
        {
          text: '请选择',
          label: true
        },
        {
          text: '买家电话',
          bold: true,
          color: 'danger',
          onClick: function() {
            $.post('/index.php?g=restful&m=HsOrder&a=ajax_get_buyer_phone',{
              order_number:_this.data('ordernumber')
            },function(res){
              if(res.status == 1){
                window.open('tel:'+res.data);
              }
            })
          }
        },
        {
          text: '私信买家',
          color: 'danger',
          onClick: function() {
            var userid = _this.data('refund_user_id');
            $.router.load('/User/HsMessage/detail/from_uid/'+userid+'.html', true);
          }
        },
        ];
      }
      var buttons2 = [
      {
        text: '取消',
        bg: 'danger'
      }
      ];
      var groups = [buttons1, buttons2];
      $.actions(groups);
    })
    //买家操作 修改退款金额 练习卖家
    // page.find('.buyer_btn').on('click',function(){
    //   var _this = $(this);
    //   var buttons1;
    //   buttons1 = [
    //   {
    //     text: '请选择',
    //     label: true
    //   },
    //   {
    //     text: '修改退款金额',
    //     color: 'danger',
    //     onClick: function() {
    //       setTimeout(function(){
    //         $('.amend_money').css('display','block');
    //       },500);
    //     }
    //   },
    //   ];
    //   var buttons2 = [
    //   {
    //     text: '取消',
    //     bg: 'danger'
    //   }
    //   ];
    //   var groups = [buttons1, buttons2];
    //   $.actions(groups);
    // })
    $('.submit').on('click',function(){
      var price = $(this).data('max_fee');
      var num = $('.amend_money_number').val();
      var _this = $(this);
      if(num){
        $.toast('请输入修改金额',1000);
      }
      if(price < num){
        $.toast('请不要超过'+price+'元');
      }else{
        $.post('/index.php?g=User&m=HsRefund&a=ajax_update_refund_amount',{
          id:_this.data('id'),
          refund_amount: num
        },function(res){
          $.toast(res.info,1000);
          location.reload();
        })
      }
      $('.amend_money').css('display','none');
    })
    $('.cancel').on('click',function(){
      $('.amend_money').css('display','none');
    })
  });
$(document).on('pageInit','#reason', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  // 调用微信分享sdk
  init.wx_share(false);
  page.find('.btn').on('click',function(){
    var _this = $(this);
    $.confirm('你确定拒绝退款吗？', function () {
      $.post('/index.php?g=User&m=HsRefund&a=seller_process_post',{
        id:_this.data('id'),
        action:'reject',
        order_number:_this.data('ordernumber'),
        reason:page.find('[name="reason"]').val()
      },function(res){
        $.toast(res.info);
        if(res.status == 1){
          window.location.href = '/user/HsOrder/untreated.html';
        }
      })
    });
  })
});
