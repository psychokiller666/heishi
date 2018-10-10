

//鬼市商品详情页

// 初始化
var common = require('../common/common.js');
// 微信jssdk
var wx = require('weixin-js-sdk');
var ApiBaseUrl = common.prototype.getApiBaseUrl();
$(document).on('pageInit','.ghost_market_seller', function(e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    var init = new common(page);
    var lazyLoad = init.lazyLoad;

    var ApiBaseUrl = init.getApiBaseUrl();
    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };
    var init = new common(page);
    var sellerId = init.getUrlParam('gg_ghost_id');
    var pageNum = 1;
    var rows = 10;
    var loading = false;//滑动时阻止加载
    var goodsStatus = true;//是否还有数据
    //拼接商品列表
    function getGoods(arr){
        arr.forEach(function(item,index){
            let goodsItem = '<li class="seller_goods_item">' +
                '                            <a class="external" href="/Portal/GhostMarket/article.html?id='+ item.gg_id +'">' +
                // '                                <img class="seller_goods_img" src="'+ item.gg_img[0] +'?x-oss-process=image/resize,m_fill,w_590,h_440" >' +


                '                                <div class="seller_goods_img" style="background: url('+ item.gg_img[0] +'?x-oss-process=image/resize,m_fill,w_590,h_440) no-repeat center center;background-size: cover"></div>' +
                '                                <div class="seller_goods_mes">' +
                '                                    <div class="seller_goods_mes_bg"></div>' +
                '                                    <div class="seller_goods_mes_con">' +
                '                                        <p class="seller_goods_description">'+ item.gg_content +'</p>' +
                '                                        <p class="seller_goods_price">￥'+ item.gg_price +'</p>' +
                '                                    </div>' +
                '                                </div>' +
                '                            </a>' +
                '                        </li>';
            $('.seller_goods').append(goodsItem)
        });
    }
    $.ajax({
        url:ApiBaseUrl + '/ghostmarket/user/'+ sellerId +'/getHomeInfo?page='+pageNum+'&rows='+rows,
        type:"GET",
        headers: ajaxHeaders,
        success:function(res){
            if(res.status != 1){
                $.toast(res.info);
                return;
            }

            let goodsList = res.data.data;
            if(res.data.user.signature == null){
                res.data.user.signature = ''
            }
            // 判断是否还有数据
            if(goodsList.length>=10){
                goodsStatus = true
            }else{
                goodsStatus = false;
            }
            var sellerMes = '<div class="seller_header">' +
                            '    <img src="'+ res.data.user.avatar +'">' +
                            '    <span></span>' +
                            '</div>' +
                            '<p class="seller_name">'+ res.data.user.nickname +'</p>' +
                            '<p class="seller_signature">'+ res.data.user.signature +'</p>' +
                            '<a class="seller_letter external" href="/User/HsMessage/detail/from_uid/'+ sellerId +'">私信</a>';
            $('.seller_mes').html(sellerMes);
            getGoods(goodsList);

            setWXshare(res.data.user);
        }
    });
    $('#sellerScroll').on('scroll',function(ev){
        var $this = $(this);
        if(!goodsStatus){
            $this.off('scroll');
            return;
        }
        if(loading){
            return
        }
        //获取自己的scrollHeight,scrollTop
        var clientHeight = $this.height();
        var scrollHeight = $this[0].scrollHeight;
        var scrollTop = $this.scrollTop();

        //判断距离底部的px
        var diff = scrollHeight - clientHeight - scrollTop <= 300;

        if(diff){
            if(!goodsStatus){
                return;
            }
            if(loading){
                return
            }else{
                loading = true;
            }
            pageNum++;
            $.ajax({
                url:ApiBaseUrl + '/ghostmarket/user/'+ sellerId +'/getHomeInfo?page='+pageNum+'&rows='+rows,
                type:"GET",
                headers: ajaxHeaders,
                success:function(res){
                    let goodsList = res.data.data;
                    if(goodsList.length>=10){
                        goodsStatus = true
                    }else{
                        goodsStatus = false;
                    }
                    getGoods(goodsList);
                    loading = false;
                },
                error:function(res){
                    console.log(res.info)
                }
            })
        }
    });

    //设置微信分享
    function setWXshare(user) {
        var share_data = {
            title: '我是公路鬼市'+ user.g_booth +'号摊主'+ user.nickname,
            desc: '终于抢到了公路鬼市摊位，速来围观有座~',
            link: window.location.href,
            img: user.avatar
        };
        init.wx_share(share_data);
    }
});



