(function (a) {
    var b = {};
    var c = {};
    var d;
    a.fn.theatre = function () {
        var b = arguments;
        this.css({visibility: "visible", display: "block"});
        (this.length ? this : a(document)).each(function () {
            c.initAll.apply(a(this), b)
        });
        return this
    };
    c.loadEffect = function (c) {
        if (!d) {
            a('script[src*="jquery.theatre-"], link[href*="theatre.css"]').first().each(function () {
                d = (this.href || this.src).replace(/\/[^\/]*(#.*)?$/, "")
            })
        }
        var e = d + "/effect." + c.split(":")[0] + ".js";
        a("head").append('<script type="text/javascript" src="' + e + '"></script>');
        return b[c]
    };
    c.buryDead = function (b) {
        return b.filter(function () {
            return a(this).get(0).parentNode
        })
    };
    c.initAll = function (d) {
        if (typeof d == "object" || !d || d == "init") {
            return this.is(document) || c.init.apply(this, arguments)
        }
        if (d == "effect") {
            if (typeof arguments[2] == "function") {
                return b[arguments[1]] = arguments[2]
            } else {
                a.error("Elixon Theatre cannot register effect object unless it is a Function.")
            }
        } else if (this.is(document)) {
            return false
        }
        var e = this.data("theatre");
        if (!e)return false;
        var f = arguments[1];
        var g = false;
        switch (d) {
            case"iterate":
                g = true;
                d = e.settings.playDir;
            case"next":
            case"prev":
                f = d;
            case"jump":
                switch (f) {
                    case"first":
                        f = 0;
                        break;
                    case"last":
                        f = e.actors.length - 1;
                        break;
                    case"next":
                        f = (e.index + e.actors.length + 1) % e.actors.length;
                        break;
                    case"prev":
                        f = (e.index + e.actors.length - 1) % e.actors.length;
                        break;
                    default:
                        f = (parseInt(arguments[1]) - 1) % e.actors.length;
                        f = (Math.abs(Math.floor(f / e.actors.length) * e.actors.length) + f) % e.actors.length
                }
                if (f == e.index)break;
                if (typeof arguments[2] != "undefined") {
                    if (typeof e.settings.speedOrig == "undefined")e.settings.speedOrig = e.settings.speed;
                    e.settings.speed = arguments[2]
                }
                var h = e.index;
                if (!g)this.theatre("stop");
                while (e.index != f) {
                    f = c.onMove.apply(this, [f]);
                    if (f == -1)break;
                    if (e.effect.jump) {
                        e.index = f;
                        e.effect.jump.apply(e.effect, [h])
                    } else {
                        if (e.index < f) {
                            var i = f - e.index;
                            var j = e.index + e.actors.length - f
                        } else {
                            var j = e.index - f;
                            var i = e.actors.length + f - e.index
                        }
                        e.index = (e.index + (i < j ? 1 : -1) + e.actors.length) % e.actors.length;
                        e.effect[i < j ? "next" : "prev"].apply(e.effect, [h])
                    }
                    if (e.index == h)break;
                    h = e.index;
                    c.updatePaging.apply(this)
                }
                if (typeof e.settings.speedOrig != "undefined")e.settings.speed = e.settings.speedOrig;
                break;
            case"play":
            case"destroy":
            case"stop":
                c[d].apply(this);
                break;
            default:
                a.error('Elixon Theatre method "' + d + '" does not exist on jQuery.theatre!')
        }
    };
    c.init = function (d) {
        c.destroy.apply(this);
        var e = {
            selector: '> *:not(".theatre-control")',
            effect: "horizontal",
            speed: 1e3,
            still: 3e3,
            autoplay: true,
            playDir: "next",
            controls: "horizontal",
            itemWidth: false,
            itemHeight: false,
            width: false,
            height: false,
            onMove: false,
            onAfterMove: function () {
            },
            random: false
        };
        if (d) {
            a.extend(e, d)
        }
        if (e.random) {
            var f = a("> *", this).get();
            while (f.length) {
                var g = Math.floor(Math.random() * f.length);
                var h = f[g];
                f.splice(g, 1);
                h.parentNode.appendChild(h)
            }
        }
        var i = a(e.selector, this);
        var j = {paging: e.paging && a(e.paging), actors: i, effect: false, settings: e, interval: false, index: 0};
        var k;
        switch (typeof e.effect) {
            case"string":
                k = e.effect.split(/\s+/);
                break;
            case"function":
                k = [e.effect];
                break
        }
        var l;
        for (var m = 0; m < k.length && !j.effect; m++) {
            e.effect = k[m];
            if (typeof e.effect == "function") {
                l = e.effect
            } else if (b[e.effect]) {
                l = b[e.effect]
            } else {
                l = c.loadEffect(e.effect)
            }
            if (!l)a.error('Elixon Theatre does not support effect "' + e.effect + '"!');
            j.effect = new b[e.effect](this, i, e, j);
            if (typeof j.effect.capable == "function") {
                var n = j.effect.capable();
                if (n !== true) {
                    if (typeof j.effect.destroy == "function")j.effect.destroy();
                    j.effect = null;
                    if (k.length == 1) {
                        k.push(n || e.effect)
                    }
                }
            }
        }
        this.addClass("theatre").data("theatre", j);
        this.addClass("theatre-" + e.effect.replace(/[^a-z0-9]+/ig, "-"));
        if (e.width)this.css("width", e.width);
        if (e.height)this.css("height", e.height);
        var g = 0;
        i.each(function () {
            var b = a(this);
            var c = g++;
            var d = function () {
                return {width: b.width(), height: b.height(), index: c}
            };
            if (!b.data("theatre")) {
                b.data("theatre", d())
            }
            b.load(function () {
                b.data("theatre", d())
            })
        });
        if (e.itemWidth || e.itemHeight) {
            var o = this;
            i.each(function () {
                var b = a(this);
                if (e.itemWidth) {
                    b.css("width", e.itemWidth == "max" ? o.width() - b.outerWidth() + b.width() + "px" : e.itemWidth)
                }
                if (e.itemHeight) {
                    b.css("height", e.itemHeight == "max" ? o.height() - b.outerHeight() + b.height() + "px" : e.itemHeight)
                }
            })
        }
        i.addClass("theatre-actor").stop(true, true);
        j.effect.init();
        if (e.autoplay) {
            c.play.apply(this, [true])
        }
        c.appendControls.apply(this);
        c.onMove.apply(this, [j.index]);
        c.generatePaging.apply(this);
        var p = a(this);
        var q = function () {
            var b = a(this).closest(".theatre-actor").add(".theatre-actor", this).add(this).filter(".theatre-actor").first();
            var c = b.data("theatre");
            if (c && c.index != j.index) {
                var d = b.offset();
                d.left += b.width() / 2;
                d.top += b.height() / 2;
                var e = p.offset();
                var f;
                f = e.left < d.left && d.left < e.left + p.width();
                f = f && e.top < d.top && d.top < e.top + p.height();
                if (!f)p.theatre("jump", c.index + 1)
            }
        };
        a("a, *:input, .theatre-actor", p).focus(function () {
            var a = this;
            setTimeout(function () {
                q.apply(a)
            }, 100)
        })
    };
    c.onMove = function (a) {
        if (isNaN(a))return -1;
        var b = this.data("theatre");
        if (typeof b.settings.onMove != "function")return a;
        var c = b.settings.onMove.apply(this, [a, b.actors[a], b]);
        if (typeof c == "number") {
            c = c % b.actors.length
        } else if (c === false) {
            c = -1
        } else {
            c = a
        }
        if (c >= 0)this.trigger("theatreMove", [c, b.actors[c], b]);
        return c
    };
    c.generatePaging = function () {
        var b = this;
        var d = this.data("theatre");
        if (!d.paging)return;
        d.paging.each(function () {
            var c = a(this);
            var e = [];
            a("> *", c).each(function () {
                e.push(a("<div></div>").append(this).html())
            });
            var f = e[e.length - 1];
            for (var g = 0; g < d.actors.length; g++) {
                var h = e.length < g + 1 ? f : e[g];
                (function (a) {
                    c.append(h.replace("{#}", a) + "\n");
                    c.children().last().click(function () {
                        b.theatre("jump", a)
                    })
                })(g + 1)
            }
        });
        c.updatePaging.apply(this)
    };
    c.updatePaging = function () {
        var b = this.data("theatre");
        if (!b.paging)return;
        b.paging.each(function () {
            var c = a(this);
            a("> *", c).removeClass("active").eq(b.index).addClass("active")
        })
    };
    c.appendControls = function () {
        settings = this.data("theatre").settings;
        if (settings.controls == "horizontal" || settings.controls == "vertical") {
            var b = this;
            this.append('<a class="theatre-control theatre-control-' + settings.controls + '-next theatre-next"><span></span></a>');
            this.append('<a class="theatre-control theatre-control-' + settings.controls + '-prev theatre-prev"><span></span></a>');
            this.append('<a class="theatre-control theatre-control-' + settings.controls + '-play theatre-play"><span></span></a>');
            this.append('<a class="theatre-control theatre-control-' + settings.controls + '-stop theatre-stop"><span></span></a>');
            a(".theatre-next", this).click(function () {
                b.theatre("next")
            });
            a(".theatre-prev", this).click(function () {
                b.theatre("prev")
            });
            a(".theatre-play", this).click(function () {
                b.theatre("play")
            });
            a(".theatre-stop", this).click(function () {
                b.theatre("stop")
            });
            this.mouseenter(function () {
                a(".theatre-control", b).fadeIn()
            });
            this.mouseleave(function () {
                a(".theatre-control", b).fadeOut()
            });
            a(".theatre-control", this).fadeOut(0)
        }
        this.append('<a class="theatre-control theatre-sign" rel="copyright license" style="position: absolute !important; display: none !important;" href="http://www.webdevelopers.eu/jquery/theatre" title="jQuery carousel plugin"><span style="display: none !important;">Elixon Theatre jQuery Plugin</span></a>')
    };
    c.destroy = function () {
        var b = this.data("theatre");
        if (b) {
            clearInterval(b.interval);
            try {
                this.theatre("jump", 0)
            } catch (c) {
            }
            if (typeof b.effect.destroy == "function")b.effect.destroy();
            this.removeClass("theatre-" + b.settings.effect.replace(/[^a-z0-9]+/ig, "-"));
            b.actors.each(function () {
                var b = a(this);
                var c = b.data("theatre");
                try {
                    b.width(c.width);
                    b.height(c.height)
                } catch (d) {
                }
            })
        }
        a(".theatre-control", this).remove()
    };
    c.play = function (a) {
        var b = this.data("theatre");
        var c = this;
        c.theatre("stop");
        !a && c.theatre("iterate");
        b.interval = setInterval(function () {
            c.theatre("iterate")
        }, b.settings.speed + b.settings.still)
    };
    c.stop = function () {
        var a = this.data("theatre");
        clearInterval(a.interval);
        a.interval = false
    };
    b["fade"] = b["slide"] = b["show"] = function (a, b, d, e) {
        var f = function () {
            d.onAfterMove.apply(a, [e.index, b.eq(e.index), e])
        };
        var g = {
            fade: {
                show: "fadeIn",
                hide: "fadeOut",
                initStyle: {margin: 0, top: 0, left: 0, position: "absolute", display: "none"}
            },
            slide: {show: "slideDown", hide: "slideUp", initStyle: {}},
            show: {show: "show", hide: "hide", initStyle: {}}
        }[d.effect];
        this.init = function () {
            b[g.hide](0).css(g.initStyle).first()[g.show](0);
            f()
        };
        this.next = function () {
            b.stop(true, true).css("z-index", 0)[g.hide](d.speed).eq(e.index).css("z-index", 10)[g.show](d.speed, f)
        };
        this.prev = function () {
            b.stop(true, true).css("z-index", 0)[g.hide](d.speed).eq(e.index).css("z-index", 10)[g.show](d.speed, f)
        };
        this.destroy = function () {
            b = c.buryDead(b);
            b.stop(true, true).css({zIndex: "", top: "", left: "", position: "", margin: ""})[g.show](0)
        }
    };
    b["vertical"] = b["horizontal"] = function (b, d, e, f) {
        var g = function () {
            e.onAfterMove.apply(b, [f.index, d[f.index], f])
        };
        var h = {
            horizontal: {size: "outerWidth", direction: "left"},
            vertical: {size: "outerHeight", direction: "top"}
        }[e.effect];
        this.init = function () {
            b.scroll(function () {
                b.scrollTop(0).scrollLeft(0)
            });
            d.fadeOut(0);
            this.align(0, 0);
            d.fadeIn();
            g()
        };
        this.prev = function () {
            var c = a(e.selector, b).last();
            var d = c.parentsUntil(".theatre");
            (d.length ? d : c).last().prependTo(b);
            c.stop(true, true).css(h.direction, -c[h.size](true));
            this.align(0)
        };
        this.next = function () {
            var c = a(e.selector, b).first();
            var d = this.align(-c[h.size](true));
            var f = c.parentsUntil(".theatre");
            f = (f.length ? f : c).last();
            f.appendTo(b)
        };
        this.destroy = function () {
            d = c.buryDead(d);
            d.stop(true, true).css(h.direction, "").css({opacity: "", left: "", top: ""});
            d.each(function () {
                a(this).appendTo(b)
            })
        };
        this.align = function (c, d) {
            b.scrollLeft(0).scrollTop(0);
            a(e.selector, b).each(function (b) {
                var i = a(this);
                var j = f.index == i.data("theatre").index ? g : function () {
                };
                var k = j;
                if (c < 0) {
                    k = function () {
                        i.css(h.direction, c);
                        j()
                    }
                }
                var l = {};
                l[h.direction] = c;
                i.stop(true, true).animate(l, isNaN(d) ? e.speed : d, k);
                c += i[h.size](true)
            });
            return c
        }
    };
    b["3d"] = function (b, c, d, e) {
        var f = function () {
            d.onAfterMove.apply(b, [e.index, c[e.index], e])
        };
        d.resize = false;
        var g = [];
        var h;
        var i;
        var j = {};
        this.init = function () {
            var a = this;
            j.overflow = b.css("overflow");
            b.css("overflow", "visible");
            h = b.width() * .5;
            i = b.height() * .8;
            c.each(function (a) {
                var d = 2 * Math.PI * -a / c.length + Math.PI / 2;
                var e = Math.cos(d);
                var f = Math.sin(d);
                f = 1 - Math.sqrt((1 - f) / 2) * 2;
                var h = 10;
                var i = .2;
                var j = (f + 1) / 2 * (1 - i) + i;
                var k = e * (b.width() - h) / 2 + b.width() / 2;
                var l = f * (b.height() - h) / 2 + b.height() / 2;
                g.push({left: k, top: l, x: e, y: f, size: j, rad: d})
            });
            this.animate()
        };
        this.next = function () {
            this.animate()
        };
        this.prev = function () {
            this.animate()
        };
        this.destroy = function () {
            c.stop(true, true).css({"z-index": "", opacity: "", left: "", top: ""});
            b.css("overflow", j.overflow)
        };
        this.animate = function () {
            var b = this;
            c.stop();
            c.each(function (j) {
                try {
                    var k = g[(j - e.index + c.length) % c.length];
                    var l = b.calcDim(a(this), h, i, k.size);
                    var m = Math.round(k.left - k.x * l[0] / 2 - l[0] / 2);
                    var n = Math.round(k.top - k.y * l[1] / 2 - l[1] / 2);
                    a(this).css({"z-index": Math.round(k.size * 1e3)}).animate({
                        opacity: k.size,
                        left: m,
                        top: n,
                        width: l[0],
                        height: l[1]
                    }, d.speed, j == e.index ? f : null)
                } catch (o) {
                }
            })
        };
        this.calcDim = function (a, b, c, d) {
            var e = a.data("theatre");
            var f = b;
            var g = e.height / e.width * f;
            if (g > c) {
                f = b * (c / g);
                g = c
            }
            return [Math.round(f * d), Math.round(g * d)]
        }
    };
    var e = "W3-130829-084944";
    if (e.match(/^W3/)) {
        var f = "%45%6C%69%78%6F%6E%20%54%68%65%61%74%72%65%20%74%72%69%61%6C%20%76%65%72%73%69%6F%6E%20%68%61%73%20%65%78%70%69%72%65%64%21%20%43%6C%69%63%6B%20%4F%4B%20%74%6F%20%6F%62%74%61%69%6E%20%74%68%65%20%66%75%6C%6C%20%76%65%72%73%69%6F%6E%2E";
        var g = new Date(e.replace(/^W(\d)-(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})$/, "20$2-$3-$4T$5:$6:$7Z"));
        var h = ["co", "nfi", "rm"];
        g.setTime(g.getTime() + 30 * 24 * 3600 * 1e3);
        if (g.getTime() && g.getTime() < (new Date).getTime()) {
            if (window[h.join("")](unescape(f))) {
                window.location = "http://www.webdevelopers.eu/jquery/theatre/buy?trial=expired"
            }
        }
    }
})(jQuery);