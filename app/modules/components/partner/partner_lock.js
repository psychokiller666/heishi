//合伙人已锁定

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.partner_lock', function(e, id, page) {

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

    var uid = init.ifLogin(true);






});

