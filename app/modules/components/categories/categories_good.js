// 初始化
var common = require('../common/common.js');
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 搜索
var SearchInit = require('../search_list/search_list.js');

$(document).on('pageInit','.categories_good', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  var share_data = {
    title: $('.categories_name').val() + ' - 公路商店',
    desc: '这里能让好事自然发生',
    link: window.location.href,
    img: $('.categories_icon').val()
  };
  init.wx_share(share_data);
  init.checkfollow();

  // 搜索初始
  SearchInit();
  // 初始化title
  $('title').text($('.categories_name').val());
  // 是否显示查看下拉
  var length = $('.categories_list_row').find('.categories_item').length - 1;
  if(length > 2){
    var width = $('.categories_list_row').find('.categories_item').eq(length).position().left;
    var categories_list_row_status = width + $('.categories_list_row').find('.categories_item').eq(length).width() - $('.categories_list_row').width();
    if(categories_list_row_status > 0){
      $('.query_more').css('display', 'block');
    }
  }
  
  $('.query_more').click(function(){
    $('.categories_content').css('display', 'block');
    $('.categories_list_row').css('display', 'none');
  })
  $('.categories_all .hs-icon').click(function(){
    $('.categories_content').css('display', 'none');
    $('.categories_list_row').css('display', 'block');
  })
  // 分类切换
  $('.categories_item').click(function(){
    var status = $(this).hasClass('categories_item_all');
    $('.categories_item').removeClass('active');
    $('.categories_content').css('display', 'none');
    $('.categories_list_row').css('display', 'block');
    if(status){
      $('.categories_item_all').addClass('active');
      categoryID = nowCategoryID;
    }else{
      var class_name = '.categories_item' + $(this).attr('data-id');
      $(class_name).addClass('active');
      categoryID = $('.categories_list_row').find('.active').attr('data-id');
    }
    if(nowTagName){
      tagName = nowTagName;
    }else{
      tagName = '';
    }
    reset_load(categoryID, tagName, curPage);
  })

  // 标签切换
  $('.tag_list').on('click', '.tag_item',function(){
    $('.tag_item').removeClass('active');
    $(this).addClass('active');
    tagName = $('.tag_list').find('.active').attr('data-name');
    reset_load(categoryID, tagName, curPage);

  })
  var categories_index_tpl = handlebars.compile($("#categories_index_tpl").html());

  // 下拉加载
  var nowCategoryID = '';
  if($('.categories_index').attr('data-id')){
    var category_tags_tpl = handlebars.compile($("#category_tags_tpl").html());
    nowCategoryID = $('.categories_index').attr('data-id');
  }
  var nowTagName = '';
  if($('.tag_index').attr('data-id')){
    nowTagName = $('.tag_index').attr('data-id');
  }

  var categoryID = nowCategoryID;
  var tagName = nowTagName;
  var curPage = 1;
  var loading = false;
  var add_goods_status = false;
  // 第一次以当前页id查询
  add_goods(categoryID, tagName, curPage);
  function add_goods(category_id, tag, cur_page){
    $.ajax({
      type: 'GET',
      url: '/index.php?g=restful&m=HsCategories&a=ajax_posts',
      data: {
        category_id: category_id,
        tag: tag,
        cur_page: cur_page
      },
      success: function(data){
        if(data.status == 1){
          $('.goods_content').append(categories_index_tpl(data.data));
          if(nowCategoryID && !tag){
            if(data.data.my_tag && data.data.my_tag.length > 0){
              $('.tag_list').css('height', '1.36rem');
              $('.tag_list_content').html('');
              $('.tag_list_content').append(category_tags_tpl(data.data));
            }else{
              $('.tag_list_content').html('');
              $('.tag_list').css('height', '0');
            }
          }
          $('.infinite-scroll-preloader').css('display', 'block');
          if(data.data.posts.length < 5){
            $('.infinite-scroll-preloader').css('display', 'none');
          }
        } else {
          $('.infinite-scroll-preloader').css('display', 'none');
          add_goods_status = true;
          $.toast(data.info);
        }
        init.loadimg();
        loading = false;
      },
      error: function(xhr, type){
        $.toast('网络错误 code');
      }
    });
  }
  page.on('infinite', function() {
    // 如果正在加载，则退出
    if (add_goods_status) {
      $.detachInfiniteScroll($('.infinite-scroll'));
    }
    if (loading) {
      return false;
    } else {
      // 设置flag
      loading = true;
      curPage = curPage + 1;
      add_goods(categoryID, tagName, curPage);
      $.refreshScroller();
    }
  });
  function reset_load(categoryID, tagName, curPage){
    curPage = 1;
    loading = true;
    add_goods_status = false;
    $('.goods_content').html('');
    $('.infinite-scroll-preloader').css('display', 'none');
    add_goods(categoryID, tagName, curPage);
  }


  $(".content").on('scroll',function(){
    if($('.content').scrollTop() > 1000){
      $('.return_top').css('display', 'block');
    }else{
      $('.return_top').css('display', 'none');
    }
  });
  $('.return_top').click(function(){
    $('.content').scrollTo();
  })
  // 增加返回顶部动画
  $.fn.scrollTo = function (options) {
    var defaults = {
      toT: 0, //滚动目标位置  
      durTime: 300, //过渡动画时间  
      delay: 30, //定时器时间  
      callback: null //回调函数  
    };
    var opts = $.extend(defaults, options),
      timer = null,
      _this = this,
      curTop = _this.scrollTop(), //滚动条当前的位置  
      subTop = opts.toT - curTop, //滚动条目标位置和当前位置的差值  
      index = 0,
      dur = Math.round(opts.durTime / opts.delay),
      smoothScroll = function(t) {
        index++;
        var per = Math.round(subTop / dur);
        if(index >= dur) {
          _this.scrollTop(t);
          window.clearInterval(timer);
          if(opts.callback && typeof opts.callback == 'function') {
            opts.callback();
          }
          return;
        } else {
          _this.scrollTop(curTop + index * per);
        }
      };
    timer = window.setInterval(function() {
      smoothScroll(opts.toT);
    }, opts.delay);
    return _this;
  };
});
