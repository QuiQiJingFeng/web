/**
 * 根据分辨率自适应字体大小
 */
;(function(win){
    function L() {
        var width = docEle.getBoundingClientRect().width;// 获取页面宽度
        width / F > 540 && (width = 540 * F);
        var fontSize = width / 10;
        docEle.style.fontSize = fontSize + "px", win.rem = fontSize;
    }
    var timer, doc = win.document,
        docEle = doc.documentElement,
        viewport = doc.querySelector('meta[name="viewport"]'),
        flexible = doc.querySelector('meta[name="flexible"]'),
        F = 0,
        E = 0
    if (viewport) {
        console.warn("将根据已有的meta标签来设置缩放比例");
        var C = viewport.getAttribute("content").match(/initial\-scale=([\d\.]+)/);
        C && (E = parseFloat(C[1]), F = parseInt(1 / E))
    } else {
        if (flexible) {
            var B = flexible.getAttribute("content");
            if (B) {
                var A = B.match(/initial\-dpr=([\d\.]+)/),
                    z = B.match(/maximum\-dpr=([\d\.]+)/);
                A && (F = parseFloat(A[1]), E = parseFloat((1 / F).toFixed(2))), z && (F = parseFloat(z[1]), E = parseFloat((1 / F).toFixed(2)))
            }
        }
    }
    if (!F && !E) {
        var userAgent = win.navigator.userAgent,
            x = (!!userAgent.match(/android/gi), !!userAgent.match(/iphone/gi)),
            w = x && !!userAgent.match(/OS 9_3/),
            v = win.devicePixelRatio;
        F = x && !w ? v >= 3 && (!F || F >= 3) ? 3 : v >= 2 && (!F || F >= 2) ? 2 : 1 : 1, E = 1 / F
    }
    if (docEle.setAttribute("data-dpr", F), !viewport) {
        if (viewport = doc.createElement("meta"), viewport.setAttribute("name", "viewport"), viewport.setAttribute("content", "initial-scale=" + E + ", maximum-scale=" + E + ", minimum-scale=" + E + ", user-scalable=no"), docEle.firstElementChild) {
            docEle.firstElementChild.appendChild(viewport)
        } else {
            var u = doc.createElement("div");
            u.appendChild(viewport), doc.write(u.innerHTML)
        }
    }
    win.addEventListener("resize", function() {
        clearTimeout(timer), timer = setTimeout(L, 300);
    }, !1), win.addEventListener("pageshow", function(b) {
        b.persisted && (clearTimeout(timer), timer = setTimeout(L, 300))
    }, !1), "complete" === doc.readyState ? doc.body.style.fontSize = 12 * F + "px" : doc.addEventListener("DOMContentLoaded", function() {
        doc.body.style.fontSize = 12 * F + "px"
    }, !1), L();
})(window);