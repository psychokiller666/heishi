// 成功or失败页
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.jump', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  var status_pay = $('.status_pay').val();
  var VueBaseUrl = init.getVueBaseUrl()
  //支付成功
  // if($('.success').length && status_pay == 0){
  if($('.success').length){
    // $.toast('支付成功');
    $('.return_index_btn').click(function(){
      window.location.href = '/Portal/Index/index.html';
    })
    $('.return_order_list').click(function(){
      window.location.href = '/user/HsBuyorder/order_deliver.html';
    })
  }
  //支付错误
  if($('.error').length) {
    if($('.no_data').attr('data-url')){
      setTimeout(function(){
        window.location.href = $('.no_data').data('url');
      },1800);
    } else {
      setTimeout(function(){
        history.go(-1);
      },3000);
    }
  }

    //商家返券
    var PHPSESSID = init.getCookie('PHPSESSID');
    var ApiBaseUrl = init.getApiBaseUrl();
    // $('.back_coupon_popup_mask').show()
    var orderId = $('[data-ordernumber]').attr('data-ordernumber');
    // orderId = 'VR20200313181525ZUIMAI'

    if(orderId){
      getOrderReturnCoupon(orderId);
    }

    function getOrderReturnCoupon(id) {

        var url = ApiBaseUrl + '/appv6/coupon/' + id + '/returnOrder';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: {
                'phpsessionid': PHPSESSID
            },
            success: function (data) {
                if (data.status == 1) {
                    initBackCouponPopup(data.data);
                }
            },
            error: function (e) {
                console.log('getOrderReturnCoupon err: ', e);
            }

        });
    }

    function initBackCouponPopup(data){
        if(!(data instanceof Array && data.length>0)){
          return;
        }

        var html = '';

        // html += '<div class="back_coupon_popup_wrap" multi="'+ (data.length>1 ? 1 : 0) +'">'
        // html += '<div class="tip">'+ (data.length>1 ? data.length+'张优惠券' : '') +'</div>'
        // html += '<div class="coupon_wrap">'
        // html += '<div class="left">'
        // html += '<div class="coupon_price">¥<b>'+ data[0].coupon_price +'</b></div>'
        // html += '<div class="coupon_desc">'+ (data[0].min_price > 0 ? '满'+data[0].min_price+'可用':'消费任意金额可用') +'</div>'
        // html += '</div>'
        // html += '<div class="center">'
        // html += '<div class="title">'+ data[0].title +'</div>'

        // if (data[0].apply_time_type==2){
        //     html += '<div class="time">'+ init.couponFmtTime(init.getTimestamp()) + ' - ' + init.couponFmtTime(init.getTimestamp(data[0].apply_time_length)) +'</div>'
        // }else{
        //     html += '<div class="time">'+ init.couponFmtTime(data[0].apply_time_start) + ' - ' + init.couponFmtTime(data[0].apply_time_end) +'</div>'
        // }
        // html += '</div>'
        // html += '</div>'
        // html += '<div class="bottom">'
        // html += '<div class="top_img"></div>'
        // html += '<div class="btn_wrap">'
        // html += '<div class="btn"><a external href="/Portal/Coupon/userCoupon.html">查看优惠券</a></div>'
        // html += '</div>'
        // html += '</div>'
        // html += '</div>'
        html+=`
          <div class="red_packet_mask">
            <div class="red_popup">
              <p class="red_tip">恭喜你获得了${data.length>1 ? data.length+'张优惠券' : ''}</p>
              <div class="red_top"></div>
              `
          if(data.length>1){
            html+=  `
            <div class="coupon_multi"></div>
            <div class="red_coupon">
              <img src="${data[0].coupon_img}" />
              <div class="coupon_price"><span>￥</span><b>${data[0].coupon_price}</b></div>
              `
          }
            if(data[0].apply_time_type==2){
              html+=`
              <div class="time"> ${init.couponFmtTime(init.getTimestamp())}  -  ${init.couponFmtTime(init.getTimestamp(data[0].apply_time_length)) }</div>
              `
            }else{
             html+= `
              <div class="time"> ${ init.couponFmtTime(data[0].apply_time_start)}  -  ${init.couponFmtTime(data[0].apply_time_end)}</div>
              `
            }
            html+=`   
                <div class="c_info tc">
                ${data[0].title}
                </div>
                <div class="c_desc tc">
                  ${data[0].desc}
                </div>
                <div class="c_msg">
                  ${data[0].coupon_note}
                </div>
       
              </div>
              <div class="red_bot">
                <div class="jump_conpon_list"></div>
              </div>
            </div>
          </div>
        `

        $('.back_coupon_popup_mask').html(html)
            .show()
            .on('click',function(ev){
                if(this === ev.target){
                    $(this).hide();
                }
            });

      $('.jump_conpon_list').click(function(){
        location.href= VueBaseUrl+"couponList"
      })

    }




  //活动 支付成功
  // if(status_pay == 1){
  //   $.hidePreloader();
  //   $.ajax({
  //     type: "GET",
  //     url: '/index.php?g=api&m=HsDigitalGoods&a=generate_digital_code&order_number=' + $(page).data('ordernumber'),
  //     success: function(data){
  //       $('.no_data').text(2);
  //       var digital = JSON.parse(data);
  //       var str = '<div><p>爸爸</p><p>您已启动黑市秘籍</p><p>游戏过后可直接观看成功视频</p></div><a href="//amuseddie.com/HeiShi/?hcode='+digital.data+'">前往体验</a>'
  //       $('.no_data').html(str);
  //     }
  //   })
  // }
});
