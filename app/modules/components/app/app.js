// 商品列表 和 商品内容页逻辑
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 图片延时加载
var Layzr = require('../../../../node_modules/layzr.js/dist/layzr.js');
// 百度上传组件
var WebUploader = require('../../../../node_modules/tb-webuploader/dist/webuploader.min.js');
// 过滤关键词
var esc = require('../../../../node_modules/chn-escape/escape.js');

$(document).on("pageInit", function (e, id, page) {
  // 控制.hs-main高度
  if($('.hs-page').length){
    if($('header').length){
      $('.hs-main').css('top',$('header').height());
    } else {
      $('.hs-main').css('top','0');
    }
    if($('footer').length){
      $('.hs-main').css('bottom',$('footer').height());
    } else {
      $('.hs-main').css('bottom','0');
    }
  }
  // 图片加载
  new Layzr({
    threshold: 50
  });
  // 测试数据
  var data = [{
    object_id: "10",
    term_id: "1",
    listorder: "0",
    post_author: "11",
    post_keywords: "点击选择...",
    post_date: "2015-08-14 13:03:30",
    post_title: "fff",
    post_excerpt: "屎",
    post_status: "1",
    post_modified: "08-14",
    post_type: "1",
    comment_count: "8",
    post_hits: "60",
    post_like: "5",
    filepath: "upload/150814/4b43e6d450e19f59c090e41ba6b92937.jpg",
    bgcolor: 2,
    type_name: "摆摊d"
  },
  {
    object_id: "11",
    term_id: "1",
    listorder: "0",
    post_author: "12",
    post_keywords: "点击选择...",
    post_date: "2015-08-14 13:07:20",
    post_title: "李根最牛逼的黑胖子",
    post_excerpt: "我的描述就是屎 就是屎 就是屎 ",
    post_status: "1",
    post_modified: "08-14",
    post_type: "1",
    comment_count: "39",
    post_hits: "53",
    post_like: "8",
    filepath: "upload/150814/c20554a0acd1ce5999c3e4e16d44bb67.jpg",
    bgcolor: 3,
    type_name: "摆摊"
  }];
  // 商品列表页
  if($('.show-list').length) {
      // 测试数据
      var store_list = $('.store_list');
      // 下拉加载更多
      var loading = false;
      // 初始化下拉
      var page_size = 2;
      var pages = 1;
      page.on('infinite', function() {
      // 如果正在加载，则退出
      if (loading) return;
      // 设置flag
      loading = true;
      // 模拟1s的加载过程
      setTimeout(function() {
        // 重置加载flag
        loading = false;
        if (pages >= page_size) {
          // 加载完毕，则注销无限加载事件，以防不必要的加载
          $.detachInfiniteScroll($('.infinite-scroll'));
          // 删除加载提示符
          $('.infinite-scroll-preloader').remove();
          $.toast('😒 没有了');
          return;
        }
        var store_list_tpl = handlebars.compile($("#store_list_tpl").html());
        store_list.find('ul').append(store_list_tpl(data));
        // 更新最后加载的序号
        pages++;
        $.refreshScroller();
      }, 1000);
    });
    }

    // 商品内容页
    if($('.store-show').length) {
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
          $('.store-show .praise ul').height('1.14rem');
        } else if (index >= 16){
          $('.store-show .praise ul li').eq(15).before(praise_more_tpl);
        } else {
          $('.store-show .praise ul').height('2.62rem');
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
      var loading = false;
      // 初始化下拉
      var page_size = 2;
      var pages = 1;
      page.on('infinite', function() {
      // 如果正在加载，则退出
      if (loading) return;
      // 设置flag
      loading = true;
      // 模拟1s的加载过程
      setTimeout(function() {
        // 重置加载flag
        loading = false;
        if (pages >= page_size) {
          // 加载完毕，则注销无限加载事件，以防不必要的加载
          $.detachInfiniteScroll($('.infinite-scroll'));
          // 删除加载提示符
          $('.infinite-scroll-preloader').remove();
          $.toast('😒 没有了');
          return;
        }
        var comment_tpl = handlebars.compile($("#comment_tpl").html());
        comment.find('.comment_bd').append(comment_tpl(data));
        // 更新最后加载的序号
        pages++;
        $.refreshScroller();
      }, 1000);
    });
    }

    // 添加评论
    var comment_btn = $('#comment-btn');
    var footer_nav = $('.footer_nav');
    var dialog_comment = $('.dialog_comment');
    var comment_bd = $('.comment_bd');
    var father_comment = $('.father');
    var son_comment = $('.son');
    var comment_input = $('#comment_input');
    var reply_tpl = handlebars.compile($("#reply_tpl").html());

    // 弹出回复框
    function comment_box(id,ispic,username,element,is_father) {
      dialog_comment.show();
      // 判断是否是回复
      if (username.length) {
        comment_input.attr('placeholder','回复：'+username);
      } else {
        comment_input.attr('placeholder','随便说点什么');
      }
      comment_input.focus();
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
      // 控制关闭
      dialog_comment.find('.cancel').on('click',function(){
        dialog_comment.hide();
        return false;
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
          var reply_data = {
            is_father:is_father,
            comment:comment_input.val()
          }
          console.log(is_father,element.find('.comment-content ul').length);
          if(!is_father){
            if(!element.find('.comment-content ul').length){
              element.find('.comment-content').append('<ul class="reply"></ul>');
            }
            element.find('.comment-content ul').append(reply_tpl(reply_data));
          } else {
            element.parent('ul').append(reply_tpl(reply_data));
          }
          console.log(element.parent('ul'));
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
      server: 'http://hstest.ontheroadstore.com/index.php?g=api&m=HsFileupload&a=upload',
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

  // 点击评论回复
  comment_bd.find('li').on('click',function(){
    var comment_id = $(this).data('id');
    var username = $(this).data('username');
    var is_father;
    if($(this).hasClass('father')){
      is_father = false;
    } else {
      is_father = true;
    }
    comment_box(comment_id,false,username,$(this),is_father);
    return false;
  });
  // 点击写评论
  comment_btn.on('click',function(){
    var comment_id = $(this).data('id');
    comment_box(comment_id,true,'');
  })



  // require('test.js');
});
$.init();
