//鬼市商品详情页

// 初始化
var common = require('../common/common.js');
var openComment = require('../comment/gs_comment.js');
// 微信jssdk
var wx = require('weixin-js-sdk');

$(document).on('pageInit','.ghost_market_comment_list', function(e, id, page) {
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

    $('html,body,.container').css('background','#212021');


    var goodsId = init.getUrlParam('id');

    var $content_wrap = $('.content_wrap');
    var $comment_load = $content_wrap.find('.comment_load');

    var commentObj = {
        over: false,
        loading: false,
        page: 0,    //当前页码
        skip: 0,    //当前已有数量
        num: 20,     //每页数量
    };

    initCommentList();
    function initCommentList(){
        getCommentList(commentObj.skip,commentObj.num,true);
        initEvent();
    }



    //增加评论
    function addComment(com) {
        var html = createCommentHtml(com);
        $content_wrap.find('.comment_ul').append(html);
    }

    //生成评论html
    function createCommentHtml(com) {
        var html = '';

        if(com && com.length>0){

            for(var i=0;i<com.length;i++){
                html+= '<li class="comment_li hs-cf" gcid="'+ com[i].gc_id +'" uid="'+com[i].gc_userId+'" username="'+com[i].nickname+'">'
                html+= '<div class="comment_left js_reply">'
                html+= '<img src="'+ (com[i].gc_user_img || init.lostImage) +'" class="comment_avatar">'
                html+= '</div>'
                html+= '<div class="comment_right">'
                html+= '<div class="comment_user">'
                html+= '<div class="comment_name js_reply">'
                html+= '<div class="time">'+fmtCommentTime(com[i].gc_createtime)+'</div>'
                html+= '<div class="name">'+com[i].nickname+'</div>'
                html+= '</div>'
                if(com[i].gc_commen_img){
                    html+= '<div class="comment_img js_reply"><img class="wx_preview" src="' + init.fixImgUrl(com[i].gc_commen_img) +'@640w_1l" wx_preview="'+ init.fixImgUrl(com[i].gc_commen_img) +'@640w_1l"></div>'
                }else{
                    html+= '<div class="comment_txt js_reply">'+ com[i].gc_comment +'</div>'
                }
                html+= '</div>'
                if(com[i].gc_kids.length>0){
                    html+= '<div class="comment_reply">'
                    for(var j=0;j<com[i].gc_kids.length;j++){
                        html+= '<div class="comment_reply_li js_reply js_reply_2" uid="'+ com[i].gc_kids[j].gc_user_id +'" username="'+ com[i].gc_kids[j].gc_username +'" >'
                        html+= '<div class="name">'+ com[i].gc_kids[j].gc_username +'<span>回复</span>'+ com[i].gc_kids[j].gc_to_user_name +'</div>'
                        html+= '<div class="txt">'+ com[i].gc_kids[j].gc_comment +'</div>'
                        html+= '</div>'
                    }
                    html+= '</div>'
                }else{
                    html+= '<div class="comment_reply comment_reply_none"></div>'
                }
                html+= '</div>'
                html+= '</li>'
            }

        }

        return html;
    }


    //初始化事件
    function initEvent(){

        evComment();

        //微信图片预览
        $content_wrap.find('.comment_ul').on('click','.wx_preview',function(){
            // 调用微信图片
            var arr = [];
            arr.push($(this).attr('wx_preview'));

            wx.previewImage({
                current: arr[0],
                urls: arr
            });
        });


        $('.content').on('scroll',function(ev){
            var $this = $(this);

            if(commentObj.over){
                $this.off('scroll');
                return;
            }
            if(commentObj.loading){
                return;
            }
            //获取自己的scrollHeight,scrollTop
            var clientHeight = $this.height();
            var scrollHeight = $this[0].scrollHeight;
            var scrollTop = $this.scrollTop();

            //判断距离底部的px
            var diff = scrollHeight - clientHeight - scrollTop <= 300;
            if(diff){
                getCommentList(commentObj.skip,commentObj.num,true);
            }

        })

    }


    //评论时间格式化
    function fmtCommentTime(time){

        if(!time || (String(time).length < 10)){
            return '';
        }

        function fixNum(v){
            return v;
            return v<10 ? '0'+v : v;
        }

        time = String(time).length === 10 ? time*1000 : time;

        var t = new Date(time);
        var y = fixNum(t.getFullYear());
        var m = fixNum(t.getMonth()+1);
        var d = fixNum(t.getDate());

        return  m + '-' + d;
    };


    function getUserInfo() {

        var url = ApiBaseUrl + '/appv4/user/simple';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: ajaxHeaders,
            success: function (data) {
                if (data.status == 1) {
                    userInfo = data.data;
                    console.log(data.data);
                }
            },
            error: function (e) {
                console.log('getUserInfo err: ', e);
            }

        });
    }


    //评论事件
    function evComment(){


        //一级评论
        page.find('.js_reply_1').on('click',function(){

            openComment({
                goodsId:goodsId,
                lvl:1,          //评论级别 1或2
                mainId:'',      //主评论id
                toUserId:'',    //被评论人id
                toUserName:'',    //被评论人的name
                callback:function(data){
                    console.log('yijipinglun:',data)
                    getCommentList(0,1,false,function(com){
                        var html = createCommentHtml(com)
                        $content_wrap.find('.comment_ul').prepend(html);
                    });
                }
            })

        });

        //    二级评论：回复评论
        $content_wrap.find('.comment_wrap').on('click','.js_reply',function(ev){

            if($(ev.target).hasClass('wx_preview')){
                return;
            }
            var $parent = $(this).parents('.comment_li');
            var index = $parent.index();

            var obj = {
                goodsId:goodsId,
                lvl:2,          //评论级别 1或2
                mainId: $parent.attr('gcid'),      //主评论id
                toUserId: $parent.attr('uid'),    //被评论人id
                toUserName: $parent.attr('username'),    //被评论人的name
                callback:function(data){
                    getCommentList(index,1,false,function(com){
                        var html = createCommentHtml(com)
                        $parent.replaceWith(html);
                    });
                }
            };

            if($(this).hasClass('js_reply_2')){
                obj.toUserId = $(this).attr('uid');
                obj.toUserName = $(this).attr('username');
            }

            openComment(obj);
        });

    }


    //获取评论列表
    //@skip 跳过几条； @num 读取几条； @record 是否修改commentObj
    function getCommentList(skip,num,record,callback){

        if(commentObj.loading || (commentObj.over && record) ){
            return;
        }else{
            commentObj.loading = true;
        }

        if(record){
            var nowLength = $content_wrap.find('.comment_li').length;
            if(nowLength != skip){
                skip = nowLength;
            }
        }

        $.ajax({
            type: 'GET',
            url: ApiBaseUrl+'/ghostmarket/getList',
            data: {
                goodsId:goodsId,
                skip: skip||'0',//跳过几条
                num: num||'5',
            },
            dataType: 'json',
            headers: ajaxHeaders,
            success: function(data){
                if(data.status == 1){
                    if(record){
                        commentObj.skip = +skip + +num;
                        if(data.data.length<num){
                            commentObj.over = true;
                            $comment_load.attr('status','1');
                        }
                        addComment(data.data);
                    }else{
                        if(typeof callback === "function"){
                            callback(data.data);
                        }
                    }
                }
                commentObj.loading = false;
            },
            error: function(xhr, type){
                commentObj.loading = false;
                $.toast('网络错误 code:'+xhr);
            }
        });
    }




});


