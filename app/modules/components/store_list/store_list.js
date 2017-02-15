// 商品列表
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.show-list', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

  // 调用微信分享sdk
  var share_data = {
    title: '黑市 | 美好而操蛋的东西',
    desc: '这里能让好事自然发生',
    link: GV.HOST+location.pathname,
    img: 'http://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
  };
  init.wx_share(share_data);
  init.checkfollow(1);
  // 检查是否有新的消息
  init.msg_tip();
  // 系统公告
  var placard = $('.placard');
  var placard_content;
  var placard_id;
  if(placard.attr('data-placard').length){
    placard.show();
    placard_content = placard.attr('data-placard').split('|')[1];
    placard_id = placard.attr('data-placard').split('|')[0];
    placard.find('.placard_content').text(placard_content);
  } else {
    placard.hide();
  }
  placard.on('click','.placard_close',function(){
    $.post('/index.php?g=restful&m=HsSystemNotice&a=disabled',{
      notice_id:placard_id
    },function(res){
      if(res.status == 1 ){
        placard.hide();
      } else {
        $.alert(res.info);
      }
    })
  })
  // 搜索按钮
  var search_box = $('.search_box');
  $('.search_btn').on('click',function(){
    search_box.show();
    search_box.find('input').trigger('focus');

    search_box.on('click','button',function(){
      var _this = $(this);
      var ctype = _this.data('ctype');
      var isculture = _this.data('isculture');
      search_box.off('click','button');
      if(!search_box.find('input').val().length){
        search_box.hide();
      } else {
        window.location.href = '/index.php?g=portal&m=HsSearch&ctype='+ctype+'&isculture='+isculture+'&keyword='+search_box.find('input').val();
      }
    });

    search_box.on('click',function(e){
      // $(this).off('click');
      if(e.srcElement.className == 'search_box'){
        search_box.hide();
      }
    });
  });
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
  var store_list = $('.store_list');
  $('.infinite-scroll-preloader').remove();
  //判断是否出现翻页
  if($(".store_list").data("pages") == 1){
      $(".pages").addClass("hide");
  }
  var alerts = true;
  // 监听滚动
  page.on('infinite','.infinite-scroll', function(e) {
    var pages = $(".store_list").data("pages");
    var curpage = $(".store_list").data("curpage");
    if(pages == curpage && alerts && pages == 1){
      $.toast('没有更多数据了');
      alerts = false;
    }
  });
  // 搜索加载页
  var search_list = $('.search-list');
  if(search_list.length){
    // 初始化加载
    if(store_list.data('isculture') == 1){
      store_list.addClass('culture_list').removeClass('store_list');
      $('.hs-footer').find('li a').removeClass('active');
      $('.hs-footer').find('li a').eq(1).addClass('active');
    }
  }
});
