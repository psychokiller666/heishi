//新人有礼页

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit','.gift_for_new', function(e, id, page) {
    if (page.selector == '.page') {
        return false;
    }
    document.title = '新人有礼';

    var init = new common(page);

    var lazyload = init.lazyLoad;

    var ApiBaseUrl = init.getApiBaseUrl();

    var PHPSESSID = init.getCookie('PHPSESSID');
    var ajaxHeaders = {
        'phpsessionid': PHPSESSID
    };

    // 调用微信分享sdk
    var share_data = {
        title: '公路商店 — 新人礼遇',
        desc: '为你不着边际的企图心',
        link: window.location.href,
        img: 'https://jscache.ontheroadstore.com/tpl/simplebootx_mobile/Public/i/logo.png'
    };
    init.wx_share(share_data);


    //判断是否是app，如果是app，领取中心url 卖家中心url 商品标签url都需要做处理，ajax headers携带身份不一样
    var isApp = false;
    var $isApp = $('.is_app');
    var Authorization = $isApp.attr('authorization');
    var uid = $isApp.attr('uid');
    // var version = $isApp.attr('version');

    var loginStatus = true;

    if(Authorization && Authorization.length>0){
        isApp = true;
        ajaxHeaders = {
            'Authorization' : Authorization,
            // 'version' : version,//跨域不能加version
        };
        $('.get_coupon').attr('href','get-coupon://0');
    }else{
        //如果不是app，通过uid判断是否登录，如果未登录，点击领取和关注按钮需要跳转到登录页3
        loginStatus = init.ifLogin();
    }


    //返回卖家中心url
    function sellerUrl(uid){
        if(isApp){
            return 'user-info://'+uid;
        }else{
            return '/User/index/index/id/'+ uid +'.html';
        }
    }
    //返回商品标签url
    function tagUrl(id){
        if(isApp){
            return 'product-tag://'+id;
        }else{
            return '/HsCategories/tag_index/tag/'+ id +'.html';
        }
    }


    getCoupon();

    //获取所有信息
    function getCoupon(){
        var url = ApiBaseUrl + '/appv6/coupon/newUserCouponList';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: ajaxHeaders,
            success: function(data){
                if(data.status==1){
                    initNewrCoupon(data.data.coupon);
                    initRecommendGoods(data.data.recommendpost);
                    initSeller(data.data.seller);
                    initTopCate(data.data.cate,data.data.postlist);

                    lazyload();
                }
            },
            error: function(e){
                console.log('getCoupon err: ',e);
            }
        });
    }


    //新人优惠券展示及领取
    function initNewrCoupon(coupon){
        var $getNewrCouponBtn = $('.gift_card_btn');
        $getNewrCouponBtn.attr('status',coupon.userStatus);
        $('.gift_card_price span').html(coupon.couponprice);

        $getNewrCouponBtn.on('click',function(){
            if(!loginStatus){
                init.toLogin();
                return false;
            }
            if($(this).attr('status')=='1'){
                return;
            }
            getNewrCoupon($getNewrCouponBtn);
        });
    }
    //领取新人优惠券
    function getNewrCoupon($btn){
        var url = ApiBaseUrl + '/appv6/coupon/receiveNewUserCoupon';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: ajaxHeaders,
            success: function(data){
                if(data.status==1){
                    $.toast('领取成功,请在App下单使用');
                    $btn.attr('status','1');
                }else{
                    $.toast(data.info || '领取失败');
                }
            },
            error: function(e){
                console.log('getNewrCoupon err: ',e);
            }
        });
    }

    //推荐狠人
    function initSeller(seller){
        var html = '';
        for(var i=0;i<seller.length;i++){
            var sell = seller[i];

            html += '<div class="item">'
            html += '<a href="'+ sellerUrl(sell.uid) +'" external>'
            html += '<div class="image user_bg"  data-layzr="'+ sell.ad_img +'@640w_1l" ></div>'
            html += '<img class="cover_img" src="'+ sell.avatar +'">'
            html += '<div class="user_nicename">'+ sell.user_nicename +'</div>'
            html += '<div class="user_desc">'+ sell.desc +'</div>'
            html += '</a>'
            html += '<div class="user_keyword">'

            var tagLength = 0;
            for (var j=0;j<sell.tag.length;j++){
                var tag = sell.tag[j];
                tagLength+= tag.length;
                if(tagLength>10){
                    if(j===0){
                        tag = tag.slice(0,8) + '...';//18010417313
                    }else{
                        break;
                    }
                }
                html += '<a>'+ tag +'</a>'
            }

            html += '</div>'
            html += '<div class="attention">'
            html += '<span class="attentionUser" data-uid="'+ sell.uid +'" data-isatten="'+ sell.is_favorited +'" isatten="'+ sell.is_favorited +'"></span>'
            html += '</div>'
            html += '</div>'
        }

        $('.user_list').html(html);
        addAttionEv();
    }
    //关注按钮事件
    function addAttionEv() {
        $('.attentionUser').click(function(){

            if(!loginStatus){
                init.toLogin();
                return false;
            }

            var that = this;
            if($(this).attr('loading')==='1'){
                return;
            }else{
                $(this).attr('loading','1');
            }
            var isAtten = $(this).data('isatten');
            if(isAtten == 0){
                $.ajax({
                    type: 'POST',
                    url: ApiBaseUrl + '/appv1/follow',
                    data: {
                        to_user_id:$(that).data('uid')
                    },
                    headers: ajaxHeaders,
                    success: function(data){
                        // if(data.status==1){
                            $(that).attr('data-isatten', 1).attr('isatten', 1);
                            $.toast('关注成功');
                        // }else{
                        //     $.toast('操作失败');
                        // }
                        setTimeout(function(){
                            $(that).attr('loading','0');
                        },200);
                    },
                    error: function(xhr, type){
                        console.log(xhr);
                        $(that).attr('loading','0');
                    }
                });
            } else {
                $.ajax({
                    type: 'POST',
                    url: ApiBaseUrl + '/appv1/unfollow',
                    data: {
                        to_user_id:$(that).data('uid')
                    },
                    headers: ajaxHeaders,
                    success: function(data){
                        // if(data.status==1) {
                            $(that).attr('data-isatten', 0).attr('isatten', 0);
                            $.toast('取消关注成功');
                        // }else{
                        //     $.toast('操作失败');
                        // }
                        setTimeout(function(){
                            $(that).attr('loading','0');
                        },200);
                    },
                    error: function(xhr, type){
                        console.log(xhr);
                        $(that).attr('loading','0');
                    }
                });
            }
        })
    }


    //推荐商品
    function initRecommendGoods(goods){
        var html = '';
        var good = {};
        for(var i=0;i<goods.length;i++){
            good = goods[i];

            html+= '<li class="goods_li hs-cf">'
            html+= '<a href="/Portal/HsArticle/index/id/'+ good.id +'.html" class="filepath" external>'
            html+= '<div class="image" data-layzr="'+ good.cover +'@640w_1l" ></div>'
            html+= '</a>'
            html+= '<a href="/Portal/HsArticle/index/id/'+ good.id +'.html" class="post_title" external>'+ good.title +'</a>'
            if(good.tag && good.tag[0]){
                html+= '<a href="'+ tagUrl(good.tag[0]) +'" class="external keywords">'+ good.tag[0] +'</a>'
            }else{
                html+= '<a class="keywords keywords_none">none</a>'
            }
            html+= '<div class="user_info">'
            html+= '<a href="'+ sellerUrl(good.uid) +'" class="external">'
            html+= '<img src="'+ good.avatar +'">'
            html+= '<span>'+ good.username +'</span>'
            html+= '</a>'
            html+= '</div>'
            html+= '</li>'
        }

        $('.goods_ul').html(html);
    }

    //商品top10分类标签
    function initTopCate(cate,postlist){
        var tabHtml = '';
        var pageHtml = '';

        tabHtml+= '<div class="classify_tab classify_tab_act" sortid="'+ cate[0].id +'" loaddata="1">'+ cate[0].name +'</div>'
        pageHtml+= '<div class="classify_page classify_page_act hs-cf" scroll="1" sortid="'+ cate[0].id +'"></div>'
        for(var i=1;i<cate.length;i++){
            tabHtml+= '<div class="classify_tab " sortid="'+ cate[i].id +'" loaddata="0">'+ cate[i].name +'</div>'
            pageHtml+= '<div class="classify_page hs-cf" scroll="1" sortid="'+ cate[i].id +'"></div>'
        }

        $('.classify_tab_wrap').html(tabHtml);
        $('.classify_page_wrap').html(pageHtml);
        $('.classify_page_act').html(createClassifyGoods(postlist));
        changeTab('classify_tab','classify_page','classify_tab_act','classify_page_act',function($o){

            var loadData = $o.attr('loaddata');
            var sortid = $o.attr('sortid');
            if(loadData!=='0'){
                return false;
            }
            $o.attr('loaddata',1);
            getClassifyGoods(sortid);
        },function($o){});
    }

    //生成分类商品列表
    function createClassifyGoods(goods){
        var html = '';
        var good = {};
        for(var i=0;i<goods.length;i++){
            good = goods[i];

            html+= '<li>'
            html+= '<a href="/Portal/HsArticle/index/id/'+ good.id +'.html" external>'
            html+= '<div class="image" data-layzr="'+ good.cover +'@640w_1l"></div>'
            html+= '<div class="post_title">'+ good.post_title +'</div>'
            html+= '<div class="price font_din">'+ good.price +'</div>'
            html+= '</a>'
            html+= '</li>'
        }
        return html;
    }
    //获取分类商品
    function getClassifyGoods(sortid){

        var url = ApiBaseUrl + '/appv6/cate/'+sortid+'/getCategoryPostTop10';
        $.ajax({
            type: "GET",
            url: url,
            dataType: 'json',
            data: {},
            headers: ajaxHeaders,
            success: function(data){
                if(data.status==1){
                    $('.classify_page[sortid="'+sortid+'"]').html(createClassifyGoods(data.data));
                    lazyload();
                }
            },
            error: function(e){
                console.log('getClassifyGoods err: ',e);
            }
        });

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




});


