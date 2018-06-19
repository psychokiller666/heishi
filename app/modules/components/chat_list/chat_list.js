// 私信聊天
// 微信jssdk
var wx = require('weixin-js-sdk');
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 过滤关键词
var esc = require('../../../../node_modules/chn-escape/escape.js');
// 百度上传组件
var WebUploader = require('../../../../node_modules/tb-webuploader/dist/webuploader.min.js');
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.detail', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

  // 回复私信
  var chat_list = $('.chat_list');
  var update_img_btn = $('.update_img_btn');
  var update_img_box = $('.update_img_box');
  var chat_content = $('.chat_content');
  var chat_footer = $('.chat-footer');
  var chat_reply_tpl = handlebars.compile($("#chat_reply_tpl").html());
  var image_list = update_img_box.find('.image_list');
  var chat_footer_bd = $('.chat-footer-bd');

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
  // 上传图片
  update_img_btn.on('click',function(e) {
    if(!$(this).hasClass('active')){
      $(this).addClass('active');
      update_img_box.show();
    } else {
      $(this).removeClass('active');
      update_img_box.hide();

    }
    // 上传初始化
    uploader.reset();
  })
  // 监听input file是否有文件添加进来
  update_img_box.on("change",'.webuploader-element-invisible', function(e) {
    uploader.addFiles(e.target.files);
  });
  // 图片列队
  uploader.onFileQueued = function(file){
    // 控制回复按钮
    chat_footer_bd.find('button').attr('disabled','disabled');
    update_img_box.find('.updata_image_btn').hide();
    // 控制回复框
    chat_content.attr('disabled','disabled');
    chat_content.val('').attr('placeholder','文字和图片只能选一个');
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
    // 添加关闭按钮
    image_list.append('<button class="close" data-id="'+file.id+'"></button>');
    // 恢复提交按钮
    chat_footer_bd.find('button').removeAttr('disabled','disabled');
    // 消除进度条
    image_list.find('.progress').remove();
    // 删除上传框
    update_img_box.find('.updata_image_btn').remove();
    // type状态等于4
    if(response.status == 1) {
      image_list.attr('data-imgurl',response.data);
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
    update_img_box.find('.updata_image_btn').remove();
    image_list.before('<div class="updata_image_btn"><button class="hs-icon" type="button"></button><input type="file" name="file" class="webuploader-element-invisible" accept="image/*" single></div>');
    image_list.empty();
    image_list.removeAttr('data-imgurl');
    chat_content.val('').attr('placeholder','回复');
    chat_content.removeAttr('disabled');
    chat_content.show();
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
    uploader.reset();
  })
  // 输入框得到焦点时
  chat_content.on('focus',function(){
    update_img_box.hide();
    update_img_btn.removeClass('active');
  })
  // 提交私信
  chat_footer.find('.submit').on('click',function(){
    // 过滤关键词
    var text_list = [
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
    esc.init(text_list);
    var content;
    var content_type;
    if(image_list.attr('data-imgurl')){
      content = image_list.attr('data-imgurl');
      content_type = 1;
    } else {
      content = chat_content.val();
      content_type = 2;
    }
    if(!content){
      chat_content.attr('placeholder','😒 内容不能为空');
    } else if (esc.find(chat_content.val()).length) {
      $.toast('🚔 我要报警了');
    } else {
      var reply_data = {
        content_type: content_type,
        content: content
      }
      $.ajax({
        type: 'POST',
        url: '/index.php?g=restful&m=HsMessage&a=send',
        data: {
          to_uid: $(this).data('touid'),
          content_type: reply_data.content_type,
          content: reply_data.content
        },
        dataType: 'json',
        timeout: 4000,
        success: function(data){
          if(data.status == 1){
            chat_list.find('ul').append(chat_reply_tpl(reply_data));
            $.toast('🌚 发送成功');
            $('.content').scrollTop(9999999);
            update_img_btn.removeClass('active');
            update_img_box.hide();
            uploader.reset();
            init.loadimg();
          } else {
            $.toast(data.info);
          }
          // 重置对话框
          chat_content.val('');
          $.refreshScroller();
          $('.content').scrollTop($('.content ul').height());
        },
        error: function(xhr, type){
          $.toast('网络错误 code:'+xhr);
        }
      });
    }
  });

  // 最后一次购买
  var chat_header_bd = $('.chat-header-bd');
  var recent_box = $('.recent_box');
  recent_box.css('top',$('.chat-header').height());
  var recent_tpl = handlebars.compile($("#recent_tpl").html());
  var recent_btn = $('.recent_btn');
  recent_btn.on('click',function(e) {
    var _this = $(this);
    if(!$(this).hasClass('active')){
      $(this).addClass('active');
      $.ajax({
        type: 'POST',
        url: '/index.php?g=User&m=HsMessage&a=ajax_query_order',
        data: {
          object_owner_uid: $(this).data('id'),
          user_id: $(this).data('uid')
        },
        dataType: 'json',
        timeout: 4000,
        success: function(data){
          if(data.status == 1){
            recent_box.html(recent_tpl(data.data));
            recent_box.show();
            chat_header_bd.css('background-color','#ededed');
          } else {
            $.toast(data.info);
            recent_btn.off('click');
            _this.remove();
          }

        },
        error: function(xhr, type){
          $.toast('网络错误 code:'+xhr);
        }
      });
    } else {
      $(this).removeClass('active');
      recent_box.hide();
      chat_header_bd.css('background-color','#fff');
    }
  })


  // 上拉加载更多
  var loading = false;
  // 初始化下拉
  var page_number = 1;
  var chat_tpl = handlebars.compile($("#chat_tpl").html());
  // 增加handlebars判断
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  handlebars.registerHelper("chat_owner", function(v1, options) {
    var v2;
    if (v1 == chat_list.data('owner')) {
      v2 = 'me';
    } else {
      v2 = 'others';
    }
    return v2;
  });
  handlebars.registerHelper("chat_avatar", function(v1, options) {
    if (v1 == chat_list.data('owner')) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  // 增加数据
  function add_data(pages){

    $.ajax({
      type: 'POST',
      url: '/index.php?g=user&m=HsMessage&a=ajax_details',
      data: {
        from_uid: chat_list.data('touid'),
        page: page_number
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          // if(page_number >= data.pages){
          //   // 加载完毕，则注销无限加载事件，以防不必要的加载
          //   $.destroyPullToRefresh($('.pull-to-refresh-content'));
          //   $.pullToRefreshDone('.pull-to-refresh-content');
          //   // 删除加载提示符
          //   $('.pull-to-refresh-layer').remove();
          //   $.toast('😒 没有更多了');
          //   return false;
          // }

          // 初始化加载
          chat_list.find('ul').prepend(chat_tpl(data.data));
          init.loadimg();
          if(page_number == 1){
            $.refreshScroller();
            $('.content').scrollTop($('.content ul').height());
          }
          if($('.content').height() > $('.content ul').height()){
            // 加载完毕，则注销无限加载事件，以防不必要的加载
            $.destroyPullToRefresh($('.pull-to-refresh-content'));
            $.pullToRefreshDone('.pull-to-refresh-content');
            // 删除加载提示符
            $('.pull-to-refresh-layer').remove();
            return false;
          }

          page_number++;
          // init.loadimg();
          $.pullToRefreshDone('.pull-to-refresh-content');
        } else if(data.status == 0) {
          // 加载完毕，则注销无限加载事件，以防不必要的加载
          $.destroyPullToRefresh($('.pull-to-refresh-content'));
          $.pullToRefreshDone('.pull-to-refresh-content');
          // 删除加载提示符
          $('.pull-to-refresh-layer').remove();
          // $.toast('😒 没有更多了');
        }

      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+xhr);
      }
    });
  }
  // 初始化1页数据
  add_data(page_number);

  // 监听下拉
  page.on('refresh', '.pull-to-refresh-content',function(e) {
   if (loading ) return;
    // 设置flag
    loading = true;
    setTimeout(function() {
      // 重置加载flag
      loading = false;
      // 添加数据
      add_data(page_number);
      $.refreshScroller();
    }, 500);
  });
  // 预览图
  page.on('click','.image',function(){
    wx.previewImage({
      current: $(this).data('preview'),
      urls: [$(this).data('preview')]
    });
  });
});
