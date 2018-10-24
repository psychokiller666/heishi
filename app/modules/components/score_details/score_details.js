// 评分详情页
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit', '.score_details', function (e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);

    var ApiBaseUrl = init.getApiBaseUrl();

    var goodsId = init.getUrlParam('id');

    if(goodsId){
        document.title = '评分详情';
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
                    initHofmUl(data.data.hoffman);
                }
            },
            error: function(e){
                console.log('getAssessment err: ',e);
            }

        });

    }
    
    function initHofmUl(data) {
        if(data){
            $('.hofm_average b').html(data.average);
            $('.hofm_txt').html(data.message);

            var detail = data.detail;
            var html = '';
            for(var i=0;i<detail.length;i++){
                html += '<li class="score_li">'
                html += '<div class="title">'+ detail[i].title +'</div>'
                html += '<div class="scores">'
                html += '<div class="stars" stars="'+ parseInt(detail[i].score) +'"></div>'
                html += '<div class="score_num">'+ detail[i].score +' 分</div>'
                html += '</div>'
                html += '<div class="score_desc">'+ detail[i].content +'</div>'
                if(detail[i].note && detail[i].note.length>0){
                    html += '<div class="score_note">'+ detail[i].note +'</div>'
                }
                html += '</li>'
            }
            $('.score_ul').html(html);

        }else{
            $.toast('暂无问题');
        }
    }



})
