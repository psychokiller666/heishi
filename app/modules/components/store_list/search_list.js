// 商品列表
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.search-list', function (e, id, page) {
  require('../../../../node_not/SUI-Mobile/dist/js/sm-extend.min.js');
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

  // 调用微信分享sdk
  var share_data = {
    title: '黑市 | 美好而操蛋的东西',
    desc: '这里能让好事自然发生',
    link: GV.HOST+location.pathname,
    img: '//jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
  };
  init.wx_share(share_data);
  init.checkfollow(1);
  // 检查是否有新的消息
  init.msg_tip();
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
      }
    });
    search_box.on('click',function(e){
      if(e.srcElement.className == 'search_box'){
        search_box.hide();
      }
    });
  });
  //防止微信后退导致重新加载
  $('.search_item').empty();
  var query = decodeURI(location.search.slice(7));
  var total_num = 0,  //总数
  total_pages = 0,  //总页数
  pagesize = 20,  //每页长度
  itemNum = 0; //当前页数
  add_data(query,0,pagesize,true);
  // 监听滚动
  var statusLoad = true;
  page.on('infinite','.infinite-scroll', function() {
    if(statusLoad && (total_pages != total_num)){
      statusLoad = false;
      add_data(query,itemNum,pagesize);
    }
  });
  //加载模板
  function dataTpl(items,imgUrl){
    var htmlStr = '';
    for(var i = 0;i<items.length;i++){
      htmlStr += '<li>'
        +'<a href="/Portal/HsArticle/index/id/'+items[i]["goods_id"]+'.html">'
          +'<div class="image" data-layzr="'+imgUrl+items[i]["goods_cover_img"]+'@640w_1l" data-layzr-bg></div>'
          +'<h2 class="title">'+items[i]["goods_title"]+'</h2>'
          +'<div class="date">'
            +'<div class="time"><span class="classify">摆摊</span></div>'
            +'<div class="icon">'
              +'<span><i class="hs-icon views"></i>'+items[i]["goods_hits"]+'</span>'
              +'<span><i class="hs-icon comments"></i>'+items[i]["goods_comments"]+'</span>'
              +'<span><i class="hs-icon praises"></i>'+items[i]["goods_likes"]+'</span>'
           +'</div>'
          +'</div>'
        +'</a>'
      +'</li>';
    }
    return htmlStr;
  }
  //下拉加载
  function add_data(query,start,pageSize,status) {
    $.ajax({
      type: 'GET',
      url: '/api/HsSearch/search/',
      data: {
        query:query,
        start: start,
        pagesize: pageSize
      },
      dataType: 'json',
      timeout: 10000,
      success: function(data){
        if(data.status == 1){
          var items = data.data.items,
          imgUrl = $('.search_img').val(),
          total_pages = data.data.total_pages;
          total_num = data.data.total_pages * pagesize;
          var str = dataTpl(items,imgUrl)
          $('.search_item').append(str);
          itemNum += pagesize;
          init.loadimg();
          if(status){
            noData();
          }
          statusLoad = true;
        }else{
          $.toast(data.info);
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+type);
      }
    });
  }
  //判断是否有数据
  function noData(){
    var lengths = $('.search_item li').length;
    if(!lengths){
      $.toast('什么都没有，再搜一下');
    }
  }
});
