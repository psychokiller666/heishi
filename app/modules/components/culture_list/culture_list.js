// 文化列表
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');
// 列表首页_通用底部发布
require('../list_footer/list_footer.js');

$(document).on('pageInit','.culture', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  var share_data = {
    title: '黑市 | 美好而操蛋的东西',
    desc: '这里能让好事自然发生',
    link: GV.HOST+location.pathname,
    img: 'http://hs.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
  };
  init.wx_share(share_data);
  // 测试数据
  var data = [{
    object_id: "10",
    term_id: "1",
    listorder: "0",
    post_author: "11",
    post_keywords: "点击选择...",
    post_date: "2015-08-14 13:03:30",
    post_title: "fff",
    post_excerpt: "屎",
    post_status: "1",
    post_modified: "08-14",
    post_type: "1",
    comment_count: "8",
    post_hits: "60",
    post_like: "5",
    filepath: "upload/150814/4b43e6d450e19f59c090e41ba6b92937.jpg",
    bgcolor: 2,
    type_name: "摆摊d"
  },
  {
    object_id: "11",
    term_id: "1",
    listorder: "0",
    post_author: "12",
    post_keywords: "点击选择...",
    post_date: "2015-08-14 13:07:20",
    post_title: "李根最牛逼的黑胖子",
    post_excerpt: "我的描述就是屎 就是屎 就是屎 ",
    post_status: "1",
    post_modified: "08-14",
    post_type: "1",
    comment_count: "39",
    post_hits: "53",
    post_like: "8",
    filepath: "upload/150814/c20554a0acd1ce5999c3e4e16d44bb67.jpg",
    bgcolor: 3,
    type_name: "摆摊"
  }];


  var culture_list = $('.culture_list');
  // 下拉加载更多
  var loading = false;
  // 初始化下拉
  var page_size = 2;
  var pages = 1;
  var culture_list_tpl = handlebars.compile($("#culture_list_tpl").html());

  page.on('infinite', function() {
    // 如果正在加载，则退出
    if (loading) return;
    // 设置flag
    loading = true;
    // 模拟1s的加载过程
    setTimeout(function() {
      // 重置加载flag
      loading = false;
      if (pages >= page_size) {
        // 加载完毕，则注销无限加载事件，以防不必要的加载
        $.detachInfiniteScroll($('.infinite-scroll'));
        // 删除加载提示符
        $('.infinite-scroll-preloader').remove();
        $.toast('😒 没有了');
        return;
      }
      culture_list.find('ul').append(culture_list_tpl(data));
      // 更新最后加载的序号
      pages++;
      init.loadimg();
      $.refreshScroller();
    }, 1000);
  });
});
