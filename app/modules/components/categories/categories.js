// 初始化
var common = require('../common/common.js');
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');

$(document).on('pageInit','.categories', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.checkfollow();
  init.wx_share(false);

  // 打开ios对应页面
  var system_query = init.system_query();
  if(system_query == 'android'){
    var system_query_url = GV.app_url;
  }
  if($('.tag_index').length == 1 && system_query == 'ios'){
    var system_query_url = GV.api_url + '/ios/tag/' + $('.tag_index').attr('data-id');
  }else if($('.categories_index').length == 1 && system_query == 'ios'){
    var system_query_url = GV.api_url + '/ios/category/' + $('.categories_index').attr('data-id');
  }else if($('.tag_index').length != 1 && $('.categories_index').length != 1 && system_query == 'ios'){
    var system_query_url = GV.api_url + '/ios/category';
  }
  $('.open_app').find('.open_app_btn').attr('href', system_query_url);


  // 初始化title
    $('title').text('分类');
  // 分类标签切换
  $('.classify_one li').click(function(){
    var that = this;
    var class_name = '.classify_two_list' + $(that).attr('data-id');
    $('.classify_one li').removeClass('active');
    $(that).addClass('active');
    $('.classify_two .classify_two_list').removeClass('active');
    $(class_name).addClass('active');
  })
  $('.label').click(function(){
    $('.classify').removeClass('active');
    $('.label').addClass('active');
    $('.classify_content').css('display', 'none');
    $('.classify_two').css('display', 'none');
    $('.label_content').css('display', 'block');
  })
  $('.classify').click(function(){
    $('.label').removeClass('active');
    $('.classify').addClass('active');
    $('.classify_content').css('display', 'block');
    $('.classify_two').css('display', 'block');
    $('.label_content').css('display', 'none');
  })



  // 分类 标签列表页
  if($(".categories_index").length == 1 || $('.tag_index').length == 1){
    // 初始化title
    $('title').text($('.categories_name').val());
    // 是否显示查看下拉
    var categories_list_row_width = $('.categories_list_row table').width() - $('.categories_list_row').width();
    if(categories_list_row_width > 20){
      $('.query_more').css('display', 'block');
    }
    $('.query_more').click(function(){
      $('.categories_content').css('display', 'block');
      $('.categories_list_row table').css('display', 'none');
    })
    $('.categories_all .hs-icon').click(function(){
      $('.categories_content').css('display', 'none');
      $('.categories_list_row table').css('display', 'block');
    })
    // 分类切换
    $('.categories_item').click(function(){
      var status = $(this).hasClass('categories_item_all');
      $('.categories_item').removeClass('active');
      $('.categories_content').css('display', 'none');
      $('.categories_list_row table').css('display', 'block');
      if(!status){
        var class_name = '.categories_item' + $(this).attr('data-id');
        $(class_name).addClass('active');
      }else{
        $('.categories_item_all').addClass('active');
      }
      reset_load();
    })

    // 标签切换
    $('.tag_item').click(function(){
      $('.tag_item').removeClass('active');
      $(this).addClass('active');
      reset_load();
    })
    var categories_index_tpl = handlebars.compile($("#categories_index_tpl").html());
    add_goods(categoryID, tagName, curPage);
    // 下拉加载
    var loading = false;
    var add_goods_status = false;
    var categoryID = get_categoryID();
    var tagName = get_tagName();
    var curPage = 1;
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
            $.each(data.data.posts, function(index, item){
              if(item.tags[0] != ""){
                data.data.posts[index]['tags_active'] = '#' + item.tags[0];
                data.data.posts[index]['tags_active_url'] = item.tags[0];
              }else{
                data.data.posts[index]['tags_active'] = '';
                data.data.posts[index]['tags_active_url'] = '';
              }
            })

            $('.goods_content').append(categories_index_tpl(data.data));
            $('.infinite-scroll-preloader').css('display', 'block');
          } else {
            $('.infinite-scroll-preloader').remove();
            add_goods_status = true;
            $.toast(data.info);
          }
          loading = false;
          init.loadimg();
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
    // 监听滚动增加返回顶部按钮
    $(".content").on('scroll',function(){
      if($('.content').scrollTop() > 1000){
        $('.bottom_search_btn').css('display', 'block');
      }else{
        $('.bottom_search_btn').css('display', 'none');
      }
    });
    function reset_load(){
      categoryID = get_categoryID();
      tagName = get_tagName();
      curPage = 1;
      loading = true;
      add_goods_status = false;
      $('.goods_content').html('');
      $('.infinite-scroll-preloader').css('display', 'none');
      add_goods(categoryID, tagName, curPage);
    }
  }

  function get_categoryID(){
    return $('.categories_list_row').find('.active').attr('data-id');
  }
  function get_tagName(){
    return $('.tag_list').find('.active').attr('data-name');
  }
});
