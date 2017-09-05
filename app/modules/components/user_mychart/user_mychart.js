//购物车页面
// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.user-mychart', function(e, id, page){
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);
  init.wx_share(false);
  //初始加载
  var lis = $('.context li').length;
  if(lis != 0){
 	  $('.allPrice').css('display','block');
    //删除本地缓存
    sessionStorage.removeItem('cid');
  }else{
  	$('.noData').css('display','block');
  }
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
          $(this).find('.delItem').css('width',"0rem");
          $(this).find('.itemMain').css('transform',"translateX(0)");
          $(this).find('.itemMain').css('webkitTransform',"translateX(0)");
        }
      }else if(n < 0 && n>=-2.19){
        var m = 2.19+n;
        if($(this).find('.delItem').width() == 0){
          return;
        }
        if(m <= 1){
          $(this).find('.delItem').css('width',"0rem");
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
  //列表删除
  page.on("click",".delAll",function(){
    //卖家列表 全选时
    var that = this;
    var arr = [];
    $(this).parents('.list').find('.item').each(function(){
        arr.push($(this).data("cid"));
    })
    var data = {
      cids: arr
    }
    $.confirm('确定要删除？', function () {
      clearShopping(data, "POST", function (data){
        if(data.status == 1){
          $(that).parents('.list').remove();
          count();
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
    var noInventory = $(this).parents('.item').find('.checkbox').hasClass('noInventory');
    if(noInventory){
      return;
    }
  	//数量
  	var n = $(this).parents('.message').find('.countNum').text();
  	n--;
  	if(n < 1) return;
  	$(this).parents('.message').find('.number').text(n);
  	$(this).parents('.message').find('.countNum').text(n);
  	count();
  })
  page.on("click",".add",function(){
    //如果商品售空直接返回
    var noInventory = $(this).parents('.item').find('.checkbox').hasClass('noInventory');
    if(noInventory){
      return;
    }
  	//数量
    var n = $(this).parents('.message').find('.countNum').text();
  	var m = $(this).parents('.message').find('.remain span').text();
  	n++;
    console.log(n+"/"+m)
  	if(n > m ) {
      $.toast('超过库存数量'+m);
      return;
    }
  	$(this).parents('.message').find('.number').text(n);
  	$(this).parents('.message').find('.countNum').text(n);
  	count();
  })
  //选择购买的商品
  page.on("click",".selectBox",function(){
    //若没有库存则锁死
    var inventory = $(this).find('.checkbox').hasClass('noInventory');
    if(inventory) return;
    //商品选择
  	var el = $(this).find('.checkbox');
  	var status = $(this).find('.checkbox').hasClass('affirm');
  	if(status){
  		el.removeClass("affirm");
	  	var elClass = $(this).parent().attr("class");
	  	if(elClass == 'title'){
	  		$(this).parents('.list').find('.checkbox').each(function(){
	  			$(this).removeClass("affirm");
	  		})
	  	}else if(elClass == 'allPrice'){
	  		$('.checkbox').each(function(){
	  			$(this).removeClass("affirm");
	  		})
	  	}
  	}else{
  		el.addClass("affirm");
	  	var elClass = $(this).parent().attr("class");
	  	if(elClass == 'title'){
	  		$(this).parents('.list').find('.checkbox').each(function(){
	  			$(this).addClass("affirm");
	  		})
	  	}else if(elClass == 'allPrice'){
	  		$('.checkbox').each(function(){
	  			$(this).addClass("affirm");
	  		})
	  	}
  	}
    //计算价格
  	count();
    //判断是否全选
    allOption(this);
  })
  //点击购买前的判断
  page.on("click",".purchase",function(){
    var arr = [],
    boolean = true;
    $('.checkbox').each(function(){
      if($(this).data("cid") && $(this).hasClass("noInventory")) return;
      if($(this).data("cid") && $(this).hasClass("affirm")) {
        var obj = {
          cid: $(this).data("cid"),
          num: $(this).parents(".item").find('.countNum').text()
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
  		if(status){
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



  //buy页面 初始化
  if(sessionStorage.cid){
    var selectItems = JSON.parse(sessionStorage.cid);
    $(".list").each(function(){
      var that = this;
      //标记 判断是否选中
      var status = false;
      $.each(selectItems, function (n, value){
        var cid = $(that).data("cid");
        if(value.cid == cid){
          $(that).find(".numbers").text(value.num);
          status = true;
        }
      })
      if(!status){
        $(this).remove();
      }
    })
    
    $(".lists").each(function(){
      if(!$(this).find('.list').length){
        $(this).remove();
      }
    })
    postage();
    countCompletePrice();
    $(".user-mychart-buy").css("display","block");
  }
  //buy 加邮费计算总价格
  function countCompletePrice(){
    var num = 0;
    $(".list").each(function(){
      var n = parseInt($(this).find('.unitPrice').text()),
      m = parseInt($(this).find('.numbers').text());
      num += n*m;
    })
    $(".postage").each(function(){
      var n = parseInt($(this).text());
      num += n;
    })
    $('.completePrice').text(num);
  }
  //下订单
  page.on("click",".next",function(){
    $(this).addClass('disabled');
    var post_data = {
      // 'order[orders][0][object_id]': $(this).data('id'), //id
      // 'order[orders][0][counts]': order_number.val(),     //数量
      // 'order[orders][0][attach]': attach.val(),           //备注
      // 'order[orders][0][seller_name]':$(this).data('username'), //卖家name
      // 'order[orders][0][mid]':$(this).data('mid'),    //类型
      'order[type]': 1,
      'order[payment_type]': 0
    };
    //组订单
    $('.lists').each(function(index){
      var num = index;
      var seller_name = 'order[orders]['+num+'][seller_name]',
      attach = 'order[orders]['+num+'][attach]',
      seller_uid = 'order[orders]['+num+'][seller_uid]';
      post_data[seller_name] = $(this).data('name');
      post_data[attach] = $(this).find('input').val();
      post_data[seller_uid] = $(this).find('.list').data('seller_user_id');
      //子订单
      $(this).find('.list').each(function(index){
        var object_id = 'order[orders]['+num+'][goods]['+index+'][object_id]';
        var mid = 'order[orders]['+num+'][goods]['+index+'][mid]';
        var counts = 'order[orders]['+num+'][goods]['+index+'][counts]';
        post_data[object_id] = $(this).data('object_id');
        post_data[counts] = $(this).find('.numbers').text();
        post_data[mid] = $(this).find('.styles').data('mid');
      })
    })
    orders(post_data)
  })
  //下单请求
  function orders (data) {
    $.post('/index.php?g=restful&m=HsOrder&a=union_add',data,function(data){
      if(data.status == 1){
        var ok_url = GV.pay_url+'hsjsapi.php?order_number=' + data.order_number;
        setTimeout(function(){
          window.location.href = ok_url;
        },500);
        init.cnzz_push('下订单',{
          '订单ID': data.order_number
        });
      } else {
        $.toast(data.info);
      }
    })
  }
  //判读取最高邮费
  function postage(){
    $('.lists').each(function(){
      var maxPostage = 0;
      var that = this;
      $(this).find(".list").each(function(){
        var n = $(this).data('postage');
        if(n > maxPostage){
          maxPostage = n;
          $(that).find('.postage').text(maxPostage);
        }
      })
    })
  }
});
