// 提现
// 页面初始化
var common = require('../common/common.js');
// 百度上船
var WebUploader = require('../../../../node_modules/tb-webuploader/dist/webuploader.min.js');

$(document).on('pageInit','.complaints_page', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  // 图片上传
  var images = $('.photo');
  var submit_btn = $('.hs-footer .submit');
  var picture_list = [];
  // 从数组里删除file
  Array.prototype.remove = function(id){
    var result;
    var _this = this;
    $.each(this,function(index,item){
      if(item.id == id){
       _this.splice(index,1);
     }
   })
    return this.push.apply(this,result);
  };
  // 限制图片数量
  var max_pic_number = 4;
  // WebUploader 初始化
  var uploader = WebUploader.create({
    fileNumLimit: max_pic_number,
    // 自动上传。
    auto: true,
    // 文件接收服务端。
    server: '/index.php?g=api&m=HsFileupload&a=upload',
    // 二进制上传
    sendAsBinary: true,
    // 只允许选择文件，可选。
    accept: {
      title: 'Images',
      extensions: 'gif,jpg,jpeg,bmp,png',
      mimeTypes: 'image/*'
    }
  });
  // 监听input file是否有文件添加进来
  images.on('change','.webuploader-element-invisible', function(e) {
    var is_add_li = true;
    var _this = e.srcElement.parentNode;
    var pic_number = images.find('li').length;

    // 当单个文件被添加进来的时候
    uploader.onFileQueued = function(file){
      // 生成缩略图
      uploader.makeThumb(file,function(error,ret){
        if(error){
          $(_this).find('.image').text('预览错误');
        } else {
          $(_this).find('.image img').remove();
          $(_this).find('.remove_btn').remove();
          $(_this).find('.image').attr('data-id',file.id);
          $(_this).find('.image').append('<img src="'+ret+'" />');
        }
      });
    }
    // 上传图片
    uploader.addFiles(e.target.files);
    // 进度条
    uploader.onUploadProgress = function(file, percentage){
      var progress_tpl = '<div class="progress"><span></span></div>';
      $(_this).find('.image').append(progress_tpl);
      $(_this).find('.image .progress span').css('width', percentage * 100 + '%');
    }
    // 文件开始上传的时候
    uploader.onStartUpload = function(){
      // 控制提交按钮
      submit_btn.attr('disabled','disabled');
    }
    // 所有文件上传结束的时候
    uploader.onUploadFinished = function(){
      // 控制提交按钮
      submit_btn.removeAttr('disabled');
    }
    // 图片上传成功
    uploader.onUploadSuccess = function(file, data){
      if(data.status==1){
        // 添加删除按钮
        var remove_button = '<button class="remove_btn hs-icon"></button>';
        $(_this).append(remove_button);
        // 销毁进度条
        $(_this).find('.image .progress').remove();
        // 添加push数组
        picture_list.push({
          id:file.id,
          filepath:data.data,
        });
        var li_tpl = '<li><div class="image"></div><button type="button" class="updata_btn hs-icon"></button><input type="file" name="file" class="webuploader-element-invisible" accept="image/*" single></li>';
        if(pic_number < max_pic_number) {
          images.find('ul').append(li_tpl);
        }
      }
    }
    uploader.onUploadError = function(file,data){
      uploader.removeFile(file);
      picture_list.remove(file.id);
      $('[data-id="'+file.id+'"]').remove();
      $.toast('请重新上传图片');
      submit_btn.removeAttr('disabled');
    }
    uploader.onError = function(type){
      if(type == 'Q_EXCEED_NUM_LIMIT'){
        $.toast('最多可上传'+max_pic_number+'张');
        images.find('li').last().remove();
      } else if(type == 'Q_EXCEED_SIZE_LIMIT') {
        $.toast('太大了，不让传');
      } else if(type == 'Q_TYPE_DENIED') {
        $.toast('兄弟必须是图片');
      }
    }
  });
  // 删除图片
  images.on('click','.remove_btn',function(e){
    images.off('click',this);
    var id = $(this).parent().find('.image').data('id');
    $(this).parent().find('.image img').remove();
    $(this).parent().find('.image').removeAttr('data-id');
    picture_list.remove(id);
    uploader.removeFile(uploader.getFile(id));

    var pic_number = images.find('li').length;
    if(pic_number != 1){
      $(this).parent().remove();
    }
    $(this).remove();

  });
  var submit_box = $('.submit_box');
  function get_telphone() {
    var result = false;
    if($('.telphone').val().length == 11){
      result = true;
    } else {
      $.toast('不会好好写电话？');
    }
    return result;
  }
  function get_memo() {
    var result = false;
    if($('.memo').val().length){
      result = true;
    } else {
      $.toast('写点详细内容行吗？');
    }
    return result;
  }

  submit_btn.on('click',function(){
    var _this = this;
    $(_this).attr('disabled','disabled');
    if(get_telphone() && get_memo()){
      $.post('/index.php?g=user&m=HsOrder&a=compliant_action',{
        telphone:$('.telphone').val(),
        order_number:$('.complaints_page').data('ordernumber'),
        seller_uid:$('.complaints_page').data('selleruid'),
        memo: $('.memo').val(),
        pic_list: JSON.stringify(picture_list),
        pic_number: picture_list.length
      },function(data){
        if(data.status == 1){
          submit_box.show();
        } else {
          $.toast(data.info);
          $(_this).removeAttr('disabled');
        }
      })
    }
  })
});
