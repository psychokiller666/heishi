var common = require('../common/common.js');
var ApiBaseUrl = common.prototype.getApiBaseUrl();
var activeId = '';
var page = 1;
var row = 10;
var over = true;
var loading = false;
var gsStatus;//鬼市状态
var preemptionStartTime;//摆摊开始时间
var preemptionEndTime;//摆摊结束时间
var preemptionStatus;//摆摊状态
var PHPSESSID = common.prototype.getCookie('PHPSESSID');//获取访问来源
var ajaxHeaders = {
    'phpsessionid': PHPSESSID
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
            '                    <a class="external gs_goods_img" href="/Portal/GhostMarket/article.html?id='+ item.gg_id +'"><img class="gs_goods_img" src="'+ item.gg_img[0] +'"></a>' +
            '                    <div class="gs_goods_mes">' +
            '                        <p class="gs_goods_name"><a class="external" href="/Portal/GhostMarket/article.html?id='+ item.gg_id +'">'+ item.gg_title +'</a></p>' +
            '                        <div class="gs_goods_store">' +
            '                            <a href="/Portal/GhostMarket/seller.html?gg_ghost_id='+ item.gg_ghost_id +'" class="gs_goods_store_mes external"' +
            '                                <img src="'+ item.avatar +'">' +
            '                                <span>'+ item.nickname +'</span>' +
            '                            </a>' +
            '                            <p class="gs_goods_price">￥'+ item.gg_price +'</p>' +
            '                        </div>' +
            '                    </div>' +
            '                </li>';
        $('.gs_goods').append(goodsItem)
    });
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
            }, 500);
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
                if(goodsArr.length<10){
                    over = false;
                }
            }
            if (gsStatus === 2) {
                $('.gs_goods').hide();
                $('.gs_home_mes').show();
                let startTime = res.data.avtivity.ga_start_time;//鬼市开启时间
                let endTime = res.data.avtivity.ga_end_time;//鬼市结束时间
                var timer = null;
                let nowTime = res.data.avtivity.present_time;
                let timeDifference = startTime - nowTime;
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
                        timeDifference--;
                        console.log(timeDifference)
                        if (timeDifference > 0) {
                            let h = Math.floor(timeDifference / 60 / 60 % 24);
                            let m = Math.floor(timeDifference / 60 % 60);
                            let s = Math.floor(timeDifference % 60);
                            let time = checkTime(h) + ':' + checkTime(m) + ':' + checkTime(s);
                            $('.gs_date').html(time);
                            $('.gs_prompt_mes img').attr('src', 'https://img8.ontheroadstore.com/guishi/img/gs_countdown_time.png')
                        } else {
                            clearInterval(timer);
                            window.location.reload();
                        }
                    },1000)
                }
            }
            if (gsStatus === 3) {
                $('.gs_goods').hide();
                $('.gs_home_mes').show();
                $('.gs_date').hide();
                $('.gs_home_btn').children('a').eq(0).attr('href','/Portal/Index/index.html');
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
function gsFun(option) {
    getGoods(option);
    $('.gs_home_con').on('scroll',function(ev){
        var $this = $(this);
        if(!over){
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
            page++;
            getGoods(option)
        }
    });
    $('.gs_home_btn').children('a').click(function(){
        let oIndex = $(this).index();
        if(gsStatus === 2){
            if(oIndex == 0){
                if(preemptionStatus === 1){
                    $.toast('摆摊时间未到');
                    return
                }
                if(preemptionStatus === 3){
                    $.toast('摆摊已结束');
                    return
                }
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
