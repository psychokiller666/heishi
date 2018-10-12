//优惠券活动页

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit', '.issue_coupon', function (e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);
    var lazyLoad = init.lazyLoad;
    // document.title = '优惠券活动';

    //判断是否登录
    var loginStatus = init.ifLogin();

    var ApiBaseUrl = init.getApiBaseUrl();
    var PHPSESSID = init.getCookie('PHPSESSID');

    var $getCouponUl = page.find('.get_coupon_ul');

    //暂时不请求接口，优惠券写死在页面里
    // getCouponList();
    addEvent();

//    获取活动优惠券列表
    function getCouponList(){

        var url = ApiBaseUrl + '/appv6/coupon/getPostsCouponList';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {'post_id[]':1095917},

            success: function(data){
                if(data.status==1){
                    console.log(data.data)
                    //生成优惠券列表
                    // setGoodsCoupon(data.data)
                    createCoupon(data.data.coupon)
                }
            },
            error: function(e){
                console.log('getCouponList err: ',e);
            }

        });
    }


    //生成优惠券列表html
    function createCoupon(data) {
        var liHtml = '';
        for (var j=0;j<data.length;j++){
            liHtml += '<li>'
            liHtml += '<div class="left">'
            liHtml += '<div class="coupon_price">¥<b>'+ data[j].coupon_price +'</b></div>'
            liHtml += '<div class="coupon_desc">'+ (data[j].min_price > 0 ? '满'+data[j].min_price+'可用':'消费任意金额可用') +'</div>'
            liHtml += '</div>'
            liHtml += '<div class="center">'
            liHtml += '<div class="title">'+ data[j].title +'</div>'

            if (data[j].apply_time_type==2){
                liHtml += '<div class="time">'+ init.couponFmtTime(init.getTimestamp()) + ' - ' + init.couponFmtTime(init.getTimestamp(data[j].apply_time_length)) +'</div>'
            }else{
                liHtml += '<div class="time">'+ init.couponFmtTime(data[j].apply_time_start) + ' - ' + init.couponFmtTime(data[j].apply_time_end) +'</div>'
            }
            liHtml += '</div>'
            liHtml += '<div class="right">'
            liHtml += '<div class="btn" coupon_id="'+ data[j].coupon_id +'" get_status="'+ data[j].receiveStatus +'"></div>'
            liHtml += '</div>'
            liHtml += '</li>'
        }
        $getCouponUl.html(liHtml);
    }

    //添加事件
    function addEvent() {
        $getCouponUl.on('click','.btn',function(ev){
            if(!loginStatus){
                init.toLogin();
                return false;
            }
            var $this = $(this);
            if($this.attr('get_status')==='1'){
                return;
            }
            if($this.attr('clicked')==='1'){
                return;
            }else{
                $this.attr('clicked','1');
            }
            var id = $this.attr('coupon_id');
            getACoupon($this,id);
            ev.stopPropagation();
        });
    }


    //领券按钮
    function getACoupon($btn,id){
        var url = ApiBaseUrl + '/appv6/coupon/'+ id +'/receive';
        $.ajax({
            type: "POST",
            url: url,
            dataType: 'json',
            data: {},
            headers: {
                'phpsessionid': PHPSESSID
            },

            success: function(data){
                if(data.status==1){
                    $btn.attr('get_status','1');
                    $.toast('领取成功,请在App下单使用');
                }else{
                    $.toast(data.info);
                    $btn.attr('clicked','0');
                }
            },
            error: function(e){
                $btn.attr('clicked','0');
                $.toast('领取失败,请稍后重试');
                console.log('getACoupon err: ',e);
            }

        });
    }





});


