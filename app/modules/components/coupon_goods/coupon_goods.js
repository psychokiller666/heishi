// 发布规则页
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit', '.coupon_goods', function (e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);

    var lazyLoad = init.lazyLoad;

    var ApiBaseUrl = init.getApiBaseUrl();

    var couponid = init.getUrlParam('couponid') || 0;

    if(couponid){
        getCouponGoods();
    }else{
        // errBack('参数错误');
    }

    function errBack(txt){
        $.toast(txt);
        setTimeout(function(){
            history.go(-1);
        },500);
    }

    //生成商品列表，传参是数据数组
    function createHtml(lists) {

        if (!(lists instanceof Array)) {
            return '';
        }

        var html = '';
        var tags = [];

        for (var i = 0; i < lists.length; i++) {

            html += '<li>'
            html += '<a href="/index.php/Portal/HsArticle/index/id/'+ lists[i].id +'.html" class="articles external">'
            html += '<div class="image" data-layzr="'+ lists[i].cover +'@640w_1l" data-layzr-bg="" data-layzrstatus="" ></div>'
            html += '<h2 class="title">'+ lists[i].title +'</h2>'
            html += '</a>'
            html += '<div class="user">'
            html += '<div class="user_info">'
            html += '<a href="/User/index/index/id/'+ lists[i].author +'.html" class="external">'
            html += '<img src="'+ lists[i].user_avatar +'">'
            html += '<span>'+ lists[i].user_name +'</span>'
            html += '</a>'
            html += '</div>'
            html += '<div class="classify">'

            tags = lists[i].traits;
            if(tags && tags.length>0){
                for(var j=0;j<1;j++){
                    html += '<a class="classify_keyword" external href="/HsCategories/tag_index/tag/'+ tags[j].name +'.html">'+ tags[j].name +'</a>'
                }
            }else{
                html += '<a class="classify_keyword classify_keyword_none">none</a>'
            }
            html += '</div>'
            html += '</div>'
            html += '</li>'
        }

        return html;
    }

    function getCouponGoods() {

        var url = ApiBaseUrl + '/appv6/coupon/'+ couponid +'/getCouponPost';//没分页
        var PHPSESSID = init.getCookie('PHPSESSID')
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: {
                'phpsessionid': PHPSESSID
            },

            success: function (data) {
                if (data.status == 1) {

                    var html = createHtml(data.data);
                    $('.coupon_goods_ul').html(html);
                    setTimeout(function(){
                        lazyLoad();
                    },100);
                }else{
                    $.toast(data.info)
                }

            },
            error: function (e) {
                console.log('getCouponGoods err: ', e);
            }
        });

    }

})
