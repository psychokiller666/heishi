// 私信列表
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.chat_list_group', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  // 检查是否有新的消息
  init.msg_tip();
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
  // $('.chat_list_group_bd ul').on("touchmove","li",function(){
  //   console.log("Asd");
  // });
  // 从右往左滑
  $('.chat_list_group_bd ul').on("swipeLeft","li",function(){
    var _this = $(this);
    $('.btn-box').hide();
    $('.chat_list_group_bd ul li').height($('.chat_list_group_bd ul li').height());
    $('.chat_list_group_bd ul li').find('.btn-box').height($('.chat_list_group_bd ul li').height());
    $('.chat_list_group_bd ul li').removeClass('active');
    $('.btn-box',this).animate({
      display: 'block'
    }, 500, 'ease-in');
    $(this).addClass('active');
    // 删除聊天
    _this.on('click','.delete',function(){
      $.post('/index.php?g=User&m=HsMessage&a=ajax_delete_list',{
        mid: $(this).data('mid')
      },function(data){
        if(data.status == 1) {
          _this.remove();
          $.toast(data.info);
        } else {
          $.toast(data.info);
        }
      });
    });
    //置顶
    _this.on('click','.stick',function(){
      $.post('/User/HsMessage/ajax_setting_top',{
        mid: $(this).data('mid')
      },function(data){
        if(data.status == 1) {
          $.toast(data.info);
          setTimeout(function(){
            location.reload();
          },500);
        } else {
          $.toast(data.info);
        }
      });
    });
  });
  // 从左往右滑
  $('.chat_list_group_bd ul').on("swipeRight","li",function(){
    $('.btn-box').hide();
    $(this).removeClass('active');
  });

  // 下拉加载
  var chat_list_group_bd = $('.chat_list_group_bd');
  // 下拉加载更多
  var loading = false;
  // 初始化下拉
  var pages = 2;
  var chat_list_group_bd_tpl = handlebars.compile($("#chat_list_group_bd_tpl").html());
  // 增加handlebars判断
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  if($('.chat_list_group_bd').find('li').length != 10){
    $.detachInfiniteScroll($('.infinite-scroll'));
    // 删除加载提示符
    $('.infinite-scroll-preloader').remove();
    return false;
  }

  function add_data(pagess){
    $.ajax({
      type: 'POST',
      url: '/index.php?g=user&m=HsMessage&a=ajax_lists',
      data: {
        page: pagess
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1) {
          if(data.pages == pages){
            $.detachInfiniteScroll($('.infinite-scroll'));
            // 删除加载提示符
            $('.infinite-scroll-preloader').remove();
          }
          chat_list_group_bd.find('ul').append(chat_list_group_bd_tpl(data.data));
          pages++;
          init.loadimg();
        } else if(data.status == 0) {
          $.detachInfiniteScroll($('.infinite-scroll'));
          // 删除加载提示符
          $('.infinite-scroll-preloader').remove();
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+xhr);
      }
    });
  }

  // 初始化加载1页
  // add_data(pages);

  page.on('infinite', function() {
    // 如果正在加载，则退出
    if (loading) return;
    // 设置flag
    loading = true;
    // 模拟1s的加载过程
    setTimeout(function() {
      // 重置加载flag
      loading = false;
      add_data(pages);

    }, 1000);
  });

});
