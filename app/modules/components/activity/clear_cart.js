//清空购物车活动

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.clear_cart', function(e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    document.title = '购物车礼金';

    var init = new common(page);

    var lazyload = init.lazyLoad;

    var ApiBaseUrl = init.getApiBaseUrl();

    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };


    // $('body,.page, .page-group').css('background','#9c0404');


    //判断是否是app
    var isApp = false;
    var $isApp = $('.is_app');
    var Authorization = $isApp.attr('authorization');
    var uid = $isApp.attr('uid');
    var deviceType = $isApp.attr('device_type');//值：IOS ANDROID WECHAT NO
    // var version = $isApp.attr('version');

    var loginStatus = true;

    if(Authorization && Authorization.length>0){
        //有Authorization值肯定是登录的状态
        isApp = true;
        ajaxHeaders = {
            'Authorization' : Authorization,
            // 'version' : version,//跨域不能加version
        };
    }else{
        //如果不是app，通过uid判断是否登录，如果未登录，点击领取和关注按钮需要跳转到登录页3
        loginStatus = init.ifLogin();
    }



    if(deviceType==='WECHAT' || deviceType==='NO'){
        $(page).find('.return_home_page').show();
    }


    $(page).on('click','.get_coupon_btn',function(){

        if(!loginStatus){
            if(deviceType==='WECHAT' || deviceType==='NO'){
                if(init.ifLogin(true) == false){
                    return ;
                }
            }else{
                $.toast('请先登录');
                return;
            }
        }

        var $this = $(this);
        if($this.attr('clicked')==='1'){
            return false;
        }
        var ids = [];

        var $act_coupon_li = $(page).find('.act_coupon_li');
        $act_coupon_li.each(function(key,item){
            var id = $(item).attr('couponid');
            ids.push(id);
        });

        getACoupon($this,ids);

    });

    //领取优惠券
    function getACoupon($btn,ids){

        var url = ApiBaseUrl + '/appv6/coupon/receiveMultipleCoupon';
        $.ajax({
            type: "POST",
            url: url,
            dataType: 'json',
            data: {couponList:ids},
            headers: ajaxHeaders,

            success: function(data){
                if(data.status==1){
                    $.toast('领取成功');
                }else{
                    var info = data.info;
                    if(info && str_length(info)>30){
                        info = cut_str(info,15) + '…';
                    }
                    $.toast(info || '领取失败,请刷新后重试');
                }
                $btn.attr('clicked','0');
            },
            error: function(xhr){
                $btn.attr('clicked','0');
                if(xhr.status==0){
                    if(deviceType==='WECHAT' || deviceType==='NO'){
                        if(init.ifLogin(true) == false){
                            return ;
                        }
                    }else{
                        $.toast('页面已过期');
                        return;
                    }
                }
                $.toast('领取失败,请刷新后重试');
                console.log('getACoupon err: ',e);
            }

        });
    }



    //获取字符串长度
    function str_length(s){
        if(typeof s === "string"){
            return s.replace(/[\u0391-\uFFE5]/g,"aa").length;
        }
        return 0;
    }
    //截取 n个汉字，一个汉字等于2字符
    function cut_str(str, len){
        var char_length = 0;
        for (var i = 0; i < str.length; i++){
            var son_str = str.charAt(i);
            encodeURI(son_str).length > 2 ? char_length += 1 : char_length += 0.5;
            if (char_length >= len){
                var sub_len = char_length == len ? i+1 : i;
                return str.substr(0, sub_len);
                break;
            }
        }
    }




});


