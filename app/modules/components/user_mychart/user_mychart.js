//购物车页面
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.user-mychart', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.checkfollow();


  //初始加载
  var lis = $('.context li').length;
  $('.allPrice').css('bottom', $('.hs-footer').height() + 'px');
  if(lis != 0){
    $('.allPrice').css('display','block');
    //删除本地缓存
    sessionStorage.removeItem('cid');
  }else{
    $('.noData').css('display','block');
    $('.correlation').addClass('no_good');
  }

  // 特级跳转
  $('.app_special_offer').click(function(){
    location.href = GV.app_url;
  })
  
  //编辑商品 显示删除按钮 记录touch位置
  var touchclientX = 0,
  touchclientY = 0;
  $('.list').on('touchstart','.item',function(e){
    touchclientX = e.originalEvent.targetTouches[0].clientX;
    touchclientY = e.originalEvent.targetTouches[0].clientY;
  })
  $('.list').on('touchmove','.item',function(e){
    
    var num = e.originalEvent.targetTouches.length;
    if(num == 1){
      var x = Math.abs(touchclientX - e.originalEvent.targetTouches[0].clientX);
      var y = Math.abs(touchclientY - e.originalEvent.targetTouches[0].clientY);
      //判断上下  还是左右
      if(x < y) return;
      e.preventDefault();
      e.stopPropagation();
      var n = (touchclientX - e.originalEvent.targetTouches[0].clientX)/100;
      if(n <= 2.19 && n>=0){
        if($(this).find('.delItem').width() != 0){
          return;
        }
        if(n > 1){
          $(this).find('.delItem').css('width',"2.19rem");
          $(this).find('.itemMain').css('transform',"translateX(-2.5rem)");
          $(this).find('.itemMain').css('webkitTransform',"translateX(-2.5rem)");
        }else{
          $(this).find('.delItem').css('width',"0");
          $(this).find('.itemMain').css('transform',"translateX(0)");
          $(this).find('.itemMain').css('webkitTransform',"translateX(0)");
        }
      }else if(n < 0 && n>=-2.19){
        var m = 2.19+n;
        if($(this).find('.delItem').width() == 0){
          return;
        }
        if(m <= 1){
          $(this).find('.delItem').css('width',"0");
          $(this).find('.itemMain').css('transform',"translateX(0)");
          $(this).find('.itemMain').css('webkitTransform',"translateX(0)");
        }else{
          $(this).find('.delItem').css('width',"2.19rem");
          $(this).find('.itemMain').css('transform',"translateX(-2.5rem)");
          $(this).find('.itemMain').css('webkitTransform',"translateX(-2.5rem)");
        }
      }
    }
  })
  //单个商品删除
  page.on("click",".delItem",function(){
      var that = this;
      var data = {
            cid: $(this).data('cid')
          }
      clearShopping(data, "GET", function (data){
        if(data.status == 1){
          var list = $(that).parents('.list');
          $(that).parents('.item').remove();
          //当卖家列表中没有商品时
          var items = list.find('.item').length;
          if(items == 0){
              list.remove();
          }
          $.toast(data.info,800);
          count();
          clear();
        } else {
          $.toast(data.info,800);
        }
      })
  })
  // 编辑
  page.on('click', '.edit_shopping_cart', function(){
    $(this).css('display', 'none');
    $('.edit_finish').css('display', 'block');
    $('.purchase').css('display', 'none');
    $('.deleteAll').css('display', 'block');
    $('.hide_content').css('display', 'none');
    $('.checkbox').each(function(){
      var status = $(this).hasClass('noInventory');
      $(this).removeClass('affirm');
      if(status){
        $(this).attr('data-noInventory', 1);
        $(this).removeClass('noInventory');
      }else{
        $(this).attr('data-noInventory', 0);
      }
    })
    count();
  })
  // 完成
  page.on('click', '.edit_finish', function(){
    $(this).css('display', 'none');
    $('.edit_shopping_cart').css('display', 'block');
    $('.purchase').css('display', 'block');
    $('.deleteAll').css('display', 'none');
    $('.hide_content').css('display', 'block');
    
    $('.checkbox').each(function(){
      var status = $(this).attr('data-noInventory');
      $(this).removeClass('affirm');
      if(status == 1){
        $(this).addClass('noInventory');
      }
      $(this).removeAttr('data-noInventory');
    })
  })
  // 删除购物车商品
  page.on('click', '.deleteAll', function(){
    //卖家列表 全选时
    var arr = [];
    $('.affirm').each(function(){
        if($(this).parents('.title').length >= 1 || $(this).parents('.allPrice').length >= 1){
          return true;
        }
        if($(this).attr('data-noInventory') == 1 || $(this).attr('data-noInventory') == 0){
          arr.push($(this).parents('.item').data("cid"));
        }
    })
    var data = {
      cids: arr
    }
    $.confirm('确定要删除？', function () {
      clearShopping(data, "POST", function (data){
        if(data.status == 1){
          $('.affirm').each(function(){
            if($(this).parents('.title').length >= 1 || $(this).parents('.allPrice').length >= 1){
              return true;
            }
            if($(this).attr('data-noInventory') == 1 || $(this).attr('data-noInventory') == 0){
              $(this).parents('.item').remove();
            }
          })
          $('.list').each(function(){
            var items = $(this).find('.item').length;
            if(items == 0){
              $(this).remove();
            }
          })
          clear();
          $.toast(data.info,800);
        } else {
          $.toast(data.info,800);
        }
      })
    });
  })
  //商品加减
  page.on("click",".minus",function(){
    //如果商品售空直接返回
    var that = this;
    var noInventory = $(that).parents('.item').find('.checkbox').hasClass('noInventory');
    if(noInventory){
      return;
    }
    //数量
    var n = $(that).parents('.message').find('.countNum').text();
    n--;
    if(n < 1) return;
    $(that).parents('.message').find('.number').text(n);
    $(that).parents('.message').find('.countNum').text(n);
    editShoppingNum({
      object_id: $(that).attr('data-id'),
      mid: $(that).attr('data-mid'),
      nums: -1,
    },function(data){
      $(that).parents('.message').find('.number').text(data.data);
      $(that).parents('.message').find('.countNum').text(data.data);
      count();
    })
  })
  page.on("click",".add",function(){
    //如果商品售空直接返回
    var that = this;
    var noInventory = $(that).parents('.item').find('.checkbox').hasClass('noInventory');
    if(noInventory){
      return;
    }
    //数量
    var n = $(that).parents('.message').find('.countNum').text();
    var m = $(that).parents('.message').find('.remain span').text();
    n++;
    if(n > m ) {
      $.toast('当前库存数量'+m);
      return;
    }
    // $(that).parents('.message').find('.number').text(n);
    // $(that).parents('.message').find('.countNum').text(n);
    editShoppingNum({
      object_id: $(that).attr('data-id'),
      mid: $(that).attr('data-mid'),
      nums: 1,
    },function(data){
      $(that).parents('.message').find('.number').text(data.data);
      $(that).parents('.message').find('.countNum').text(data.data);
      count();
    })
  })
  //选择购买的商品
  page.on("click",".selectBox",function(){
    var that = this;
    var status = $(this).find('.checkbox').hasClass('affirm');
    var el = $(this).find('.checkbox');
    var elClass = $(this).parent().attr("class");
    // 删除商品
    var inventory_status = $(this).find('.checkbox').attr('data-noInventory');
    if(inventory_status == 1 || inventory_status == 0){
      if(status){
        el.removeClass("affirm");
        select(0);
      }else{
        el.addClass("affirm");
        select(1);
      }
      return false;
    }

    // 购买
    //若没有库存则锁死
    var inventory = $(this).find('.checkbox').hasClass('noInventory');
    if(inventory) return;
    //商品选择
    if(status){
      el.removeClass("affirm");
      select(0);
    }else{
      el.addClass("affirm");
      select(1);
    }
    //计算价格
    count();
    //判断是否全选
    allOption(this);
    function select(n){
      if(elClass == 'title'){
        $(that).parents('.list').find('.checkbox').each(function(){
          if(n == 1){
            $(this).addClass("affirm");
          }else{
            $(this).removeClass("affirm");
          }
        })
      }else if(elClass == 'allPrice'){
        $('.checkbox').each(function(){
          if(n == 1){
            $(this).addClass("affirm");
          }else{
            $(this).removeClass("affirm");
          }
        })
      }
    }
  })
  //点击购买前的判断
  page.on("click",".purchase",function(){
    var arr = [],
    boolean = true;
    $('.checkbox').each(function(){
      if($(this).data("cid") && $(this).hasClass("noInventory")) return;
      var num = parseInt($(this).parents(".item").find('.countNum').text());
      if(num <= 0){
        $.toast('请填写正确的商品数量',1000);
        boolean = false;
      }
      if($(this).data("cid") && $(this).hasClass("affirm")) {
        var obj = {
          cid: $(this).data("cid")
        }
        arr.push(obj);
      }
    })
    if(!arr.length) {
      $.toast('请选择要购买的商品',1000);
      boolean = false;
    }
    sessionStorage.cid = JSON.stringify(arr);
    return boolean;
  })
  //计算总价
  function count () {
    var num = 0;
    $('.item').each(function () {
      var status = $(this).find('.checkbox').hasClass('affirm');
      var noInventory = $(this).find('.checkbox').hasClass('noInventory');
      if(status && !noInventory){
        var n = parseInt($(this).find('.unitPrice').text());
        var m = parseInt($(this).find('.number').text());
        num += n*m;
      }
    })
    $('.price').find('span').text(num);
  }
  //当商品被清空
  function clear() {
    var lis = $(".list").length;
    if(lis == 0){
      $('.allPrice').css('display','none');
      $('.noData').css('display','block');
      $('.edit_shopping_cart').css('display', 'block');
      $('.edit_finish').css('display', 'none');

    }
  }
  //删除购物车商品接口
  function clearShopping (data, type, callBack){
    $.ajax({
      type: type,
      url: '/index.php?g=restful&m=HsShoppingCart&a=delete',
      data: data,
      dataType: 'json',
      timeout: 4000,
      success: callBack,
      error: function(xhr, type){
        $.toast('网络错误 code:'+xhr);
      }
    })
  }
  //全选优化判断
  function allOption (that){
    var state = true;
    $(that).parents('.list').find(".details .checkbox").each(function(){
      if(!$(this).hasClass('affirm')){
        state = false;
        return;
      }
    })
    if(state){
      $(that).parents('.list').find(".title .checkbox").addClass('affirm');
    }else{
      $(that).parents('.list').find(".title .checkbox").removeClass('affirm');
    }
    var status = true;
    $(".context").find(".checkbox").each(function(){
      if(!$(this).hasClass('affirm')){
        status = false;
        return;
      }
    })
    if(status){
      $('.allPrice').find(".checkbox").addClass('affirm');
    }else{
      $('.allPrice').find(".checkbox").removeClass('affirm');
    }
  }
  function editShoppingNum(data, callBack){
    $.ajax({
      type: 'POST',
      url: '/index.php?g=restful&m=HsShoppingCart&a=add',
      data: data,
      success: callBack,
      error: function(xhr, type){
        console.log(type);
      }
    })
  }


  //buy页面 初始化
  if(sessionStorage.cid){
    var selectItems = JSON.parse(sessionStorage.cid);
    $(".good_info").each(function(){
      var that = this;
      //标记 判断是否选中
      var status = false;
      $.each(selectItems, function (n, value){
        var cid = $(that).data("cid");
        if(value.cid == cid){
          status = true;
        }
      })
      if(!status){
        $(this).remove();
      }
    })
    
    $(".lists").each(function(){
      if(!$(this).find('.good_info').length){
        $(this).remove();
      }
    })
    postage();
    countCompletePrice();
    $(".user-mychart-buy").css("display","block");
  }
  //buy 加邮费计算总价格
  function countCompletePrice(){
    var all_price = 0;
    var all_postage = 0;
    $(".good_info").each(function(){
      var n = parseInt($(this).find('.good_price').attr('data-price')),
      m = parseInt($(this).find('.good_num').attr('data-numbers'));
      all_price += n*m;
    })
    $('.lists').each(function(){
      var n = parseInt($(this).attr('data-maxpostage'));
      all_postage += n;
    })
    all_price += all_postage;
    $('.all_price_num').text(all_price);
    // $('.all_postage_num').text(all_postage); //总运费初始化为"请填写地址"所以不需要初始化。
  }
  //下订单
  var payment_status = false;
  page.on("click",".payment",function(){
    if(payment_status){
      return $.toast('订单正在生成中');
    }
    payment_status = true;
    var post_data = {
      // 'order[orders][0][object_id]': $(this).data('id'), //id
      // 'order[orders][0][counts]': order_number.val(),     //数量
      // 'order[orders][0][attach]': attach.val(),           //备注
      // 'order[orders][0][seller_name]':$(this).data('username'), //卖家name
      // 'order[orders][0][mid]':$(this).data('mid'),    //类型
      'order[type]': 1,
      'order[payment_type]': 0,
      'order[address_id]':$(this).attr('data-address_id'),
    };
    //组订单
    $('.lists').each(function(index){
      var that = this;
      var num = index;
      var seller_name = 'order[orders]['+num+'][seller_name]',
      attach = 'order[orders]['+num+'][attach]',
      seller_uid = 'order[orders]['+num+'][seller_uid]';
      post_data[seller_name] = $(this).data('name');
      post_data[attach] = $(this).find('.attach').val();
      post_data[seller_uid] = $(this).data('seller_user_id');
      //子订单
      $(this).find('.good_info').each(function(i){
        var object_id = 'order[orders]['+num+'][goods]['+i+'][object_id]';
        var mid = 'order[orders]['+num+'][goods]['+i+'][mid]';
        var counts = 'order[orders]['+num+'][goods]['+i+'][counts]';
        post_data[object_id] = $(this).data('object_id');
        post_data[counts] = $(this).find('.good_num').attr('data-numbers');
        post_data[mid] = $(this).attr('data-type');
      })
    })
    orders(post_data);
  })
  //下单请求
  function orders (data) {
    $.post('/index.php?g=restful&m=HsOrder&a=union_add',data,function(data){
      payment_status = false;
      if(data.status == 1){
        var ok_url = GV.pay_url+'hsjsapi.php?order_number=' + data.order_number + '&digital_goods=0';
        window.location.href = ok_url;
      } else {
        $.toast(data.info);
      }
    })
  }
  // 设置每个卖家商品的最高邮费
  function postage(){
    $('.lists').each(function(){
      var maxPostage = 0;
      var that = this;
      $(this).find(".good_info").each(function(){
        var n = $(this).data('postage');
        if(n > maxPostage){
          maxPostage = n;
        }
      })
      // $(that).find('.express .postage').text(maxPostage); //总运费初始化为"请填写地址"所以不需要初始化。
      $(that).attr('data-maxpostage', maxPostage);
    })
  }


/*
  //优惠券
  var ApiBaseUrl = init.getApiBaseUrl();
  var phpsessionid = init.getCookie('PHPSESSID');
  var sellerCoupon = {};
  var $showCoupon = page.find('.show_coupon');
  $showCoupon.each(function(){
      var $this = $(this);
      var sellerid = $this.attr('sellerid');
      getSellerCouponList(sellerid,$this);

  });
  page.on('click','.show_coupon',function(){
      var $this = $(this);
      var sellerid = $this.attr('sellerid');
  });

  function getSellerCouponList(id,$btn){
      var url = ApiBaseUrl + '/appv6/coupon/'+ id +'/getSellerCouponList';

      $.ajax({
          type: "GET",
          url: url,
          dataType: 'json',
          data: {},
          // headers: {
          //     'phpsessionid': phpsessionid,
          // },
          success: function(data){
              if(data.status==1){
                  console.log(data.data)
              }
          },
          error: function(e){
              console.log('getGoodsCoupon err: ',e);
          }
      });

  }
*/

});
