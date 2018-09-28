var common = require('../common/common.js');
var ApiBaseUrl = common.prototype.getApiBaseUrl();
var activeId = '';
var page = 1;
var row = 14;
var over = true;
var loading = false;
var gsStatus;//鬼市状态
var timer = null;//倒计时定时器
var ga_start_time ;//鬼市开启时间
var preemptionStartTime;//摆摊开始时间
var preemptionEndTime;//摆摊结束时间
var preemptionStatus;//摆摊状态
var PHPSESSID = common.prototype.getCookie('PHPSESSID');//获取访问来源
var ajaxHeaders = {
    'phpsessionid': PHPSESSID
};

function lazyload() {
    var contentHeight = $('.content').height();
    $('[data-layzr]').each(function(){
        var status = $(this).attr('data-layzrstatus');
        if($(this).offset().top < contentHeight && !status){
            $(this).css('background-image', 'url('+ $(this).attr('data-layzr') +')');
            $(this).attr('data-layzrstatus', '1');
        }
    })
};
//时间戳转年月日
function timestampToTime(timestamp) {
    var date = new Date(timestamp * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '.';
    var D = date.getDate() + ' ';
    var h = date.getHours() + ':';
    var m = date.getMinutes();
    var s = date.getSeconds();
    return M + D + h + m
}

function checkTime(n) {
    let num = n >= 10 ? n : '0' + n;
    return num
}
function checkGoodsHtml(arr){
    arr.forEach(function(item,index){
        let goodsItem = '<li class="gs_goods_list">' +
            '                    <a class="external gs_goods_img_a" href="/Portal/GhostMarket/article.html?id='+ item.gg_id +'"><div class="gs_goods_img" data-layzr="'+ item.gg_img[0] +'@640w_1l"></div></a>' +
            '                    <div class="gs_goods_mes">' +
            '                        <p class="gs_goods_name"><a class="external" href="/Portal/GhostMarket/article.html?id='+ item.gg_id +'">'+ item.gg_title +'</a></p>' +
            '                        <div class="gs_goods_store">' +
            '                            <a href="/Portal/GhostMarket/seller.html?gg_ghost_id='+ item.gg_ghost_id +'" class="gs_goods_store_mes external">' +
            '                                <img src="'+ item.avatar +'">' +
            '                                <span>'+ item.nickname +'</span>' +
            '                            </a>' +
            '                            <p class="gs_goods_price">￥'+ item.gg_price +'</p>' +
            '                        </div>' +
            '                    </div>' +
            '                </li>';
        $('.gs_goods').append(goodsItem)
    });
    lazyload();
}
function getGoods(option){
    if(loading){
        return
    }else{
        loading = true;
    }
    if(option.ga_id){
        activeId = option.ga_id;
    }
    $.ajax({
        url: ApiBaseUrl + '/ghostmarket/goods/getGhostMarketGoods?ga_id='+ activeId +'&page='+ page +'&rows='+row,
        type: 'GET',
        headers: ajaxHeaders,
        success: function (res) {
            $('.gs_home_move').animate({
                marginTop: "4.0533rem"
            }, 500,function () {
                lazyload();
            });
            $('.gs_home_con').animate({
                background: 'rgba(33,32,33,0.6)'
            }, 500);
            activeId = res.data.avtivity.ga_id;
            gsStatus = res.data.avtivity.ga_type;//鬼市开启关闭状态
            $('.gs_home_title p').html(res.data.avtivity.ga_theme);
            if(gsStatus === 1){
                let goodsArr = res.data.data;
                if(over){
                    checkGoodsHtml(goodsArr);
                }
                if(goodsArr.length<14){
                    over = false;
                }
            }
            if (gsStatus === 2) {
                $('.gs_home_con').css('overflow','hidden');
                $('.gs_goods').hide();
                $('.gs_home_mes').show();
                let startTime = res.data.avtivity.ga_start_time;//鬼市开启时间
                let endTime = res.data.avtivity.ga_end_time;//鬼市结束时间
                let nowTime = res.data.avtivity.present_time;
                let timeDifference = startTime - nowTime;
                ga_start_time = +timeDifference + +currentTime();//获取当前设备开始时间（因为微信/浏览器应用切出去以后定时器可能会暂停）
                preemptionStartTime = res.data.avtivity.ga_preemption_start_time;
                preemptionEndTime = res.data.avtivity.ga_preemption_end_time;
                if(nowTime < preemptionStartTime){
                    preemptionStatus = 1//摆摊未开始
                }else if(nowTime >= preemptionStartTime && nowTime < preemptionEndTime){
                    preemptionStatus = 2;//可以摆摊，跳转到下载app页面
                    $('.gs_home_btn').children('a').eq(0).attr('href','/Portal/Coupon/useCoupon.html?id=2')
                }else{
                    preemptionStatus = 3;//摆摊结束
                }
                if (timeDifference > 86400) {
                    startTime = timestampToTime(startTime);
                    endTime = timestampToTime(endTime);
                    $('.gs_date').html(startTime + '-' + endTime);
                    $('.gs_prompt_mes img').attr('src', 'https://img8.ontheroadstore.com/guishi/img/gs_open_time.png')
                }else if(timeDifference <= 86400 && timeDifference>0){
                    timer = setInterval(function(){
                        // timeDifference--;
                        timeDifference = ga_start_time - currentTime();//时间差值取当前设备的开始时间和当前时间的差值

                        if (timeDifference > 0) {
                            let h = Math.floor(timeDifference / 60 / 60 % 24);
                            let m = Math.floor(timeDifference / 60 % 60);
                            let s = Math.floor(timeDifference % 60);
                            let time = checkTime(h) + ':' + checkTime(m) + ':' + checkTime(s);
                            $('.gs_date').html(time);
                            $('.gs_prompt_mes img').attr('src', 'https://img8.ontheroadstore.com/guishi/img/gs_countdown_time.png')
                        } else {
                            clearInterval(timer);
                            window.location.href = '/Portal/GhostMarket/home.html';
                        }
                    },1000)
                }
            }
            if (gsStatus === 3) {
                $('.gs_home_con').css('overflow','hidden');
                $('.gs_goods').hide();
                $('.gs_home_mes').show();
                $('.gs_date').hide();
                $('.gs_home_btn').children('a').eq(0).attr('href','javascript:$.toast("敬请期待");');
                $('.gs_home_btn').children('a').eq(0).html('狠货榜单');
                $('.gs_home_btn').children('a').eq(1).html('下期提醒');
                $('.gs_prompt_mes img').attr('src', 'https://img8.ontheroadstore.com/guishi/img/gs_close_store.png')
            }
            loading = false
        },
        error:function(res){
            loading = false;
            $.toast(res.info)
        }
    });
}

//获取当前时间戳（10位）
function currentTime() {
    return parseInt((new Date().valueOf())/1000);
}

//设置鬼市背景图
function setGSbg(){
    var url = ApiBaseUrl + '/ghostmarket/getSetting';
    $.ajax({
        type: "GET",
        url: url,
        dataType: 'json',
        data: {},
        headers: ajaxHeaders,
        success: function (data) {
            if (data.status == 1) {
                var $gs_home_bg = $('.gs_home_bg');
                if($gs_home_bg.attr('status') !== '1'){
                    $gs_home_bg.css({'background':'url("'+ data.data.secondFloorBackgroundImg +'") no-repeat center center','background-size': 'cover'}).attr('status','1');
                }
            }
        },
        error: function (e) {
            console.log('getSetting err: ', e);
        }

    });
}

function gsFun(option) {

    //初始化数据
    activeId = '';
    page = 1;
    row = 14;
    over = true;
    $('.gs_goods').html('');
    clearInterval(timer);
    setGSbg();
    getGoods(option);
    var $gs_goods_ul = $('.gs_goods');
    $('.gs_home_con').off('scroll').on('scroll',function(ev){
        lazyload();
        var $this = $(this);

        //获取自己的scrollHeight,scrollTop
        var clientHeight = $this.height();
        var scrollHeight = $this[0].scrollHeight;
        var scrollTop = $this.scrollTop();

        //调节背景色
        if($gs_goods_ul.children('.gs_goods_list').length>0){

            var gs_goods_top = $gs_goods_ul.offset().top;//这个元素距离页面顶部的距离
            var percent = 2 * scrollTop / (+scrollTop + +gs_goods_top);//滚动比例，滚动到一半距离的时候显示为不透明
            var opacity = (percent * 0.4 + 0.6).toFixed(2);
            opacity = opacity > 1 ? 1 : opacity;
            $('.gs_home_con').css({'background':'rgba(33,32,33,'+ opacity +')'});
        }


        if(!over){
            // $this.off('scroll');
            return;
        }
        if(loading){
            return
        }
        //判断距离底部的px
        var diff = scrollHeight - clientHeight - scrollTop <= 800;

        if(diff){
            page++;
            getGoods(option)
        }
    });
    $('.gs_home_btn').children('a').off('click').click(function(){
        let oIndex = $(this).index();
        if(gsStatus === 2){
            if(oIndex == 0){

                var nowTime = parseInt((new Date().valueOf()) / 1000);
                if(nowTime>preemptionEndTime){

                }
                if(nowTime>preemptionStartTime){
                    if(nowTime>preemptionEndTime){
                        //摆摊已结束
                        $.toast('摆摊已结束');
                    }else{
                        //摆摊已开始
                        if(preemptionStatus === 2){
                            return;
                        }
                        location.href = '/Portal/Coupon/useCoupon.html?id=2';
                    }
                }else{
                    //摆摊未开始
                    $.toast('摆摊时间未到');
                }

                // if(preemptionStatus === 1){
                //     $.toast('摆摊时间未到');
                //     return
                // }
                // if(preemptionStatus === 3){
                //     $.toast('摆摊已结束');
                //     return
                // }
            }
            if(oIndex == 1){
                $.toast('请移步公路商店App')
            }
        }
        if(gsStatus == 3){
            if(oIndex == 1){
                $.toast('请移步公路商店App')
            }
        }
    })
}
module.exports = gsFun;
