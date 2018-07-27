//卖家店铺分类标签页

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.seller_tag', function(e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);

    var HostName = location.hostname;
    var ApiBaseUrl = 'https://apitest.ontheroadstore.com';

    if(HostName==="hs.ontheroadstore.com"){
        ApiBaseUrl = 'https://api.ontheroadstore.com';
    }

    var uid = getUrlParam('id');

    $('.tag_header_a').attr('href','/User/index/tag_goods?id='+ uid + '&sortid=0');

    getGoodsSort();


    //获取店铺分类
    function getGoodsSort(){
        var url = ApiBaseUrl + '/appv5_2/sort/getGoodsSort';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {uid:uid,status:1},

            success: function(data){
                if(data.status==1){
                    addGoodsSort(data.data);
                }
            },
            error: function(e){
                console.log('getGoodsSort err: ',e);
            }
        });
    }

    function addGoodsSort(data){
        var html = '';
        for(var i=0;i<data.length;i++){
            html += '<li class="tag_li"><a href="/User/index/tag_goods?id='+ uid + '&sortid=' + data[i].id +'" external>'+ data[i].sort_name +'</a></li>'
        }
        $('.tag_ul').html(html);
    }


    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }


});


