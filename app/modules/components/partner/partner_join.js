//加入合伙人

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.partner_join', function(e, id, page) {

    if (page.selector == '.page') {
        return false;
    }

    document.title = '加入公路传教士';

    var init = new common(page);

    var $page = $(page);

    var ApiBaseUrl = init.getApiBaseUrl();

    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };

    var uid = init.ifLogin();

    var $partner_join_btn = $page.find('.partner_join_btn');

    initJoin();

    function initJoin(){
        $partner_join_btn.off('click').on('click',function(){
            if(init.ifLogin(true) == false){
                return ;
            }
            var $this = $(this);
            if($this.attr('status')==='0'){
               $this.attr('status','1');
               joinPartner();
            }
            init.sensors.track('buttonClick', {
                pageType : '公路传教士注册页',
                buttonName : '立即加入',
            })
        });
    }

    function joinPartner(){

        var url = ApiBaseUrl + '/appv6_3/setUserToPartner';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: ajaxHeaders,

            success: function(data){

                if(data.status==1){
                    // console.log(data.data)
                    //设置成功
                    $.toast(data.data.message || '加入成功！');
                    setTimeout(function(){
                        location.href = '/Portal/Partner/partner_detail.html';
                    },1000)
                }else{
                    $.toast(data.info);
                }
                $partner_join_btn.attr('status','0');
            },
            error: function(e){
                $.toast('网络错误，请稍后重试');
                $partner_join_btn.attr('status','0');
                console.log('setUserToPartner err: ',e);
            }
        });
    }





});


