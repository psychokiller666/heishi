//圣诞活动

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.christmas', function(e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    // document.title = '';

    var init = new common(page);

    var lazyload = init.lazyLoad;

    var ApiBaseUrl = init.getApiBaseUrl();

    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };

    // 调用微信分享sdk
    var share_data = {
        title: '公路商店 — 新人礼遇',//todo:
        desc: '为你不着边际的企图心',
        link: window.location.href,
        img: 'https://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
    };
    init.wx_share(share_data);


    //判断是否是app
    var isApp = false;
    var $isApp = $('.is_app');
    var Authorization = $isApp.attr('authorization');
    var uid = $isApp.attr('uid');
    // var version = $isApp.attr('version');

    var loginStatus = true;

    if(Authorization && Authorization.length>0){
        isApp = true;
        ajaxHeaders = {
            'Authorization' : Authorization,
            // 'version' : version,//跨域不能加version
        };
    }else{
        //如果不是app，通过uid判断是否登录，如果未登录，点击领取和关注按钮需要跳转到登录页3
        loginStatus = init.ifLogin();
    }




    $(page).on('click','.get_coupon',function(){

        if(isApp){
            if(!uid){
                $.toast('请先登录');
                return;
            }
        }else{
            if(init.ifLogin(true) == false){
                return ;
            }
        }

        var $this = $(this);
        if($this.attr('clicked')==='1'){
            return false;
        }
        var id = $this.attr('couponid');
        getACoupon($this,id);

    });

    //领取优惠券
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
                    $.toast('领取成功');//todo:
                }else{
                    $.toast(data.info);
                }
                $btn.attr('clicked','0');
            },
            error: function(e){
                $btn.attr('clicked','0');
                $.toast('领取失败,请稍后重试');
                console.log('getACoupon err: ',e);
            }

        });
    }




});


