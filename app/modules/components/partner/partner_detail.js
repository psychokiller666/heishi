//合伙人详情

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.partner_detail', function(e, id, page) {

    if (page.selector == '.page') {
        return false;
    }

    document.title = '黑市合伙人';

    var init = new common(page);

    var $page = $(page);

    var ApiBaseUrl = init.getApiBaseUrl();

    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };


    function initPartnerData(){

        var url = ApiBaseUrl + '/appv6_2/getLotteryUserList/'+id;
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: ajaxHeaders,

            success: function(data){
                if(data.status==1){
                    console.log(data.data)

                }

            },
            error: function(e){

                console.log('getLotteryUser err: ',e);
            }
        });
    }

    setPartnerData();

    function setPartnerData(data) {
        var $wrap = $page.find('.partner_detail_wrap')
        var $userimg = $wrap.find('.user_info img');
        var $username = $wrap.find('.user_info span');
        var $total_price = $wrap.find('.total_price span');
        var $today_price = $wrap.find('.today_price span');
        var $today_order = $wrap.find('.today_order');
        var $freeze_price = $wrap.find('.freeze_price');
        var $can_use = $wrap.find('.can_use');

        var $freeze_tip = $wrap.find('.freeze_tip');



        $freeze_tip.on('click',function(ev){
            $.toast('click')
            ev.stopPropagation();
            ev.preventDefault();
            return false;
        });
    }




});


