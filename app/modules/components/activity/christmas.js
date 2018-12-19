//圣诞活动

// 初始化
var common = require('../common/common.js');
var velocity = require('../plugin/velocity.min.js');
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
        title: '直男直通车',
        desc: '圣诞送礼能保半年平安',
        link: window.location.href,
        img: 'https://img8.ontheroadstore.com/upload/181218/f8fd802e6bb0b34697cd1fc13d15811f.jpg?x-oss-process=image/resize,m_fixed,h_300,w_300',
    };
    init.wx_share(share_data);

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


    var $act_cut_line = $(page).find('.act_cut_line');

    var $content = $(page).find('.content');

    var $popup_wrap = $(page).find('.popup_wrap');
    $popup_wrap.on('click','.popup_btn',function(){
        if($(this).hasClass('popup_yes')){
            //滚动到指定位置
            var scrollTop = $content[0].scrollTop;//当前位置
            var offsetTop = $act_cut_line.offset().top; //得到box这个div层的offset，包含两个值，top和left
            // $content.scrollTop(scrollTop + offsetTop)
            start(scrollTop,offsetTop,50,function(top){
                $content.scrollTop(top);
            })
        }
        hidePopup();
    });
    $popup_wrap.on('click','.popup_mask',function(){
        hidePopup();
    });

    function showPopup(){
        $popup_wrap.show();
    }
    function hidePopup(){
        $popup_wrap.hide();
    }

    //t当前时间，b初始值，c变化量，d持续时间
    function linear(t,b,c,d){ return c*t/d + b; }
    function start(b,c,d,callback){
        var t=0;
        function run(){
            var now = Math.ceil(linear(t,b,c,d));
            callback(now);
            if(t<d){ t++; setTimeout(run, 1); }
        }
        run();
    }

    $(page).on('click','.act_coupon_li',function(){

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
            headers: ajaxHeaders,

            success: function(data){
                if(data.status==1){
                    showPopup();
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


