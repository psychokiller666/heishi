// 生成订单页
// 微信jssdk
var wx = require('weixin-js-sdk');
// 页面初始化
var common = require('../common/common.js');

$(document).on('pageInit','.orderform', function (e, id, page) {
  if (page.selector == '.page'){
    return false;
  }
  var init = new common(page);

  var ApiBaseUrl = init.getApiBaseUrl();

  var PHPSESSID = init.getCookie('PHPSESSID');
  var ajaxHeaders = {
      'phpsessionid': PHPSESSID
  };
  $("input").blur(function(){
  	document.body.scrollTop = 0;
	  document.documentElement.scrollTop = 0;
  });
  //如果是九折购买
  var user_coupon_id = null
  window.user_coupon_price =null
  if(getQueryString("fromxsxw")=="nineDiscount"){
    //检查是不是玩过九折的活动
    $('.numbers').find('.min').hide()
    $('.numbers').find('.add').hide()
    if(window.localStorage.getItem('selectStar')&&window.localStorage.getItem('answer')){
      // let url = 'https://img8.ontheroadstore.com/dev_test/1-A-B-C.json?callback=callback'
      let url
      if(localStorage.getItem('xsxw2Report')){
        url =`https://img8.ontheroadstore.com/perfume/jsons/${window.localStorage.getItem('jsonname')}.json`
      }else{
        url =`https://img8.ontheroadstore.com/perfume/json/${window.localStorage.getItem('jsonname')}.json`
      }
     
      $.getJSON(url,function(data){
        localStorage.setItem('xsxwcouponid',data.coupon_id) 
        getDiscountCoupon([data.coupon_id])
      })
    }
  }
  function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return decodeURI(r[2]);
    return null;
  }

   //领取九折优惠券
   function getDiscountCoupon(ids){
    var url = ApiBaseUrl + '/appv6/coupon/receiveMultipleCoupon';
    $.ajax({
      type: "POST",
      url: url,
      dataType: 'json',
      data: {couponList:ids},
      headers: {
        'phpsessionid': PHPSESSID
      },
      success: function(data){
       
        getCouponId(ids)
      },
      error: function(e){
          // $.toast('你还没有九折优惠资格 这个提示需要删掉');
          console.log('getACoupon err: ',e);
      }
    });
  }
  //获取可使用的优惠券id
  function getCouponId(id){
    var orderData = {
      "address_id":'',
      "orders":[
          {
              "attach":$('.attach').val(),//备注
              "items":[
                  {
                      "counts":1,
                      "item_id":$(".payment").data('id'),//商品id
                      "mid":$(".payment").data('mid'),//款式id
                  }
              ],
              "seller_name":$(".payment").data('username'),
              "seller_uid":$(".payment").data('seller_uid'),
          }
      ],
      "type":1 //类型 1商品订单 0打赏
     
  };
    var url = ApiBaseUrl + '/appv6/coupon/getOrderCouponList';
    $.ajax({
      type: "POST",
      url: url,
      dataType: 'json',
      data: orderData,
      headers: {
        'phpsessionid': PHPSESSID
      },
      success: function(data){
  
        console.log(data.data.useCoupon)
        let useCoupon = data.data.useCoupon
        useCoupon.forEach(v => {
          if(v.coupon_id==id[0]){
           
            user_coupon_id = v.id
          
          }
        });
        
      },
      error: function(e){
          // $.toast('你还没有九折优惠资格 这个提示需要删掉');
          console.log('getACoupon err: ',e);
      }
    });
  }
  //限购，加减数量判断
  function limitGoodsNum(num){
    var maxBuyNum = parseInt($('.countNum').attr('data-max-buy-num'));
    //限购
    if(maxBuyNum>0 && num > maxBuyNum){
        $.toast('数量超过限购范围');
        return maxBuyNum;
    }else{
      return num;
    }
  }
    var $addr_sel_wrap = $('.addr_sel_wrap');
      $addr_sel_wrap.on("click",function(){
        // openaddress();
        goToAddressShow();
      });

      //选择地址跳转到/user/HsAddress/show.html?object_id=1095984&mid=869631&number=6
      function goToAddressShow(){
        var object_id = $addr_sel_wrap.attr('object_id')
        var mid = $addr_sel_wrap.attr('mid')
        var number = +$('.countNum').text();
        if(!(number>0)){
          number = 1;
        }
        location.href = '/user/HsAddress/show.html?object_id='+object_id+'&mid='+mid+'&number='+number;
      }
  $('.min').click(function(){
    var num = parseInt($('.countNum').attr('data-num'));
    if(num <= 1){
      return $.toast('最少选择1个');
    }
    num = num - 1;
    num = limitGoodsNum(num);
    $('.countNum').attr('data-num', num);
    $('.countNum').text(num);
    $('.good_num').attr('data-num', num);
    $('.good_num').find('span').text(num);
    all_price();
  })
  //输入框失去焦点时
  let isIdCardOk = false
  $('.post_card input').blur(function(){
    if(checkIdCard()){
      let url = ApiBaseUrl + '/appv6/checkIdNumber';
      let addId = $('.payment').attr('data-address_id')
      let idNum =  $('.post_card input').val()
      $.ajax({
        type: "POST",
        url: url,
        dataType: 'json',
        headers: ajaxHeaders,
        data: {
          address_id: addId,
          id_number: idNum
        },
        success: function(data){
          if(data.code==1){
            $('.post_card input').hide()
            $('.post_card .finish_id').show()
            $('.post_card input').val(idNum)
            $('.post_card .finish_id').html(idNum.substr(0,4)+'**********'+idNum.substr(14,4))
            $.toast('保存成功')
            isIdCardOk =true
          }else{
            $.toast(data.info)
            isIdCardOk =false
          }
         
        },
        error: function(e){
          isIdCardOk= false
        }
      });

    }
  })
  //点击重新输入新的
  $('.finish_id').click(function(){
    $('.post_card input').show()
    $('.post_card input').val('')
    $('.post_card .finish_id').hide()
    isIdCardOk =false
  })
  //检查身份证号js
  function checkIdCard(){
    let _postCard = false
    let postCard = $('.post_card input').val()
    var p = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
    if(!p.test(postCard)){
      $.toast('请检查身份证号')
      isIdCardOk =false
    } else{
      isIdCardOk =true
      _postCard = postCard
    }
    return _postCard
  }
  //验证是否有海外商品
  let isOverSeas = false
  function checkNeedIdCard(){
    let url = ApiBaseUrl + '/appv6/getPostRequireDuty';
    let addId = $('.payment').attr('data-address_id')
    if(addId==0){
      return
    }
    $.ajax({
      type: "GET",
      url: url,
      dataType: 'json',
      headers: ajaxHeaders,
      data: {
        address_id: addId,
        post_list: [$(".payment").data('id')]
      },
    
      success: function(data){
        // $.toast('保存成功')
        
        if(data.data.status){
          isOverSeas= true
          $('.post_card').show()
          if(data.data.shenfenzheng!=""){
            isIdCardOk = true
          }
        }
      },
      error: function(e){
        sessionStorage.setItem('ADDRESS','')
        // getAddress() 不可执行  需要强制刷新
        location.reload()
      }
    });
  }
  checkNeedIdCard()
  $('.add').click(function(){
    var num = parseInt($('.countNum').attr('data-num'));
    var remain = $(this).attr('data-remain');
    if(num >= remain){
      return $.toast('当前库存为' + remain + '件');
    }
    num = num + 1;
    num = limitGoodsNum(num);
    $('.countNum').attr('data-num', num);
    $('.countNum').text(num);
    $('.good_num').attr('data-num', num);
    $('.good_num').find('span').text(num);
    all_price();
  })
  all_price();
  function all_price() {
    var good_price = parseInt($('.good_price').attr('data-price'));
    var countNum = parseInt($('.countNum').attr('data-num'));
    var postage = parseInt($('.all_postage_num').attr('data-postage'));
    var m = good_price * countNum + postage;
    if(getQueryString("fromxsxw")=="nineDiscount"){
    if(localStorage.getItem('xsxwcouponprice')){
      m=m-localStorage.getItem('xsxwcouponprice')
      $('.good_price').text(m)
    }
  }
    $('.all_price_num').text(m);
  }
  // 生成订单
  var payment_status = false;
  //防止多次点击
  let clickFlag = false
  $('.payment').click(function(){
    if(clickFlag==true){
      return
    }
    clickFlag = true
    setTimeout(()=>{
      clickFlag = false
    },600)
    var number = $('.countNum').attr('data-num');
    var addressid = $(this).attr('data-address_id');

    if(addressid==0){
        return $.toast('请先选择地址');
    }
    if(number <= 0){
      return $.toast('请输入正确的数量');
    }
    if(payment_status){
      return $.toast('订单正在生成中');
    }
    //如果是海外商品
    if(isOverSeas){
      if(!isIdCardOk){
        return $.toast('请检查身份证号');
      }
     
    }
    
    //九折
    if(getQueryString("fromxsxw")=="nineDiscount"){
      if(!user_coupon_id){
        // let url =`https://img8.ontheroadstore.com/perfume/json/${window.localStorage.getItem('jsonname')}.json?1134`
        let url
        if(localStorage.getItem('xsxw2Report')){
          url =`https://img8.ontheroadstore.com/perfume/jsons/${window.localStorage.getItem('jsonname')}.json`
        }else{
          url =`https://img8.ontheroadstore.com/perfume/json/${window.localStorage.getItem('jsonname')}.json`
        }
        $.getJSON(url,function(data){
          localStorage.setItem('xsxwcouponid',data.coupon_id) 
          
          getDiscountCoupon([data.coupon_id])
        })
        return $.toast('订单正在生成中')
      }
    }
   
    payment_status = true;
/*    var post_data = {
      'order[orders][0][seller_name]':$(this).data('username'),
      'order[orders][0][attach]': $('.attach').val(),
      'order[orders][0][seller_uid]': $(this).data('seller_uid'),
      'order[orders][0][goods][0][object_id]': $(this).data('id'),
      'order[orders][0][goods][0][counts]': number,
      'order[orders][0][goods][0][mid]':$(this).data('mid'),
      'order[type]': 1,
      'order[payment_type]': 0,
      'order[address_id]':$(this).attr('data-address_id'),

    };
    $.post('/index.php?g=restful&m=HsOrder&a=union_add',post_data,function(data){
      payment_status = false;
      if(data.status == 1){
        var ok_url = GV.pay_url+'hsjsapi.php?order_number=' + data.order_number + '&digital_goods=0';
        window.location.href = ok_url;
      } else {
        $.toast(data.info);
      }
    })*/

      //    创建订单api接口
      var orderData = {
          "address_id":addressid,
          "orders":[
              {
                  "attach":$('.attach').val(),//备注
                  "items":[
                      {
                          "counts":number,
                          "item_id":$(this).data('id'),//商品id
                          "mid":$(this).data('mid'),//款式id
                      }
                  ],
                  "seller_name":$(this).data('username'),
                  "seller_uid":$(this).data('seller_uid'),
              }
          ],
          "type":1, //类型 1商品订单 0打赏
          "user_coupon_id":user_coupon_id
      };

      $.ajax({
          type: "POST",
          url: ApiBaseUrl + '/appv6/createorder',
          dataType: 'json',
          data: orderData,
          headers: ajaxHeaders,

          success: function(data){
              if(data.status==1){
                  // console.log(data.data)
                  /*var tmp = {
                      "status":1,
                      "code":1,
                      "info":"Success",
                      "data":"VR20180820151512ZST5UV"
                  }*/
                  var ok_url = GV.pay_url+'hsjsapi.php?order_number=' + data.data;
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

  })


});
