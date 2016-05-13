// 百度上传组件
var WebUploader = require('../../../../node_modules/tb-webuploader/dist/webuploader.min.js');
// 过滤关键词
var esc = require('../../../../node_modules/chn-escape/escape.js');

if ($('.comment').length){
  // 添加评论
  var comment_btn = $('#comment-btn');
  var footer_nav = $('.footer_nav');
  var dialog_comment = $('.dialog_comment');
  var father_comment = $('.father');
  var son_comment = $('.son');
  var comment_input = $('#comment_input');

  // 弹出回复框
  function comment_box(id,username,ispic) {
    dialog_comment.show();
    // 判断是否是回复
    if (username) {
      comment_input.attr('placeholder','回复：'+username);
    }
    comment_input.focus();
    // 控制是否上传图片
    if (ispic) {
      dialog_comment.find('.image').hide();
    }
    // 禁止滑动
    dialog_comment.on('touchmove',function(e){
      e.stopPropagation();
    });
    // 控制关闭
    dialog_comment.find('.cancel').on('click',function(){
      dialog_comment.hide();
    });
    // 提交评论
    dialog_comment.find('.submit').on('click',function(){
      dialog_comment.find('.submit').off('click');
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
      if(!comment_input.val().length){
        comment_input.attr('placeholder','😒 评论不能为空');
      } else if (esc.find(comment_input.val()).length) {
        dialog_comment.hide();
        $.toast('🚔 我要报警了');
      } else {
        dialog_comment.hide();
        $.toast('😄 评论成功');
      }
      // 重置按钮及对话框
      comment_input.val('').attr('placeholder','随便说点什么');
      dialog_comment.find('button').removeAttr('disabled');
    });

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
    // 监听input file是否有文件添加进来
    dialog_comment.find('.updata_image_btn input').on("change", function(e) {
      uploader.addFiles(e.target.files);
      uploader.upload();
    });
    // 图片列队
    uploader.onFileQueued = function(file) {
      console.log(file);
    }
    // 上传成功
    uploader.onuploadSuccess = function(file,response) {
      console.log(file,response);
    }
    // 控制进度条
    uploader.onuploadProgress = function(file,percentage) {
      console.log(file,percentage);
    }
    // 上传出错
    uploader.onuploadError = function(file,reason) {
      console.log(file,reason);
    }
    // 选择时文件出错
    uploader.onerror = function(type) {
      console.log(type);
    }

  }


  // 点击写评论
  comment_btn.on('click',function(e){
    $(this).addClass('active');
    comment_box('a');
  });


  // 点击评论框
  father_comment.on('click',function(){
    var comment_id = $(this).data('id');
    var username = $(this).find('.username .hs-fl').text();
    comment_box(comment_id,username);
  })

  // 点击回复框
  son_comment.on('click',function(){
    var comment_id = $(this).data('id');
    var username = $(this).find('.span').text();
    comment_box(comment_id,username,'1');
  })
}
