//鬼市评论js
var common = require('../common/common.js');
// 百度上传组件
var WebUploader = require('../../../../node_modules/tb-webuploader/dist/webuploader.min.js');
// 过滤关键词
var esc = require('../../../../node_modules/chn-escape/escape.js');
// 微信jssdk
var wx = require('weixin-js-sdk');

// 过滤关键词
var sensitiveWord = ['燃料','大麻','叶子','淘宝','taobao.com','共产党','有飞','想飞','要飞','微信','加我','大妈','飞吗','飞嘛','qq','拿货','weed','机长','thc','V信','wechat','VX','蘑菇','邮票','LSD','taobao','tb','操你妈','草你妈','🍃'];
// 过滤关键词插件esc初始化
var ApiBaseUrl = common.prototype.getApiBaseUrl();
var PHPSESSID = common.prototype.getCookie('PHPSESSID');
var ajaxHeaders = {
    'phpsessionid': PHPSESSID
};
esc.init(sensitiveWord);
//打开回复对话框
function gsComment(commentData){

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


module.exports = gsComment;





