// 发布页
// 页面初始化
var common = require('../common/common.js');
// 百度上传组件
var WebUploader = require('../../../../node_modules/tb-webuploader/dist/webuploader.min.js');

$(document).on('pageInit','.add', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  // 上传图片
  var images = $('.images');

  var uploader = WebUploader.create({
    fileNumLimit: 16,
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
    console.log(e.target.files);
    console.log(e);
    if($(this).offsetParent().className == 'cover') {
      console.log('头图');
    } else {
      console.log('不是头图');
    }
    uploader.addFiles(e.target.files);
  });

  // 选择标签
  var tags = $('.tags');
  var tags_num = tags.find('button.active').length;
  // 返回选中标签
  function get_tags(tags_list){
    var tags_list = [];
    tags.find('button.active').each(function(index,item){
      JSON.stringify(tags_list.push($(item).text()));
    });
    return tags_list;
  }
  tags.find('button').on('click',function(e) {
    if(tags_num >= 2){
      if($(this).hasClass('active')){
        $(this).removeClass('active');
        tags_num--;
      } else {
        $.toast("😕 标签最多选2个");
      }
    } else {
      if(!$(this).hasClass('active')){
        $(this).addClass('active');
        tags_num++;
      } else {
        $(this).removeClass('active');
        tags_num--;
      }
    }
  })

  // 提交
  $('.submit').on('click',function(){
    console.log(get_tags());
  })

});
$.init();

