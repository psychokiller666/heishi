//抽奖活动页-彩蛋

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit', '.lottery_act', function (e, id1, page) {
  if (page.selector == '.page') {
    return false;
  }
  document.title = '抽奖';

  var init = new common(page);

  var ApiBaseUrl = init.getApiBaseUrl();

  var PHPSESSID = init.getCookie('PHPSESSID');
  var ajaxHeaders = {
    'phpsessionid': PHPSESSID
  };


  var $page = $(page);
  var id = init.getUrlParam('id') || '';
  var pretendApp = init.getUrlParam('pretendApp');//假装是app
  var shareCode = init.getUrlParam('share_code') || '';
  var userinfo = null;//保存当前用户的信息
  var lottery = null;//保存活动信息
  var lotteryData = null;//保存所有活动信息
  var lotteryids = { //1 正在进行，2 预告，3 彩蛋
    1: '',
    2: '',
    3: '',
  };
  var lotteryCache = {    //存储lottery对象，'活动id':{time:'获取数据时的时间戳',data:'接口返回的data.data数据'}
    cacheTime: 60,     //缓存时长，单位秒
  };
  var topOpenTimer = null;
  var topTimer = null;
  var diffServerTime = 0;//与服务器的时差 本地时间-服务器时间

  var isIOS = init.system_query() === 'ios';//是否是ios

  //判断是否是app，如果是app，url都需要做处理，ajax headers携带身份不一样
  var isApp = false;
  var $isApp = $('.is_app');
  var Authorization = $isApp.attr('authorization');
  var uid = $isApp.attr('uid');
  // var version = $isApp.attr('version');

  var loginStatus = true;


  //app回调函数对象。调用方式：appCallbackFunction.lotteryAddTicketCount(args)
  window.appCallbackFunction = {};
  window.appCallbackFunction.lotteryAddTicketCount = addUserLotteryCount2; //分享后更新抽奖码数量
  window.appCallbackFunction.getLotteryCallback = getLotteryCallback;  //抽奖回调
  window.appCallbackFunction.setLotteryNotifyCallback = setLotteryNotifyCallback;  //设置提醒成功回调
  window.appCallbackFunction.changeLotteryGetBtn = changeLotteryGetBtn;  //修改领取按钮状态 0 未领取，1待发货，2查看物流
  window.appCallbackFunction.changeLottery = changeLottery;  ////更改当前抽奖 //type： 1 正在进行，2 预告，3 彩蛋，0 任意+活动id，


  //与app交互的协议url
  var AppUrl = {

    //抽奖首页 https://hstest.ontheroadstore.com/Portal/Lottery/lottery.html?id=CJ20181107102903JH5991&share_code=163

    //商品详情页
    //卖家中心页                  user-info:// +uid

    //设置开始提醒                lottery://11

    //抽奖成功弹窗（点击免费抽奖）  lottery://21
    //我的抽奖码弹窗              lottery://22
    //点击获取更多抽奖码（分享）    lottery://23

    //中奖后领取奖品弹窗          lottery://31
    //中奖后分享（点击显摆一下）   lottery://32
    //未中奖，点击去购买          lottery://33
    //领奖后,若已发货，点击查看物流打开物流页     lottery://34

    //关闭loading     lottery://41

    //打开活动预告页       lottery-url://Portal/Lottery/lottery.html?id=xxx
    //打开抽奖规则页       lottery-url://Portal/Lottery/lottery_rule.html
    //打开参与用户列表页    lottery-url://Portal/Lottery/lottery_user.html

    //传递json            lottery-json://

  };
  let lottery_type = 1
  if (Authorization && Authorization.length > 0) {
    isApp = true;
    ajaxHeaders = {
      'Authorization': Authorization,
      // 'version' : version,//跨域不能加version
    };
  } else {
    //如果不是app，通过uid判断是否登录，如果未登录，点击领取和关注按钮需要跳转到登录页3
    loginStatus = init.ifLogin();
  }



  if (pretendApp == 1) {
    isApp = true;
  } else if (pretendApp == 2) {
    isApp = false;
  }




  initLottery();

  //获取所有信息
  function initLottery() {
    var url = ApiBaseUrl + '/appv6_2/getLotteryDetail';
    $.ajax({
      type: "GET",
      url: url,
      dataType: 'json',
      data: { lottery_id: id },
      headers: ajaxHeaders,
      success: function (data) {
        if (isApp) {
          setTimeout(function () {
            callApp(41);
          }, 50);
        }
        if (data.status == 1) {
          // console.log(data.data)
          var lotteryData = data.data;
          lottery_type = lotteryData.lottery.type
          lotteryCache[lotteryData.lottery.id] = {
            data: lotteryData,
            time: init.getTimestamp(),
          };
          console.log(lotteryCache);
          getLotteryAd()
          initLotteryFun(lotteryData);
          
        }
      },
      error: function (e) {
        if (isApp) {
          callApp(41);
        }
        console.log('initLottery err: ', e);
      }
    });

    show_lottery_apple_tip();
  }

  //重新加载lottery，传入新id
  function reloadLottery() {

    clearInterval(topTimer);
    clearInterval(topOpenTimer);

    var cache = lotteryCache[id];
    var now = init.getTimestamp();
    if (cache && (now - cache.time < lotteryCache.cacheTime)) {
      //如果有缓存并且时间差小于cacheTime，使用缓存
      // initLotteryFun(cache.data);//todo:倒计时没有更新，暂时无法使用
      initLottery();
    } else {
      initLottery();
    }
  }

  //具体的init方法
  function initLotteryFun(data) {
    id = data.lottery.id;
    userinfo = data.user || {};
    lotteryData = data;
    lottery = data.lottery;
    if (lotteryids[1] === '') {
      lotteryids[1] = data.lottery.id;
      lotteryids[2] = data.lottery.next_lottery_id;
      lotteryids[3] = data.lottery.eggs_lottery_id;
    }
    $page.find('.dis_none').hide();
    tokenExpire(data.user);
    initDetail(data.lottery, data);
    initSeller(data);
    createSendAppJson(data);//传递json给app
  }


  //抽奖
  function getLottery() {
    var url = ApiBaseUrl + '/lottery/getLottery';
    $.ajax({
      type: "POST",
      url: url,
      dataType: 'json',
      data: { lotteryId: id, shareCode: shareCode },
      headers: ajaxHeaders,
      success: function (data) {
        if (data.status == 1) {
          // console.log(data);
          if (data.data.code) {
            addUserLotteryCount([data.data.code]);
            //抽奖成功
            if (isApp) {
              callApp(21);
              $page.find('.lottery_btns .able').attr('status', '1').html('获取更多抽奖码，提高中奖率');
              $page.find('.lottery_btns .lottery_num').show();
            } else {
              $page.find('.lottery_btns .able').attr('status', '1').hide();
              $page.find('.lottery_btns .disable').html('参与抽奖成功').show();
              $page.find('.lottery_download').show();
            }
            if ($page.find('.lottery_participator .imgs img').length < 4) {
              $page.find('.lottery_participator .imgs').append('<img src="' + userinfo.avatar + '" style="border-color:' + lotteryData.lottery.background + ';">');//插入头像，增加人数
            }
            $page.find('.lottery_participator .txt b').html((lotteryData.user_list && lotteryData.user_list.count >= 0 ? (+lotteryData.user_list.count + 1) : 1));
            $page.find('.lottery_participator').show();
          } else {
            $.toast(data.data.info);
          }

        } else {
          $.toast(data.info);
        }
      },
      error: function (e) {
        console.log('getLottery err: ', e);
      }
    });
  }


  //调起app弹窗等
  function callApp(type) {
    if (!type) {
      return;
    }
    var url = callAppUrl(type);
    // console.log(url);
    location.href = url;
  }
  //生成url
  function callAppUrl(type) {
    var url = '';
    // var actId = id || lottery&&lottery.id || '';
    // var userCode = (userinfo && userinfo.user_encrypt) ? userinfo.user_encrypt : '';//用户分享code
    // var share_img = (lottery && lottery.picture) ? lottery.picture[0] : '';//分享图片
    switch (type) {
      case 11:
      case 21:
      case 23:
      case 31:
      case 32:
      case 33:
      case 34:
      case 41:
        url = 'lottery://' + type;//设置开始提醒
        break;
      case 22:
        url = 'lottery://' + type + '?lottery_code=' + userinfo.lottery_code.join(',');
        break;
      default:
        break;
    }
    return url;
  }

  //区分h5和app生成url
  //打开活动预告页       lottery-url://Portal/Lottery/lottery.html?id=xxx
  //打开抽奖规则页       lottery-url://Portal/Lottery/lottery_rule.html
  //打开参与用户列表页    lottery-url://Portal/Lottery/lottery_user.html
  function createUrl(url) {
    if (isApp) {
      return 'lottery-url://' + url;
    } else {
      return '/' + url;
    }
  }

  //用户中心页
  function createUserUrl(uid) {
    if (isApp) {
      return 'user-info://' + uid;
    } else {
      return '/User/index/index/id/' + uid + '.html'
    }
  }

  //传递json协议
  function sendAppJson(data) {
    if (isApp && data) {
      var txt = JSON.stringify(data);
      // console.log('lottery-json://'+txt);
      location.href = 'lottery-json://' + txt;

      sendDataByOC(txt);
    }
  }

  //与app交互专用方法
  function sendDataByOC(data) {
    try {
      window.webkit.messageHandlers.getLotteryInfo.postMessage(data);
    } catch (e) {

    }
  }

  //生成app需要的数据
  function createSendAppJson(data) {
    var lottery = data.lottery;
    var obj = {
      lottery: {
        lottery_id: lottery.id,//活动id
        lottery_join_goods_id: lottery.lottery_join_goods_id,//支付款式id
        lottery_join_object_id: lottery.lottery_join_object_id,//支付商品id
        lottery_object_id: lottery.lottery_object_id,//直接购买商品id
        lottery_uid: lottery.lottery_uid,//活动商品卖家uid
        lottery_uid_name: lottery.lottery_uid_name,//活动商品卖家uid name
        lottery_price: lottery.price,//活动商品价格
        name: lottery.name,//商品标题
        next_lottery_id: lotteryids[2],//如果是正在进行的抽奖活动 该id为下期未开始的抽奖活动id 使用当前抽奖的值
        eggs_lottery_id: lotteryids[3],//彩蛋抽奖id 使用当前抽奖的值
        lottery_img: lottery.picture[0],//卖家头像
        seller_avatar: lottery.seller_avatar,//卖家头像
        seller_name: lottery.seller_name,//卖家名称
        seller_uid: lottery.seller_uid,//卖家id
        coupon_code: lottery.coupon_code,//活动抽奖码id
        background: lottery.background,//十六进制背景色
        pay_endtime: lottery.pay_endtime,//领奖截止时间
        lottery_type: lottery.lottery_type,//int 抽奖状态 1进行中 2 未开始 3已结束
        is_lottery_active: lottery.is_lottery_active,//1当前，0不是当前
      },
      user: data.user,//所有用户信息
    };



    sendAppJson(obj);
  }





  //顶部开奖倒计时 参数：结束时间戳，服务器时间戳，抽奖结束后延迟
  function initEndCD(endTime, nowServerTime, delay) {


    var nowLocalTime = currentTime();//本地时间
    if (diffServerTime === 0) {
      diffServerTime = nowLocalTime - nowServerTime;//本地时间 - 服务器时间
    } else {
      nowServerTime = nowLocalTime - diffServerTime;//如果设置过本地时间与服务器时间差值，重新计算服务器时间
    }

    var scrolling = false;//是否在滚动，如果在滚动，不更新倒计时
    var scrollTimer = null;//重置scrolling的计时器

    delay = parseInt(delay) >= 0 ? parseInt(delay) : 30 * 60;
    var delayCD = 5;//几秒刷一次开奖倒计时时间

    var diff = endTime - nowServerTime;
    var localEndTime = +diff + nowLocalTime;//本地的活动结束时间

    var localOpenTime = +delay + localEndTime;//本地的开奖时间 结束时间+抽奖延时

    var $countdown = $page.find('.lottery_header .count_down');
    var $hour = $countdown.find('.hour');
    var $min = $countdown.find('.min');
    var $sec = $countdown.find('.sec');

    // $hour.html('00');
    // $min.html('00');
    // $sec.html('00');

    clearInterval(topTimer);
    clearInterval(topOpenTimer);
    cdIntervalFun();
    topTimer = setInterval(cdIntervalFun, 1000);

    //倒计时interval的fun
    function cdIntervalFun() {

      createCD(diff--);
      if (diff % 8 === 0) {
        diff = localEndTime - currentTime();
      }
      if (diff < 0) {
        clearInterval(topTimer);
        clearInterval(topOpenTimer);

        $page.find('.lottery_btns .able').hide();
        $page.find('.lottery_btns .disable').html('等待开奖').show();

        if (!isApp) {
          //如果不是app，倒计时结束后，使用开奖延迟时间delay进行倒计时，时间到了后刷新页面。
          topOpenTimer = setInterval(function () {
            delay = localOpenTime - currentTime();
            // console.log('delay sec: ',delay);
            if (delay < 0) {
              clearInterval(topOpenTimer);
              history.go(0);//在app中自动刷新无法发送header信息
            }
          }, delayCD * 1000)
        }
      }
    }

    $page.find('.lottery_header .going').show();


    var openT = +endTime + +delay;
    var openTimeTxt = new Date(openT * 1000).format('MM.dd hh:mm');
    $page.find('.lottery_header .going .title span').html(openTimeTxt);
    //更新倒计时dom
    function createCD(t) {
      if (scrolling && isApp) {
        return;
      }
      if (parseInt(t) >= 0) {
        var s = fixTime(t % 60);
        var m = fixTime(Math.floor(t / 60) % 60);
        var h = fixTime(Math.floor(t / 3600));

        $hour.html(h);
        $min.html(m);
        $sec.html(s);

      }
    }

    $page.find('.hs-page').off('scroll')
    $page.find('.hs-page').on('scroll', function () {
      scrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        scrolling = false;
      }, 300)
    });

  }



  //修复数字为00-99之间的字符串
  function fixTime(n) {
    if (n < 10) {
      n = '0' + n;
    } else if (n > 99) {
      n = '99';
    }
    return '' + n;
  }

  //获取当前时间戳（10位）
  function currentTime() {
    return parseInt((new Date().valueOf()) / 1000);
  }

  //顶部预告开始时间
  function initStartTime(startTime) {
    var time = new Date(startTime * 1000).format('yyyy-MM-dd hh:mm');
    var timeArr = time.split(' ');
    $page.find('.lottery_header .forecast .start_time').html('<b>' + timeArr[0] + '</b><b>' + timeArr[1] + '</b>')
    $page.find('.lottery_header .forecast').show();
  }

  //初始化抽奖商品详情
  function initDetail(lottery, data) {

    $('.lottery_act .hs-page').css('background-color', lottery.background);
    $('body').css('background-color', lottery.background);

    $page.find('.lottery_banner .banner_a').attr('href', '/Portal/HsArticle/index/id/' + lottery.lottery_object_id + '.html')
      .css({
        'background-image': 'url(' + lottery.picture[0] + '@640w_1l)',
      });
    $page.find('.lottery_banner .title').html(lottery.name);
    $page.find('.lottery_banner .desc').html('抽' + lottery.number + '人');
    $page.find('.lottery_banner .price').html('¥ ' + lottery.price);

    $page.find('.lottery_detail .text_a').attr('href', '/Portal/HsArticle/index/id/' + lottery.lottery_object_id + '.html');
    $page.find('.lottery_detail .text_a span').html(lottery.detail);

    $page.find('.lottery_rule_btn a').attr('href', createUrl('Portal/Lottery/lottery_rule.html'));

    var lottery_type = lottery.lottery_type; //抽奖类型 1进行中 2 未开始 3已结束

    if (lottery_type == 2) {
      initStartTime(lottery.start_time);
      initLotteryForecast(data);//活动未开始
    } else {


      if (lottery_type == 1) {
        initEndCD(lottery.end_time, lottery.current_time, lottery.lottery_close_time);
        initLotteryInProgress(data);//活动进行中
      } else if (lottery_type == 3) {
        initWinners(data.awardee);//中奖名单
        initLotteryEnd(data);//中奖后处理
      }

      initParticipator(data);//参与人员

      // if(lottery.next_lottery_id && !isApp){
      //     $page.find('.lottery_header .forecast_a').attr('href',createUrl('Portal/Lottery/lottery.html?id='+lottery.next_lottery_id)).show();
      // }
    }

    // 调用微信分享sdk
    var share_data = {
      title: '公路福利--[' + lottery.name + ']免费拿走',
      desc: '公路商店会员活动限时开启中！稀缺狠货免费拿！',
      link: window.location.href,
      img: lottery.picture[0],
    };
    init.wx_share(share_data);

  }

  //活动未开始
  function initLotteryForecast(data) {
    if (isApp && data.user.is_notify == 0) {
      //未设置开始提醒
      $page.find('.lottery_btns .able').attr('status', '2').html('设置提醒').show();//status 0 未抽奖 1 获取更多抽奖码 2 设置开始提醒
    } else {
      $page.find('.lottery_btns .disable').html('等待开始').show();
    }
    $page.find('.lottery_btns').show();
  }

  //活动进行中
  function initLotteryInProgress(data) {
    if (isApp) {
      //1 在app里，如果已参与，显示拥有的码数
      if (data.user.lottery_code && data.user.lottery_code.length > 0) {
        $page.find('.lottery_btns .able').attr('status', '1').html('获取更多抽奖码，提高中奖率').show();//status 0 未抽奖 1 获取更多抽奖码 2 设置开始提醒
        $page.find('.lottery_btns .lottery_num .num b').html(data.user.lottery_code.length);
        $page.find('.lottery_btns .lottery_num').show();
      } else {
        $page.find('.lottery_btns .able').attr('status', '0').html('免费抽奖').show();
      }
    } else {
      //2 在h5里，如果已登录且参与过，显示抽奖成功和打开app查看结果
      if (loginStatus && data.user && data.user.lottery_code && data.user.lottery_code.length > 0) {
        $page.find('.lottery_btns .disable').html('抽奖成功，下载App可提高中奖率').show();
        $page.find('.lottery_download').show();
      } else {
        $page.find('.lottery_btns .able').attr('status', '0').html('免费抽奖').show();
      }
    }
    $page.find('.lottery_btns').show();
  }

  //开奖后
  function initLotteryEnd(data) {

    if (isApp) {
      //1 在app里，如果参与了显示中奖或没中奖 data.user.status 1中奖 2未中奖 没有就是没参与
      // user.order_status 1已付款，2未付款
      // user.deliver_status 1已发货，2未发货
      // user.order_number 订单号
      if (data.user.status == 1) {

        if (data.user.deliver_status == 1) {
          //已发货
          $page.find('.result_true').attr('status', '2').show();
        } else if (data.user.order_status == 2) {
          //待领取
          $page.find('.result_true').attr('status', '0').show();
        } else {
          //待发货
          $page.find('.result_true').attr('status', '1').show();
        }

        $page.find('.lottery_result').show();
        $page.find('.result_true .result_get_0').attr('href', callAppUrl(31));//领奖
        $page.find('.result_true .result_get_2').attr('href', callAppUrl(34));//查看物流
        $page.find('.result_true .result_share').attr('href', callAppUrl(32));//分享

      } else if (data.user.status == 2 || data.user.status == 0) {
        if (data.coupon) {
          createCoupon(data.coupon);
          $page.find('.result_false .no_win_img').attr('src', 'https://img8.ontheroadstore.com/static/image/choujiang/no_winning_2x.png')
        } else {
          $page.find('.result_false .no_win_img').attr('src', 'https://img8.ontheroadstore.com/static/image/choujiang/no_win_2x.png')
        }
        $page.find('.result_false').show();
        $page.find('.lottery_result').show();
        $page.find('.result_false .result_see').attr('href', callAppUrl(33));//优惠券购买

      } else {
        $page.find('.lottery_btns .disable').html('已结束').show();
        $page.find('.lottery_btns').show();
      }
    } else {
      //2 在h5里，不论有没有登录、有没有中奖只显示查看中奖结果按钮
      $page.find('.lottery_btns .disable').html('已结束').show();
      $page.find('.lottery_btns').show();
      $page.find('.lottery_download').show();
    }

  }


  //参与者头像
  function initParticipator(data) {
    var userlist = data.user_list;
    if (!(data.user_list && userlist.count > 0)) {
      return;
    }
    // $page.find('.lottery_participator a').attr('href',createUrl('Portal/Lottery/lottery_user.html?id='+id));//参与用户列表//取消抽奖用户列表入口
    $page.find('.lottery_participator .txt b').html(userlist.count);

    var html = '';
    var users = userlist.result;
    var length = users.length > 4 ? 4 : users.length;

    for (var i = 0; i < length; i++) {
      html += '<img src="' + users[i].avatar + '" style="border-color:' + data.lottery.background + ';">'
    }
    $page.find('.lottery_participator .imgs').html(html);
    $page.find('.lottery_participator').show();
  }

  //中奖名单
  function initWinners(awardee) {
    if (isApp && awardee) {
      var html = '';
      for (var i = 0; i < awardee.length; i++) {
        html += '<li>'
        html += '<a external href="' + createUserUrl(awardee[i].uid) + '">'  //中奖人头像
        html += '<img src="' + awardee[i].avatar + '">'
        html += '<div class="name">' + awardee[i].user_name + '</div>'
        html += '<div class="sn">' + awardee[i].lottery_win_code + '</div>'
        html += '</a>'
        html += '</li>'
      }
      $page.find('.lottery_winners ul').html(html);
      $page.find('.lottery_winners').show();
    }
  }

  //赞助商
  function initSeller(data) {
    var seller = data.seller;
    if (seller) {
      $page.find('.lottery_sponsor .sponsor .avatar_img').attr('src', seller.avatar);
      $page.find('.lottery_sponsor .sponsor .name').html(seller.nickname);
      $page.find('.lottery_sponsor .sponsor .intro').html(seller.signature);
      $page.find('.lottery_sponsor .sponsor a').attr('href', createUserUrl(seller.id));//卖家店铺中心
      $page.find('.lottery_sponsor').show();

      //卖家商品列表
      if (data.seller_goods) {

        var goods = data.seller_goods;
        var html = '';
        for (var i = 0; i < goods.length; i++) {
          html += '<li>'
          html += '<a external href="/Portal/HsArticle/index/id/' + goods[i].id + '.html">'
          html += '<div class="img" style="background-image: url(' + goods[i].cover + '@640w_1l);"></div>'
          html += '<div class="title">' + goods[i].title + '</div>'
          html += '</a>'
          html += '</li>'
        }
        $page.find('.lottery_sponsor_goods_ul').html(html);
        $page.find('.lottery_sponsor_goods_ul').show();
      }
    }
  }

  //抽奖或获取更多抽奖码
  $page.on('click', '.lottery_btns .able', function (ev) {
    var $this = $(this);
    //status 0 未抽奖 1 获取更多抽奖码 2 设置开始提醒
    if ($this.attr('status') === '0') {
      if (!isApp && !loginStatus) {
        init.toLogin();
      } else {
        if (isApp) {
          //是app，让app自己调用抽奖接口
          callApp(21);
        } else {
          getLottery();
          sensorsClick('免费抽奖');
        }
      }
    } else if (isApp && $this.attr('status') === '1') {
      //点击获取更多抽奖码（分享）    lottery://23-xxx 加分享shareid
      callApp(23);
      sensorsClick('获取更多抽奖码，提高中奖率');

    } else if (isApp && $this.attr('status') === '2') {
      //设置开始提醒                lottery://11
      callApp(11);
      sensorsClick('设置提醒');
    }

  });

  //我的抽奖码弹窗
  $page.on('click', '.lottery_btns .lottery_num', function (ev) {
    var $this = $(this);
    if (isApp) {
      //我的抽奖码弹窗              lottery://22-xxx 加分享shareid
      callApp(22);
    }
  });


  //app登录过期警告
  function tokenExpire(user) {
    if (isApp && !user) {
      $.toast('用户登录已过期');
    }
  }

  //生成优惠券
  function createCoupon(data) {
    if (!data || !data.title) {
      return;
    }
    var liHtml = '';

    liHtml += '<li class="coupon_li">'
    liHtml += '<div class="coupon_top">'
    liHtml += '<div class="left">'
    liHtml += '<div class="coupon_price">¥<b>' + data.coupon_price + '</b></div>'
    liHtml += '<div class="coupon_desc">' + (data.min_price > 0 ? '满' + data.min_price + '可用' : '消费任意金额可用') + '</div>'
    liHtml += '</div>'
    liHtml += '<div class="right_top">'
    liHtml += '<div class="center">'
    liHtml += '<div class="title">' + data.title + '</div>'
    if (data.apply_time_type == 2) {
      liHtml += '<div class="time">' + init.couponFmtTime(init.getTimestamp()) + ' - ' + init.couponFmtTime(init.getTimestamp(data.apply_time_length)) + '</div>'
    } else {
      liHtml += '<div class="time">' + init.couponFmtTime(data.apply_time_start) + ' - ' + init.couponFmtTime(data.apply_time_end) + '</div>'
    }
    liHtml += '</div>'
    liHtml += '</div>'
    liHtml += '<div class="right_btm">'
    liHtml += '<div class="open_wrap"><span class="title">' + data.coupon_note + '</span></div>'
    liHtml += '</div>'
    liHtml += '</div>'
    liHtml += '</li>'


    $page.find('.lottery_coupon_wrap').html(liHtml);

  }

  //设置提醒
  function setLotteryNotify(callback) {
    var url = ApiBaseUrl + '/lottery/setLotteryNotify/' + id;
    $.ajax({
      type: "POST",
      url: url,
      dataType: 'json',
      data: {},
      headers: ajaxHeaders,
      success: function (data) {
        if (data.status == 1) {
          if (typeof callback === 'function') {
            callback();
          }
        } else {
          $.toast(data.info);
        }
      },
      error: function (e) {
        console.log('setLotteryNotify: ', e);
      }
    });
  }

  function getLotteryAd() {
    var url
    if(lottery_type==1){
      url = ApiBaseUrl + "/appv6_5/getAdvertList?area=32768&size=1"
    }
    if(lottery_type==2){
      url = ApiBaseUrl + "/appv6_5/getAdvertList?area=65536&size=1"
    }
    
    
    $.ajax({
      type: "GET",
      url: url,
      dataType: 'json',
      headers: ajaxHeaders,
      success: function (data) {
        if (data.status == 1) {
          let _data = data.data[0]
          let ad = `<img src="${_data.image}"></img>`
          $('.lottery_ad').html(ad)
          $('.lottery_ad').on('click', function () {
            let id = _data.url
            switch (_data.url_type) {
              case 1:
                location.href = `${location.origin}/Portal/HsArticle/index/id/${id}.html`
                break;
              case 2:
                if(isApp){
                  location.href = "subject-read://" + id
                }else{
                  window.location.href=`${location.origin}/Portal/HsArticle/culture/id/${id}.html`
                }
              

                break;
              case 3:
                if(isApp){
                  if(isIOS){
                    location.href = `${location.origin}/HsProject/index/pid/${id}.html`
                  }else{
                    location.href = "stopic://" + id
                  }  
                }else{
                  location.href = `${location.origin}/HsProject/index/pid/${id}.html`
                }
                
                break;
              case 5:
                window.location.href = `${id}`
                break;
              case 6:
                if(isApp){
                  location.href = 'category-list://' + id
                }else{
                  window.location.href=`${location.origin}/HsCategories/category_index/id/${id}.html`
                }
                break;
              default:
                console.log('没找到这样的类型')
            }
          })
        } else {

        }
      },
      error: function (e) {
        console.log('setLotteryAd: ', e);
      }
    });
  }
 
  //分享成功后抽奖码数量增加，增加抽奖码code
  function addUserLotteryCount(codeArr) {
    if (codeArr instanceof Array && codeArr.length > 0) {

      var $num = $page.find('.lottery_btns .lottery_num .num b');
      if (!userinfo) {
        userinfo = {};
      }
      userinfo.lottery_code = userinfo.lottery_code || [];
      for (var i = 0; i < codeArr.length; i++) {
        if (userinfo.lottery_code.indexOf(codeArr[i]) === -1) {
          userinfo.lottery_code.push(codeArr[i]);
        }
      }
      $num.html(userinfo.lottery_code.length);
    }
  }
  //分享成功后抽奖码数量增加，增加抽奖码code,传一个code字符串
  function addUserLotteryCount2(codeTxt) {
    if (typeof codeTxt === "string" && codeTxt.length > 0) {
      var $num = $page.find('.lottery_btns .lottery_num .num b');
      if (!userinfo) {
        userinfo = {};
      }
      userinfo.lottery_code = userinfo.lottery_code || [];
      if (userinfo.lottery_code.indexOf(codeTxt) === -1) {
        userinfo.lottery_code.push(codeTxt);
      }
      $num.html(userinfo.lottery_code.length);
    }
  }

  //修改领取按钮状态
  function changeLotteryGetBtn(status) {
    if (status == 0 || status == 1 || status == 2) {
      $page.find('.result_true').attr('status', status);
    }
  }

  //抽奖成功回调
  function getLotteryCallback(codeTxt) {
    addUserLotteryCount2(codeTxt);
    //抽奖成功
    $page.find('.lottery_btns .able').attr('status', '1').html('获取更多抽奖码，提高中奖率');
    $page.find('.lottery_btns .lottery_num').show();

    if ($page.find('.lottery_participator .imgs img').length < 4) {
      $page.find('.lottery_participator .imgs').append('<img src="' + userinfo.avatar + '" style="border-color:' + lotteryData.lottery.background + ';">');//插入头像，增加人数
    }
    $page.find('.lottery_participator .txt b').html((lotteryData.user_list && lotteryData.user_list.count >= 0 ? (+lotteryData.user_list.count + 1) : 1));
    $page.find('.lottery_participator').show();
  }

  //设置提醒成功
  function setLotteryNotifyCallback() {
    $page.find('.lottery_btns .able').hide();
    $page.find('.lottery_btns .disable').html('等待开始').show();
  }

  //更改当前抽奖//type 0 任意+活动id，1 正在进行，2 预告，3 彩蛋
  function changeLottery(type, lotteryId) {

    if (lotteryids[type]) {
      id = lotteryids[type];
      reloadLottery();
    } else if (type == 0 && lotteryId) {
      id = lotteryId;
      reloadLottery();
    } else {
      if (isApp) {
        callApp(41);
      }
      setTimeout(function () {
        $.toast('当前抽奖不存在')
      }, 50)
    }
  }

  //显示苹果声明
  function show_lottery_apple_tip() {
    if (isApp) {
      var u = navigator.userAgent;
      var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
      if (isIOS) {
        $page.find('.lottery_apple_tip').show();
      }
    }
  }


  //  神策埋点事件
  sensorsEvent();
  function sensorsEvent() {

    $page.on('click', '.lottery_download ', function () {
      sensorsClick('打开APP');
    });

    //卖家推荐商品
    $(page).find('.lottery_sponsor_goods_ul').on('click', 'a', function () {
      var $this = $(this);
      var $li = $this.parents('li');
      var url = $this.attr('href');
      var index = $li.index();
      var title = $li.find('.title').html();
      var desc = '商品';
      var id = init.sensorsFun.getUrlId(url);

      init.sensorsFun.mkt('卖家推荐商品', '抽奖页', title, index, desc, id);
    });

    //卖家推荐商品的卖家
    $(page).find('.lottery_sponsor').on('click', 'a', function () {
      var $this = $(this);
      var url = $this.attr('href');
      var id = init.sensorsFun.getUrlId(url);

      init.sensorsFun.mkt('卖家推荐商品', '抽奖页', id, '', '店铺', '');
    });

    //去逛逛
    $(page).find('.sponsor').on('click', function () {
      sensorsClick('去逛逛');
    });
    //显摆一下
    $(page).find('.result_share').on('click', function () {
      sensorsClick('显摆一下');
    });
    //买他妈的
    $(page).find('.result_see').on('click', function () {
      sensorsClick('买他妈的');
    });
    //奖品详情
    $(page).find('.lottery_detail a').on('click', function () {
      sensorsClick('奖品详情');
    });

  }
  //抽奖页面的点击埋点
  function sensorsClick(buttonName) {
    init.sensors.track('buttonClick', {
      pageType: '抽奖页',
      buttonName: buttonName,
    })
  }




});


