// 初始化
var common = require('../common/common.js');
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 搜索
// var SearchInit = require('../search_list/search_list.js');

$(document).on('pageInit','.category_top10', function(e, id, page){
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
  var ApiBaseUrl = init.getApiBaseUrl();

  init.wx_share(share_data);
  init.checkfollow();
  var categoryID = getUrlId(window.location.href)
    function getUrlId (url) {
        var id = url.replace('.html','').split('/id/')[1];
        return id;
    }
  // 搜索初始
  // SearchInit();
  // 初始化title
 
  var categories_index_tpl = handlebars.compile($("#categories_index_tpl").html());

  // 第一次以当前页id查询
 
  add_goods(categoryID);
  function add_goods(category_id){
    let url =   ApiBaseUrl + `/appv6/cate/${category_id}/getCategoryTop10`;
    $.ajax({
      type: 'GET',
      // url: '/index.php?g=restful&m=HsCategories&a=ajax_posts',
      url: url,
      data: {
      },
      success: function(data){
        if(data.status == 1){
        $('title').text(data.data.catename);
        $('.goods_content').html('')
        $('.goods_content').append(categories_index_tpl(data.data));
         
        } else {
          $.toast(data.info);
        }
        init.loadimg();
      },
      error: function(xhr, type){
        $.toast('网络错误 code');
      }
    });
  }
});
