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
  // 检测用户是否产生跨号支付留有待购买商品
  $.ajax({
    type: 'GET',
    url: '/index.php?g=restful&m=HsArticle&a=ajax_check_last_goods',
    timeout: 4000,
    success: function(data){
      if(data.status == 1){
        var id = data.data.id;
        var post_title = data.data.post_title;
        var filepath = data.data.filepath;
        var img_url = $('.img_url').val() + filepath + '@640w_1l';
        $('.hint_purchase').find('img').attr('src', img_url);
        $('.hint_purchase').find('h3').text(post_title);
        $('.hint_purchase').find('.btn').on('click',function(){
          delete_last_goods();
          var url = '/Portal/HsArticle/index/id/'+id+'.html';
          location.href = url;
        })
        $('.hint_purchase').find('.close').on('click',function(){
          delete_last_goods();
          $('.hint_purchase').css('display','none');
        })
        $('.hint_purchase').css('display','block');
      }
    }
  });
  function delete_last_goods(){
    $.ajax({
      type: 'GET',
      url: '/index.php?g=restful&m=HsArticle&a=ajax_delete_last_goods',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          console.log(data);
        }
      }
    });
  }
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
    $.post('/index.php?g=datatful&m=HsSystemNotice&a=disabled',{
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
        window.location.href = '/Portal/index/search.html?query='+search_box.find('input').val();
        // window.location.href = '/index.php?g=portal&m=HsSearch&ctype='+ctype+'&isculture='+isculture+'&keyword='+search_box.find('input').val();
      }
    });
    search_box.on('click',function(e){
      if(e.srcElement.className == 'search_box'){
        search_box.hide();
      }
    });
  });
  // swiper配置
  var mySwiper = new Swiper ('.swiper-container',{
    lazyLoading: true,
    autoplay : 3000,
    speed:300,
    autoplayDisableOnInteraction : false,
    loop: true,
    pagination : '.swiper-pagination',
  })
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
  // 下拉加载更多
  var loading = false;
  // 初始化下拉

  var store_list_tpl = handlebars.compile($("#store_list_tpl").html());
  // 增加handlebars判断
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  // 控制翻页
  var control_pages = {
    init:function(){
      if(store_list.data('curpage') > 1){
        this.show_page();
      }
    },
    get_subpage:function(){
      if(store_list.data('subpage') < 5){
        store_list.attr('data-subpage',store_list.data('subpage')+1);
      }
      return store_list.attr('data-subpage');
    },
    get_page:function(){
      return store_list.attr('data-page');
    },
    show_page:function(){
      $('.pages').removeClass('hide');
      // 注销滚动
      $.detachInfiniteScroll($('.infinite-scroll'));
      $('.infinite-scroll-preloader').remove();
    },
    get_ajax_data:function(){
      var r_page = this.get_page(),
      r_subpage = this.get_subpage();
      return {
        page:r_page,
        pages:store_list.attr('data-pages'),
        page_size:store_list.attr('data-pagesize'),
        ctype:store_list.attr('data-ctype'),
        keyword:store_list.attr('data-keyword'),
        is_culture:store_list.attr('data-isculture'),
        subpage:r_subpage
      }
    }
  }
  control_pages.init();
  // function add_data
  function add_data(ajax_data) {
    $.ajax({
      type: 'POST',
      url: '/index.php?g=portal&m=index&a=ajax_index_list',
      data: ajax_data,
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          if (ajax_data.page >= data.pages) {
            $.detachInfiniteScroll($('.infinite-scroll'));
            $('.infinite-scroll-preloader').remove();
            $.toast('没有了');
          } else {
            store_list.find('ul').append(store_list_tpl(data));
            // 图片加载
            init.loadimg();
            if(ajax_data.subpage >= 5){
              control_pages.show_page();
            }
          }
          if(ajax_data.keyword){
            if(!data.data.length){
              if(!store_list.find('li').length){
                store_list.append('<div class="no_data">毛都没找到</div>');
              }
              $.detachInfiniteScroll($('.infinite-scroll'));
              $('.infinite-scroll-preloader').remove();
            }
            if(ajax_data.subpage >= 5){
              $.detachInfiniteScroll($('.infinite-scroll'));
              $('.infinite-scroll-preloader').remove();
              $('.pages').addClass('hide');
            }
          }
          // 刷新
          $.refreshScroller();
        } else {
          // $.toast('请求错误');
        }
      },
      error: function(xhr, type){
        // $.toast('网络错误 code:'+type);
      }
    });
  }
  // 监听滚动
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
    add_data(control_pages.get_ajax_data());
    if(store_list.data('isculture') == 1){
      store_list.addClass('culture_list').removeClass('store_list');
      $('.hs-footer').find('li a').removeClass('active');
      $('.hs-footer').find('li a').eq(1).addClass('active');
    }
  }
});
