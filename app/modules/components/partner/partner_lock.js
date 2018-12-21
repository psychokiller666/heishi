//合伙人已锁定

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.partner_lock', function(e, id, page) {

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

    var reason = init.getUrlParam('reason');

    if(reason){
        reason = unescape(reason)
        $page.find('.lock_reason').html(reason);
    }

    var $contact_customer_a = $page.find('.contact_customer_a');

    getServerPhone();
    // 获取客服电话号码
    function getServerPhone(){
        var url = ApiBaseUrl + '/appv2/servicephone';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: ajaxHeaders,

            success: function(data){
                if(data.status==1){
                    // console.log(data.data)
                    var phone = data.data.service_phone[0];
                    $contact_customer_a.attr('href','tel:'+phone);
                }

            },
            error: function(e){

                console.log('servicephone err: ',e);
            }
        });
    }
    



});


