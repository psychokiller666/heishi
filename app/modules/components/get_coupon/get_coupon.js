//我的优惠券

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit', '.get_coupon', function (e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);
    var lazyLoad = init.lazyLoad;
    document.title = '领券中心';

    if(init.ifLogin(true) == false){
        return ;
    };

    var ApiBaseUrl = init.getApiBaseUrl();
    var PHPSESSID = init.getCookie('PHPSESSID');

    getUserCouponList();

    function getUserCouponList(){
        var url = ApiBaseUrl + '/appv6/coupon/getUserCouponList';

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

                    if(data.data.all.length===0 && data.data.seller.length===0){
                        $('.no_coupon_tip').show();
                        return;
                    }
                    createCouponAll(data.data.all);//通用优惠券
                    createCouponSeller(data.data.seller);//店铺优惠券
                    addCouponEvent();
                }

            },
            error: function (e) {
                console.log('getUserCouponList err: ', e);
            }
        });
    }

    function createCouponAll(lists){
        if (!(lists instanceof Array)) {
            return '';
        }

        var html = '';

        for (var i = 0; i < lists.length; i++) {
            html += '<li class="coupon_li" status="1" open="0" couponid="'+ lists[i].coupon_id +'">'
            html += '<div class="coupon_top">'
            html += '<div class="left">'
            html += '<div class="coupon_price">¥<b>' + lists[i].coupon_price + '</b></div>'
            html += '<div class="coupon_desc">'+ (lists[i].min_price>0 ? '满'+ lists[i].min_price +'可用' : '任意消费可用') +'</div>'
            html += '</div>'
            html += '<div class="right_top">'
            html += '<div class="center">'
            html += '<div class="title">' + lists[i].title + '</div>'

            if (lists[i].apply_time_type==2){
                html += '<div class="time">'+ init.couponFmtTime(init.getTimestamp()) + ' - ' + init.couponFmtTime(init.getTimestamp(lists[i].apply_time_length)) +'</div>'
            }else{
                html += '<div class="time">'+ init.couponFmtTime(lists[i].apply_time_start) + ' - ' + init.couponFmtTime(lists[i].apply_time_end) +'</div>'
            }
            html += '</div>'
            html += '<div class="right">'
            html += '<div class="btn" couponid="'+ lists[i].coupon_id +'">立即领取</div>'
            html += '</div>'
            html += '</div>'
            html += '<div class="right_btm">'
            html += '<div class="open_wrap">'
            html += '<span class="title">'+lists[i].coupon_note+'</span>'
            html += '<img class="open_ico" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAC0klEQVRIS72WTU8UQRCG651BV3HPGhUPJELXwEETIHrwZEwkIKLRxIvEm/ob/AH+BvGoXjgYwQ+iifFkoomQqMky3WACiQT0jhsHd6dMjzubYXb2A1ip0yRd9T5d1dXTBdpjw3Z4IuKsrKwcDoKgS0QEwLpS6geAsFWdpkAR6TDGXCWi6yIyCuBQUlxEfgGYFZEpZp4BUGoErwu0CRhj7hLRPSLqajGDVSK6r5R6AECyYjKBhUIh77ruFBGNtAhKu82Wy+Ub/f39G+mFGuDy8vKBIAg+EtGpHcLisK+5XO5Md3f376RODdD3/UkAt3cJi8MnmdkeS9W2AI0xIyLyqk2wSMZxnEu9vb1VzSpQRFyttQZwsp1AEfnGzAygbHWrQK31TSJ63E5YQmuCmZ+kgc+I6Erqjs0TkQegs5WNiEiRiHwAAyn/aWa2d/lfhpVyFgHsjx1FpJDP54eKxeJAGIZvmkEtzHGci6VS6bPrup+IiBNam8zcacsaARcWFo46jrOWyq4E4BozPzfGnGsEjWFKqfda68si8hRAR1IvDMNjfX196xHQ9/0BAHPpsonIFqiIvCWiXMovAHChEaxSxUHP8+YjoNZ6kIhsGWosCdVanyei2QQ0sH8jZn5XL7OE4BAzz0XApaWlrnK5/L1eY1SgY8z8OgG17jFsWERepMuY1HNd90RPT89q3DT7tNYbyabJKO8mgPEKdNiux98iYl+JasNlxTJzHsCf5D2cJqLxRu0vIlVo5ShsZg1hFb0ZZo6uXBVojJkQkUfN7lsMrTRCKzACcEspFWnv9Ndmm8VaumOzmi7712Y9FxcXR8MwfNksy+2sAxhVStnOjuy/Pk8i8tDzvDvJDdZ7gD8Q0entZJLh+yWXy51t+gDbwD0dMeKd7ukQlSxPckwkojEiOphab8+YmHV+dhD2ff+I4zjH7SAsImue5/1s6yC8y8apCf8LwgGQLJSQQMMAAAAASUVORK5CYII=">'
            html += '</div>'
            html += '</div>'
            html += '</div>'
            html += '<div class="coupon_btm">'+lists[i].coupon_note+'</div>'
            html += '</li>'
        }

        $('.all_wrap').html(html);

        return html;
    }

    function createCouponSeller(lists){
        if (!(lists instanceof Array)) {
            return '';
        }

        var html = '';
        var user,coupon;

        for (var i = 0; i < lists.length; i++) {
            user = lists[i].user;
            coupon = lists[i].coupon;

            html += '<div class="seller_out">'
            html += '<div class="seller_info">'
            html += '<div class="go_seller_store">'
            html += '<a href="/User/index/index/id/'+ user.id +'.html" external class="hs-icon">去逛逛</a>'
            html += '</div>'
            html += '<img src="'+ (transHttps(user.avatar)) +'" class="seller_avatar">'
            html += '<span class="seller_name">'+ user.username +'</span>'
            html += '</div>'
            html += '<ul class="seller_coupon_ul">'

            for (var j = 0; j < coupon.length; j++) {

                html += '<li>'
                html += '<div class="left">'
                html += '<div class="coupon_price">¥<b>'+ coupon[j].coupon_price +'</b></div>'
                html += '<div class="coupon_desc">'+ (coupon[j].min_price > 0 ? '满'+coupon[j].min_price+'可用':'消费任意金额可用') +'</div>'
                html += '</div>'
                html += '<div class="center">'
                html += '<div class="title">'+ coupon[j].title +'</div>'

                if (coupon[j].apply_time_type==2){
                    html += '<div class="time">'+ init.couponFmtTime(init.getTimestamp()) + ' - ' + init.couponFmtTime(init.getTimestamp(coupon[j].apply_time_length)) +'</div>'
                }else{
                    html += '<div class="time">'+ init.couponFmtTime(coupon[j].apply_time_start) + ' - ' + init.couponFmtTime(coupon[j].apply_time_end) +'</div>'
                }
                html += '</div>'
                html += '<div class="right">'
                html += '<div class="btn" couponid="'+ coupon[j].coupon_id +'" get_status="0"></div>'
                html += '</div>'
                html += '</li>'

            }

            html += '</ul>'
            html += '</div>'

        }

        $('.seller_wrap').html(html);

    }

    function addCouponEvent(){

        $('.all_wrap').on('click','.btn',function(){

            var $this = $(this);
            if($this.attr('loading')==='1'){
                return ;
            }else{
                $this.attr('loading','1');
            }

            var couponid = $this.attr('couponid');
            getACoupon(couponid,$this);
        });

        $('.all_wrap').on('click','.open_wrap',function(){
            var $this = $(this);
            var $parent = $this.parents('.coupon_li');
            if($parent.attr('open')==='0'){
                $parent.attr('open',1);
            }else{
                $parent.attr('open',0);
            }
        });

        $('.seller_wrap').on('click','.btn',function(){

            var $this = $(this);
            if($this.attr('loading')==='1'){
                return ;
            }else{
                $this.attr('loading','1');
            }

            var couponid = $this.attr('couponid');
            getACoupon(couponid,$this);
        });

    }

    function getACoupon(id,$btn){
        console.log('id:',id)
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
                    $.toast('领取成功,请在App下单使用');
                }else{
                    $.toast(data.info);
                }
                $btn.attr('loading','0');
            },
            error: function(e){
                $btn.attr('loading','0');
                $.toast('领取失败,请稍后重试');
                console.log('getACoupon err: ',e);
            }

        });
    }


    // 链接 http --> https
    function transHttps(url) {
        if (typeof url === 'string') {
            url = url.replace('http://', 'https://');
        }
        return url;
    }

});


