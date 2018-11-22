// 用户中心页
/**
* 注意!!!:
* 这个js是 卖家中心页: /User/index/index/id/163.html 和 用户中心页: /index.php/User/Center/index.html
* 两个页面共同使用的js,由于以前的开发人员将两个页面同时使用了 .center 这个class 作为页面的class,所以现在将就着用吧.
* 其中大部分代码均为卖家中心页的js.
* 添加某些功能时需要先判断当前是哪个页面.
* */
// handlebars
var handlebars = require('../../../../node_modules/handlebars/dist/handlebars.min.js');
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.center', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  var desc = $('.desc').hasClass('no_desc');
  if(desc){
    desc = '商品、发货、物流有问题直接私信问我';
  }else{
    desc = $('.desc').text();
  }
  if($('.user_inedx').length){
    var share_data = {
      title: $('.username').text() + ' — 帮你发现点牛逼物件，爱点不点',
      desc: desc,
      link: window.location.href,
      img: $('.avatar').data('share')
    };
    init.wx_share(share_data);
  }




  // 高度补丁
  $('.hs-main').css('top','0');

  // 发布
  page.on('click','.add_posts a',function(e){
    e.preventDefault();
    $.showPreloader();
    $.post('/index.php?g=restful&m=HsMobile&a=ajax_mobile_checking','',function(data){
      if(data.status == 1){
        $.hidePreloader();
        $('.phone_verify').find('.submit').attr('href','/user/HsPost/notice/type/1.html');
        $('.phone_verify').show();
      } else {
        // $.toast(data.info);
        $.hidePreloader();
        $.router.load('/user/HsPost/add/type/1.html', true);
      }
    })
  })
  page.find('.phone_verify').on('click','.modal-overlay',function(){
    $('.phone_verify').hide();
  })


  // 别人的个人中心
  var store_list = $('.user_inedx');
  var attention = $('.attention');
  var $pushMsg = $('#pushMsg');

  if(store_list.length){
    // 检查是否关注
    // 增加handlebars判断
    handlebars.registerHelper('eq', function(v1, v2, options) {
      if(v1 == v2){
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });
    //当前用户如果是自己,不显示关注按钮,下面的代码不应该执行.
    if(attention.length>0 && attention.data('myuid')){
        $.post('/index.php?g=user&m=HsFellows&a=ajax_relations',{
            my_uid: attention.data('myuid'),
            other_uid: attention.data('id')
        },function(data){
            if(data.relations == '2' || data.relations == '3') {
                $('.cancel_attention').show();
            } else if(data.relations == '1' || data.relations == '0') {
                attention.show();
                $pushMsg.hide();
            }
        });

        attention.click(function(){
            // 关注
            $.post('/index.php?g=user&m=HsFellows&a=ajax_add',{
                uid: $(this).data('id')
            },function(data){
                if(data.status == '1') {
                    $('.cancel_attention').show();
                    $('.attention').hide();
                    $pushMsg.show().attr('push',1);
                    $.toast(data.info);
                } else {
                    $.toast(data.info);
                }
            });
            init.sensors.track('subscribe', {
                pageType : '卖家店铺页',
                operationType : '关注',
                sellerID : $(this).data('id'),
                storeName : $(page).find('.header .username').html(),
            })
        })
    }

    $('.cancel_attention').click(function(){
      // 取消关注
      $.post('/index.php?g=user&m=HsFellows&a=ajax_cancel',{
        uid: $(this).data('id')
      },function(data){
        if(data.status == '1') {
          $('.cancel_attention').hide();
          $('.attention').show();
          $pushMsg.hide();
          $.toast(data.info);
        } else {
          $.toast(data.info);
        }
      });

        init.sensors.track('subscribe', {
            pageType : '卖家店铺页',
            operationType : '取关',
            sellerID : $(this).data('id'),
            storeName : $(page).find('.header .username').html(),
        })
    })

    $pushMsg.click(function(){
      //取消、恢复推送
        $.post('/index.php?g=restful&m=HsShoppingCart&a=ajax_cancle_push',{
            uid: $(this).data('myuid'),
            seller_id: $(this).data('id'),
        },function(data){
            if(data.status == '1') {
                $('.cancel_attention').show();
                $('.attention').hide();
                $pushMsg.show();
                if($pushMsg.attr('push')=='1'){
                    $pushMsg.attr('push',0);
                }else{
                    $pushMsg.attr('push',1);
                }
                $.toast(data.info);
            } else {
                $.toast(data.info);
            }
        });

    })

      $(page).find('.private_letter').on('click',function(){
          init.sensors.track('contactSeller', {
              pageType : '卖家店铺页',
              buttonName : '私信',
              commodityID : '',
              sellerID : $(this).data('id'),
          })
      });


    /****店铺首页 分类及加载 -start ****/
      var ApiBaseUrl = init.getApiBaseUrl();


      var $classifyWrap = $('.classify_wrap');
      var uid = $classifyWrap.attr('uid');
      var img_root = $classifyWrap.attr('img_root');

      var $classifyTabWrap = $('.classify_tab_wrap');
      var $classifyPageWrap = $('.classify_page_wrap');
      var $classifyLoading = $('.classify_loading');

      //属性名是sortid,值是对象,保存nowpage,totalpage,ifover,ifloading
      var goodsSort = {
          0:{
              nowPage:1,
              totalPage:2,
              ifOver:false,
              ifLoading:false,
              pageSize:10,
          }
      };

      getHomePage(uid);
      getGoodsSort();//判断是否展示更多分类的小图标

      //获取初始化的分类数据
      function getHomePage(uid){
          var url = ApiBaseUrl + '/appv5_2/user/homepage'
          $.ajax({
              type: "GET",
              url: url,
              dataType: 'json',
              data: {uid:uid},

              success: function(data){
                  if(data.status == 1){
                      createHomePage(data.data);
                  }
              },
              error: function(e){
                  console.log('homepage err: ',e);
              }
          });

      }


      //生成商品列表，传参是数据数组
      function createGoodsLists(lists){

          if(!(lists instanceof Array)){
              return '';
          }

          var html = '';
          for(var i=0;i<lists.length;i++){
              html+= '<li>'
              html+= '<a href="/Portal/HsArticle/index/id/'+ lists[i].id +'.html" class="filepath external">'
              html+= '<div class="image" data-layzr="'+ transHttps(lists[i].cover) +'@640w_1l"></div>'
              html+= '</a>'
              html+= '<a href="/Portal/HsArticle/index/id/'+ lists[i].id +'.html" class="post_title external">'+ lists[i].title +'</a>'
              html+= '<a class="keywords keywords_none"></a>'
              html+= '<div class="price font_din">'+ lists[i].price +'</div>'
              html+= '</li>'
          }

          return html;
      }

      //生成初始化的分类值
      function createHomePage(data){

          data = data;

          var html = '';
          html += '<div class="classify_page classify_page_act" scroll="1" sortid="0">'+ createGoodsLists(data.goodsall) +'</div>'
          html += '<div class="classify_page ">'+ createGoodsLists(data.goodsnew) +'</div>'
          html += '<div class="classify_page ">'+ createGoodsLists(data.seller_recommended) +'</div>'
          html += '<div class="classify_page ">'+ createGoodsLists(data.goodspopular) +'</div>'

          $classifyPageWrap.html(html);
          $('.content').scrollTop(1).scrollTop(0);
          // 原本的商品分类不再加载
          // getGoodsSort();
          //不加载原本的分类后直接添加点击事件和滚动事件
          addChangeEvent();
          addScrollEvent();
          if(data.seller_recommended || data.seller_recommended >0){
              $('.js_seller_recommended').css('display','inline-block');
          }
          $('.classify_tab_wrap').css('visibility','visible');

      }

      //获取店铺分类
      function getGoodsSort(){
          var url = ApiBaseUrl + '/appv5_2/sort/getGoodsSort';
          $.ajax({
              type: "GET",
              url: url,
              dataType: 'json',
              data: {uid:uid,status:1},

              success: function(data){
                  if(data.status==1){
                      // 如果有店铺分类,展示列表按钮
                      if(data.data && data.data.length>0){
                          $('.classify_more').show();
                          $('.classify_more_button').show();//分类页按钮
                      }
                      // addGoodsSort(data.data);
                      // addChangeEvent();
                      // addScrollEvent();
                  }
              },
              error: function(e){
                  console.log('getGoodsSort err: ',e);
              }

          });
      }

      //把分类添加进去
      function addGoodsSort(data){

          var tabHtml = '';
          var pageHtml = '';
          for(var i=0;i<data.length;i++){
              tabHtml+= '<div class="classify_tab" sortid="'+ data[i].id +'" loaddata="0">'+ data[i].sort_name +'</div>'
              pageHtml += '<div class="classify_page " scroll="1" sortid="'+ data[i].id +'"></div>'
              goodsSort[data[i].id]={
                  nowPage:0,
                  totalPage:Math.ceil(data[i].goods_num/20),
                  ifOver:false,
                  ifLoading:false,
                  pageSize:20,
              }
          }
          $classifyTabWrap.append($(tabHtml));
          $classifyPageWrap.append($(pageHtml));
      }

      //在每次请求前都设置goodsSort相应的值,判断是否可以请求
      //获取分类商品列表
      function getGoodsSortInfo(sortid,page){

          var gSort = goodsSort[sortid];

          if(!gSort){
              return false;
          }
          if(gSort.ifOver){
              return false;
          }
          if(gSort.ifLoading){
              return false;
          }
          gSort.ifLoading=true;

          page = page || gSort.nowPage + 1;

          var obj = {
              uid: uid,
              page: page,
              size: gSort.pageSize || 10,
              sortid: sortid
          };
          var url = ApiBaseUrl + '/appv5_2/user/goodsSortInfo';
          $.ajax({
              type: "GET",
              url: url,
              dataType: 'json',
              data: obj,

              success: function(data){
                  if(data.status == 1){

                      addGoodsList(sortid,data.data.goodslist);
                      gSort.nowPage= obj.page;
                      gSort.totalPage=data.data.totalPages;
                      gSort.ifOver= obj.page>=data.data.totalPages;
                  }
                  gSort.ifLoading=false;
              },
              error: function(e){
                  console.log('getGoodsSortInfo err: ',e);
                  gSort.ifLoading=false;
              }
          });

      }

      //追加商品列表
      function addGoodsList(sortid,data){
          var $page = $('.classify_page[sortid="'+ sortid +'"]');
          var html = createGoodsLists(data);

          $page.append($(html));

          //延迟触发一次页面scroll事件,防止图片懒加载没有生效.
          setTimeout(function(){
              $('.content').trigger('scroll');
          },500);
      }

      //添加点击事件
      function addChangeEvent(){
          changeTab('classify_tab','classify_page','classify_tab_act','classify_page_act',function($o){

              /*if($o.attr('scroll_top')){
                  var scrollTop = $o.attr('scroll_top');
                  $('.classify_page_act').scrollTop(scrollTop);
              }*/

              var loadData = $o.attr('loaddata');
              var sortid = $o.attr('sortid');
              if(loadData!=='0'){
                  return false;
              }
              $o.attr('loaddata',1);
              getGoodsSortInfo(sortid,1);
          },function($o){
              //切换标签之前先保存当前标签的scroll top
              /*var scrollTop = $('.classify_page_act').scrollTop();
              $o.siblings('.classify_tab_act').attr('scroll_top',scrollTop)*/
          });
      }

      //添加滚动事件
      function addScrollEvent(){
          //获取滚动元素
          $('.content').on('scroll',function(ev){
              var cwTop = $classifyWrap.offset().top;
              var cLTop = $classifyLoading.offset().top;
              if(cwTop<5){
                  // $('.classify_page').css('overflow-y','auto');
                  $classifyTabWrap.addClass('fixed_top');
              }else{
                  // $('.classify_page').css('overflow-y','hidden');
                  $classifyTabWrap.removeClass('fixed_top');
              }

              var bodyH =  document.documentElement.clientHeight;
              var diffH = cLTop - bodyH;
              if(diffH<300){
                  //尝试加载
                  var $classifyPageAct = $('.classify_page_act');
                  var sortId = $classifyPageAct.attr('sortid');

                  if(typeof sortId === 'string'){
                      getGoodsSortInfo(sortId)
                  }

              }
          });

/*          $('.classify_page[scroll="1"]').on('scroll',function(){
              var $this = $(this);
              //获取自己的scrollHeight,scrollTop
              var clientHeight = $this.height();
              var scrollHeight = $this[0].scrollHeight;
              var scrollTop = $this.scrollTop();

              //判断距离底部的px
              var diff = scrollHeight - clientHeight - scrollTop <= 300;
              if(diff){

                  var sortId = $this.attr('sortid');

                  if(typeof sortId === 'string'){
                      getGoodsSortInfo(sortId)
                  }
              }
          });

          $('.classify_page').on('scroll',function(){
              $('.content').trigger('scroll');
          });*/

      }


    /*点击tab切换对应标签*/
      function changeTab(tabClass,pageClass,tabActClass,pageActClass,endback,preback){
          var $tabs = $('.' + tabClass);
          var $pages = $('.' + pageClass);

          $tabs.off('click').on('click',function(ev){
              var index = $(this).index();
              if($(this).hasClass(tabActClass)){
                  return;
              }
              if(typeof preback === "function"){
                  preback($(this),ev);
              }
              $tabs.removeClass(tabActClass);
              $tabs.eq(index).addClass(tabActClass);
              $pages.removeClass(pageActClass);
              $pages.eq(index).addClass(pageActClass);
              if(typeof endback === "function"){
                  endback($(this),ev);
              }
          })
      }

    // 链接 http --> https
    function transHttps(url){
      if(typeof url === 'string'){
          url = url.replace('http://','https://');
      }
      return url;
    }
    /****店铺首页 分类及加载 -end ****/


    if($('.user_index_bd').find('li').length <= 19) {
      $('.infinite-scroll-preloader').remove();
    } else
      {
      var loading = false;
      var page_num = 2;
      var pages;
      var page_size = 20;
      var post_id = $('.user_index_bd').data('id');
      var store_list_tpl = handlebars.compile($("#store_list_tpl").html());
      function add_data(page_size,page) {
        $.ajax({
          type: 'POST',
          url: '/index.php?g=User&m=index&a=ajax_more_articles',
          data: {
            id:post_id,
            page:page_num,
            page_size:page_size
          },
          dataType: 'json',
          timeout: 4000,
          success: function(data){
            loading = false;
            if(data.status == 1){
              $('.user_index_bd').find('ul').append(store_list_tpl(data.data));
                // 更新最后加载的序号
                pages = data.pages;
                page_num++;
                $('.user_index_bd').attr('pagenum',page_num);
                $('.user_index_bd').attr('pages',data.pages);
                init.loadimg();
              } else {
                $.toast('请求错误');
              }
            },
            error: function(xhr, type){
              loading = false;
              $.toast('网络错误 code:'+type);
            }
          });
      }
      // 监听滚动
      page.on('infinite', function() {
        // 如果正在加载，则退出
        if (loading) return;
        // 设置flag
        loading = true;
        setTimeout(function() {
          if (page_num >= pages) {
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
    }
  }

  //判断是否展示用户中心页的新人领取优惠券
    var $coupon_for_new = $('.coupon_for_new');
    if($coupon_for_new.length>0){
        var PHPSESSID = init.getCookie('PHPSESSID');
        var ApiBaseUrl = init.getApiBaseUrl();
        var url = ApiBaseUrl + '/appv6/coupon/getNewUserCouponStatus';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: {
                'phpsessionid': PHPSESSID
            },
            success: function (data) {

                if (data.status == 1) {
                    if(data.data.status==1){
                        $coupon_for_new.find('.coupon_price').html(data.data.total_price);
                        $coupon_for_new.show();
                    }
                }
            },
            error: function (e) {
                console.log('getOrderReturnCoupon err: ', e);
            }

        });
    }

  if(store_list.length == 0){
    // 弹出绑定手机窗口 自己的个人中心
    $.ajax({
      url: '/index.php?g=restful&m=HsMobile&a=ajax_check_mobile_login&pagename=homepage',
      type: 'GET',
      success: function(data){
        if(data.status == 1){
          $('.login').animate({'top': '0'}, 400);
        }
        if(data.status == 3){
          $('.binding').css('display', 'none');
        }
      }
    })
    $('.close').click(function(){
      $('.login').animate({'top': '100%'}, 400);
    })
    $('.get_pass').click(function(){
      var that = this;
      $.post('/Api/HsChangeUserInfo/ajax_change_mobile',{
        mobile: $('.tel').val()
      },function(res){
        if(res.status == 1){
          $.toast(res.info);
          $(that).attr('disabled', 'disabled');
          count_down(that);
        } else {
          $.toast(res.info);
        }
      });
    })
    $('.bind_tel').click(function(){
      var mobile = $('.tel').val();
      var verify = $('.pass_num').val();
      if(mobile == '' || verify == ''){
        $.toast('请填写帐号密码');
        return false;
      }
      $.ajax({
        url: '/index.php?g=restful&m=HsMobile&a=ajax_mobile_verify',
        type: 'POST',
        data: {
          newbie: 1,
          mobile: mobile,
          verify: verify
        },
        success: function(res) {
          if(res.status == 1){
            var str = res.redirect_uri;
            location.href = str;
          } else {
            $.toast(res.info);
          }
        }
      })
    })

    $('.binding').click(function(){
      $('.login').css('top',0);
    })
  }
  function count_down(that){
    var clearTime = null;
    var num = 59;
    clearTime = setInterval(function(){
      if(num == 0){
        clearInterval(clearTime);
        $(that).removeAttr('disabled');
        $(that).text('获取验证码');
      }else{
        $(that).text(num + 's');
      }
      num--;
    },1000)
  }
});
