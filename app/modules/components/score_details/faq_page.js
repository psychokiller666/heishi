// 评分详情页
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit', '.faq_page', function (e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);

    var ApiBaseUrl = init.getApiBaseUrl();


    var goodsId = init.getUrlParam('id');

    if(goodsId){
        document.title = '常见问题';
        getAssessment()
    }else{
        $.toast('参数错误');
    }


    function getAssessment(){
        var url = ApiBaseUrl + '/appv6_1/goods/'+ goodsId +'/assessment';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},

            success: function(data){
                if(data.status==1){
                    initFQA(data.data.problem);
                }
            },
            error: function(e){
                console.log('getAssessment err: ',e);
            }

        });

    }

    //常见问题
    function initFQA(data){
        if(data && data.length>0){
            var html = '';
            var length = data.length>2 ? 2 : data.length;
            for(var i=0;i<length;i++){
                html += '<li class="faq">'
                html += '<div class="title">'+ data[i].title +'</div>'
                html += '<div class="txt">'+ data[i].content +'</div>'
                html += '</li>'
            }
            $('.faqs').html(html);

        }
    }


})
