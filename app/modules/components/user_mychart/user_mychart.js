/**
 * FBI warning　！！！：　
 * 这个页的js不仅是购物车页，还包含了初始化订单页的代码！！！/User/MyChart/index.html
 * WTF
 * */

//购物车页面
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.user-mychart', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.checkfollow();

  var ApiBaseUrl = init.getApiBaseUrl();

  var PHPSESSID = init.getCookie('PHPSESSID');
  var ajaxHeaders = {
      'phpsessionid': PHPSESSID
  };

  //限购json
  var $cartData = $('.cartData');
  var chartData = null;
  var limitBuyData = null;
  if($cartData.length>0){
      chartData = JSON.parse($cartData.attr('value'));
      initLimitBuy(chartData);
  }

    init.sensorsFun.bottomNav();

    $(page).find('.recommend').on('click',function(){
        init.sensors.track('buttonClick', {
            pageType : '购物车',
            buttonName : '相似商品',
        })
    });


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

    //  限购标签
    $('.item[data-limit_mask="1"]').attr('data-limit_mask','2');

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

    //  限购标签
    $('.item[data-limit_mask="2"]').attr('data-limit_mask','1');

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
    var $item = $(that).parents('.item');
    var noInventory = $item.find('.checkbox').hasClass('noInventory');
    if($item.attr('num_editing')==='1'){
      return;//接口正在发送信息不允许点击
    }
    if(noInventory){
      return;
    }
    //限购显示遮罩不可点击
    if($item.attr('data-limit_mask')==='1'){
      return;
    }
    //数量
    var n = $(that).parents('.message').find('.countNum').text();
    n--;
    if(n < 1) return;
    var minNum = -1;//默认设置减1
    //限购判断 减的时候不做判断
    // var limitNum = fixLimitNum(n, $item);
    // if(n > limitNum){
    //     return ;//可以计算一下，直接调用减几个的接口
    //     // minNum = limitNum - n - 1;
    // }

    // $(that).parents('.message').find('.number').text(n);//需要注释掉，跟下面调用接口重复
    // $(that).parents('.message').find('.countNum').text(n);
    $item.attr('num_editing','1');
    editShoppingNum({
      object_id: $(that).attr('data-id'),
      mid: $(that).attr('data-mid'),
      nums: minNum,//接口要传入加多少或减多少
    },function(data){
      $(that).parents('.message').find('.number').text(data.data);
      $(that).parents('.message').find('.countNum').text(data.data);
      count();
      disableLimitAll();//对所有款式限购的其他款式进行 禁用 / 启用
    }, function(){
        $item.attr('num_editing','0');
    })
  })
  page.on("click",".add",function(){
    //如果商品售空直接返回
    var that = this;
    var $item = $(that).parents('.item');
    var noInventory = $item.find('.checkbox').hasClass('noInventory');
    if($item.attr('num_editing')==='1'){
        return;//接口正在发送信息不允许点击
    }
    if(noInventory){
      return;
    }
    //限购显示遮罩不可点击
    if($item.attr('data-limit_mask')==='1'){
        return;
    }
    //数量
    var n = $(that).parents('.message').find('.countNum').text();
    var m = $(that).parents('.message').find('.remain span').text();
    n++;

    //限购判断，在限购中同时对库存进行判断
    var limitNum = fixLimitNum(n, $item);
    if(n > limitNum){
        return ;
    }

    if(n > m ) {
      $.toast('当前库存数量'+m);
      return;
    }

    // $(that).parents('.message').find('.number').text(n);
    // $(that).parents('.message').find('.countNum').text(n);
    $item.attr('num_editing','1');
    editShoppingNum({
      object_id: $(that).attr('data-id'),
      mid: $(that).attr('data-mid'),
      nums: 1,
    },function(data){
      $(that).parents('.message').find('.number').text(data.data);
      $(that).parents('.message').find('.countNum').text(data.data);
      count();
      disableLimitAll();//对所有款式限购的其他款式进行 禁用 / 启用
    }, function(){
        $item.attr('num_editing','0');
    })
  })
  //选择购买的商品
  page.on("click",".selectBox",function(){

      selectBoxClick(this);
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

  //更改商品数量的接口
  function editShoppingNum(data, callBack,complete){
    $.ajax({
      type: 'POST',
      url: '/index.php?g=restful&m=HsShoppingCart&a=add',
      data: data,
      success: callBack,
      error: function(xhr, type){
        console.log(type);
      },
      complete: function(){
        if(typeof complete === "function"){
          complete();
        }
      }
    })
  }

/**
 * warning: 下面是初始化订单页的相关功能  /User/MyChart/index.html
 * */
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
    window.FUNgetAddress();
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
    var addressid = $(this).attr('data-address_id');

    if(addressid==0){
        return $.toast('请先选择地址');
    }
    payment_status = true;

    var orderData = {
        "address_id":addressid,
        "orders":[
            /*{
                "attach":'',//备注
                "seller_name":'',
                "seller_uid":'',
                "items":[
                    {
                        "counts":'',
                        "item_id":'',//商品id
                        "mid":'',//款式id
                    }
                ],
            }*/
        ],
        "type":1, //类型 1商品订单 0打赏
        // "user_coupon_id":""
    };
    $('.lists').each(function(index){
        var that = this;

        var order = {
            attach: $(this).find('.attach').val(),
            seller_name: $(this).data('name'),
            seller_uid: $(this).data('seller_user_id'),
            items: []
        };

        //子订单
        $(this).find('.good_info').each(function(i){
            var item = {
                counts: $(this).find('.good_num').attr('data-numbers'),
                item_id: $(this).data('object_id'),
                mid: $(this).attr('data-type'),
            };
            order.items.push(item);
        });

        orderData.orders.push(order);
    })
    createOrder(orderData);

/*
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
*/



  })
  //疑似废弃
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

    //    创建订单api接口
  function createOrder(data){
      //    创建订单api接口

      $.ajax({
          type: "POST",
          url: ApiBaseUrl + '/appv6/createorder',
          dataType: 'json',
          data: data,
          headers: ajaxHeaders,

          success: function(data){
              if(data.status==1){
                  // console.log(data.data)
                  var ok_url = ''
                  if(GV.device === 'moblie'){
                    //移动端非微信h5环境使用
                    ok_url = '/Portal/HsPayment/pay.html?order_number=' + data.data
                  }else{
                    ok_url = GV.pay_url+'native.php?order_number=' + data.data;
                  }

                  window.location.href = ok_url;
              }else{
                  $.toast(data.info);
              }
              payment_status = false;

          },
          error: function(e){
              payment_status = false;
              $.toast('网络故障，请稍后重试');
              console.log('createOrder err: ',e);
          }
      });

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

/**
 * 限购相关
 * */
//限购相关
    function initLimitBuy(chartData) {
        parseLimitData(chartData);
        addLimitProp(limitBuyData);
    }

//    1 解析json数据，全部解析为商品限购的形式，款式限购可视为购物车内无同一id商品
    function parseLimitData(chartData) {
        var limitGoods = {}; //所有限购商品
        if (chartData) {
            for (var seller in chartData) {
                var goods = chartData[seller].goods;

                $.each(goods, function (index, good) {

                    if (good.is_selling == 0 || good.remain == 0) {
                        //下架或没有库存显示失效，不做限购处理
                        return;
                    }

                    if (good.postLockNumber > 0) {
                        //  商品限购
                        good.limitType = 1;
                        good.limitNum = good.postLockNumber - good.postBuyNumber;
                    } else if (good.goodsLockNumber > 0) {
                        //  款式限购
                        good.limitType = 2;
                        good.limitNum = good.goodsLockNumber - good.goodsBuyNumber;
                    } else {
                        return;
                    }
                    limitGoods[good.model_id] = good;
                })
            }
        }
        limitBuyData = limitGoods;
    }

//给限购的商品html增加属性
    function addLimitProp(limitBuyData) {
        for (var key in limitBuyData) {
            var goods = limitBuyData[key];
            var model_id = goods.model_id;
            var $item = $('.item[data-modelid="' + model_id + '"]');
            $item.attr('data-limit_type', goods.limitType);
            if (goods.limitNum > 0) {
                $item.attr('data-limit_num', goods.limitNum);
            } else {
                $item.attr('data-limit_mask', 1);//超出限购
            }
            //添加限购横条
            var $imageA = $item.find('.image a');
            $imageA.find('.remain_status').remove();
            var limitNumber = goods.limitType == 1 ? goods.postLockNumber : goods.goodsLockNumber;
            $imageA.append('<span class="remain_status">限购' + limitNumber + '件</span>');

        }
    }

//  限购数量判断，加减
    function fixLimitNum(num, $item) {

        var remain = parseInt($item.attr('data-remain'))||0;//库存
        var limitNum = parseInt($item.attr('data-limit_num'))||0;
        if ($item.attr('data-limit_type') === '1') {
            //  商品限购
            //    先看当前商品是否被选中，如果当前商品没被选中，不用去循环判断别人，
            // 如果当前商品被选中，需要去判断其他已选择的商品是否数量超过限购
            if ($item.find('.checkbox').hasClass('affirm')) {
                //  被选中
                var total = 0;
                var $items = $item.parent('.details').find('.item[data-postid="'+ $item.attr('data-postid') +'"]')
                $items.each(function(index,item){
                    if ($(this).find('.checkbox').hasClass('affirm')) {
                        total += parseInt($(this).find('.countNum').text());
                    }
                });
                total += 1;//当前所有数量+1才是将要+1后的值
                if(total > limitNum){
                    $.toast('数量超过限购范围');
                    return num-1;
                }

            } else {
                if (remain < limitNum && remain < num) {
                    //  如果库存小于限购数，只提示库存
                    $.toast('当前库存数量' + remain);
                    return remain || 1;
                }
                if (remain >= limitNum && num > limitNum) {
                    $.toast('数量超过限购范围');
                    // setGoodsNum(limitNum || 1, $item);
                    return limitNum || 1;
                }
            }


        } else if ($item.attr('data-limit_type') === '2') {
            //  款式限购

            if (remain < limitNum && remain < num) {
                //  如果库存小于限购数，只提示库存
                $.toast('当前库存数量' + remain);
                return remain || 1;
            }
            if (remain >= limitNum && num > limitNum) {
                $.toast('数量超过限购范围');
                // setGoodsNum(limitNum || 1, $item);
                return limitNum || 1;
            }
        }
    }


//  限购，选中时
    function selectLimit($select) {

        //判断是商品还是多选
        if($select.parent().hasClass('itemMain')){
        //  单选
            var $item = $select.parents('.item')
            var limitType = $item.attr('data-limit_type');
            var limitNum = parseInt($item.attr('data-limit_num'));
            if (limitType === '1') {
                //  商品限购
                //  需要先选中所有的id相同的商品，去计算总数
                var selectNum = 0;//保存已选择的数量
                var $items = $item.parent('.details').find('.item[data-postid="'+ $item.attr('data-postid') +'"]')
                $items.each(function(index,item){
                    if ($(this).find('.checkbox').hasClass('affirm')) {
                        selectNum += parseInt($(this).find('.countNum').text());
                    }
                });
                var maxNum = limitNum - selectNum;//还可选择的最大数量
                var itemNum = parseInt($item.find('.countNum').text());//当前商品的数量
                if(maxNum < itemNum){
                    // $.toast('数量超过限购范围,还可以购买'+ maxNum +'件');
                    if(maxNum>0){
                        ifSetGoodsNum(maxNum, $item);//选中时超出提示是否设置为可买值
                    }
                    return false;
                }


            } else if(limitType === '2'){   //还有不是限购的商品
                //  款式限购
                //  款式限购选中时判断数量，如果数量超出范围，直接设置数量并提示
                var num = parseInt($item.find('.countNum').text());
                if (num > limitNum) {
                    // $.toast('数量超过限购范围');
                    if(limitNum>0){
                        ifSetGoodsNum(limitNum, $item);//选中时超出提示是否设置为可买值
                    }
                    return false;
                }
            }
        }else if($select.parent().hasClass('title')){
        //  店铺全选
            var $list = $select.parents('.list');
            var $items1 = $list.find('.item[data-limit_type="1"]');//商品限购
            var $items2 = $list.find('.item[data-limit_type="2"]');//款式限购

        //    判断款式限购有没有不能选的
            for(let i=0;i<$items2.length;i++){
                let $item = $items2.eq(i);
                let limitNum = parseInt($item.attr('data-limit_num'));
                let num = parseInt($item.find('.countNum').text());
                if (num > limitNum) {
                    $.toast('数量超过限购范围');
                    return false;
                }
            }

        //    判断商品限购有没有不能选的
            var postids = [];//存储处理过的商品

            for(let i=0;i<$items1.length;i++){
                var $item = $items1.eq(i);
                var postid = $item.attr('data-postid');

                if (postids.indexOf(postid) >= 0) {
                    continue;
                }

                postids.push(postid);

                let limitNum = parseInt($item.attr('data-limit_num'));
                let selectNum = 0;//保存已选择的数量
                let $items = $item.parent('.details').find('.item[data-postid="' + $item.attr('data-postid') + '"]');
                $items.each(function (index, item) {
                    selectNum += parseInt($(this).find('.countNum').text());
                });
                if(limitNum < selectNum){
                    $.toast('数量超过限购范围');
                    return false;
                }

            }

        }else if($select.parent().hasClass('allPrice')){
        //  全选

            var $list = $('.list');
            var $items1 = $list.find('.item[data-limit_type="1"]');//商品限购
            var $items2 = $list.find('.item[data-limit_type="2"]');//款式限购

            //    判断款式限购有没有不能选的
            for(let i=0;i<$items2.length;i++){
                let $item = $items2.eq(i);
                let limitNum = parseInt($item.attr('data-limit_num'));
                let num = parseInt($item.find('.countNum').text());
                if (num > limitNum) {
                    $.toast('数量超过限购范围');
                    return false;
                }
            }

            //    判断商品限购有没有不能选的
            var postids = [];//存储处理过的商品

            for(let i=0;i<$items1.length;i++){
                var $item = $items1.eq(i);
                var postid = $item.attr('data-postid');

                if (postids.indexOf(postid) >= 0) {
                    continue;
                }

                postids.push(postid);

                let limitNum = parseInt($item.attr('data-limit_num'));
                let selectNum = 0;//保存已选择的数量
                let $items = $item.parent('.details').find('.item[data-postid="' + $item.attr('data-postid') + '"]');
                $items.each(function (index, item) {
                    selectNum += parseInt($(this).find('.countNum').text());
                });
                if(limitNum < selectNum){
                    $.toast('数量超过限购范围');
                    return false;
                }

            }

        }

        return true;
    }

//    对所有款式限购的其他款式进行 禁用 / 启用
    function disableLimitAll(){
        var $details = $('.context .list .details');//所有的店铺
        $details.each(function(){
            var $modelItems = $(this).find('.item[data-limit_type="1"]');
            var postids = [];//存储处理过的商品
            if($modelItems.length<2){
                return ;
            }else{
                $modelItems.each(function () {
                    var postid = $(this).attr('data-postid');

                    if (postids.indexOf(postid) >= 0) {
                        return;
                    }

                    postids.push(postid);

                    var $item = $(this);
                    var limitNum = parseInt($item.attr('data-limit_num'));
                    var selectNum = 0;//保存已选择的数量
                    var $items = $item.parent('.details').find('.item[data-postid="' + $item.attr('data-postid') + '"]');
                    $items.each(function (index, item) {
                        if ($(this).find('.checkbox').hasClass('affirm')) {
                            selectNum += parseInt($(this).find('.countNum').text());
                        }
                    });

                    var maxNum = limitNum - selectNum;//还可选择的最大数量

                    //禁用/启用 其他选项
                    $items.each(function (index, item) {
                        if (!$(this).find('.checkbox').hasClass('affirm')) {
                            $(this).attr('data-limit_mask', (maxNum > 0 ? 0 : 1));
                        }
                    });

                });
            }
        })
    }

//    对某个款式限购的其他款式进行 禁用 / 启用
    function disableLimit($item) {
        var limitType = $item.attr('data-limit_type');
        var limitNum = parseInt($item.attr('data-limit_num'));
        if (limitType === '1') {
            var selectNum = 0;//保存已选择的数量
            var $items = $item.parent('.details').find('.item[data-postid="' + $item.attr('data-postid') + '"]');
            $items.each(function (index, item) {
                if ($(this).find('.checkbox').hasClass('affirm')) {
                    selectNum += parseInt($(this).find('.countNum').text());
                }
            });

            var maxNum = limitNum - selectNum;//还可选择的最大数量

            //禁用/启用 其他选项
            $items.each(function (index, item) {
                if (!$(this).find('.checkbox').hasClass('affirm') && $(this).attr('data-modelid') !== $item.attr('data-modelid')) {
                    $(this).attr('data-limit_mask', (maxNum > 0 ? 0 : 1));
                }
            });

        }

    }

//  设置商品数量
    function setGoodsNum(targetNum, $item) {
        var $countNum = $item.find('.countNum');
        var $number = $item.find('.number');
        var nowNum = $countNum.text();
        var changeNum = targetNum - nowNum;
        editShoppingNum({
            object_id: $item.attr('data-postid'),
            mid: $item.attr('data-modelid'),
            nums: changeNum,
        }, function (data) {
            $number.text(data.data);
            $countNum.text(data.data);
            count();
            disableLimitAll();//对所有款式限购的其他款式进行 禁用 / 启用
            $item.attr('num_editing','0');

            // $item.find('.selectBox').trigger('click');

            selectBoxClick($item.find('.selectBox'));

        }, function(){
            $item.attr('num_editing','0');
        })
    }

//  是否设置商品数量
    function ifSetGoodsNum(targetNum, $item){
        $.confirm('当前最大可购买数量为'+ targetNum +'件，是否将商品数量设置为'+ targetNum +'件', function () {
            setGoodsNum(targetNum, $item);
        });
    }

    //selectBox的click函数
    function selectBoxClick(that) {
        // var that = this;
        var status = $(that).find('.checkbox').hasClass('affirm');
        var el = $(that).find('.checkbox');
        var elClass = $(that).parent().attr("class");
        // 删除商品
        var inventory_status = $(that).find('.checkbox').attr('data-noInventory');
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
        var inventory = $(that).find('.checkbox').hasClass('noInventory');
        if(inventory) return;

        //限购：如果当前商品已经设置为限购不可买，返回
        var limitMask = $(that).parents('.item').attr('data-limit_mask');
        if(limitMask === '1'){
          return;
        }


        //限购：如果是取消选中的操作，不检查
        if(!el.hasClass('affirm')){
            if(selectLimit($(that)) === false){
                return;
            };
        }

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
        allOption(that);

        //禁用/启用其他款式
        disableLimitAll();

        //判断是否要全选卖家商品或所有商品
        function select(n){
            if(elClass == 'title'){
                //全选卖家商品
                $(that).parents('.list').find('.checkbox').each(function(){
                    if(n == 1){
                        $(this).addClass("affirm");
                    }else{
                        $(this).removeClass("affirm");
                    }
                })
            }else if(elClass == 'allPrice'){
                //全选所有商品
                $('.checkbox').each(function(){
                    if(n == 1){
                        $(this).addClass("affirm");
                    }else{
                        $(this).removeClass("affirm");
                    }
                })
            }
        }
    }




//    购物车页神策
    //  神策埋点事件
    sensorsEvent();
    function sensorsEvent() {

        //随便看看 购物车页
        $(page).find('.correlation .goods_content').on('click','a',function(){
            var $this = $(this);
            var $li = $this.parents('.goods_list');
            var url = $this.attr('href');
            var index = $li.index();
            var title = '';
            var desc = '';
            var id = '';
            if($this.hasClass('filepath')||$this.hasClass('post_title')){
                //商品
                title = $li.find('.post_title').html();
                desc = '商品';
                id = init.sensorsFun.getUrlId(url);
            }else if($this.hasClass('classify_keyword')){
                //标签
                title = $this.html();
                desc = '标签';
            }else{
                //卖家id
                title = init.sensorsFun.getUrlId(url);
                desc = '店铺'
            }

            init.sensorsFun.mkt('随便看看','购物车页',title,index,desc,id);

        });

    }
});
