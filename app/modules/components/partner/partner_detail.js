//合伙人详情

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.partner_detail', function(e, id, page) {

    if (page.selector == '.page') {
        return false;
    }

    document.title = '公路传教士';

    var init = new common(page);

    var $page = $(page);

    var ApiBaseUrl = init.getApiBaseUrl();

    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };

    var uid = init.ifLogin(true);

    initPartnerData();

    function initPartnerData(){

        var url = ApiBaseUrl + '/appv6_3/getPartnerMoneyInfo';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: ajaxHeaders,

            success: function(data){
                if(data.status==1){
                    console.log(data.data)
                    setPartnerData(data.data);

                }

            },
            error: function(e){

                console.log('getLotteryUser err: ',e);
            }
        });
    }


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

/*        var temp = {
            cumulativeIncome: 0,//累计金额
            frozenMoney: 0,//冻结金额
            todayMoney: 0,//今日收益
            todayOrders: 0,//今日订单数
            withdrawMoney: 0,//可提现金额
            withdrawable: "100",//提现最低限额

        }*/



        $total_price.html(data.cumulativeIncome);
        $today_price.html(data.todayMoney);
        $today_order.html(data.todayOrders);
        $freeze_price.html(data.frozenMoney);
        $can_use.html(data.withdrawMoney);


        $freeze_tip.off('click').on('click',function(ev){

            ev.preventDefault();
        });
    }




});


