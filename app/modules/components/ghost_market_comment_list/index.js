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

    var goodsId = init.getUrlParam('id');

    var $content_wrap = $('.content_wrap');
    var $comment_load = $content_wrap.find('.comment_load');

    var commentObj = {
        over: false,
        loading: false,
        page: 0,    //当前页码
        skip: 0,    //当前已有数量
        num: 5,     //每页数量
    };

    initCommentList();
    function initCommentList(){
        getCommentList(commentObj.skip,commentObj.num,true);
        initEvent();
    }


    //初始化评论
    function initComment(com){

        var html = createCommentHtml(com);
        $content_wrap.find('.comment_ul').html(html);

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
                html+= '<img src="'+com[i].gc_user_img+'" class="comment_avatar">'
                html+= '</div>'
                html+= '<div class="comment_right">'
                html+= '<div class="comment_user">'
                html+= '<div class="comment_name js_reply">'
                html+= '<div class="time">'+fmtCommentTime(com[i].gc_createtime)+'</div>'
                html+= '<div class="name">'+com[i].nickname+'</div>'
                html+= '</div>'
                if(com[i].gc_commen_img){
                    html+= '<div class="comment_img"><img class="wx_preview" src="' + init.fixImgUrl(com[i].gc_commen_img) +'"></div>'
                }else{
                    html+= '<div class="comment_txt">'+ com[i].gc_comment +'</div>'
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
            arr.push($(this).attr('src'));

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
        $content_wrap.find('.comment_input').on('click',function(){

            openComment({
                goodsId:goodsId,
                lvl:1,          //评论级别 1或2
                mainId:'',      //主评论id
                toUserId:'',    //被评论人id
                toUserName:'',    //被评论人的name
                callback:function(data){
                    getCommentList();
                }
            })

        });

        //    二级评论：回复评论
        $content_wrap.find('.comment_wrap').on('click','.js_reply',function(){
            var $parent = $(this).parents('.comment_li');

            var obj = {
                goodsId:goodsId,
                lvl:2,          //评论级别 1或2
                mainId: $parent.attr('gcid'),      //主评论id
                toUserId: $parent.attr('uid'),    //被评论人id
                toUserName: $parent.attr('username'),    //被评论人的name
                callback:function(data){
                    getCommentList();
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
    function getCommentList(skip,num,record){
        console.log(skip ,num)

        if(commentObj.loading || commentObj.over){
            return;
        }else{
            commentObj.loading = true;
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
                            $('.comment_load').attr('status','1');
                        }
                    }
                    addComment(data.data);
                }
                commentObj.loading = false;
            },
            error: function(xhr, type){
                commentObj.loading = false;
                $.toast('网络错误 code:'+xhr);
            }
        });
    }

    //打开回复对话框
    function openComment1(commentData){

        var dialogComment = $('.dialog_comment');
        var comment_input = $('#comment_input');
        var comment_type = 0;
        var image_list = dialogComment.find('.image_list');
        var image = dialogComment.find('.image');
        comment_input.val('').attr('placeholder','随便说点什么');
        dialogComment.find('button').removeAttr('disabled');
        dialogComment.show();

        // 上传图片
        var uploader = WebUploader.create({
            fileNumLimit: 1,
            // 自动上传。
            auto: true,
            // 文件接收服务端。
            server: '/index.php?g=api&m=HsFileupload&a=upload',
            // 二进制上传
            sendAsBinary: true,
            // 只允许选择文件，可选。
            accept: {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png,webp',
                mimeTypes: 'image/*'
            }
        });


        // 判断是否是回复别人
        if (commentData.toUserName.length) {
            comment_input.attr('placeholder','回复：'+commentData.toUserName);
        } else {
            comment_input.attr('placeholder','随便说点什么');
        }
        // 控制是否上传图片 二级评论不能发图
        if (commentData.lvl===1) {
            dialogComment.find('.image').show();
        } else {
            dialogComment.find('.image').hide();
        }


        // 禁止滑动
        dialogComment.on('touchmove',function(e){
            e.stopPropagation();
        });
        dialogComment.find('#comment_input').focus();

        dialogComment.on('click', '.margin_box', function(){
            dialogComment.off('click','.cancel');
            dialogComment.off('click','.submit');
            dialogComment.find('.webuploader-element-invisible').removeAttr('disabled','disabled');
            dialogComment.find('.hs-icon').css('color','#000');
            dialogComment.off("change",'.webuploader-element-invisible');
            dialogComment.hide();
            uploader.reset();
        })

        // 提交评论
        dialogComment.on('click','.submit', function() {
            var comment_content;
            dialogComment.off('click','.submit');
            dialogComment.find('button').attr('disabled','disabled');
            //判断是提交图片还是文字
            var commentImg = comment_input.attr('data-imgurl');
            if(commentImg){
                comment_content = commentImg;
            } else {
                comment_content = comment_input.val();
            }
            // 如果为空
            if(!comment_content.length){
                dialogComment.hide();
                $.toast('评论不能为空');
                return false;
            }
            // 判断是否为空并且过滤关键词
            if (esc.find(comment_content).length) {
                dialogComment.hide();
                $.toast('🚔 我要报警了');
                return false;
            }


            // 评论回复参数
            var post_data = null;
            // 一级评论回复参数
            if(commentData.lvl===1){
                // 一级回复
                if(commentImg){
                    post_data = {
                        goodsId: commentData.goodsId,
                        commentImg: commentImg,
                    }
                }else{
                    post_data = {
                        goodsId: commentData.goodsId,
                        comment: comment_content,
                    }
                }

            }else{
                // 二级回复
                post_data = {
                    goodsId: commentData.goodsId,
                    comment: comment_content,
                    mainId: commentData.mainId,
                    toUserId: commentData.toUserId,
                }
            }


            $.ajax({
                type: 'POST',
                url: ApiBaseUrl+'/ghostmarket/sendComment',
                data: post_data,
                dataType: 'json',
                timeout: 4000,
                headers: ajaxHeaders,
                success: function(data){
                    if(data.status == 1){
                        // 成功评论
                        $.toast('😄 评论成功');
                        dialogComment.find('.webuploader-element-invisible').removeAttr('disabled','disabled');
                        dialogComment.find('.hs-icon').css('color','#000');
                        dialogComment.hide();

                        // 添加评论dom

                        if(typeof commentData.callback === 'function'){
                            commentData.callback(post_data);
                        }

                        uploader.reset();
                        $.refreshScroller();

                    }else{
                        $.toast(data.info);
                        dialogComment.hide();
                    }
                },
                error: function(xhr, type){
                    $.toast('网络错误 code:'+xhr);
                    uploader.reset();
                    dialogComment.hide();
                }
            });

        });


        // 监听input file是否有文件添加进来
        dialogComment.on("change",'.webuploader-element-invisible', function(e) {
            uploader.addFiles(e.target.files);
            uploader.upload();
        });
        //文本发生变化时
        comment_input[0].oninput = function(e) {
            var num = $(this).val().length;
            if(num){
                dialogComment.find('.webuploader-element-invisible').attr('disabled','disabled');
                dialogComment.find('.hs-icon').css('color','#eee');
            }else{
                dialogComment.find('.webuploader-element-invisible').removeAttr('disabled','disabled');
                dialogComment.find('.hs-icon').css('color','#000');
            }
        }
        // 图片列队
        uploader.onFileQueued = function(file){
            // 控制回复按钮
            dialogComment.find('.cancel').attr('disabled','disabled');
            dialogComment.find('.submit').attr('disabled','disabled');
            // 控制回复框
            comment_input.attr('disabled','disabled');
            comment_input.val('').attr('placeholder','图片和文字二选一！');
            // 生成缩略图
            uploader.makeThumb(file,function(error,ret){
                image_list.empty();
                if(error){
                    image_list.html('预览错误');
                } else {
                    image_list.append('<img src="'+ret+'" />');
                }
            });
        }
        // 上传成功
        uploader.onUploadSuccess = function(file,response) {
            // type状态等于4
            comment_type = 4;
            // 添加关闭按钮
            image_list.append('<button class="close" data-id="'+file.id+'"></button>');
            dialogComment.find('.cancel').removeAttr('disabled','disabled');
            // 消除进度条
            image_list.find('.progress').remove();
            // 删除上传框
            dialogComment.find('.image .updata_image_btn').remove();
            // setTimeout(function(){
            // 恢复提交按钮
            dialogComment.find('.submit').removeAttr('disabled','disabled');
            // },1000)
            if(response.status == 1) {
                // comment_input.val(response.data);
                comment_input.attr('data-imgurl',response.data);
            } else {
                uploader.reset();
                $.toast(response.info);
            }
        }
        // 控制进度条
        uploader.onUploadProgress = function(file,percentage) {
            image_list.append('<div class="progress"><span></span></div>');
            image_list.find('.progress span').css('width', percentage * 100 + '%');
        }
        // 上传出错
        uploader.onUploadError = function(file,reason) {
            uploader.reset();
            $.toast(reason);
        }
        // 当图片初始化
        uploader.onReset = function(){
            image.find('.updata_image_btn').remove();
            image_list.before('<div class="updata_image_btn"><button type="button" class="hs-icon"></button><input type="file" name="file" class="webuploader-element-invisible" accept="image/*" single></div>');
            image.find('.image_list').empty();
            comment_input.val('');
            comment_input.removeAttr('data-imgurl');
            comment_input.removeAttr('disabled');
            comment_input.attr('placeholder','随便说点什么');
            comment_input.show();
            comment_type = 0;
        }
        // 选择时文件出错
        uploader.onError = function(type){
            if(type == 'Q_EXCEED_NUM_LIMIT'){
                $.toast('最多可上传1张');
            } else if(type == 'Q_EXCEED_SIZE_LIMIT') {
                $.toast('太大了，不让传');
            } else if(type == 'Q_TYPE_DENIED') {
                $.toast('兄弟必须是图片');
            }
            uploader.reset();
        }
        // 删除图片按钮
        image_list.on('click','.close',function(){
            dialogComment.find('#comment_input').removeAttr('disabled');
            uploader.reset();
        })
        // 关闭按钮
        dialogComment.on('click','.cancel', function() {
            dialogComment.off('click','.cancel');
            dialogComment.off('click','.submit');
            dialogComment.find('.webuploader-element-invisible').removeAttr('disabled','disabled');
            dialogComment.find('.hs-icon').css('color','#000');
            dialogComment.off("change",'.webuploader-element-invisible');
            dialogComment.hide();
            // 上传图片初始化
            uploader.reset();
        });

    }



});


