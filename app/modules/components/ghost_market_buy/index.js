
// 初始化
var common = require('../common/common.js');
// 微信jssdk
var wx = require('weixin-js-sdk');

$(document).on('pageInit','.ghost_market_buy', function(e, id, page) {

    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);
    init.ifLogin(true);
    var ApiBaseUrl = init.getApiBaseUrl();
    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };
    var goodsId = init.getUrlParam('id');
    var totalPrice = 0; //商品总价
    var goodsStockNum = 0;//商品库存数量
    var goodsNum = 1;
    var goodsPrice = 0;
    $.ajax({
        url:ApiBaseUrl+'/ghostmarket/goods/'+ goodsId +'/getDetail',
        headers: ajaxHeaders,
        type:'GET',
        success:function(res){
            if(res.status == 1){
                goodsStockNum = res.data.detail.gg_num;
                let sellerHtml = '<img src="'+ res.data.user.avatar +'"><span>'+ res.data.user.nickname +'</span>';
                goodsPrice = res.data.detail.gg_price;
                totalPrice = goodsPrice;
                $('.total_price span').html('￥'+totalPrice);
                $('.goods_seller').html(sellerHtml);
                let goodsHtml = '<img class="goods_img hs-fl" src="'+ res.data.detail.gg_img[0] +'">' +
                    '             <div class="hs-fl goods_mes_right">' +
                    '                 <p class="goods_name">'+ res.data.detail.gg_title +'</p>' +
                    '                 <div class="goods_price hs-cf">' +
                    '                     <span class="hs-fl">￥'+ goodsPrice +'</span>' +
                    '                     <p class="hs-fr">x<span class="buy_goods_num">1</span></p>' +
                    '                 </div>' +
                    '             </div>';
                $('.goods_mes_con').html(goodsHtml);
                $('#reduceNum').on('click',addNum);
                $('#addNum').on('click',reduceNum);
            }else{
                $.toast(res.info)
            }
        },
        error:function(err){
            console.log(err.info)
        }
    });
    //点击留言时处理键盘遮挡输入框的问题；
    var winHeight = $(window).height();
    $(window).resize(function() {
        var thisHeight = $(this).height();
        if (winHeight - thisHeight > 50) {
            $('.goods_mes').css({
                position:'fixed',
                left:0,
                bottom:'1.28rem'
            });
            $('.goods_leave_mes').css('border-bottom','.0267rem solid #e8e8e8;')
        } else {
            $('.goods_mes').css('position','static');
            $('.goods_leave_mes').css('border','none')

        }
    });
    //改变购买数量
    function addNum(){
        goodsNum--;
        if(goodsNum<=1){
            goodsNum = 1;
        }
        $('.buy_goods_num').html(goodsNum);
        totalPrice = goodsNum*goodsPrice;
        $('.total_price span').html('￥'+totalPrice);
    }
    function reduceNum(){
        goodsNum++;
        if(goodsNum>=goodsStockNum){
            goodsNum = goodsStockNum;
        }
        $('.buy_goods_num').html(goodsNum);
        totalPrice = goodsNum*goodsPrice;
        $('.total_price span').html('￥'+totalPrice);
    }
    //获取地址
    var root_url = '/';
    var address_saving = root_url +"index.php?g=restful&m=HsOrder&a=address_saving";//保存地址的接口
    var addressId = '';
    var addressConfig = $('#addressConfig').val();
    addressConfig = JSON.parse(addressConfig);
    wx.config( addressConfig );
    wx.error(function(res){
        alert(JSON.stringify(res));
    });
    $('#choseAddress').click(function(){
        // addrTest({
        wx.openAddress({
            success: function (res) {
                // 页面赋值
                let addressHtml = '<p class="user_con_top">' +
                    '                   <span class="user_con_name">收货人：'+ res.userName +'</span>' +
                    '                   <span class="user_con_tel">'+ res.telNumber +'</span>' +
                    '               </p>' +
                    '               <p class="user_con_bottom">收货地址：'+ res.provinceName+res.cityName+res.countryName+res.detailInfo+res.userName+res.telNumber +'</p>';
                $('.user_address_center').html(addressHtml);
                let address_info = {
    //                    'address[order_number]': '',
                        'address[username]': res.userName,
                        'address[telNumber]': res.telNumber,
                        'address[proviceFirstStageName]': res.provinceName,
                        'address[addressCitySecondStageName]': res.cityName,
                        'address[addressCountiesThirdStageName]': res.countryName,
                        'address[addressDetailInfo]': res.detailInfo,
                        'address[addressPostalCode]': res.nationalCode,
                        'address[default_address]': '1'
                    };
                openaddressCallback(address_info);
            },
            fail: function(res) {
//                alert('openAddressErr: '+JSON.stringify(res));
            },
            cancel: function () {
                alert('填个地址好吗？');
            }
        });
    });
    //调用地址之后请求
    function openaddressCallback(address_info){
        $.ajax({
            url: address_saving,
            data: address_info,
            type: "post",
            dataType: 'json',
            success: function(data){
                if(data.status == '1') {
                    //保存 address id，更新邮费
                    if(data.addressId){
                        addressId = data.addressId;
                        // console.log(data.addressId)
                    }
                }else{
                    console.log('addr save err : ',data.info);
                }
            },
            error : function(e){
                console.log('addr save error : ',e);
            }
        });
    }
    //创建订单
    $('.go_pay').click(function(){
        if(addressId == ''){
            $.toast('请填写收货信息');
            return
        }
        let goodsMes = {};
        let goodsLeaveMes = $('#goodsLeaveMes').val();
        if(goodsLeaveMes !== ''){
            goodsMes.buyer_note = goodsLeaveMes;
        }
        goodsMes.counts = goodsNum;
        goodsMes.postid = goodsId;
        goodsMes.source = 3;
        goodsMes.address_id = addressId;
        $.ajax({
            url:ApiBaseUrl + '/ghostmarket/creatorder',
            type:'POST',
            data:goodsMes,
            headers: ajaxHeaders,
            success:function(res){
                if(res.status == 1){
                    //必须是https
                    location.href = 'https://'+location.hostname+'/payment/test_pay/gsjsapi.php?order_number='+ res.data.order_sn+ '&creatOrderTime='+ res.data.created_at +'&count_down=' + res.data.count_down;
                }else{
                    $.toast(res.info)
                }
            },
            error:function(err){
                $.toast(err.info)
            }
        })
    });
    function addrTest(obj){
        var res = {
            provinceName:'北京市',
            cityName:'北京市',
            countryName:'大兴区',
            detailInfo:'哪有详细地址',
            userName:'勿忘我',
            telNumber:'13500000001',
            nationalCode:'102600',
        };
        obj.success(res);
    }
});