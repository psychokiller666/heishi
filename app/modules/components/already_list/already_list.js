// 卖过的东西_未发货
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.untreated', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);

  var already_list = $('.already_list');
  var loading = false;
  // 初始化下拉
  var page_num = 2;
  var page_size = 20;
  var pages;
  var ajax_url = '/index.php?g=user&m=HsOrder&a=ajax_untreated';
  // 判断是已发货还是未发货
  if($('.delivered').length){
    ajax_url = '/index.php?g=user&m=HsOrder&a=ajax_delivered';
  }
  var already_list_tpl = handlebars.compile($("#already_list_tpl").html());
  // 加入判断方法
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  // 搜索
  var already_search_btn = $('.already_search_btn');
  var already_search_box = $('.already_search_box');
  var already_li_old;
  $('.already_header').find('li').each(function(index,item){
    if($(item).hasClass('active')){
      already_li_old = index;
    }
  });
  already_search_btn.on('click',function(){
    var _this = $(this);
    if(_this.hasClass('active')){
      $('.already_header').find('li').eq(already_li_old).addClass('active');
      _this.removeClass('active');
      already_search_box.hide();
    } else {
      $('.already_header').find('li').removeClass('active');
      _this.addClass('active');
      already_search_box.show();
      already_search_box.find('input').trigger('focus');
    }
    $('.hs-main').css('top',$('.already_header').height());
  })
  already_search_box.on('click','button',function(){
    if(already_search_box.find('input').val().length) {
      window.location.href = '/index.php?g=user&m=HsOrder&a=search&content='+already_search_box.find('input').val();
    } else {
      $('.already_header').find('li').eq(already_li_old).addClass('active');
      already_search_btn.removeClass('active');
      already_search_box.hide();
      $('.hs-main').css('top',$('.already_header').height());
    }
  })

  function search_data(content){
    $.ajax({
      type: 'POST',
      url: '/index.php?g=user&m=HsOrder&a=ajax_search_by_name',
      data: {
        content:content,
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          already_list.find('ul').html(already_list_tpl(data.data));
          init.loadimg();
        } else {
          $.toast(data.info);
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+type);
      }
    });
  }
  if($('.search').length){
    search_data($('.search').data('content'));
  }
  // 联系卖家
  page.on('click','.contact_btn',function(){
    var _this = $(this);
    var features_btn = [
    {
      text: '请选择',
      label: true
    },
    {
      text: '私信买家',
      onClick: function() {
        $.router.load('/User/HsMessage/detail/from_uid/'+_this.data('uid')+'.html', true);
      }
    }
    ];
    var cancel_btn = [
    {
      text: '取消',
      bg: 'danger'
    }
    ];
    var groups = [features_btn, cancel_btn];
    $.actions(groups);
  })

  // 添加数据
  function add_data(page_size,page) {
    $.ajax({
      type: 'POST',
      url: ajax_url,
      data: {
        page:page_num,
        page_size:page_size
      },
      dataType: 'json',
      timeout: 4000,
      success: function(data){
        if(data.status == 1){
          already_list.find('ul').append(already_list_tpl(data.data));
          // 更新最后加载的序号
          pages = data.pages;
          page_num++;
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
  // 收货地址按钮
  already_list.on('click','.address_btn',function(){
    var _this = $(this);
    var addressid = _this.data('addressid');
    var userid = _this.data('userid');
    var ordernumber = _this.data('ordernumber');
  });
  if(already_list.find('li').length < 20){
    $.detachInfiniteScroll($('.infinite-scroll'));
    // 删除加载提示符
    $('.infinite-scroll-preloader').remove();
    $.refreshScroller();
    return false;
  };
  // 监听滚动
  page.on('infinite', function() {
    // 如果正在加载，则退出
    if (loading) return;
    // 设置flag
    loading = true;
    setTimeout(function() {
      loading = false;
      if (page_num >= pages+1) {
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


})
