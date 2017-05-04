// 我买过的东西
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.bought', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  var already_list = $('.already_list');
  // 下拉加载更多
  var loading = false;
  // 初始化下拉
  var page_num = 2;
  var page_size = 20;
  var pages;
  var already_list_tpl = handlebars.compile($("#already_list_tpl").html());
  // 加入判断方法
  handlebars.registerHelper('eq', function(v1, v2, options) {
    if(v1 == v2){
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  //判断是否显示 申请退款选项
  liForeach();
  function liForeach(){
    $('li').each(function(){
      var lengthA = $(this).find('.orderList .price a').length;
      var lengthOrderList= $(this).find('.orderList').length;
      if(lengthA == lengthOrderList){
        $(this).find('.apply_for').css('display','none')
      }
    })
  }
  // 添加数据
  function add_data(page_size,page) {
    $.ajax({
      type: 'POST',
      url: '/index.php?g=user&m=HsOrder&a=ajax_my_bought',
      data: {
        page:page_num,
        page_size:page_size
      },
      dataType: 'json',
      timeout: 10000,
      success: function(data){
        if(data.status == 1){
          //计算邮费 为发货 已发货
          var dataObj = data.data;
          for(var i = 0;i<dataObj.length;i++){
            if(dataObj[i].type == 1){
              dataObj[i]['shopping_price'] = dataObj[i].total_fee-dataObj[i].price*dataObj[i].counts;
            }
          }
          already_list.find('ul').append(already_list_tpl(dataObj));
          // 更新最后加载的序号
          pages = data.pages;
          //设置是否显示退款详情
          page_num++;
          init.loadimg();
          liForeach();
        } else {
          $.toast('请求错误');
        }
      },
      error: function(xhr, type){
        $.toast('网络错误 code:'+type);
      }
    });
  }
  // 确认收货
  already_list.on('click','.bought_btn',function(){
    var _this = $(this);
    var order_number = _this.data('ordernumber');
    $.post('/index.php?g=user&m=HsOrder&a=comfirm_received',{
      order_number:order_number
    },function(data){
      if(data.status == '1'){
        $.toast('收货成功');
        _this.parent('.logistics').parent('.header').parent('li').find('.status').text('已收货');
        _this.remove();
      } else {
        $.toast(data.info);
      }
    })
  });
  already_list.on('click','.contact_btn',function(){
    var _this = $(this);
    var userid = _this.data('userid');
    var buttons1;
    var buttons2 = [
    {
      text: '取消',
      bg: 'danger'
    }
    ];
    $.post('/index.php?g=restful&m=HsMobile&a=ajax_get_moblie',{
      uid:userid
    },function(data){
      if(data.status == '1'){
        buttons1 = [
        {
          text: '请选择',
          label: true
        },
        {
          text: '私信卖家',
          bold: true,
          color: 'danger',
          onClick: function() {
            $.router.load('/User/HsMessage/detail/from_uid/'+userid+'.html', true);
          }
        },
        {
          text: '卖家电话',
          onClick: function() {
            // $.router.load('tel:'+data.data, true);
            window.open('tel:'+data.data);
          }
        }
        ];

      } else {
        buttons1 = [
        {
          text: '请选择',
          label: true
        },
        {
          text: '私信卖家',
          bold: true,
          color: 'danger',
          onClick: function() {
            $.router.load('/User/HsMessage/detail/from_uid/'+userid+'.html', true);
          }
        }];

      }
      $.actions([buttons1,buttons2]);
    })
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
