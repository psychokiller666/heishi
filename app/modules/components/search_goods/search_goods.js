//搜索页

// 初始化
var common = require('../common/common.js');
// 搜索
var SearchInit = require('../search_list/search_list_2.js');

$(document).on('pageInit','.search_goods', function(e, id, page) {

    var init = new common(page);
    SearchInit();


});


