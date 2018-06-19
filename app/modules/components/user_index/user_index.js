// 用户中心页
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
    $.post('/index.php?g=user&m=HsFellows&a=ajax_relations',{
      my_uid: attention.data('myuid'),
      other_uid: attention.data('id')
    },function(data){
      if(data.relations == '2' || data.relations == '3') {
        $('.cancel_attention').show();
      } else if(data.relations == '1' || data.relations == '0') {
        attention.show();
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
          $.toast(data.info);
        } else {
          $.toast(data.info);
        }
      });
    })
    $('.cancel_attention').click(function(){
      // 取消关注
      $.post('/index.php?g=user&m=HsFellows&a=ajax_cancel',{
        uid: $(this).data('id')
      },function(data){
        if(data.status == '1') {
          $('.cancel_attention').hide();
          $('.attention').show();
          $.toast(data.info);
        } else {
          $.toast(data.info);
        }
      });
    })


    if($('.user_index_bd').find('li').length <= 19) {
      $('.infinite-scroll-preloader').remove();
    } else {
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
            var str = res.redirect_uri + '&code=' + res.code;
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
