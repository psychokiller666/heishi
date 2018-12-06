// 页面初始化

// 微信sdk
var wx = require('weixin-js-sdk');

//神策sdk
var sensors = require('../../../modules/components/sa_sdk/sensorsdata.min.js')

//md5
var md5 = require('../../../modules/components/plugin/md5.min');

function common(page){
  this.page = page;
  // 控制.hs-page高度
  this.countHeight();
  // 安卓兼容
  $('.actions-modal-group').on('click', function(){
    $('.modal-overlay').remove();
    $('.actions-modal').remove();
  })
  var contentHeight = $('.content').height();
  $('.content').on('scroll',function(){
    Lazyload();
  });
  Lazyload();
  function Lazyload() {
    $('[data-layzr]').each(function(){
      var status = $(this).attr('data-layzrstatus');
      if($(this).offset().top < contentHeight && !status){
        $(this).css('background-image', 'url('+ $(this).attr('data-layzr') +')');
        $(this).attr('data-layzrstatus', '1');
      }
    })
  }
  this.lazyLoad = Lazyload;

  //上传图片的base url
  this.ImgBaseUrl = 'https://img8.ontheroadstore.com';
  addCss();
  initSensorsdata();
};

//判断域名是否是生产环境
common.prototype.isProduction = isProduction;
function isProduction(){
    return location.hostname === 'hs.ontheroadstore.com';
}
//没有图片的默认url
common.prototype.lostImage = 'https://img8.ontheroadstore.com/iosupload/20180808/b0pMT2tsVk8vMmtzek1aSUtlYVlxQT09.jpg';

common.prototype.loadimg = function(){
  var contentHeight = $('.content').height();
  $('[data-layzr]').each(function(){
    var status = $(this).attr('data-layzrstatus');
    if($(this).offset().top < contentHeight && !status){
      $(this).css('background-image', 'url('+ $(this).attr('data-layzr') +')');
      $(this).attr('data-layzrstatus', '1');
    }
  })
}
common.prototype.countHeight = function(){
  if($(this.page).find('.hs-page').length){
    if($(this.page).find('header').length){
      $(this.page).find('.hs-main').css('top',lib.flexible.px2rem($(this.page).find('header').height())+'rem');
    } else {
      $(this.page).find('.hs-main').css('top','0');
    }
    $(this.page).find('.hs-main').css('bottom','0');
    // if($('footer').length){
    //   $(this.page).find('.hs-main').css('bottom',lib.flexible.px2rem($('footer').height())+'rem');
    // } else {
    //   $(this.page).find('.hs-main').css('bottom','0');
    // }
  }
}
// 检查是否关注公众号
common.prototype.checkfollow = function(){
  // 默认隐藏
  var _this = this;
  $.ajax({
    url: '/index.php?g=user&m=HsWeixin&a=userinfo&type=1',
    type: 'GET',
    async: true
  }).done(function (res) {
    if(res.data == 0) {
      $('.open_hs').hide();
      $('.open_app').hide();
      $('.open_hs').show();
      if($('.show-list').length == 1){
        $('.show-list').find('.return_top').css('bottom', '0.946rem');
      }
      $('.open_hs_close').click(function(){
        $('.open_hs').hide();
        _this.countHeight();
        close();
      })
    }else if(res.data == 1){
      $('.open_app').hide();
      $('.open_hs').hide();
      $('.open_app').show();
      if($('.show-list').length == 1){
        $('.show-list').find('.return_top').css('bottom', '0.946rem');
      }
      $('.open_app_close').click(function(){
        $('.open_app').hide();
        _this.countHeight();
        close();
      })
    }
    _this.countHeight();
  });
  // 关闭提示窗
  function close() {
    if($('.show-list').length == 1){
      $('.return_top').css('bottom', '2.226rem');
    }
    $.ajax({
      url: '/index.php?g=user&m=HsWeixin&a=userinfo&type=2',
      type: 'GET',
      async: true
    }).done(function (res) {
      console.log(res);
    });
  }
}
// 微信jssdk分享
common.prototype.wx_share = function(options,callback){
  var _this = this;
  $.ajax({
    url: '/index.php?g=restful&m=HsJsapi&a=jssign',
    type: 'POST',
    data: {
      url: encodeURIComponent(options.link.split('#')[0])
    }
  }).done(function(data){

    // 判断是否分享
    if(options) {

      options.img = fixUrlProtocol(options.img);//补全分享图片url协议

      wx.config({
        debug: false,
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: [
        'checkJsApi',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'showAllNonBaseMenuItem',
        ]
      });
      wx.ready(function(){
      // 分享
      wx.onMenuShareTimeline({
        title: $.trim(options.title),
        link: partnerUrlFix(options.link),
        imgUrl: options.img,
        success: function(){
          // 用户确认分享后执行的回调函数
          // 腾讯统计
          MtaH5.clickStat('wx_onMenuShareTimeline',{'title': options.title});
        },
        complete: function(){
            if(typeof callback === "function"){
                callback(1);//1是朋友圈，2是好友
            }
        }
      });
      wx.onMenuShareAppMessage({
        title: $.trim(options.title),
        desc: $.trim(options.desc),
        link: partnerUrlFix(options.link),
        imgUrl: options.img,
        success:function(){
          // 用户确认分享后执行的回调函数
          // 腾讯统计
          MtaH5.clickStat('wx_onMenuShareAppMessage',{'title': options.title});
        },
        complete: function(){
          if(typeof callback === "function"){
              callback(2);//1是朋友圈，2是好友
          }
        }
      });
    });
    } else {
      wx.config({
        debug: false,
        appId: data.appId,
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: [
        'checkJsApi',
        'scanQRCode',
        'openAddress'
        ]
      });
      wx.ready(function(){
        wx.hideOptionMenu();
      });
    }
  });

}
common.prototype.system_query = function() {
  var u = navigator.userAgent, app = navigator.appVersion;
  var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
  var isIos = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  if(isAndroid){
    return 'android';
  }
  if(isIos){
    return 'ios';
  }
  return null;
}

//获取url中的参数
common.prototype.getUrlParam = function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
};
common.prototype.setCookie = function (name,value,days) {
    var Days = parseFloat(days)>0 ? parseFloat(days) : 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString() + ';path=/;';
};
common.prototype.getCookie = function (name) {
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
};
common.prototype.delCookie = function (name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
};

common.prototype.getApiBaseUrl = function(){
    var HostName = location.hostname;
    var ApiBaseUrl = 'https://apitest.ontheroadstore.com';

    if (HostName === "hs.ontheroadstore.com") {
        ApiBaseUrl = 'https://api.ontheroadstore.com';
    }
    return ApiBaseUrl;
};

//判断是否登录，如果参数toLogin==true，未登录则跳往登录页 注：需要在html中添加隐藏的input.current_user_id
common.prototype.ifLogin = function(toLogin){
    var $current_user_id = $('.current_user_id');
    var uid='';
    if($current_user_id.length>0){
        uid = $current_user_id.attr('uid');
        if(typeof uid === 'string' && uid.length>0){
            //已登录
            return uid;
        }
    }
    if(toLogin){
        this.toLogin();
    }
    return false;
};

//去往登录页
common.prototype.toLogin = function(){

    if(!isWeiXin()){
        location.href = 'https://url.cn/5EVfeob';
        return;
    }

    var nowUrl = encodeURI(location.href);
    // var url = '/Api/Oauth/login?type=weixin&login_http_referer='+nowUrl;
    // var url = '/User/Login/mobile?appid='+appid+'&redirect_uri='+nowUrl+'&type=mobile&response_type=code';
    // location.href = url;

    var postForm = document.createElement("form");//表单对象
    postForm.method="post" ;
    postForm.action = '/Api/Oauth/login' ;

    var typeInput = document.createElement("input") ; //type input
    typeInput.setAttribute("name", "type") ;
    typeInput.setAttribute("value", "weixin");
    postForm.appendChild(typeInput) ;
    var refererInput = document.createElement("input");// referer input
    refererInput.setAttribute("name","login_http_referer");
    refererInput.setAttribute("value",nowUrl);
    postForm.appendChild(refererInput);

    document.body.appendChild(postForm) ;
    postForm.submit() ;
    document.body.removeChild(postForm) ;

    return false;
};
//判断是否是微信浏览器的函数
common.prototype.isWeiXin = isWeiXin;
function isWeiXin(){
    var ua = window.navigator.userAgent.toLowerCase();
    //通过正则表达式匹配ua中是否含有MicroMessenger字符串
    if(ua.match(/MicroMessenger/i) == 'micromessenger'){
        return true;
    }else{
        return false;
    }
}
//优惠券的格式化时间，显示为2001.11.11
common.prototype.couponFmtTime = function (time){

    function fixNum(v){
        return v<10 ? '0'+v : v;
    }

    time = String(time).length === 10 ? time*1000 : time;

    var t = new Date(time);
    var y = fixNum(t.getFullYear());
    var m = fixNum(t.getMonth()+1);
    var d = fixNum(t.getDate());

    return y + '.' + m + '.' + d;
};
//获取 几天 后的时间戳（默认10位）天、时、分、秒、是否13位
common.prototype.getTimestamp = function (day, hour, min, sec, full){
    day = isNaN(parseInt(day)) ? 0 : parseInt(day);
    hour = isNaN(parseInt(hour)) ? 0 : parseInt(hour);
    min = isNaN(parseInt(min)) ? 0 : parseInt(min);
    sec = isNaN(parseInt(sec)) ? 0 : parseInt(sec);

    var delay = ( day * 86400 + hour * 3600 + min * 60 + sec ) * 1000;//毫秒
    var now = (new Date()).getTime();   //当前13位时间戳
    var stp = +now + delay;
    if(!full){
        stp = parseInt(stp / 1000) ;
    }
    return stp;
};


//补全评论上传图片的imgUrl(因为不确定接口返回的imgurl是否是完整路径)
common.prototype.fixImgUrl = function (url,ImgBaseUrl) {

    ImgBaseUrl = ImgBaseUrl || this.ImgBaseUrl || 'https://img8.ontheroadstore.com';

    if(typeof url === 'string' && url.length>0){

        var arr = ['http://','https://','//'];

        for(var i=0;i<arr.length;i++){
            if(url.indexOf(arr[i])===0){
                return url;
            }
        }

        if(url.indexOf('/')===0){
            return ImgBaseUrl + url;
        }else{
            return ImgBaseUrl + '/' + url;
        }

    }

};

//判断是否是安卓
common.prototype.isAndroid = function (){
    var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    // var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    return isAndroid;
};

//添加css:由于less的bug，无法编译某些css，使用js添加到页面中
common.prototype.addCss = addCss();

function addCss(){
    if($('style.addcss').length>0){
        return;
    }
    var css = '';
    css+= '<style type="text/css" class="addcss">'
    css+= '.ellipsis_2{overflow : hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 2;}'
    css+= '.ellipsis_3{overflow : hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 3;}'
    css+= '.ellipsis_4{overflow : hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 4;}'
    css+= '.ellipsis_5{overflow : hidden;text-overflow: ellipsis;display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 5;}'
    css+= '</style>'
    $('body').append(css);
};


//时间戳格式化 调用方法  new Date(1541753878000).format('yyyy-MM-dd hh:mm:ss')
Date.prototype.format = function(format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
};

//补全url协议同当前网页协议：修复分享url没有http或https时分享缩略图不显示的问题
function fixUrlProtocol(url){
    if(url && url.indexOf('//')===0){
        return location.protocol + url;
    }else{
        return url;
    }
}

common.prototype.sensors = sensors;
//神策初始化
//文档 https://www.sensorsdata.cn/manual/js_sdk.html
function initSensorsdata(){

    var pageType = getPageType();

    var HostName = location.hostname;
    var isProduction = common.prototype.isProduction();

    var server_url = 'https://sc.ontheroadstore.com/sa?project=default';//测试服务器
    if (isProduction) {
        server_url = 'https://sc.ontheroadstore.com/sa?project=production';//正式服务器
    }

    if(localStorage.getItem('SASER')==='DEVSERVER'){
        server_url = 'https://sc.ontheroadstore.com/sa?project=default';
    }
    var showlog = false;
    if(localStorage.getItem('SALOG')==='SHOWLOG'){
        showlog = true;
        console.log(server_url.split('?')[1]);
        window.sensors = sensors;
    }
    sensors.init({
        server_url: server_url,
        web_url:"http://47.93.182.143:8107",
        use_app_track: true,// 与app打通
        show_log:showlog,//log
    });

    //注册公共属性
    sensors.registerPage({
        platformType:'H5',//公共属性 ：平台
    });

    //自动采集页面浏览
    sensors.quick('autoTrack', {
        pageType: pageType,
    });



    var $current_user_id = $('.current_user_id');
    var uid='';
    if($current_user_id.length>0){
        uid = $current_user_id.attr('uid');
        if(typeof uid === 'string' && uid.length>0){
            //已登录
            sensors.login(uid);
        }
    }

    //自定义事件追踪
    // sensors.track('sendVCode',{
    //     phoneNumber:'',
    //     buttonName:'',
    // });
    setSensorsHeader();

    $('body').on('click','.open_app',function(){
        sensors.track('buttonClick', {
            pageType : '页面头部',
            buttonName : '打开APP',
        })
    });
    $('body').on('click','.open_hs',function(){
        sensors.track('buttonClick', {
            pageType : '页面头部',
            buttonName : '关注我们',
        })
    });

}

//给ajax设置header
common.prototype.setSensorsHeader = setSensorsHeader;
function setSensorsHeader(){
    $.ajaxSettings.beforeSend = function(xhr,request){
        // 在这里加上你的 token
        var obj = sensors.getPresetProperties();
        obj.platformType = 'H5';
        xhr.setRequestHeader('SCProperties',encodeURI(JSON.stringify(obj)));
    }
};

//埋点公用的一些方法
common.prototype.sensorsFun = {
    bottomNav : function () {
    //    底部导航加埋点
        var $footerNavUl = $('body').find('.footer_nav_ul');
        if($footerNavUl.attr('sensors')!=='1'){
            $footerNavUl.attr('sensors','1');
            $footerNavUl.on('click','li',function () {
                var index = $(this).index();
                var btnTxt = ['首页', '分类', '购物车', '消息','我的']

                sensors.track('buttonClick', {
                    pageType : '底部导航',
                    buttonName : btnTxt[index],
                })
            })
        }
    },
    pageType : function (pageType){
        //页面类型
        sensors.quick('autoTrack', {
            pageType: pageType
        });
    },
    mkt : function (type,page,content,location,desc,id){
        var index = location;
        if(location===''||location===undefined||location===null||isNaN(parseInt(location))){
            index = '';
        }else{
            index = String(+location+1)
        }
        sensors.track('mkt_event', {
            mkt_type : type,
            mkt_page : page,
            mkt_content : String(content),
            mkt_location : index,
            mkt_desc : String(desc),
            commodityID : String(id),
        });
    },
    //从url中获取商品或文章id
    getUrlId : function (url) {
        var id = '';
        var goods = '/Portal/HsArticle/index/id/';// /Portal/HsArticle/index/id/1095919.html
        var article = '/Portal/HsArticle/culture/id/';// /Portal/HsArticle/culture/id/1095879.html
        var user = '/User/index/index/id/';// /User/index/index/id/176.html
        if(url.indexOf(goods)>-1 || url.indexOf(article)>-1 || url.indexOf(user)>-1){
            id = url.replace('.html','').split('/id/')[1];
        }
        return id;
    },
    //获取 /xxx/abc.html 格式中的 abc
    getUrlKey : function (url,key) {
        key = key || 'id';
        var txt = '/'+key+'/';
        var id = '';
        if(url.indexOf(txt)>-1){
            id = url.replace('.html','').split(txt)[1];
        }
        return id;
    }

};

//获取埋点pageType
function getPageType (){
    var pathname = location.pathname;
    var pathArr = [
        {name:'推荐页',path:'/Portal/Index/index.html'},
        {name:'大专题页',path:'/HsProject/index/pid/'},
        {name:'文章列表页',path:'/Portal/Index/cultureall.html'},
        {name:'分类列表页',path:'/HsCategories/category_index/id/'},
        {name:'热门页',path:'/Portal/index/showall.html'},
        {name:'关注-关注的狠人',path:'/Portal/index/atten.html'},
        {name:'关注-关注的狠货',path:'/Portal/index/atten.html'},
        {name:'特卖页',path:'/Portal/index/sale.html'},
        {name:'分类页',path:'/Portal/HsCategories/index.html'},
        {name:'标签页',path:'/HsCategories/category_index/id/'},
        {name:'搜索结果页',path:'/Portal/Index/search_goods.html'},
        {name:'购物车页',path:'/User/MyChart/index.html'},
        {name:'订单物流页',path:'/User/HsOrder/express_query/order_number/'},
        {name:'我的页面（买家版）',path:'/User/Center/index.html'},
        {name:'我的订单页',path:'/user/HsBuyorder/order_all.html'},
        {name:'我的订单页',path:'/user/HsBuyorder/order_deliver.html'},
        {name:'买家订单详情页',path:'/user/HsBuyorder/order_info/id/'},
        {name:'商品详情页',path:'/Portal/HsArticle/index/id/'},
        {name:'卖家店铺页',path:'/User/index/index/id/'},
        {name:'我的优惠券页',path:'/Portal/Coupon/userCoupon.html'},
        {name:'我的收藏页',path:'/user/HsLike/index.html'},
        {name:'确认订单页',path:'/User/HsOrder/add/object_id/'},
        {name:'确认订单页',path:'/User/MyChart/buy.html'},
        {name:'私信页',path:'/User/HsMessage/detail/from_uid/'},
        {name:'文章页',path:'/Portal/HsArticle/culture/id/'},
        {name:'常见问题页',path:'/Portal/PostDetails/faq.html'},
        {name:'评分详情页',path:'/Portal/PostDetails/scoreDetails.html'},
        {name:'评论列表页',path:'/user/HsComment/my_comment_list.html'},
        {name:'评论页',path:'/Portal/HsArticle/comment_list/id/,type/1.html'},
        {name:'哆嗦列表页',path:'/Portal/HsArticle/comment_list/id/,/type/2.html'},
        {name:'登录注册页',path:'/User/Login/mobile.html'},
        {name:'抽奖页',path:'/Portal/Lottery/lottery.html'},
    ];


    if(pathname==='/'){
        return '推荐页';
    }
    for(var i=0;i<pathArr.length;i++){
        var item = pathArr[i];
        var path = item.path;
        if(path.indexOf(',')>-1){
            var arr = path.split(',');
            if(pathname.indexOf(arr[0])>-1 && pathname.indexOf(arr[1])>-1){
                return item.name;
            }
        }else{
            if(pathname.indexOf(path)>-1){
                return item.name;
            }
        }
    }
    return '';
}


//合伙人分享url追加 referCode
function partnerUrlFix(url){
    var uid = getUserId();
    var md5Uid = '';
    if(uid){
        md5Uid = md5(uid);
        url = replaceUrlParams(url,{referCode:md5Uid});
    }
    console.log('shareurl:',url);
    return url;
}

//获取用户id
function getUserId(){
    var $current_user_id = $('.current_user_id');
    var uid='';
    if($current_user_id.length>0){
        uid = $current_user_id.attr('uid');
        if(typeof uid === 'string' && uid.length>0){
            //已登录
            return uid;
        }
    }
    return false;
}

//解析url
function parseURL(url) {
    var a = document.createElement('a');
    a.href = url;
    return {
        source: url,
        protocol: a.protocol.replace(':', ''),
        host: a.hostname,
        port: a.port,
        query: a.search,
        params: (function () {
            var ret = {},
                seg = a.search.replace(/^\?/, '').split('&'),
                len = seg.length, i = 0, s;
            for (; i < len; i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;

        })(),
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
        hash: a.hash.replace('#', ''),
        path: a.pathname.replace(/^([^\/])/, '/$1'),
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
        segments: a.pathname.replace(/^\//, '').split('/')
    };
}

//替换url中的同名参数值，url:原本的url;newParams:新的参数对象
function replaceUrlParams(url, newParams) {
    var parsedUrl = parseURL(url);

    for (var x in newParams) {
        var hasInMyUrlParams = false;
        for (var y in parsedUrl.params) {
            if (x.toLowerCase() == y.toLowerCase()) {
                parsedUrl.params[y] = newParams[x];
                hasInMyUrlParams = true;
                break;
            }
        }
        //原来没有的参数则追加
        if (!hasInMyUrlParams) {
            parsedUrl.params[x] = newParams[x];
        }
    }
    var _result = parsedUrl.protocol + "://" + parsedUrl.host + (parsedUrl.port ? ":" + parsedUrl.port : '') + parsedUrl.path + "?";

    for (var p in parsedUrl.params) {
        _result += (p + "=" + parsedUrl.params[p] + "&");
    }

    if (_result.substr(_result.length - 1) == "&") {
        _result = _result.substr(0, _result.length - 1);
    }

    if (parsedUrl.hash != "") {
        _result += "#" + parsedUrl.hash;
    }
    return _result;
}





module.exports = common;
