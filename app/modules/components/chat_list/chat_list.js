// 私信聊天
// 微信jssdk
var wx = require('weixin-js-sdk');
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 过滤关键词
var esc = require('../../../../node_modules/chn-escape/escape.js');
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.chat', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

  // 回复私信
  var chat_list = $('.chat_list');
  var update_img_btn = $('.update_img_btn');
  var update_img_box = $('.update_img_box');
  var chat_content = $('.chat_content');
  var chat_footer = $('.chat-footer');
  var chat_reply_tpl = handlebars.compile($("#chat_reply_tpl").html());
  // 上传图片
  update_img_btn.on('click',function(e) {
    if(!$(this).hasClass('active')){
      $(this).addClass('active');
      update_img_box.show();
    } else {
      $(this).removeClass('active');
      update_img_box.hide();
    }
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
    '共产党'
    ];
    esc.init(text_list);

    if(!chat_content.val().length){
      chat_content.attr('placeholder','😒 内容不能为空');
    } else if (esc.find(chat_content.val()).length) {
      $.toast('🚔 我要报警了');
    } else {
      var reply_data = {
        content_type: 0,
        content: chat_content.val()
      }
      $.ajax({
        type: 'POST',
        url: '/index.php?g=restful&m=HsMessage&a=send',
        data: {
          to_uid: $(this).data('touid'),
          content_type: 0,
          content: chat_content.val()
        },
        dataType: 'json',
        timeout: 4000,
        success: function(data){
          if(data.status == 1){
            chat_list.find('ul').append(chat_reply_tpl(reply_data));
            $.toast('🌚 发送成功');
            $('.content').scrollTop(9999999);
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
        if(page_number >= data.total){
          // 加载完毕，则注销无限加载事件，以防不必要的加载
          $.destroyPullToRefresh($('.pull-to-refresh-content'));
          $.pullToRefreshDone('.pull-to-refresh-content');
          // 删除加载提示符
          $('.pull-to-refresh-layer').remove();
          $.toast('😒 没有更多了');
        } else {
          chat_list.find('ul').prepend(chat_tpl(data.data));
          page_number++;
          init.loadimg();
          $.pullToRefreshDone('.pull-to-refresh-content');
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+xhr);
      }
    });
  }
  // 初始化1页数据
  add_data(page_number);
  // 移动到底部
  $.refreshScroller();
  setTimeout(function(){
    $('.content').scrollTop($('.content ul').height());
  },100);
  // 监听下拉
  page.on('refresh', '.pull-to-refresh-content',function(e) {
   if (loading ) return;
    // 设置flag
    loading = true;
    setTimeout(function() {
      // 重置加载flag
      loading = false;
      // 添加数据
      console.log(page_number);
      add_data(page_number);
      $.refreshScroller();
    }, 500);
  });
  // 预览图
  page.on('click','.image',function(){
    wx.previewImage({
      current: $(this).data('preview')
    });
  });
});
