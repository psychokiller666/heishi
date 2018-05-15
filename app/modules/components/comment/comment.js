// 百度上传组件
var WebUploader = require('../../../../node_modules/tb-webuploader/dist/webuploader.min.js');
// 过滤关键词
var esc = require('../../../../node_modules/chn-escape/escape.js');
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 微信jssdk
var wx = require('weixin-js-sdk');

var Comment = function(){
  // 过滤关键词
  this.text_list = [
  '燃料',
  '大麻',
  '叶子',
  '淘宝',
  'taobao.com',
  '共产党',
  '有飞',
  '想飞',
  '要飞',
  '微信',
  '加我',
  '大妈',
  '飞吗',
  '飞嘛',
  'qq',
  '拿货',
  'weed',
  '机长',
  'thc',
  'V信',
  'wechat',
  'VX',
  '蘑菇',
  '邮票',
  'LSD',
  'taobao',
  'tb',
  '操你妈',
  '草你妈',
  '🍃'
  ];
  // 过滤关键词插件esc初始化
  esc.init(this.text_list);
}
Comment.prototype.add_data_comment = function(data, success, error){
  $.ajax({
    type: 'GET',
    url: '/index.php?g=Comment&m=Widget&a=ajax_more&table=posts',
    data: data,
    timeout: 10000,
    success: success,
    error: error
  });
}
// 参数：ispic=是否需要上传图片按钮; username=二级评论被回复用户名; reply_tpl=生成模板方法; callback=回调处理;
// 参数：is_father=是否一级评论; is_wxinput=是否微信公众号打开回复; element = 二级回复带有被回复者ID(li)，评论ID对象
// Comment.prototype.open_comment_box = function(ispic, username, element, is_father, is_wxinput, reply_tpl) {
Comment.prototype.open_comment_box = function(commentData) {
  // 初始化
  var commentModule = $('#comment');
  var comment_bd = commentModule.find('.comment_bd');
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
  if (commentData.username.length) {
    comment_input.attr('placeholder','回复：'+commentData.username);
  } else {
    comment_input.attr('placeholder','随便说点什么');
  }
  // 控制是否上传图片 二级评论不能发图
  if (commentData.ispic) {
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
    if(comment_input.attr('data-imgurl')){
      comment_content = comment_input.attr('data-imgurl');
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
    if(commentData.is_father){
      // 一级回复
      post_data = {
        content:comment_content,
        post_table:commentModule.data('table'),
        post_id: commentModule.data('id'),
        to_uid: 0,
        parentid: 0,
        type: comment_type,
        url:window.location.origin + window.location.pathname
      }
    }
    // 二级回复
    if(!commentData.is_father){
      // 是否是从微信公众号里进来的
      if(commentData.is_wxinput){
        post_data = {
          content: comment_content,
          post_table: commentModule.data('table'),
          post_id: commentModule.data('id'),
          to_uid: commentModule.data('commenttouid'),
          parentid: commentModule.data('commentparentid'),
          type: comment_type,
          url:window.location.origin + window.location.pathname
        }
      }else{
        post_data = {
          content: comment_content,
          post_table: commentModule.data('table'),
          post_id: commentModule.data('id'),
          to_uid: commentData.element.data('uid'),
          parentid: commentData.element.data('id'),
          type: comment_type,
          url:window.location.origin + window.location.pathname
        }
      }
    }

    $.ajax({
      type: 'POST',
      url: '/index.php?g=comment&m=comment&a=post',
      data: post_data,
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          // 成功评论
          $.toast('😄 评论成功');
          dialogComment.find('.webuploader-element-invisible').removeAttr('disabled','disabled');
          dialogComment.find('.hs-icon').css('color','#000');
          dialogComment.hide();
          if(commentData.is_wxinput) {
            return false;
          }
          // 添加评论dom
          // 一级评论
          if(commentData.is_father) {
            // 回复直接添加底部
            var reply_data = {
              is_father: true,
              type: comment_type,
              comment: comment_content,
              username: commentModule.data('username'),
              avatar: commentModule.data('avatar'),
              uid: commentModule.data('uid'),
              id: data.data.id
            };
            commentData.callback(reply_data);
            uploader.reset();
            $.refreshScroller();
            return false;
          }
          // 二级回复
          var reply_data = {
            is_father: false,
            type: comment_type,
            comment: comment_content,
            username: commentModule.data('username'),
            parent_full_name: commentData.element.data('username'),
            uid: commentModule.data('uid'),
            id: data.data.id
          };
          if(commentData.element.hasClass('father')){
            if(!commentData.element.find('.comment-content .reply').length){
              commentData.element.find('.comment-content').append('<ul class="reply"></ul>');
              commentData.element.find('.comment-content .reply').append(commentData.reply_tpl(reply_data));
            }else{
              commentData.element.find('.comment-content .reply').append(commentData.reply_tpl(reply_data));
            }
          }else{
            commentData.element.parent('.reply').append(commentData.reply_tpl(reply_data));
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

module.exports = Comment;





















// 初始化
var common = require('../common/common.js');
$(document).on('pageInit','.user_comment_list', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  $('title').text('全部评论');
  var comment_box = $('#comment');
  var comment_bd = comment_box.find('.comment_bd');
  var comment_manage = new Comment();
  var comment_list_tpl = handlebars.compile($("#comment_list_tpl").html());
  var comment_list_reply_tpl = handlebars.compile($("#reply_tpl").html());
  // 增加模板引擎判断
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  var loading = false;
  var comment_type = $('.comment_type').val();
  comment_list(comment_box.data('id'), '', comment_type);
  function comment_list(post_id, cur_cid, comment_type){
    comment_manage.add_data_comment({
      post_id: post_id,
      type: comment_type,
      cur_cid: cur_cid
    },function(data){
      if(data.status == 1){
        if(data.comments != null){
          comment_bd.append(comment_list_tpl(data));
          comment_box.attr('data-cid',comment_bd.find('.father').last().data('id'));
          init.loadimg();
        }
        // 评论数不足一屏幕
        if($('.comment_bd').height() < 800){
          $('.infinite-scroll-preloader').remove();
          $('.bottom_alert').css('display', 'block');
        }
      }else{
        $.detachInfiniteScroll($('.infinite-scroll'));
        $('.infinite-scroll-preloader').remove();
        $('.bottom_alert').css('display', 'block');
      }
      loading = false;
    },function(xhr, type){
      console.log(type);
    })
  }
  page.on('infinite', function() {
    if (loading) {
      return false;
    }
    loading = true;
    comment_list(comment_box.data('id'), comment_box.data('cid'), comment_type);
    $.refreshScroller();
  });

  // 点击回复框
  page.on('click','.comment_bd li',function(e){
    // 图片
    e.stopPropagation();
    e.preventDefault();
    if(e.srcElement.className == 'comment_image') {
      // 调用微信图片
      var arr = [];
      arr.push($(e.srcElement).data('preview'));
      wx.previewImage({
        current: $(e.srcElement).data('preview'),
        urls: arr
      });
    } else {
      comment_type = 2;
      el_li = $(this);
      $('.uploading').addClass('no_uploading');
      $('.uploading').find('.webuploader-element-invisible').attr('disabled','disabled');
      $('.reply_text').attr('placeholder', '回复 '+ $(this).attr('data-username')).focus().val('');
    }
  });
  // 适配输入框
  $('.reply_text').focus(function(){
    $('.content').css('overflow-y', 'hidden');
  })
  $('.reply_text').blur(function(){
    $('.content').css('overflow-y', 'auto');
    $('.reply_text').attr('placeholder', '有话快说，有屁快放。');
    $('.uploading').removeClass('no_uploading');
    $('.uploading').css({'display': 'block', 'color': '#000'});
    $('.uploading').find('.webuploader-element-invisible').removeAttr('disabled','disabled');
  })
  // 提交
  // 是否正在提交
  var submit_status = false;
  // 一级/二级评论
  var comment_type = 1;
  // 二级评论需要传入element
  var el_li = null;
  var text_list = [
  '燃料','大麻','叶子','淘宝','taobao.com','共产党','有飞','想飞','要飞','微信','加我','大妈','飞吗','飞嘛','qq','拿货','weed','机长','thc',
  'V信','wechat','VX','蘑菇','邮票','LSD','taobao','tb','操你妈','草你妈','🍃'];
  esc.init(text_list);
  $('.submit').click(function(){
    if(submit_status){
      return false;
    }
    submit_status = true;
    replyText(comment_type, el_li);
  })
  function replyText(father, element){
    var comment_content = $('.reply_text').val();
    // 如果为空
    if(!comment_content.length){
      $.toast('评论不能为空');
      submit_status = false;
      return false;
    }
    // 判断是否为空并且过滤关键词
    if (esc.find(comment_content).length) {
      $.toast('🚔 我要报警了');
      submit_status = false;
      return false;
    }
    // 评论回复参数
    var post_data = null;
    // 一级评论回复参数
    if(father == 1){
      post_data = {
        content: comment_content,
        post_table: comment_box.data('table'),
        post_id: comment_box.data('id'),
        to_uid: 0,
        parentid: 0,
        type: 0
      }
    }
    // 二级回复
    if(father == 2){
      post_data = {
        content: comment_content,
        post_table: comment_box.data('table'),
        post_id: comment_box.data('id'),
        to_uid: element.data('uid'),
        parentid: element.data('id'),
        type: 0
      }
    }
    // 根据文章类型，改变推送url
    if($('.article_type').val() == 1){
      post_data.url = window.location.origin + '/Portal/HsArticle/index/id/'+$('.article_id').val()+'.html';
    }else{
      post_data.url = window.location.origin + '/Portal/HsArticle/culture/id/'+$('.article_id').val()+'.html';
    }
    ajaxCommentPost(post_data, father, element);
  }
  function ajaxCommentPost(post_data, father, element){
    $.ajax({
      type: 'POST',
      url: '/index.php?g=comment&m=comment&a=post',
      data: post_data,
      success: function(data){
        if(data.status == 1){
          // 成功评论
          $.toast('😄 评论成功');
          $('.reply_text').val('');
          // 一级评论
          if(father == 1) {
            var reply_data = {
              is_father: true,
              type: post_data.type,
              comment: post_data.content,
              username: comment_box.data('username'),
              avatar: comment_box.data('avatar'),
              uid: comment_box.data('uid'),
              id: data.data.id
            };
            comment_bd.prepend(comment_list_reply_tpl(reply_data));
          }
          // 二级回复
          if(father == 2){
            var reply_data = {
              is_father: false,
              type: 0,
              comment: post_data.content,
              username: comment_box.data('username'),
              parent_full_name: element.data('username'),
              uid: comment_box.data('uid'),
              id: data.data.id
            };
            if(element.hasClass('father')){
              if(!element.find('.comment-content .reply').length){
                element.find('.comment-content').append('<ul class="reply"></ul>');
                element.find('.comment-content .reply').prepend(comment_list_reply_tpl(reply_data));
              }else{
                element.find('.comment-content .reply').prepend(comment_list_reply_tpl(reply_data));
              }
            }else{
              element.parent('.reply').prepend(comment_list_reply_tpl(reply_data));
            }

          }
          init.loadimg();
        } else {
          $.toast(data.info);
        }
        $.refreshScroller();
        uploadReply.reset();
        submit_status = false;
        comment_type = 1;
        el_li = null;
      },
      error: function(xhr, type){
        submit_status = false;
        uploadReply.reset();
        $.toast('网络错误 code:'+xhr);
      }
    });
  }
  // 监听input file是否有文件添加进来
  $('.uploading').on("change",'.webuploader-element-invisible', function(e) {
    uploadReply.addFiles(e.target.files);
    uploadReply.upload();
  });
  var uploadReply = WebUploader.create({
    fileNumLimit: 1,
    auto: true,
    server: '/index.php?g=api&m=HsFileupload&a=upload',
    sendAsBinary: true,
    accept: {
      title: 'Images',
      extensions: 'gif,jpg,jpeg,bmp,png,webp',
      mimeTypes: 'image/*'
    }
  });
  // 上传成功 直接评论
  uploadReply.onUploadSuccess = function(file,response) {
    var post_data = {
      content: response.data,
      post_table: comment_box.data('table'),
      post_id: comment_box.data('id'),
      to_uid: 0,
      parentid: 0,
      type: 4,
      url:window.location.origin + window.location.pathname
    }
    ajaxCommentPost(post_data, 1, '');
  }
  // 控制进度条
  uploadReply.onUploadProgress = function(file,percentage) {
    var str = '正在上传：'+ percentage * 100 + '%';
    $('.reply_text').val(str);
  }
  // 上传出错
  uploadReply.onUploadError = function(file,reason) {
    uploadReply.reset();
    $.toast(reason);
  }
  // 当图片初始化
  uploadReply.onReset = function(){
    $('.uploading').empty().append('<input type="file" class="webuploader-element-invisible" name="file" accept="image/*">');
  }
  // 选择时文件出错
  uploadReply.onError = function(type){
    if(type == 'Q_EXCEED_NUM_LIMIT'){
      $.toast('最多可上传1张');
    } else if(type == 'Q_EXCEED_SIZE_LIMIT') {
      $.toast('太大了，不让传');
    } else if(type == 'Q_TYPE_DENIED') {
      $.toast('兄弟必须是图片');
    }
    uploadReply.reset();
  }
  
});