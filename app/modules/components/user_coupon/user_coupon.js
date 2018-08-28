//我的优惠券

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit', '.user_coupon', function (e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);
    var lazyLoad = init.lazyLoad;
    document.title = '我的优惠券';

    if(init.ifLogin(true) == false){
        return ;
    };

    var ApiBaseUrl = init.getApiBaseUrl();


    //属性名是优惠券类型type,值是对象,保存nowpage,totalpage,ifover,ifloading
    var couponTypes = {
        1: {
            nowPage: 0,
            totalPage: 1,
            ifOver: false,
            ifLoading: false,
            pageSize: 20,

        },
        2: {
            nowPage: 0,
            totalPage: 1,
            ifOver: false,
            ifLoading: false,
            pageSize: 20,
        },
        3: {
            nowPage: 0,
            totalPage: 1,
            ifOver: false,
            ifLoading: false,
            pageSize: 20,
        }
    };

    initUserCoupon();
    addChangeEvent();
    addScrollEvent();

    function initUserCoupon() {
        for (var i = 1; i <= 3; i++) {
            getUserCoupons(i);
        }
    }

    //生成商品列表，传参是数据数组
    function createCouponLists(lists,type) {

        if (!(lists instanceof Array)) {
            return '';
        }

        var html = '';

        for (var i = 0; i < lists.length; i++) {
            html += '<li class="coupon_li" status="'+ (type==1 ? 1 : 0) +'" open="0" couponid="'+ lists[i].id +'">'
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
            html += '<div class="btn"><a external href="/Portal/Coupon/useCoupon.html">立即使用</a></div>'
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

        return html;
    }

    //在每次请求前都设置goodsSort相应的值,判断是否可以请求
    //获取分类商品列表
    function getUserCoupons(type, page) {
        var couponObj = couponTypes[type];

        if (!couponObj) {
            return false;
        }
        if (couponObj.ifOver) {
            return false;
        }
        if (couponObj.ifLoading) {
            return false;
        }
        couponObj.ifLoading = true;

        page = page || couponObj.nowPage + 1;

        var obj = {
            type: type,
            page: page,
            rows: couponObj.pageSize || 20,
        };
        var url = ApiBaseUrl + '/appv6/coupon/getBuyerCouponList';
        var PHPSESSID = init.getCookie('PHPSESSID');

        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: obj,
            headers: {
                'phpsessionid': PHPSESSID
            },

            success: function (data) {
                if (data.status == 1) {

                    addCouponList(type, data.data);
                    couponObj.nowPage = obj.page;
                    couponObj.ifOver = data.data.length<obj.rows;
                }
                couponObj.ifLoading = false;
            },
            error: function (e) {
                console.log('getGoodsSortInfo err: ', e);
                couponObj.ifLoading = false;
            }
        });

    }

    //追加商品列表
    function addCouponList(type, data) {
        var $page = $('.classify_page[type="' + type + '"]');
        var $couponWrap = $page.find('.coupon_wrap');
        var html = createCouponLists(data,type);

        $couponWrap.append($(html));

        if($couponWrap.find('.coupon_li').length === 0){
            $couponWrap.siblings('.no_coupon_tip').show();
        }else{
            $couponWrap.siblings('.no_coupon_tip').hide();
        }
    }

    //添加点击事件
    function addChangeEvent() {
        changeTab('classify_tab', 'classify_page', 'classify_tab_act', 'classify_page_act');
        page.on('click', '.open_wrap', function () {
            var $this = $(this);
            var $couponLi = $this.parents('.coupon_li');

            if($couponLi.attr('open')==='1'){
                $couponLi.attr('open','0');
            }else{
                $couponLi.attr('open','1');
            }

        })
    }

    //添加滚动事件
    function addScrollEvent() {
        //获取滚动元素

        $('.classify_page[scroll="1"]').on('scroll', function () {
            var $this = $(this);
            //获取自己的scrollHeight,scrollTop
            var clientHeight = $this.height();
            var scrollHeight = $this[0].scrollHeight;
            var scrollTop = $this.scrollTop();


            //判断距离底部的px
            var diff = scrollHeight - clientHeight - scrollTop <= 300;
            if (diff) {

                var type = $this.attr('type');
                if (typeof type === 'string') {
                    getUserCoupons(type)
                }
            }
            // console.log(clientHeight, scrollHeight, scrollTop, diff)
        });

    }


    /*点击tab切换对应标签*/
    function changeTab(tabClass, pageClass, tabActClass, pageActClass, endback, preback) {
        var $tabs = $('.' + tabClass);
        var $pages = $('.' + pageClass);

        $tabs.off('click').on('click', function (ev) {
            var index = $(this).index();
            if ($(this).hasClass(tabActClass)) {
                return;
            }
            if (typeof preback === "function") {
                preback($(this), ev);
            }
            $tabs.removeClass(tabActClass);
            $tabs.eq(index).addClass(tabActClass);
            $pages.removeClass(pageActClass);
            $pages.eq(index).addClass(pageActClass);
            if (typeof endback === "function") {
                endback($(this), ev);
            }
        })
    }




});


