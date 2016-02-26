// 商品内容页
// 微信jssdk
var wx = require('weixin-js-sdk');
// 打赏框
require('../dialog_reward/dialog_reward.js');
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');



  // 微信预览图片
  // 微信jssdk 预览图片
  // http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html#.E9.A2.84.E8.A7.88.E5.9B.BE.E7.89.87.E6.8E.A5.E5.8F.A3
  $('.images ul li').tap(function(){
    var preview_list = [];
    $.each($('.images ul li'),function(index,item){
      preview_list.push($('.images ul li').eq(index).data('preview'));
    });
    wx.previewImage({
      current: $(this).data('preview'), // 当前显示图片的http链接
      urls: preview_list // 需要预览的图片http链接列表
    });
  })
  // 打赏行为
  $('.buy button').on('click',function(){
    $('.dialog_reward').dialog('show');
  })
  // 点赞
  $('.praise_btn').on('click',function(){

  })
  // 更多点赞列表

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
  })
// 评论加载更多
var comment = $('.comment');
  // 测试数据
  var comment_data = [{
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
        comment.find('.comment_bd').append(comment_tpl(comment_data));
        // 更新最后加载的序号
        pages++;
        $.refreshScroller();
      }, 1000);
    });
