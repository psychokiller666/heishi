// 用户中心页
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.center', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  // 检查是否有新的消息
  init.msg_tip();
  // 高度补丁
  $('.hs-main').css('top','0');
  // 列表首页_通用底部发布
  var hs_footer = $('.hs-footer');
  var notice_box = $('.notice_box');
  var notice_bd = $('.notice_bd');
  var old_active;
  // 记录位置
  hs_footer.find('li').each(function(index,item) {
    if($(item).find('a').hasClass('active')) {
      old_active = index
    }
  })
  hs_footer.on('click','.notice_btn',function() {
    if(!$(this).find('a').hasClass('active')){
      hs_footer.find('li a').removeClass('active');
      $(this).find('a').addClass('active');
      notice_box.show();
      notice_box.css('bottom',hs_footer.height()-2);
    } else {
      $(this).find('a').removeClass('active');
      hs_footer.find('li').eq(old_active).find('a').addClass('active');
      notice_box.hide();
    }
  })
  notice_bd.on('click','a',function(e){
    var typeid = $(this).data('typeid');
    e.preventDefault();
    $.showPreloader();
    $.post('/index.php?g=restful&m=HsMobile&a=ajax_mobile_checking','',function(data){
      if(data.status == 1){
        $.hidePreloader();
        $('.phone_verify').find('.submit').attr('href','/user/HsPost/notice/type/'+typeid+'.html');
        $('.phone_verify').show();
      } else {
        // $.toast(data.info);
        $.hidePreloader();
        $.router.load('/user/HsPost/add/type/'+typeid+'.html', true);
      }
    })

    $('.notice_btn').find('a').removeClass('active');
    hs_footer.find('li').eq(old_active).find('a').addClass('active');
    notice_box.hide();
  })
  $('.phone_verify').on('click','.modal-overlay',function(){
    $('.phone_verify').hide();
  })

  // 别人的个人中心
  var store_list = $('.store_list');
  var attention_btn = $('.attention-btn');
  if(store_list.length){
    // 检查是否关注
    if(attention_btn.length){
      $.post('/index.php?g=user&m=HsFellows&a=ajax_relations',{
        my_uid:attention_btn.data('myuid'),
        other_uid:attention_btn.data('id')
      },function(data){
        if(data.relations == '2' || data.relations == '3') {
          attention_btn.addClass('active');
          attention_btn.text('取消关注');
        } else if(data.relations == '1' || data.relations == '0') {
          attention_btn.removeClass('active');
          attention_btn.html('关注');
        }
      });
    // 操作关注 & 取消关注
    attention_btn.on('click',function(){

      if($(this).hasClass('active')){
        // 取消关注
        $.post('/index.php?g=user&m=HsFellows&a=ajax_cancel',{
          uid:$(this).data('id')
        },function(data){
          if(data.status == '1') {
            attention_btn.text('关注');
            attention_btn.removeClass('active');
            $.toast(data.info);
          } else {
            $.toast(data.info);
          }
        });
      } else {
        // 关注
        $.post('/index.php?g=user&m=HsFellows&a=ajax_add',{
          uid:$(this).data('id')
        },function(data){
          if(data.status == '1') {
            attention_btn.text('取消关注');
            attention_btn.addClass('active');
            $.toast(data.info);
          } else {
            $.toast(data.info);
          }
        });
      }
    });
  }

  if(store_list.find('li').length <= 19) {
    $('.infinite-scroll-preloader').remove();
  } else {
    var loading = false;
    var page_num = 2;
    var pages;
    var page_size = 20;
    var post_id = store_list.data('id');
    var store_list_tpl = handlebars.compile($("#store_list_tpl").html());
    function add_data(page_size,page) {
      $.ajax({
        type: 'POST',
        url: '/index.php?g=User&m=index&a=ajax_more_articles',
        data: {
          id:post_id,
          page:page_num,
          page_size:page_size
        },
        dataType: 'json',
        timeout: 4000,
        success: function(data){
          if(data.status == 1){
            store_list.find('ul').append(store_list_tpl(data.data));
              // 更新最后加载的序号
              pages = data.pages;
              page_num++;
              store_list.attr('pagenum',page_num);
              store_list.attr('pages',data.pages);
              init.loadimg();
            } else {
              $.toast('请求错误');
            }
          },
          error: function(xhr, type){
            $.toast('网络错误 code:'+type);
          }
        });
    }
    // 监听滚动
    page.on('infinite', function() {
      // 如果正在加载，则退出
      if (loading) return;
      // 设置flag
      loading = true;
      setTimeout(function() {
        loading = false;
        if (page_num >= pages) {
          // 加载完毕，则注销无限加载事件，以防不必要的加载
          $.detachInfiniteScroll($('.infinite-scroll'));
          // 删除加载提示符
          $('.infinite-scroll-preloader').remove();
          $.toast('😒 没有了');
          return;
        }
        // 请求数据
        add_data(page_size,page);
      },500);
      $.refreshScroller();
    });
  }
}
});
