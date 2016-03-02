// 商品内容页
// 微信jssdk
var wx = require('weixin-js-sdk');
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 百度上传组件
// var WebUploader = require('../../../../node_modules/tb-webuploader/dist/webuploader.min.js');
// 过滤关键词
var esc = require('../../../../node_modules/chn-escape/escape.js');
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.store-show', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

  // 加关注
  var attention_btn = $('.attention-btn');
  attention_btn.on('click',function(){
    if($(this).hasClass('active')){
      $(this).removeClass('active');
      $.toast('已取消关注');
    } else {
      $(this).addClass('active');
      $.toast('关注成功');
    }
  });
  // 微信预览图片
  $('.images ul li').tap(function(){
    var preview_list = [];
    $.each($('.images ul li'),function(index,item){
      preview_list.push($('.images ul li').eq(index).data('preview'));
    });
    wx.previewImage({
      current: $(this).data('preview'),
      urls: preview_list
    });
  });
  // 打赏
  var dialog_reward = $('.dialog_reward');
  $('.buy button').on('click',function(){
    dialog_reward.find('input').val('');
    dialog_reward.show();
  });
  // 打赏框
  dialog_reward.find('.ui-dialog-close').on('click',function(){
    dialog_reward.hide();
  });
  dialog_reward.find('.ui-dialog-ft button').on('click',function(){
    if(dialog_reward.find('input').val() >= 1){
      $.toast('🌚 谢谢哥');
      dialog_reward.hide();
    } else {
      $.toast('😐 必须是整数');
      dialog_reward.find('input').trigger('focus');
    }
  });
  // 点赞
  $('.praise_btn').on('click',function(){
    $.toast('🌚 点赞成功');
  });
  // 更多按钮
  var praise_more_tpl = '<li><button type="button" class="praise_more">更多</button></li>';
  $('.store-show .praise ul li').each(function(index,item){
    if(index <= 7) {
      $('.store-show .praise ul').height('1.32rem');
    } else if (index >= 16){
      $('.store-show .praise ul li').eq(15).before(praise_more_tpl);
    } else {
      $('.store-show .praise ul').height('2.64rem');
    }
  });
  $('.praise_more').live('click',function(){
    $('.praise_more').parent().remove();
    if($(this).hasClass('active')) {
      $(this).parent().remove();
      $('.store-show .praise ul li').eq(15).before(praise_more_tpl);
      $('.store-show .praise ul').height('2.64rem');
    } else {
      $(this).parent().remove();
      $('.store-show .praise ul').height('auto');
      $('.store-show .praise ul').append(praise_more_tpl);
      $('.praise_more').addClass('active');
      $('.praise_more').text('回收');
    }
  });
  // 评论加载更多
  var comment = $('.comment');
  var comment_bd = $('.comment_bd');
  var loading = false;
  // 初始化下拉
  var post_id = comment.data('id');
  var cur_cid;
  var is_load = false;
  var comment_list_tpl = handlebars.compile($("#comment_list_tpl").html());
  // 增加模板引擎判断
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  function add_data() {
    if (page.selector == '.page'){
      return false;
    }
    $.ajax({
      type: 'GET',
      url: '/index.php?g=Comment&m=Widget&a=ajax_more&table=posts',
      data: {
        post_id:post_id,
        cur_cid:cur_cid
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          // 添加继续
          comment_bd.append(comment_list_tpl(data));
          cur_cid = comment_bd.find('li').last().data('id');
          init.loadimg();
        } else if(data.status == 0) {
          // 没有数据，不继续加载
          is_load = true;
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+type);
      }
    });
  }
  page.on('infinite', function(){
  // 如果正在加载，则退出
  if (loading) return;
    // 设置flag
    loading = true;
    // 模拟1s的加载过程
    setTimeout(function() {
      // 重置加载flag
      loading = false;
      add_data();
      if (is_load) {
        // 加载完毕，则注销无限加载事件，以防不必要的加载
        $.detachInfiniteScroll($('.infinite-scroll'));
        // 删除加载提示符
        $('.infinite-scroll-preloader').remove();
        $.toast('😒 没有了');
        return;
      }
      $.refreshScroller();
    }, 500);
  });

  // 添加评论
  var comment_btn = $('#comment-btn');
  var footer_nav = $('.footer_nav');
  var comment_bd = $('.comment_bd');
  var dialog_comment = $('.dialog_comment');
  var father_comment = $('.father');
  var son_comment = $('.son');
  var comment_input = $('#comment_input');
  var reply_tpl = handlebars.compile($("#reply_tpl").html());

  // 弹出回复框
  function comment_box(id,ispic,username,element,is_father,is_comment) {
    comment_bd.on('click','.comment_image',function(){
      comment_bd.off('click','.comment_image');
      console.log('aaaaaa');
      return false;
    })
    if(!is_comment){

    } else {
      // 初始化
      comment_input.val('').attr('placeholder','随便说点什么');
      dialog_comment.find('button').removeAttr('disabled');
      dialog_comment.show();
      // 判断是否是回复
      if (username.length) {
        comment_input.attr('placeholder','回复：'+username);
      } else {
        comment_input.attr('placeholder','随便说点什么');
      }
      // 控制是否上传图片
      if (ispic) {
        dialog_comment.find('.image').show();
      } else {
        dialog_comment.find('.image').hide();
      }
      // 禁止滑动
      dialog_comment.on('touchmove',function(e){
        e.stopPropagation();
      });
      // 提交评论
      dialog_comment.on('click','.submit', function() {
        dialog_comment.off('click','.submit');
        dialog_comment.hide();
        dialog_comment.find('button').attr('disabled','disabled');
        // 过滤关键词
        var text_list = [
        '燃料',
        '大麻',
        '叶子',
        '淘宝',
        'taobao.com',
        '共产党'
        ];
        esc.init(text_list);
        // 判断是否为空并且过滤关键词
        if(!comment_input.val().length){
          comment_input.attr('placeholder','😒 评论不能为空');
        } else if (esc.find(comment_input.val()).length) {
          dialog_comment.hide();
          $.toast('🚔 我要报警了');
        } else {
          if(is_father) {
            var post_data = {
              content:comment_input.val(),
              post_table:comment.data('table'),
              post_id:comment.data('id'),
              to_uid:0,
              parentid:0,
              type:0,
              url:window.location.href
            }
          } else {
            var post_data = {
              content:comment_input.val(),
              post_table:comment.data('table'),
              post_id:comment.data('id'),
              to_uid:element.data('uid'),
              parentid:element.data('id'),
              type:0,
              url:window.location.href
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
                dialog_comment.hide();
                $.toast('😄 评论成功');
                // 添加评论dom
                if(is_father) {
                  // 回复直接添加底部
                  var reply_data = {
                   is_father:true,
                   comment:comment_input.val(),
                   username:comment.data('username'),
                   avatar:comment.data('avatar'),
                   uid:comment.data('uid'),
                   id:data.data.id};
                   comment_bd.append(reply_tpl(reply_data));
                 } else {
                  var reply_data = {
                   is_father:false,
                   comment:comment_input.val(),
                   username:comment.data('username'),
                   parent_full_name:element.data('username'),
                   uid:comment.data('uid'),
                   id:data.data.id};
                   if(element.hasClass('father')){
                    // 二级回复
                    if(!element.find('.comment-content .reply').length){
                      element.find('.comment-content').append('<ul class="reply"> </ul>');
                      element.find('.comment-content .reply').append(reply_tpl(reply_data));
                    }
                  } else {
                    //一级回复
                    element.parent('.reply').append(reply_tpl(reply_data));
                  }
                }
              } else {
                $.toast(data.info);
              }
              $.refreshScroller();
            },
            error: function(xhr, type){
              $.toast('网络错误 code:'+xhr);
            }
          });
        }
      });
      // 关闭按钮
      dialog_comment.on('click','.cancel', function() {
        dialog_comment.off('click','.cancel');
        dialog_comment.hide();
      });
    }
  }


    // 上传图片
    // var uploader = WebUploader.create({
    //   fileNumLimit: 1,
    //   // 自动上传。
    //   auto: true,
    //   // 文件接收服务端。
    //   server: 'http://hstest.ontheroadstore.com/index.php?g=api&m=HsFileupload&a=upload',
    //   // 二进制上传
    //   sendAsBinary: true,
    //   // 只允许选择文件，可选。
    //   accept: {
    //     title: 'Images',
    //     extensions: 'gif,jpg,jpeg,bmp,png,webp',
    //     mimeTypes: 'image/*'
    //   }
    // });
    // 监听input file是否有文件添加进来
    // dialog_comment.find('.updata_image_btn input').on("change", function(e) {
    //   uploader.addFiles(e.target.files);
    //   uploader.upload();
    // });
    // // 图片列队
    // uploader.onFileQueued = function(file) {
    //   console.log(file);
    // }
    // // 上传成功
    // uploader.onuploadSuccess = function(file,response) {
    //   console.log(file,response);
    // }
    // // 控制进度条
    // uploader.onuploadProgress = function(file,percentage) {
    //   console.log(file,percentage);
    // }
    // // 上传出错
    // uploader.onuploadError = function(file,reason) {
    //   console.log(file,reason);
    // }
    // // 选择时文件出错
    // uploader.onerror = function(type) {
    //   console.log(type);
    // }

  // 点击回复框
  $('.comment_bd').on('click','li',function(e){
    var comment_id = $(this).data('id');
    var username = $(this).data('username');
    comment_box(comment_id,false,username,$(this),false,true);
  });

  comment_btn.on('click',function(){
    var comment_id = $(this).data('id');
    comment_box(comment_id,true,'',$(this),true,true);
  });

});
