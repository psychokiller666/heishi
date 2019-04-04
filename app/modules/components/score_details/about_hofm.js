// 评分详情页
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit', '.about_hofm', function (e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);

    var ApiBaseUrl = init.getApiBaseUrl();

    document.title = '公路商店霍夫曼评分体系';

})
