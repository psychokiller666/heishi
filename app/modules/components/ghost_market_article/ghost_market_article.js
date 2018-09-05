//鬼市商品详情页

// 初始化
var common = require('../common/common.js');
// 微信jssdk
var wx = require('weixin-js-sdk');

// 百度上传组件
var WebUploader = require('../../../../node_modules/tb-webuploader/dist/webuploader.min.js');
// 过滤关键词
var esc = require('../../../../node_modules/chn-escape/escape.js');
// 评论初始化
var Comment = require('../comment/comment.js');


$(document).on('pageInit','.ghost_market_article', function(e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);
    var lazyLoad = init.lazyLoad;

    var ApiBaseUrl = init.getApiBaseUrl();
    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };
    //2018090315365152249

    var goodsId = init.getUrlParam('id');

    var $content_wrap = $('.content_wrap');


    getGoodsDetail(goodsId);

    function getGoodsDetail(id) {

        var url = ApiBaseUrl + '/ghostmarket/goods/' + id + '/getDetail';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: ajaxHeaders,
            success: function (data) {
                if (data.status == 1) {
                    console.log(data.data);
                    initPage(data.data);

                }
            },
            error: function (e) {
                console.log('getGoodsDetail err: ', e);
            }

        });
    }


    function initPage(data){
        initDetail(data.detail);
        initSeller(data.user);
        initLiker(data.like);
        initComment(data.comment);

        initEvent();
    }


    function initDetail(detail){
        $content_wrap.find('.title').html(detail.gg_title);
        $content_wrap.find('.price').html('¥'+detail.gg_price);
        $content_wrap.find('.detail_txt').html(detail.gg_content);

        initBanner(detail.gg_img);

    }

    function initBanner(imgs){
        var html = '';
        for(var i=0;i<imgs.length;i++){
            html+= '<div class="swiper-slide">'
            html+= '<img src="'+imgs[i]+'">'
            html+= '</div>'
        }
        $('.banner .swiper-wrapper').html(html);

        var mySwiper = new Swiper('.swiper-container',{
            loop: true,
            pagination: '.swiper-pagination',
            lazyLoading: true,
            autoplay: 3000,
            speed:300,
            autoplayDisableOnInteraction : false
        })


    }

    function initSeller(user){
        $content_wrap.find('.to_seller_center').attr('href','/User/index/index/id/'+user.id+'.html');
        $content_wrap.find('.avatar').attr('src',user.avatar)
        $content_wrap.find('.name').html(user.username);
        $content_wrap.find('.intro').html(user.announcement);
        $content_wrap.find('.like_ico').attr('status',user.likeStatus);
        $('.footer .contact a').attr('href','/User/HsMessage/detail/from_uid/'+user.id);

    }

    function initLiker(like){
        var html = '';
        if(like && like.length>0){

            //todo: delete
            like.push(like[0])
            like.push(like[0])
            like.push(like[0])
            like.push(like[0])
            like.push(like[0])
            like.push(like[0])
            like.push(like[0])
            like.push(like[0])
            like.push(like[0])
            like.push(like[0])

            var len = like.length>8 ? 8 : like.length;
            for(var i=0;i<len;i++){
                html += '<a href="javascript:;"><img src="'+like[i].avatar+'"></a>'
            }
            $content_wrap.find('.liker_wrap').html(html).show();
        }
    }

    function initComment(com){
        var html = '';

        if(com && com.length>0){

            //todo:delete
            com.push(com[0])
            com.push(com[0])

            for(var i=0;i<com.length;i++){
                html+= '<li class="comment_li hs-cf">'
                html+= '<div class="comment_left">'
                html+= '<img src="'+com[i].gc_user_img+'" class="comment_avatar">'
                html+= '</div>'
                html+= '<div class="comment_right">'
                html+= '<div class="comment_user" uid="'+com[i].gc_userId+'">'
                html+= '<div class="comment_name">'
                html+= '<div class="time">'+com[i].gc_createtime+'</div>'
                html+= '<div class="name">'+com[i].gc_username+'</div>'
                html+= '</div>'
                html+= '<div class="comment_txt">'+ com[i].gc_comment +'</div>'
                html+= '</div>'
                if(com[i].gc_kids.length>0){
                    html+= '<div class="comment_reply">'
                    for(var j=0;j<com[i].gc_kids.length;j++){
                        html+= '<div class="comment_reply_li" uid="'+ com[i].gc_kids[j].gc_user_id +'">'
                        html+= '<div class="name">'+ com[i].gc_kids[j].gc_username +'</div>'
                        html+= '<div class="txt">'+ com[i].gc_kids[j].gc_comment +'</div>'
                        html+= '</div>'

                    }
                    html+= '</div>'
                }
                html+= '</div>'
                html+= '</li>'
            }

            $content_wrap.find('.comment_ul').html(html);
            $content_wrap.find('.comment_more').show();

        }



    }

    function initEvent(){
        $('.like_ico').off('click').on('click',function(){
            if($(this).attr('status')=='1'){
                return;
            }
            setUserLike();
        })

    }
    
    function setUserLike() {
        var url = ApiBaseUrl + '/ghostmarket/goods/' + goodsId + '/setUserLike';
        $.ajax({
            type: "POST",
            url: url,
            dataType: 'json',
            data: {},
            headers: ajaxHeaders,
            success: function (data) {
                $('.like_ico').attr('status','1');
            },
            error: function (e) {
                console.log('getGoodsDetail err: ', e);
                $('.like_ico').attr('status','1');
            }

        });
    }

});


