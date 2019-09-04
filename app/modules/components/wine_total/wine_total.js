//酒会员专区

// 初始化
var common = require('../common/common.js');

$(document).on('pageInit', '.wine_total', function (e, id, page) {

  if (page.selector == '.page') {
    return false;
  }

  document.title = '就会员专区';

  var init = new common(page);

  var $page = $(page);

  var ApiBaseUrl = init.getApiBaseUrl();

  var PHPSESSID = init.getCookie('PHPSESSID');
  var ajaxHeaders = {
    'phpsessionid': PHPSESSID
  };
  var mySwiper = new Swiper('.wine_swiper_wrap', {
    pagination: '.swiper-pagination',
    loop: true,
    autoplay: 3000,
    speed: 300,
    watchSlidesVisibility: true,
    autoplayDisableOnInteraction: false,
  })
  // var uid = init.ifLogin(true);

  // initPartnerData();


  // $page.find('.partner_share_btn').on('click',function(){
  //     init.sensors.track('buttonClick', {
  //         pageType : '公路传教士',
  //         buttonName : '去分享',
  //     })
  // });

 $('#circleList').on('click','div',function(){
 
   if($(this).hasClass('active')){
    $(this).removeClass('active')
   }else{
    $(this).addClass('active')
   }
   checkSelect()
 })

 function checkSelect(){
   let flag = false
  $('#circleList').find('div').forEach(v=>{
    if($(v).hasClass('active')){
      flag=- true
    }
  })
  if(flag){
    $('.finish').addClass('finish_btn')
  }else{
    $('.finish').removeClass('finish_btn')
  }
 }

page.on('click','.finish_btn',function(){
  let arr = []
  $('#circleList').find('div').forEach(v=>{
    if($(v).hasClass('active')){
      arr.push($(v).html())
    }
  })
  console.log(arr)
})



    class Circle {
      constructor(x, y, r) {
        this.x = x
        this.y = y
        this.r = r
      }
     
    }
    class RandomCircle {
      constructor(obj) {
        this.c = document.getElementById(obj.id);
        this.dWidth = document.getElementById(obj.id).clientWidth;
        this.dHeight = document.getElementById(obj.id).clientHeight;
        this.fix = obj.fix || false;
        this.minMargin = obj.minMargin || 10
        this.minRadius = obj.minRadius || 60/2*window.devicePixelRatio
        this.mixRadius = obj.mixRadius || 90/2*window.devicePixelRatio
        this.radiuArr = obj.radiuArr || [90,90,90,75,75,75,60,60,60,90,90,90,75,75,75,60,60,60]
        this.total = obj.total || 10
        this.circleArray = []
        this.circleNumber = 1
      }
      drawOneCircle(c) {
        let _div = document.createElement("div");
        _div.style.width = `${c.r * 2}px`
        _div.style.height = `${c.r * 2}px`
        _div.style.lineHeight = `${c.r * 2}px`
        _div.style.left = `${c.x}px`
        _div.style.top = `${c.y}px`
        _div.innerText = `${c.r}px`
        document.getElementById('circleList').appendChild(_div)
      }

      check(x, y, r) {
        return !(x + r > this.dWidth || x - r < 0 || y + r > this.dHeight || y - r < 0)
      }

      // 获取一个新圆的半径，主要判断半径与最近的一个圆的距离
      getR(x, y) {
        if (this.circleArray.length === 0) return this.radiuArr[0]
        let lenArr = this.circleArray.map(c => {
          let xSpan = c.x - x
          let ySpan = c.y - y
          return Math.floor(Math.sqrt(Math.pow(xSpan, 2) + Math.pow(ySpan, 2))) - c.r
        })
        let minCircleLen = Math.min(...lenArr)
        let minC = this.circleArray[lenArr.indexOf(minCircleLen)]
        let tempR = this.fix ? this.radiuArr[this.circleArray.length]/2*window.devicePixelRatio : minCircleLen - this.minMargin
        let bool = this.fix ? (tempR <= minCircleLen - minC.r) : (tempR >= this.minRadius&&tempR<=this.mixRadius)
        return bool ? tempR : false
      }

      // 生成一个圆，随机生成圆心。
      // 如果连续生成200次半径都没有合适的话，终止进程
      createOneCircle() {
        let x, y, r;
        let createCircleTimes = 0
        while (true) {
          createCircleTimes++
          x = Math.floor(Math.random() * this.dWidth)
          y = Math.floor(Math.random() * this.dHeight)
          let TR = this.getR(x, y)
          if (!TR) {
            continue;
          } else {
            r = TR
          }
          if (this.check(x, y, r) || createCircleTimes > 500) {
            break
          }

        }
        this.check(x, y, r) && this.circleArray.push(new Circle(x, y, r))
      }
      // 如果生成100次新圆都失败的话，终止方案。
      // 如果生成100种方案都没有合适可用的话，终止进程。
      init() {
        let n = 0
        while (this.circleArray.length < this.total) {
          this.circleArray = []
          let i = 0;
          while (this.circleArray.length < this.total) {
            this.createOneCircle()
            i++
            if (i >= 100) {
              break;
            }
          }
          n++
          if (n > 100) {
            break;
          }
        }
        // 根据半径从大到小画圆。根据半径从大到小画圆。
        this.circleArray.sort((a, b) => b.r - a.r).forEach(c => {
          this.drawOneCircle(c)
        })
      }
    }

   
    let p = new RandomCircle({ id: 'circleList', total: 20,fix: false, })
    p.init()

    console.log(p.circleArray)




});


