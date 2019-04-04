// 手淘flexible
! function(a, b) {
    var ua = navigator.userAgent;
    var isIOS = /(iPhone|iPad|iPod)/.test(ua);
    function fixRem(){
        var docW = document.documentElement.getBoundingClientRect().width
        var fs = document.documentElement.style.fontSize

        var $FixRemDom = $('#FixRemDom');
        if($FixRemDom.length === 0){
            $('body').append('<div id="FixRemDom" style="width:10rem;"></div>');
        }
        $FixRemDom = $('#FixRemDom');
        if($FixRemDom.length > 0){
            var divW = $FixRemDom[0].clientWidth;
            if(docW < divW){
                var fixFontSize = docW * parseFloat(fs) / divW;
                document.documentElement.style.fontSize=fixFontSize+'px'
            }
        }
    }

    function c() {
        var b = f.getBoundingClientRect().width;
        b / i > 540 && (b = 540 * i);
        var c = b / 10;
        f.style.fontSize = c + "px", k.rem = a.rem = c

        if (!isIOS) {
            setTimeout(function(){
                fixRem();
            },5)
        }
    }
    var d, e = a.document,
        f = e.documentElement,
        g = e.querySelector('meta[name="viewport"]'),
        h = e.querySelector('meta[name="flexible"]'),
        i = 0,
        j = 0,
        k = b.flexible || (b.flexible = {});
    if (g) {
        console.warn("将根据已有的meta标签来设置缩放比例");
        var l = g.getAttribute("content").match(/initial\-scale=([\d\.]+)/);
        l && (j = parseFloat(l[1]), i = parseInt(1 / j))
    } else if (h) {
        var m = h.getAttribute("content");
        if (m) {
            var n = m.match(/initial\-dpr=([\d\.]+)/),
                o = m.match(/maximum\-dpr=([\d\.]+)/);
            n && (i = parseFloat(n[1]), j = parseFloat((1 / i).toFixed(2))), o && (i = parseFloat(o[1]), j = parseFloat((1 / i).toFixed(2)))
        }
    }
    if (!i && !j) {
        var p = a.navigator.userAgent,
            q = (!!p.match(/android/gi), !!p.match(/iphone/gi)),
            r = q && !!p.match(/OS 9_3/),
            s = a.devicePixelRatio;
        i = q && !r ? s >= 3 && (!i || i >= 3) ? 3 : s >= 2 && (!i || i >= 2) ? 2 : 1 : 1, j = 1 / i
    }
    if (f.setAttribute("data-dpr", i), !g)
        if (g = e.createElement("meta"), g.setAttribute("name", "viewport"), g.setAttribute("content", "initial-scale=" + j + ", maximum-scale=" + j + ", minimum-scale=" + j + ", user-scalable=no"), f.firstElementChild) f.firstElementChild.appendChild(g);
        else {
            var t = e.createElement("div");
            t.appendChild(g), e.write(t.innerHTML)
        }
    a.addEventListener("resize", function() {
        clearTimeout(d), d = setTimeout(c, 300)
    }, !1), a.addEventListener("pageshow", function(a) {
        a.persisted && (clearTimeout(d), d = setTimeout(c, 300))
    }, !1), "complete" === e.readyState ? e.body.style.fontSize = 12 * i + "px" : e.addEventListener("DOMContentLoaded", function() {
        e.body.style.fontSize = 12 * i + "px"
    }, !1), c(), k.dpr = a.dpr = i, k.refreshRem = c, k.rem2px = function(a) {
        var b = parseFloat(a) * this.rem;
        return "string" == typeof a && a.match(/rem$/) && (b += "px"), b
    }, k.px2rem = function(a) {
        var b = parseFloat(a) / this.rem;
        return "string" == typeof a && a.match(/px$/) && (b += "rem"), b
    }
}(window, window.lib || (window.lib = {}));
