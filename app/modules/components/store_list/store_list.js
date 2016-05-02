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
  // 下拉加载更多
  var loading = false;
  // 初始化下拉
  var page_size = 20;
  var ctype;
  var keyword;
  var isculture;
  if($('.showall').length){
    ctype = 3;
  } else {
    ctype = 1
  }
  // 搜索加载页
  var search_list = $('.search-list');
  if($('.search-list').length){
    // 初始化加载
    keyword = store_list.data('keyword');
    ctype = 3;
    isculture = store_list.data('isculture');
    var page_num = 1;
    add_data(page_num);
    if(isculture == 1){
      store_list.addClass('culture_list').removeClass('store_list');
      $('.hs-footer').find('li a').removeClass('active');
      $('.hs-footer').find('li a').eq(1).addClass('active');
    }

    if(store_list.find('li').length != page_size) {

    } else {
      // 加载完毕，则注销无限加载事件，以防不必要的加载
      $.detachInfiniteScroll($('.infinite-scroll'));
      // 删除加载提示符
      $('.infinite-scroll-preloader').remove();
    }
  }
  var store_list_tpl = handlebars.compile($("#store_list_tpl").html());
  // 增加handlebars判断
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  // 控制前后页数
  // function control_pages
  // control_pages[0,1] 返回前后页数
  function control_pages(current_pages,up_and_down){
    var pages_next;
    var pages_prev;
    if(up_and_down == 'down'){
      pages_next = parseInt(current_pages) + 1;
      pages_prev = parseInt(current_pages) - 3;
    } else if(up_and_down == 'up'){
      pages_next = parseInt(current_pages) + 3;
      pages_prev = parseInt(current_pages) - 1;
    }
    store_list.attr('data-pages_next',pages_next);
    store_list.attr('data-pages_prev',pages_prev);
  }
  // 控制ul里面li的数量
  // function control_number
  // number 返回当前ul里面有多少个page页
  function control_number(number){
    var number = [];
    // 去掉重复数组
    Array.prototype.unique = function(){
      var b = {} , n = [];
      for (var i = 0 ; i < this.length; i++){
        if(!b[this[i]]){
          b[this[i]] = 1;
          n.push(this[i]);
        }
      }
      return n;
    }
    $.map(store_list.find('li'),function(item,index){
      number.push($(item).data('page'));
    })
    return number.unique();
  }
  // function control_number
  // remove_first 删除第一个
  // remove_last 删除最后一个
  function control_dom() {
    var first_id = $('.store_list').find('li').first().data('page').split('_')[1];
    var last_id = $('.store_list').find('li').last().data('page').split('_')[1];
    this.remove_first = function(){
      if(control_number().length == 3){
        $('[data-page=page_'+first_id).remove();
      }
    }
    this.remove_last = function(){
      if(control_number().length == 3){
        $('[data-page=page_'+last_id).remove();
      }
    }
  }

  // function add_data
  // ajax_page 页数，up_and_down 添加上或下
  function add_data(ajax_page,up_and_down) {
    $.ajax({
      type: 'POST',
      url: '/index.php?g=restful&m=HsArticle&a=ajax_index_list',
      data: {
        page:ajax_page,
        page_size:page_size,
        ctype:ctype,
        keyword:keyword,
        is_culture:isculture
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){

          if (store_list.data('pages-next') >= data.pages+1) {
            $.detachInfiniteScroll($('.infinite-scroll'));
            // 删除加载提示符
            $('.infinite-scroll-preloader').remove();
            $.toast('没有了');
          } else {
            if(up_and_down == 'up'){
              store_list.find('ul').prepend(store_list_tpl({data:data.data,page:ajax_page}));
              control_pages(ajax_page,'up');
            } else {
              store_list.find('ul').append(store_list_tpl({data:data.data,page:ajax_page}));
              control_pages(ajax_page,'down');
            }
            init.loadimg();
          }
          if($('.search-list').length){
            if(!data.data.length){
              store_list.append('<div class="no_data">毛都没找到</div>');
              // 加载完毕，则注销无限加载事件，以防不必要的加载
              $.detachInfiniteScroll($('.infinite-scroll'));
              // 删除加载提示符
              $('.infinite-scroll-preloader').remove();
            }
          }
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
  page.on('infinite','.infinite-scroll', function(e) {
    // 如果正在加载，则退出
    if (loading) return;
    // 设置flag
    loading = true;
    setTimeout(function() {
      loading = false;
      add_data(store_list.data('pages_next'),'down');
    },500);
    // new control_dom().remove_first();
    $.refreshScroller();
  });

  store_list.on('scrollend',function(e){
    console.log(e);
  });

  // 向上加载更多
  // store_list.on('scroll',function(e){
  //   if (loading) return;


  //   if(store_list.scrollTop() <= store_list.find('li').height() * 15){
  //     if(store_list.data('pages_prev') >= 1){
  //       console.log(store_list.data('pages_prev'));
  //       loading = true;
  //       setTimeout(function() {
  //         loading = false;
  //         add_data(store_list.data('pages_prev'),'up');
  //       },500);
  //       new control_dom().remove_last();
  //       $.refreshScroller();
  //     }
  //   }
  // })
});
