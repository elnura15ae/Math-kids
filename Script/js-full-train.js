/*! lightgallery - v1.2.18 - 2016-04-13
* http://sachinchoolur.github.io/lightGallery/
* Copyright (c) 2016 Sachin N; Licensed Apache 2.0 */
(function($, window, document, undefined) {
    'use strict';
    var defaults = {
        mode: 'lg-slide',
        cssEasing: 'ease',
        easing: 'linear',
        speed: 600,
        height: '100%',
        width: '100%',
        addClass: '',
        startClass: 'lg-start-zoom',
        backdropDuration: 150,
        hideBarsDelay: 6000,
        useLeft: false,
        closable: true,
        loop: true,
        escKey: true,
        keyPress: true,
        controls: true,
        slideEndAnimatoin: true,
        hideControlOnEnd: false,
        mousewheel: true,
        getCaptionFromTitleOrAlt: true,
        appendSubHtmlTo: '.lg-sub-html',
        preload: 1,
        showAfterLoad: true,
        selector: '',
        selectWithin: '',
        nextHtml: '',
        prevHtml: '',
        index: false,
        iframeMaxWidth: '100%',
        download: true,
        counter: true,
        appendCounterTo: '.lg-toolbar',
        swipeThreshold: 50,
        enableSwipe: true,
        enableDrag: true,
        dynamic: false,
        dynamicEl: [],
        galleryId: 1
    };
    function Plugin(element, options) {
        this.el = element;
        this.$el = $(element);
        this.s = $.extend({}, defaults, options);
        if (this.s.dynamic && this.s.dynamicEl !== 'undefined' && this.s.dynamicEl.constructor === Array && !this.s.dynamicEl.length) {
            throw ('When using dynamic mode, you must also define dynamicEl as an Array.');
        }
        this.modules = {};
        this.lGalleryOn = false;
        this.lgBusy = false;
        this.hideBartimeout = false;
        this.isTouch = ('ontouchstart'in document.documentElement);
        if (this.s.slideEndAnimatoin) {
            this.s.hideControlOnEnd = false;
        }
        if (this.s.dynamic) {
            this.$items = this.s.dynamicEl;
        } else {
            if (this.s.selector === 'this') {
                this.$items = this.$el;
            } else if (this.s.selector !== '') {
                if (this.s.selectWithin) {
                    this.$items = $(this.s.selectWithin).find(this.s.selector);
                } else {
                    this.$items = this.$el.find($(this.s.selector));
                }
            } else {
                this.$items = this.$el.children();
            }
        }
        this.$slide = '';
        this.$outer = '';
        this.init();
        return this;
    }
    Plugin.prototype.init = function() {
        var _this = this;
        if (_this.s.preload > _this.$items.length) {
            _this.s.preload = _this.$items.length;
        }
        var _hash = window.location.hash;
        if (_hash.indexOf('lg=' + this.s.galleryId) > 0) {
            _this.index = parseInt(_hash.split('&slide=')[1], 10);
            $('body').addClass('lg-from-hash');
            if (!$('body').hasClass('lg-on')) {
                setTimeout(function() {
                    _this.build(_this.index);
                    $('body').addClass('lg-on');
                });
            }
        }
        if (_this.s.dynamic) {
            _this.$el.trigger('onBeforeOpen.lg');
            _this.index = _this.s.index || 0;
            if (!$('body').hasClass('lg-on')) {
                setTimeout(function() {
                    _this.build(_this.index);
                    $('body').addClass('lg-on');
                });
            }
        } else {
            _this.$items.on('click.lgcustom', function(event) {
                try {
                    event.preventDefault();
                    event.preventDefault();
                } catch (er) {
                    event.returnValue = false;
                }
                _this.$el.trigger('onBeforeOpen.lg');
                _this.index = _this.s.index || _this.$items.index(this);
                if (!$('body').hasClass('lg-on')) {
                    _this.build(_this.index);
                    $('body').addClass('lg-on');
                }
            });
        }
    }
    ;
    Plugin.prototype.build = function(index) {
        var _this = this;
        _this.structure();
        $.each($.fn.lightGallery.modules, function(key) {
            _this.modules[key] = new $.fn.lightGallery.modules[key](_this.el);
        });
        _this.slide(index, false, false);
        if (_this.s.keyPress) {
            _this.keyPress();
        }
        if (_this.$items.length > 1) {
            _this.arrow();
            setTimeout(function() {
                _this.enableDrag();
                _this.enableSwipe();
            }, 50);
            if (_this.s.mousewheel) {
                _this.mousewheel();
            }
        }
        _this.counter();
        _this.closeGallery();
        _this.$el.trigger('onAfterOpen.lg');
        _this.$outer.on('mousemove.lg click.lg touchstart.lg', function() {
            _this.$outer.removeClass('lg-hide-items');
            clearTimeout(_this.hideBartimeout);
            _this.hideBartimeout = setTimeout(function() {
                _this.$outer.addClass('lg-hide-items');
            }, _this.s.hideBarsDelay);
        });
    }
    ;
    Plugin.prototype.structure = function() {
        var list = '';
        var controls = '';
        var i = 0;
        var subHtmlCont = '';
        var template;
        var _this = this;
        $('body').append('<div class="lg-backdrop"></div>');
        $('.lg-backdrop').css('transition-duration', this.s.backdropDuration + 'ms');
        for (i = 0; i < this.$items.length; i++) {
            list += '<div class="lg-item"></div>';
        }
        if (this.s.controls && this.$items.length > 1) {
            controls = '<div class="lg-actions">' + '<div class="lg-prev lg-icon">' + this.s.prevHtml + '</div>' + '<div class="lg-next lg-icon">' + this.s.nextHtml + '</div>' + '</div>';
        }
        if (this.s.appendSubHtmlTo === '.lg-sub-html') {
            subHtmlCont = '<div class="lg-sub-html"></div>';
        }
        template = '<div class="lg-outer ' + this.s.addClass + ' ' + this.s.startClass + '">' + '<div class="lg" style="width:' + this.s.width + '; height:' + this.s.height + '">' + '<div class="lg-inner">' + list + '</div>' + '<div class="lg-toolbar group">' + '<span class="lg-close lg-icon"></span>' + '</div>' + controls + subHtmlCont + '</div>' + '</div>';
        $('body').append(template);
        this.$outer = $('.lg-outer');
        this.$slide = this.$outer.find('.lg-item');
        if (this.s.useLeft) {
            this.$outer.addClass('lg-use-left');
            this.s.mode = 'lg-slide';
        } else {
            this.$outer.addClass('lg-use-css3');
        }
        _this.setTop();
        $(window).on('resize.lg orientationchange.lg', function() {
            setTimeout(function() {
                _this.setTop();
            }, 100);
        });
        this.$slide.eq(this.index).addClass('lg-current');
        if (this.doCss()) {
            this.$outer.addClass('lg-css3');
        } else {
            this.$outer.addClass('lg-css');
            this.s.speed = 0;
        }
        this.$outer.addClass(this.s.mode);
        if (this.s.enableDrag && this.$items.length > 1) {
            this.$outer.addClass('lg-grab');
        }
        if (this.s.showAfterLoad) {
            this.$outer.addClass('lg-show-after-load');
        }
        if (this.doCss()) {
            var $inner = this.$outer.find('.lg-inner');
            $inner.css('transition-timing-function', this.s.cssEasing);
            $inner.css('transition-duration', this.s.speed + 'ms');
        }
        $('.lg-backdrop').addClass('in');
        setTimeout(function() {
            _this.$outer.addClass('lg-visible');
        }, this.s.backdropDuration);
        if (this.s.download) {
            this.$outer.find('.lg-toolbar').append('<a id="lg-download" target="_blank" download class="lg-download lg-icon"></a>');
        }
        this.prevScrollTop = $(window).scrollTop();
    }
    ;
    Plugin.prototype.setTop = function() {
        if (this.s.height !== '100%') {
            var wH = $(window).height();
            var top = (wH - parseInt(this.s.height, 10)) / 2;
            var $lGallery = this.$outer.find('.lg');
            if (wH >= parseInt(this.s.height, 10)) {
                $lGallery.css('top', top + 'px');
            } else {
                $lGallery.css('top', '0px');
            }
        }
    }
    ;
    Plugin.prototype.doCss = function() {
        var support = function() {
            var transition = ['transition', 'MozTransition', 'WebkitTransition', 'OTransition', 'msTransition', 'KhtmlTransition'];
            var root = document.documentElement;
            var i = 0;
            for (i = 0; i < transition.length; i++) {
                if (transition[i]in root.style) {
                    return true;
                }
            }
        };
        if (support()) {
            return true;
        }
        return false;
    }
    ;
    Plugin.prototype.isVideo = function(src, index) {
        var html;
        if (this.s.dynamic) {
            html = this.s.dynamicEl[index].html;
        } else {
            html = this.$items.eq(index).attr('data-html');
        }
        if (!src && html) {
            return {
                html5: true
            };
        }
        var youtube = src.match(/\/\/(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch\?v=|embed\/)?([a-z0-9\-\_\%]+)/i);
        var vimeo = src.match(/\/\/(?:www\.)?vimeo.com\/([0-9a-z\-_]+)/i);
        var dailymotion = src.match(/\/\/(?:www\.)?dai.ly\/([0-9a-z\-_]+)/i);
        var vk = src.match(/\/\/(?:www\.)?(?:vk\.com|vkontakte\.ru)\/(?:video_ext\.php\?)(.*)/i);
        if (youtube) {
            return {
                youtube: youtube
            };
        } else if (vimeo) {
            return {
                vimeo: vimeo
            };
        } else if (dailymotion) {
            return {
                dailymotion: dailymotion
            };
        } else if (vk) {
            return {
                vk: vk
            };
        }
    }
    ;
    Plugin.prototype.counter = function() {
        if (this.s.counter) {
            $(this.s.appendCounterTo).append('<div id="lg-counter"><span id="lg-counter-current">' + (parseInt(this.index, 10) + 1) + '</span> / <span id="lg-counter-all">' + this.$items.length + '</span></div>');
        }
    }
    ;
    Plugin.prototype.addHtml = function(index) {
        var subHtml = null;
        var subHtmlUrl;
        if (this.s.dynamic) {
            if (this.s.dynamicEl[index].subHtmlUrl) {
                subHtmlUrl = this.s.dynamicEl[index].subHtmlUrl;
            } else {
                subHtml = this.s.dynamicEl[index].subHtml;
            }
        } else {
            if (this.$items.eq(index).attr('data-sub-html-url')) {
                subHtmlUrl = this.$items.eq(index).attr('data-sub-html-url');
            } else {
                subHtml = this.$items.eq(index).attr('data-sub-html');
                if (this.s.getCaptionFromTitleOrAlt && !subHtml) {
                    subHtml = this.$items.eq(index).attr('title') || this.$items.eq(index).find('img').first().attr('alt');
                }
            }
        }
        if (!subHtmlUrl) {
            if (typeof subHtml !== 'undefined' && subHtml !== null) {
                var fL = subHtml.substring(0, 1);
                if (fL === '.' || fL === '#') {
                    subHtml = $(subHtml).html();
                }
            } else {
                subHtml = '';
            }
        }
        if (this.s.appendSubHtmlTo === '.lg-sub-html') {
            if (subHtmlUrl) {
                this.$outer.find(this.s.appendSubHtmlTo).load(subHtmlUrl);
            } else {
                this.$outer.find(this.s.appendSubHtmlTo).html(subHtml);
            }
        } else {
            if (subHtmlUrl) {
                this.$slide.eq(index).load(subHtmlUrl);
            } else {
                this.$slide.eq(index).append(subHtml);
            }
        }
        if (typeof subHtml !== 'undefined' && subHtml !== null) {
            if (subHtml === '') {
                this.$outer.find(this.s.appendSubHtmlTo).addClass('lg-empty-html');
            } else {
                this.$outer.find(this.s.appendSubHtmlTo).removeClass('lg-empty-html');
            }
        }
        this.$el.trigger('onAfterAppendSubHtml.lg', [index]);
    }
    ;
    Plugin.prototype.preload = function(index) {
        var i = 1;
        var j = 1;
        for (i = 1; i <= this.s.preload; i++) {
            if (i >= this.$items.length - index) {
                break;
            }
            this.loadContent(index + i, false, 0);
        }
        for (j = 1; j <= this.s.preload; j++) {
            if (index - j < 0) {
                break;
            }
            this.loadContent(index - j, false, 0);
        }
    }
    ;
    Plugin.prototype.loadContent = function(index, rec, delay) {
        var _this = this;
        var _hasPoster = false;
        var _$img;
        var _src;
        var _poster;
        var _srcset;
        var _sizes;
        var _html;
        var getResponsiveSrc = function(srcItms) {
            var rsWidth = [];
            var rsSrc = [];
            for (var i = 0; i < srcItms.length; i++) {
                var __src = srcItms[i].split(' ');
                if (__src[0] === '') {
                    __src.splice(0, 1);
                }
                rsSrc.push(__src[0]);
                rsWidth.push(__src[1]);
            }
            var wWidth = $(window).width();
            for (var j = 0; j < rsWidth.length; j++) {
                if (parseInt(rsWidth[j], 10) > wWidth) {
                    _src = rsSrc[j];
                    break;
                }
            }
        };
        if (_this.s.dynamic) {
            if (_this.s.dynamicEl[index].poster) {
                _hasPoster = true;
                _poster = _this.s.dynamicEl[index].poster;
            }
            _html = _this.s.dynamicEl[index].html;
            _src = _this.s.dynamicEl[index].src;
            if (_this.s.dynamicEl[index].responsive) {
                var srcDyItms = _this.s.dynamicEl[index].responsive.split(',');
                getResponsiveSrc(srcDyItms);
            }
            _srcset = _this.s.dynamicEl[index].srcset;
            _sizes = _this.s.dynamicEl[index].sizes;
        } else {
            if (_this.$items.eq(index).attr('data-poster')) {
                _hasPoster = true;
                _poster = _this.$items.eq(index).attr('data-poster');
            }
            _html = _this.$items.eq(index).attr('data-html');
            _src = _this.$items.eq(index).attr('href') || _this.$items.eq(index).attr('data-src');
            if (_this.$items.eq(index).attr('data-responsive')) {
                var srcItms = _this.$items.eq(index).attr('data-responsive').split(',');
                getResponsiveSrc(srcItms);
            }
            _srcset = _this.$items.eq(index).attr('data-srcset');
            _sizes = _this.$items.eq(index).attr('data-sizes');
        }
        var iframe = false;
        if (_this.s.dynamic) {
            if (_this.s.dynamicEl[index].iframe) {
                iframe = true;
            }
        } else {
            if (_this.$items.eq(index).attr('data-iframe') === 'true') {
                iframe = true;
            }
        }
        var _isVideo = _this.isVideo(_src, index);
        if (!_this.$slide.eq(index).hasClass('lg-loaded')) {
            if (iframe) {
                _this.$slide.eq(index).prepend('<div class="lg-video-cont" style="max-width:' + _this.s.iframeMaxWidth + '"><div class="lg-video"><iframe class="lg-object" frameborder="0" src="' + _src + '"  allowfullscreen="true"></iframe></div></div>');
            } else if (_hasPoster) {
                var videoClass = '';
                if (_isVideo && _isVideo.youtube) {
                    videoClass = 'lg-has-youtube';
                } else if (_isVideo && _isVideo.vimeo) {
                    videoClass = 'lg-has-vimeo';
                } else {
                    videoClass = 'lg-has-html5';
                }
                _this.$slide.eq(index).prepend('<div class="lg-video-cont ' + videoClass + ' "><div class="lg-video"><span class="lg-video-play"></span><img class="lg-object lg-has-poster" src="' + _poster + '" /></div></div>');
            } else if (_isVideo) {
                _this.$slide.eq(index).prepend('<div class="lg-video-cont "><div class="lg-video"></div></div>');
                _this.$el.trigger('hasVideo.lg', [index, _src, _html]);
            } else {
                _this.$slide.eq(index).prepend('<div class="lg-img-wrap"><img class="lg-object lg-image" src="' + _src + '" /></div>');
            }
            _this.$el.trigger('onAferAppendSlide.lg', [index]);
            _$img = _this.$slide.eq(index).find('.lg-object');
            if (_sizes) {
                _$img.attr('sizes', _sizes);
            }
            if (_srcset) {
                _$img.attr('srcset', _srcset);
                try {
                    picturefill({
                        elements: [_$img[0]]
                    });
                } catch (e) {
                    console.error('Make sure you have included Picturefill version 2');
                }
            }
            if (this.s.appendSubHtmlTo !== '.lg-sub-html') {
                _this.addHtml(index);
            }
            _this.$slide.eq(index).addClass('lg-loaded');
        }
        _this.$slide.eq(index).find('.lg-object').on('load.lg error.lg', function() {
            var _speed = 0;
            if (delay && !$('body').hasClass('lg-from-hash')) {
                _speed = delay;
            }
            setTimeout(function() {
                _this.$slide.eq(index).addClass('lg-complete');
                _this.$el.trigger('onSlideItemLoad.lg', [index, delay || 0]);
            }, _speed);
        });
        if (_isVideo && _isVideo.html5 && !_hasPoster) {
            _this.$slide.eq(index).addClass('lg-complete');
        }
        if (rec === true) {
            if (!_this.$slide.eq(index).hasClass('lg-complete')) {
                _this.$slide.eq(index).find('.lg-object').on('load.lg error.lg', function() {
                    _this.preload(index);
                });
            } else {
                _this.preload(index);
            }
        }
    }
    ;
    Plugin.prototype.slide = function(index, fromTouch, fromThumb) {
        var _prevIndex = this.$outer.find('.lg-current').index();
        var _this = this;
        if (_this.lGalleryOn && (_prevIndex === index)) {
            return;
        }
        var _length = this.$slide.length;
        var _time = _this.lGalleryOn ? this.s.speed : 0;
        var _next = false;
        var _prev = false;
        if (!_this.lgBusy) {
            if (this.s.download) {
                var _src;
                if (_this.s.dynamic) {
                    _src = _this.s.dynamicEl[index].downloadUrl !== false && (_this.s.dynamicEl[index].downloadUrl || _this.s.dynamicEl[index].src);
                } else {
                    _src = _this.$items.eq(index).attr('data-download-url') !== 'false' && (_this.$items.eq(index).attr('data-download-url') || _this.$items.eq(index).attr('href') || _this.$items.eq(index).attr('data-src'));
                }
                if (_src) {
                    $('#lg-download').attr('href', _src);
                    _this.$outer.removeClass('lg-hide-download');
                } else {
                    _this.$outer.addClass('lg-hide-download');
                }
            }
            this.$el.trigger('onBeforeSlide.lg', [_prevIndex, index, fromTouch, fromThumb]);
            _this.lgBusy = true;
            clearTimeout(_this.hideBartimeout);
            if (this.s.appendSubHtmlTo === '.lg-sub-html') {
                setTimeout(function() {
                    _this.addHtml(index);
                }, _time);
            }
            this.arrowDisable(index);
            if (!fromTouch) {
                _this.$outer.addClass('lg-no-trans');
                this.$slide.removeClass('lg-prev-slide lg-next-slide');
                if (index < _prevIndex) {
                    _prev = true;
                    if ((index === 0) && (_prevIndex === _length - 1) && !fromThumb) {
                        _prev = false;
                        _next = true;
                    }
                } else if (index > _prevIndex) {
                    _next = true;
                    if ((index === _length - 1) && (_prevIndex === 0) && !fromThumb) {
                        _prev = true;
                        _next = false;
                    }
                }
                if (_prev) {
                    this.$slide.eq(index).addClass('lg-prev-slide');
                    this.$slide.eq(_prevIndex).addClass('lg-next-slide');
                } else if (_next) {
                    this.$slide.eq(index).addClass('lg-next-slide');
                    this.$slide.eq(_prevIndex).addClass('lg-prev-slide');
                }
                setTimeout(function() {
                    _this.$slide.removeClass('lg-current');
                    _this.$slide.eq(index).addClass('lg-current');
                    _this.$outer.removeClass('lg-no-trans');
                }, 50);
            } else {
                var touchPrev = index - 1;
                var touchNext = index + 1;
                if ((index === 0) && (_prevIndex === _length - 1)) {
                    touchNext = 0;
                    touchPrev = _length - 1;
                } else if ((index === _length - 1) && (_prevIndex === 0)) {
                    touchNext = 0;
                    touchPrev = _length - 1;
                }
                this.$slide.removeClass('lg-prev-slide lg-current lg-next-slide');
                _this.$slide.eq(touchPrev).addClass('lg-prev-slide');
                _this.$slide.eq(touchNext).addClass('lg-next-slide');
                _this.$slide.eq(index).addClass('lg-current');
            }
            if (_this.lGalleryOn) {
                setTimeout(function() {
                    _this.loadContent(index, true, 0);
                }, this.s.speed + 50);
                setTimeout(function() {
                    _this.lgBusy = false;
                    _this.$el.trigger('onAfterSlide.lg', [_prevIndex, index, fromTouch, fromThumb]);
                }, this.s.speed);
            } else {
                _this.loadContent(index, true, _this.s.backdropDuration);
                _this.lgBusy = false;
                _this.$el.trigger('onAfterSlide.lg', [_prevIndex, index, fromTouch, fromThumb]);
            }
            _this.lGalleryOn = true;
            if (this.s.counter) {
                $('#lg-counter-current').text(index + 1);
            }
        }
    }
    ;
    Plugin.prototype.goToNextSlide = function(fromTouch) {
        var _this = this;
        if (!_this.lgBusy) {
            if ((_this.index + 1) < _this.$slide.length) {
                _this.index++;
                _this.$el.trigger('onBeforeNextSlide.lg', [_this.index]);
                _this.slide(_this.index, fromTouch, false);
            } else {
                if (_this.s.loop) {
                    _this.index = 0;
                    _this.$el.trigger('onBeforeNextSlide.lg', [_this.index]);
                    _this.slide(_this.index, fromTouch, false);
                } else if (_this.s.slideEndAnimatoin) {
                    _this.$outer.addClass('lg-right-end');
                    setTimeout(function() {
                        _this.$outer.removeClass('lg-right-end');
                    }, 400);
                }
            }
        }
    }
    ;
    Plugin.prototype.goToPrevSlide = function(fromTouch) {
        var _this = this;
        if (!_this.lgBusy) {
            if (_this.index > 0) {
                _this.index--;
                _this.$el.trigger('onBeforePrevSlide.lg', [_this.index, fromTouch]);
                _this.slide(_this.index, fromTouch, false);
            } else {
                if (_this.s.loop) {
                    _this.index = _this.$items.length - 1;
                    _this.$el.trigger('onBeforePrevSlide.lg', [_this.index, fromTouch]);
                    _this.slide(_this.index, fromTouch, false);
                } else if (_this.s.slideEndAnimatoin) {
                    _this.$outer.addClass('lg-left-end');
                    setTimeout(function() {
                        _this.$outer.removeClass('lg-left-end');
                    }, 400);
                }
            }
        }
    }
    ;
    Plugin.prototype.keyPress = function() {
        var _this = this;
        if (this.$items.length > 1) {
            $(window).on('keyup.lg', function(e) {
                if (_this.$items.length > 1) {
                    if (e.keyCode === 37) {
                        e.preventDefault();
                        _this.goToPrevSlide();
                    }
                    if (e.keyCode === 39) {
                        e.preventDefault();
                        _this.goToNextSlide();
                    }
                }
            });
        }
        $(window).on('keydown.lg', function(e) {
            if (_this.s.escKey === true && e.keyCode === 27) {
                e.preventDefault();
                if (!_this.$outer.hasClass('lg-thumb-open')) {
                    _this.destroy();
                } else {
                    _this.$outer.removeClass('lg-thumb-open');
                }
            }
        });
    }
    ;
    Plugin.prototype.arrow = function() {
        var _this = this;
        this.$outer.find('.lg-prev').on('click.lg', function() {
            _this.goToPrevSlide();
        });
        this.$outer.find('.lg-next').on('click.lg', function() {
            _this.goToNextSlide();
        });
    }
    ;
    Plugin.prototype.arrowDisable = function(index) {
        if (!this.s.loop && this.s.hideControlOnEnd) {
            if ((index + 1) < this.$slide.length) {
                this.$outer.find('.lg-next').removeAttr('disabled').removeClass('disabled');
            } else {
                this.$outer.find('.lg-next').attr('disabled', 'disabled').addClass('disabled');
            }
            if (index > 0) {
                this.$outer.find('.lg-prev').removeAttr('disabled').removeClass('disabled');
            } else {
                this.$outer.find('.lg-prev').attr('disabled', 'disabled').addClass('disabled');
            }
        }
    }
    ;
    Plugin.prototype.setTranslate = function($el, xValue, yValue) {
        if (this.s.useLeft) {
            $el.css('left', xValue);
        } else {
            $el.css({
                transform: 'translate3d(' + (xValue) + 'px, ' + yValue + 'px, 0px)'
            });
        }
    }
    ;
    Plugin.prototype.touchMove = function(startCoords, endCoords) {
        var distance = endCoords - startCoords;
        if (Math.abs(distance) > 15) {
            this.$outer.addClass('lg-dragging');
            this.setTranslate(this.$slide.eq(this.index), distance, 0);
            this.setTranslate($('.lg-prev-slide'), -this.$slide.eq(this.index).width() + distance, 0);
            this.setTranslate($('.lg-next-slide'), this.$slide.eq(this.index).width() + distance, 0);
        }
    }
    ;
    Plugin.prototype.touchEnd = function(distance) {
        var _this = this;
        if (_this.s.mode !== 'lg-slide') {
            _this.$outer.addClass('lg-slide');
        }
        this.$slide.not('.lg-current, .lg-prev-slide, .lg-next-slide').css('opacity', '0');
        setTimeout(function() {
            _this.$outer.removeClass('lg-dragging');
            if ((distance < 0) && (Math.abs(distance) > _this.s.swipeThreshold)) {
                _this.goToNextSlide(true);
            } else if ((distance > 0) && (Math.abs(distance) > _this.s.swipeThreshold)) {
                _this.goToPrevSlide(true);
            } else if (Math.abs(distance) < 5) {
                _this.$el.trigger('onSlideClick.lg');
            }
            _this.$slide.removeAttr('style');
        });
        setTimeout(function() {
            if (!_this.$outer.hasClass('lg-dragging') && _this.s.mode !== 'lg-slide') {
                _this.$outer.removeClass('lg-slide');
            }
        }, _this.s.speed + 100);
    }
    ;
    Plugin.prototype.enableSwipe = function() {
        var _this = this;
        var startCoords = 0;
        var endCoords = 0;
        var isMoved = false;
        if (_this.s.enableSwipe && _this.isTouch && _this.doCss()) {
            _this.$slide.on('touchstart.lg', function(e) {
                if (!_this.$outer.hasClass('lg-zoomed') && !_this.lgBusy) {
                    e.preventDefault();
                    _this.manageSwipeClass();
                    startCoords = e.originalEvent.targetTouches[0].pageX;
                }
            });
            _this.$slide.on('touchmove.lg', function(e) {
                if (!_this.$outer.hasClass('lg-zoomed')) {
                    e.preventDefault();
                    endCoords = e.originalEvent.targetTouches[0].pageX;
                    _this.touchMove(startCoords, endCoords);
                    isMoved = true;
                }
            });
            _this.$slide.on('touchend.lg', function() {
                if (!_this.$outer.hasClass('lg-zoomed')) {
                    if (isMoved) {
                        isMoved = false;
                        _this.touchEnd(endCoords - startCoords);
                    } else {
                        _this.$el.trigger('onSlideClick.lg');
                    }
                }
            });
        }
    }
    ;
    Plugin.prototype.enableDrag = function() {
        var _this = this;
        var startCoords = 0;
        var endCoords = 0;
        var isDraging = false;
        var isMoved = false;
        if (_this.s.enableDrag && !_this.isTouch && _this.doCss()) {
            _this.$slide.on('mousedown.lg', function(e) {
                if (!_this.$outer.hasClass('lg-zoomed')) {
                    if ($(e.target).hasClass('lg-object') || $(e.target).hasClass('lg-video-play')) {
                        e.preventDefault();
                        if (!_this.lgBusy) {
                            _this.manageSwipeClass();
                            startCoords = e.pageX;
                            isDraging = true;
                            _this.$outer.scrollLeft += 1;
                            _this.$outer.scrollLeft -= 1;
                            _this.$outer.removeClass('lg-grab').addClass('lg-grabbing');
                            _this.$el.trigger('onDragstart.lg');
                        }
                    }
                }
            });
            $(window).on('mousemove.lg', function(e) {
                if (isDraging) {
                    isMoved = true;
                    endCoords = e.pageX;
                    _this.touchMove(startCoords, endCoords);
                    _this.$el.trigger('onDragmove.lg');
                }
            });
            $(window).on('mouseup.lg', function(e) {
                if (isMoved) {
                    isMoved = false;
                    _this.touchEnd(endCoords - startCoords);
                    _this.$el.trigger('onDragend.lg');
                } else if ($(e.target).hasClass('lg-object') || $(e.target).hasClass('lg-video-play')) {
                    _this.$el.trigger('onSlideClick.lg');
                }
                if (isDraging) {
                    isDraging = false;
                    _this.$outer.removeClass('lg-grabbing').addClass('lg-grab');
                }
            });
        }
    }
    ;
    Plugin.prototype.manageSwipeClass = function() {
        var touchNext = this.index + 1;
        var touchPrev = this.index - 1;
        var length = this.$slide.length;
        if (this.s.loop) {
            if (this.index === 0) {
                touchPrev = length - 1;
            } else if (this.index === length - 1) {
                touchNext = 0;
            }
        }
        this.$slide.removeClass('lg-next-slide lg-prev-slide');
        if (touchPrev > -1) {
            this.$slide.eq(touchPrev).addClass('lg-prev-slide');
        }
        this.$slide.eq(touchNext).addClass('lg-next-slide');
    }
    ;
    Plugin.prototype.mousewheel = function() {
        var _this = this;
        _this.$outer.on('mousewheel.lg', function(e) {
            if (!e.deltaY) {
                return;
            }
            if (e.deltaY > 0) {
                _this.goToPrevSlide();
            } else {
                _this.goToNextSlide();
            }
            e.preventDefault();
        });
    }
    ;
    Plugin.prototype.closeGallery = function() {
        var _this = this;
        var mousedown = false;
        this.$outer.find('.lg-close').on('click.lg', function() {
            _this.destroy();
        });
        if (_this.s.closable) {
            _this.$outer.on('mousedown.lg', function(e) {
                if ($(e.target).is('.lg-outer') || $(e.target).is('.lg-item ') || $(e.target).is('.lg-img-wrap')) {
                    mousedown = true;
                } else {
                    mousedown = false;
                }
            });
            _this.$outer.on('mouseup.lg', function(e) {
                if ($(e.target).is('.lg-outer') || $(e.target).is('.lg-item ') || $(e.target).is('.lg-img-wrap') && mousedown) {
                    if (!_this.$outer.hasClass('lg-dragging')) {
                        _this.destroy();
                    }
                }
            });
        }
    }
    ;
    Plugin.prototype.destroy = function(d) {
        var _this = this;
        if (!d) {
            _this.$el.trigger('onBeforeClose.lg');
        }
        $(window).scrollTop(_this.prevScrollTop);
        if (d) {
            if (!_this.s.dynamic) {
                this.$items.off('click.lg click.lgcustom');
            }
            $.removeData(_this.el, 'lightGallery');
        }
        this.$el.off('.lg.tm');
        $.each($.fn.lightGallery.modules, function(key) {
            if (_this.modules[key]) {
                _this.modules[key].destroy();
            }
        });
        this.lGalleryOn = false;
        clearTimeout(_this.hideBartimeout);
        this.hideBartimeout = false;
        $(window).off('.lg');
        $('body').removeClass('lg-on lg-from-hash');
        if (_this.$outer) {
            _this.$outer.removeClass('lg-visible');
        }
        $('.lg-backdrop').removeClass('in');
        setTimeout(function() {
            if (_this.$outer) {
                _this.$outer.remove();
            }
            $('.lg-backdrop').remove();
            if (!d) {
                _this.$el.trigger('onCloseAfter.lg');
            }
        }, _this.s.backdropDuration + 50);
    }
    ;
    $.fn.lightGallery = function(options) {
        return this.each(function() {
            if (!$.data(this, 'lightGallery')) {
                $.data(this, 'lightGallery', new Plugin(this,options));
            } else {
                try {
                    $(this).data('lightGallery').init();
                } catch (err) {
                    console.error('lightGallery has not initiated properly');
                }
            }
        });
    }
    ;
    $.fn.lightGallery.modules = {};
}
)(jQuery, window, document);
(function($, window, document, undefined) {
    'use strict';
    var defaults = {
        autoplay: false,
        pause: 5000,
        progressBar: true,
        fourceAutoplay: false,
        autoplayControls: true,
        appendAutoplayControlsTo: '.lg-toolbar'
    };
    var Autoplay = function(element) {
        this.core = $(element).data('lightGallery');
        this.$el = $(element);
        if (this.core.$items.length < 2) {
            return false;
        }
        this.core.s = $.extend({}, defaults, this.core.s);
        this.interval = false;
        this.fromAuto = true;
        this.canceledOnTouch = false;
        this.fourceAutoplayTemp = this.core.s.fourceAutoplay;
        if (!this.core.doCss()) {
            this.core.s.progressBar = false;
        }
        this.init();
        return this;
    };
    Autoplay.prototype.init = function() {
        var _this = this;
        if (_this.core.s.autoplayControls) {
            _this.controls();
        }
        if (_this.core.s.progressBar) {
            _this.core.$outer.find('.lg').append('<div class="lg-progress-bar"><div class="lg-progress"></div></div>');
        }
        _this.progress();
        if (_this.core.s.autoplay) {
            _this.startlAuto();
        }
        _this.$el.on('onDragstart.lg.tm touchstart.lg.tm', function() {
            if (_this.interval) {
                _this.cancelAuto();
                _this.canceledOnTouch = true;
            }
        });
        _this.$el.on('onDragend.lg.tm touchend.lg.tm onSlideClick.lg.tm', function() {
            if (!_this.interval && _this.canceledOnTouch) {
                _this.startlAuto();
                _this.canceledOnTouch = false;
            }
        });
    }
    ;
    Autoplay.prototype.progress = function() {
        var _this = this;
        var _$progressBar;
        var _$progress;
        _this.$el.on('onBeforeSlide.lg.tm', function() {
            if (_this.core.s.progressBar && _this.fromAuto) {
                _$progressBar = _this.core.$outer.find('.lg-progress-bar');
                _$progress = _this.core.$outer.find('.lg-progress');
                if (_this.interval) {
                    _$progress.removeAttr('style');
                    _$progressBar.removeClass('lg-start');
                    setTimeout(function() {
                        _$progress.css('transition', 'width ' + (_this.core.s.speed + _this.core.s.pause) + 'ms ease 0s');
                        _$progressBar.addClass('lg-start');
                    }, 20);
                }
            }
            if (!_this.fromAuto && !_this.core.s.fourceAutoplay) {
                _this.cancelAuto();
            }
            _this.fromAuto = false;
        });
    }
    ;
    Autoplay.prototype.controls = function() {
        var _this = this;
        var _html = '<span class="lg-autoplay-button lg-icon"></span>';
        $(this.core.s.appendAutoplayControlsTo).append(_html);
        _this.core.$outer.find('.lg-autoplay-button').on('click.lg', function() {
            if ($(_this.core.$outer).hasClass('lg-show-autoplay')) {
                _this.cancelAuto();
                _this.core.s.fourceAutoplay = false;
            } else {
                if (!_this.interval) {
                    _this.startlAuto();
                    _this.core.s.fourceAutoplay = _this.fourceAutoplayTemp;
                }
            }
        });
    }
    ;
    Autoplay.prototype.startlAuto = function() {
        var _this = this;
        _this.core.$outer.find('.lg-progress').css('transition', 'width ' + (_this.core.s.speed + _this.core.s.pause) + 'ms ease 0s');
        _this.core.$outer.addClass('lg-show-autoplay');
        _this.core.$outer.find('.lg-progress-bar').addClass('lg-start');
        _this.interval = setInterval(function() {
            if (_this.core.index + 1 < _this.core.$items.length) {
                _this.core.index = _this.core.index;
            } else {
                _this.core.index = -1;
            }
            _this.core.index++;
            _this.fromAuto = true;
            _this.core.slide(_this.core.index, false, false);
        }, _this.core.s.speed + _this.core.s.pause);
    }
    ;
    Autoplay.prototype.cancelAuto = function() {
        clearInterval(this.interval);
        this.interval = false;
        this.core.$outer.find('.lg-progress').removeAttr('style');
        this.core.$outer.removeClass('lg-show-autoplay');
        this.core.$outer.find('.lg-progress-bar').removeClass('lg-start');
    }
    ;
    Autoplay.prototype.destroy = function() {
        this.cancelAuto();
        this.core.$outer.find('.lg-progress-bar').remove();
    }
    ;
    $.fn.lightGallery.modules.autoplay = Autoplay;
}
)(jQuery, window, document);
(function($, window, document, undefined) {
    'use strict';
    var defaults = {
        fullScreen: true
    };
    var Fullscreen = function(element) {
        this.core = $(element).data('lightGallery');
        this.$el = $(element);
        this.core.s = $.extend({}, defaults, this.core.s);
        this.init();
        return this;
    };
    Fullscreen.prototype.init = function() {
        var fullScreen = '';
        if (this.core.s.fullScreen) {
            if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled && !document.mozFullScreenEnabled && !document.msFullscreenEnabled) {
                return;
            } else {
                fullScreen = '<span class="lg-fullscreen lg-icon"></span>';
                this.core.$outer.find('.lg-toolbar').append(fullScreen);
                this.fullScreen();
            }
        }
    }
    ;
    Fullscreen.prototype.requestFullscreen = function() {
        var el = document.documentElement;
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        }
    }
    ;
    Fullscreen.prototype.exitFullscreen = function() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
    ;
    Fullscreen.prototype.fullScreen = function() {
        var _this = this;
        $(document).on('fullscreenchange.lg webkitfullscreenchange.lg mozfullscreenchange.lg MSFullscreenChange.lg', function() {
            _this.core.$outer.toggleClass('lg-fullscreen-on');
        });
        this.core.$outer.find('.lg-fullscreen').on('click.lg', function() {
            if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                _this.requestFullscreen();
            } else {
                _this.exitFullscreen();
            }
        });
    }
    ;
    Fullscreen.prototype.destroy = function() {
        this.exitFullscreen();
        $(document).off('fullscreenchange.lg webkitfullscreenchange.lg mozfullscreenchange.lg MSFullscreenChange.lg');
    }
    ;
    $.fn.lightGallery.modules.fullscreen = Fullscreen;
}
)(jQuery, window, document);
(function($, window, document, undefined) {
    'use strict';
    var defaults = {
        pager: false
    };
    var Pager = function(element) {
        this.core = $(element).data('lightGallery');
        this.$el = $(element);
        this.core.s = $.extend({}, defaults, this.core.s);
        if (this.core.s.pager && this.core.$items.length > 1) {
            this.init();
        }
        return this;
    };
    Pager.prototype.init = function() {
        var _this = this;
        var pagerList = '';
        var $pagerCont;
        var $pagerOuter;
        var timeout;
        _this.core.$outer.find('.lg').append('<div class="lg-pager-outer"></div>');
        if (_this.core.s.dynamic) {
            for (var i = 0; i < _this.core.s.dynamicEl.length; i++) {
                pagerList += '<span class="lg-pager-cont"> <span class="lg-pager"></span><div class="lg-pager-thumb-cont"><span class="lg-caret"></span> <img src="' + _this.core.s.dynamicEl[i].thumb + '" /></div></span>';
            }
        } else {
            _this.core.$items.each(function() {
                if (!_this.core.s.exThumbImage) {
                    pagerList += '<span class="lg-pager-cont"> <span class="lg-pager"></span><div class="lg-pager-thumb-cont"><span class="lg-caret"></span> <img src="' + $(this).find('img').attr('src') + '" /></div></span>';
                } else {
                    pagerList += '<span class="lg-pager-cont"> <span class="lg-pager"></span><div class="lg-pager-thumb-cont"><span class="lg-caret"></span> <img src="' + $(this).attr(_this.core.s.exThumbImage) + '" /></div></span>';
                }
            });
        }
        $pagerOuter = _this.core.$outer.find('.lg-pager-outer');
        $pagerOuter.html(pagerList);
        $pagerCont = _this.core.$outer.find('.lg-pager-cont');
        $pagerCont.on('click.lg touchend.lg', function() {
            var _$this = $(this);
            _this.core.index = _$this.index();
            _this.core.slide(_this.core.index, false, false);
        });
        $pagerOuter.on('mouseover.lg', function() {
            clearTimeout(timeout);
            $pagerOuter.addClass('lg-pager-hover');
        });
        $pagerOuter.on('mouseout.lg', function() {
            timeout = setTimeout(function() {
                $pagerOuter.removeClass('lg-pager-hover');
            });
        });
        _this.core.$el.on('onBeforeSlide.lg.tm', function(e, prevIndex, index) {
            $pagerCont.removeClass('lg-pager-active');
            $pagerCont.eq(index).addClass('lg-pager-active');
        });
    }
    ;
    Pager.prototype.destroy = function() {}
    ;
    $.fn.lightGallery.modules.pager = Pager;
}
)(jQuery, window, document);
(function($, window, document, undefined) {
    'use strict';
    var defaults = {
        thumbnail: true,
        animateThumb: true,
        currentPagerPosition: 'middle',
        thumbWidth: 100,
        thumbContHeight: 100,
        thumbMargin: 5,
        exThumbImage: false,
        showThumbByDefault: true,
        toogleThumb: true,
        pullCaptionUp: true,
        enableThumbDrag: true,
        enableThumbSwipe: true,
        swipeThreshold: 50,
        loadYoutubeThumbnail: true,
        youtubeThumbSize: 1,
        loadVimeoThumbnail: true,
        vimeoThumbSize: 'thumbnail_small',
        loadDailymotionThumbnail: true
    };
    var Thumbnail = function(element) {
        this.core = $(element).data('lightGallery');
        this.core.s = $.extend({}, defaults, this.core.s);
        this.$el = $(element);
        this.$thumbOuter = null;
        this.thumbOuterWidth = 0;
        this.thumbTotalWidth = (this.core.$items.length * (this.core.s.thumbWidth + this.core.s.thumbMargin));
        this.thumbIndex = this.core.index;
        this.left = 0;
        this.init();
        return this;
    };
    Thumbnail.prototype.init = function() {
        var _this = this;
        if (this.core.s.thumbnail && this.core.$items.length > 1) {
            if (this.core.s.showThumbByDefault) {
                setTimeout(function() {
                    _this.core.$outer.addClass('lg-thumb-open');
                }, 700);
            }
            if (this.core.s.pullCaptionUp) {
                this.core.$outer.addClass('lg-pull-caption-up');
            }
            this.build();
            if (this.core.s.animateThumb) {
                if (this.core.s.enableThumbDrag && !this.core.isTouch && this.core.doCss()) {
                    this.enableThumbDrag();
                }
                if (this.core.s.enableThumbSwipe && this.core.isTouch && this.core.doCss()) {
                    this.enableThumbSwipe();
                }
                this.thumbClickable = false;
            } else {
                this.thumbClickable = true;
            }
            this.toogle();
            this.thumbkeyPress();
        }
    }
    ;
    Thumbnail.prototype.build = function() {
        var _this = this;
        var thumbList = '';
        var vimeoErrorThumbSize = '';
        var $thumb;
        var html = '<div class="lg-thumb-outer">' + '<div class="lg-thumb group">' + '</div>' + '</div>';
        switch (this.core.s.vimeoThumbSize) {
        case 'thumbnail_large':
            vimeoErrorThumbSize = '640';
            break;
        case 'thumbnail_medium':
            vimeoErrorThumbSize = '200x150';
            break;
        case 'thumbnail_small':
            vimeoErrorThumbSize = '100x75';
        }
        _this.core.$outer.addClass('lg-has-thumb');
        _this.core.$outer.find('.lg').append(html);
        _this.$thumbOuter = _this.core.$outer.find('.lg-thumb-outer');
        _this.thumbOuterWidth = _this.$thumbOuter.width();
        if (_this.core.s.animateThumb) {
            _this.core.$outer.find('.lg-thumb').css({
                width: _this.thumbTotalWidth + 'px',
                position: 'relative'
            });
        }
        if (this.core.s.animateThumb) {
            _this.$thumbOuter.css('height', _this.core.s.thumbContHeight + 'px');
        }
        function getThumb(src, thumb, index) {
            var isVideo = _this.core.isVideo(src, index) || {};
            var thumbImg;
            var vimeoId = '';
            if (isVideo.youtube || isVideo.vimeo || isVideo.dailymotion) {
                if (isVideo.youtube) {
                    if (_this.core.s.loadYoutubeThumbnail) {
                        thumbImg = '//img.youtube.com/vi/' + isVideo.youtube[1] + '/' + _this.core.s.youtubeThumbSize + '.jpg';
                    } else {
                        thumbImg = thumb;
                    }
                } else if (isVideo.vimeo) {
                    if (_this.core.s.loadVimeoThumbnail) {
                        thumbImg = '//i.vimeocdn.com/video/error_' + vimeoErrorThumbSize + '.jpg';
                        vimeoId = isVideo.vimeo[1];
                    } else {
                        thumbImg = thumb;
                    }
                } else if (isVideo.dailymotion) {
                    if (_this.core.s.loadDailymotionThumbnail) {
                        thumbImg = '//www.dailymotion.com/thumbnail/video/' + isVideo.dailymotion[1];
                    } else {
                        thumbImg = thumb;
                    }
                }
            } else {
                thumbImg = thumb;
            }
            thumbList += '<div data-vimeo-id="' + vimeoId + '" class="lg-thumb-item" style="width:' + _this.core.s.thumbWidth + 'px; margin-right: ' + _this.core.s.thumbMargin + 'px"><img src="' + thumbImg + '" /></div>';
            vimeoId = '';
        }
        if (_this.core.s.dynamic) {
            for (var i = 0; i < _this.core.s.dynamicEl.length; i++) {
                getThumb(_this.core.s.dynamicEl[i].src, _this.core.s.dynamicEl[i].thumb, i);
            }
        } else {
            _this.core.$items.each(function(i) {
                if (!_this.core.s.exThumbImage) {
                    getThumb($(this).attr('href') || $(this).attr('data-src'), $(this).find('img').attr('src'), i);
                } else {
                    getThumb($(this).attr('href') || $(this).attr('data-src'), $(this).attr(_this.core.s.exThumbImage), i);
                }
            });
        }
        _this.core.$outer.find('.lg-thumb').html(thumbList);
        $thumb = _this.core.$outer.find('.lg-thumb-item');
        $thumb.each(function() {
            var $this = $(this);
            var vimeoVideoId = $this.attr('data-vimeo-id');
            if (vimeoVideoId) {
                $.getJSON('//www.vimeo.com/api/v2/video/' + vimeoVideoId + '.json?callback=?', {
                    format: 'json'
                }, function(data) {
                    $this.find('img').attr('src', data[0][_this.core.s.vimeoThumbSize]);
                });
            }
        });
        $thumb.eq(_this.core.index).addClass('active');
        _this.core.$el.on('onBeforeSlide.lg.tm', function() {
            $thumb.removeClass('active');
            $thumb.eq(_this.core.index).addClass('active');
        });
        $thumb.on('click.lg touchend.lg', function() {
            var _$this = $(this);
            setTimeout(function() {
                if ((_this.thumbClickable && !_this.core.lgBusy) || !_this.core.doCss()) {
                    _this.core.index = _$this.index();
                    _this.core.slide(_this.core.index, false, true);
                }
            }, 50);
        });
        _this.core.$el.on('onBeforeSlide.lg.tm', function() {
            _this.animateThumb(_this.core.index);
        });
        $(window).on('resize.lg.thumb orientationchange.lg.thumb', function() {
            setTimeout(function() {
                _this.animateThumb(_this.core.index);
                _this.thumbOuterWidth = _this.$thumbOuter.width();
            }, 200);
        });
    }
    ;
    Thumbnail.prototype.setTranslate = function(value) {
        this.core.$outer.find('.lg-thumb').css({
            transform: 'translate3d(-' + (value) + 'px, 0px, 0px)'
        });
    }
    ;
    Thumbnail.prototype.animateThumb = function(index) {
        var $thumb = this.core.$outer.find('.lg-thumb');
        if (this.core.s.animateThumb) {
            var position;
            switch (this.core.s.currentPagerPosition) {
            case 'left':
                position = 0;
                break;
            case 'middle':
                position = (this.thumbOuterWidth / 2) - (this.core.s.thumbWidth / 2);
                break;
            case 'right':
                position = this.thumbOuterWidth - this.core.s.thumbWidth;
            }
            this.left = ((this.core.s.thumbWidth + this.core.s.thumbMargin) * index - 1) - position;
            if (this.left > (this.thumbTotalWidth - this.thumbOuterWidth)) {
                this.left = this.thumbTotalWidth - this.thumbOuterWidth;
            }
            if (this.left < 0) {
                this.left = 0;
            }
            if (this.core.lGalleryOn) {
                if (!$thumb.hasClass('on')) {
                    this.core.$outer.find('.lg-thumb').css('transition-duration', this.core.s.speed + 'ms');
                }
                if (!this.core.doCss()) {
                    $thumb.animate({
                        left: -this.left + 'px'
                    }, this.core.s.speed);
                }
            } else {
                if (!this.core.doCss()) {
                    $thumb.css('left', -this.left + 'px');
                }
            }
            this.setTranslate(this.left);
        }
    }
    ;
    Thumbnail.prototype.enableThumbDrag = function() {
        var _this = this;
        var startCoords = 0;
        var endCoords = 0;
        var isDraging = false;
        var isMoved = false;
        var tempLeft = 0;
        _this.$thumbOuter.addClass('lg-grab');
        _this.core.$outer.find('.lg-thumb').on('mousedown.lg.thumb', function(e) {
            if (_this.thumbTotalWidth > _this.thumbOuterWidth) {
                e.preventDefault();
                startCoords = e.pageX;
                isDraging = true;
                _this.core.$outer.scrollLeft += 1;
                _this.core.$outer.scrollLeft -= 1;
                _this.thumbClickable = false;
                _this.$thumbOuter.removeClass('lg-grab').addClass('lg-grabbing');
            }
        });
        $(window).on('mousemove.lg.thumb', function(e) {
            if (isDraging) {
                tempLeft = _this.left;
                isMoved = true;
                endCoords = e.pageX;
                _this.$thumbOuter.addClass('lg-dragging');
                tempLeft = tempLeft - (endCoords - startCoords);
                if (tempLeft > (_this.thumbTotalWidth - _this.thumbOuterWidth)) {
                    tempLeft = _this.thumbTotalWidth - _this.thumbOuterWidth;
                }
                if (tempLeft < 0) {
                    tempLeft = 0;
                }
                _this.setTranslate(tempLeft);
            }
        });
        $(window).on('mouseup.lg.thumb', function() {
            if (isMoved) {
                isMoved = false;
                _this.$thumbOuter.removeClass('lg-dragging');
                _this.left = tempLeft;
                if (Math.abs(endCoords - startCoords) < _this.core.s.swipeThreshold) {
                    _this.thumbClickable = true;
                }
            } else {
                _this.thumbClickable = true;
            }
            if (isDraging) {
                isDraging = false;
                _this.$thumbOuter.removeClass('lg-grabbing').addClass('lg-grab');
            }
        });
    }
    ;
    Thumbnail.prototype.enableThumbSwipe = function() {
        var _this = this;
        var startCoords = 0;
        var endCoords = 0;
        var isMoved = false;
        var tempLeft = 0;
        _this.core.$outer.find('.lg-thumb').on('touchstart.lg', function(e) {
            if (_this.thumbTotalWidth > _this.thumbOuterWidth) {
                e.preventDefault();
                startCoords = e.originalEvent.targetTouches[0].pageX;
                _this.thumbClickable = false;
            }
        });
        _this.core.$outer.find('.lg-thumb').on('touchmove.lg', function(e) {
            if (_this.thumbTotalWidth > _this.thumbOuterWidth) {
                e.preventDefault();
                endCoords = e.originalEvent.targetTouches[0].pageX;
                isMoved = true;
                _this.$thumbOuter.addClass('lg-dragging');
                tempLeft = _this.left;
                tempLeft = tempLeft - (endCoords - startCoords);
                if (tempLeft > (_this.thumbTotalWidth - _this.thumbOuterWidth)) {
                    tempLeft = _this.thumbTotalWidth - _this.thumbOuterWidth;
                }
                if (tempLeft < 0) {
                    tempLeft = 0;
                }
                _this.setTranslate(tempLeft);
            }
        });
        _this.core.$outer.find('.lg-thumb').on('touchend.lg', function() {
            if (_this.thumbTotalWidth > _this.thumbOuterWidth) {
                if (isMoved) {
                    isMoved = false;
                    _this.$thumbOuter.removeClass('lg-dragging');
                    if (Math.abs(endCoords - startCoords) < _this.core.s.swipeThreshold) {
                        _this.thumbClickable = true;
                    }
                    _this.left = tempLeft;
                } else {
                    _this.thumbClickable = true;
                }
            } else {
                _this.thumbClickable = true;
            }
        });
    }
    ;
    Thumbnail.prototype.toogle = function() {
        var _this = this;
        if (_this.core.s.toogleThumb) {
            _this.core.$outer.addClass('lg-can-toggle');
            _this.$thumbOuter.append('<span class="lg-toogle-thumb lg-icon"></span>');
            _this.core.$outer.find('.lg-toogle-thumb').on('click.lg', function() {
                _this.core.$outer.toggleClass('lg-thumb-open');
            });
        }
    }
    ;
    Thumbnail.prototype.thumbkeyPress = function() {
        var _this = this;
        $(window).on('keydown.lg.thumb', function(e) {
            if (e.keyCode === 38) {
                e.preventDefault();
                _this.core.$outer.addClass('lg-thumb-open');
            } else if (e.keyCode === 40) {
                e.preventDefault();
                _this.core.$outer.removeClass('lg-thumb-open');
            }
        });
    }
    ;
    Thumbnail.prototype.destroy = function() {
        if (this.core.s.thumbnail && this.core.$items.length > 1) {
            $(window).off('resize.lg.thumb orientationchange.lg.thumb keydown.lg.thumb');
            this.$thumbOuter.remove();
            this.core.$outer.removeClass('lg-has-thumb');
        }
    }
    ;
    $.fn.lightGallery.modules.Thumbnail = Thumbnail;
}
)(jQuery, window, document);
(function($, window, document, undefined) {
    'use strict';
    var defaults = {
        videoMaxWidth: '855px',
        youtubePlayerParams: false,
        vimeoPlayerParams: false,
        dailymotionPlayerParams: false,
        vkPlayerParams: false,
        videojs: false,
        videojsOptions: {}
    };
    var Video = function(element) {
        this.core = $(element).data('lightGallery');
        this.$el = $(element);
        this.core.s = $.extend({}, defaults, this.core.s);
        this.videoLoaded = false;
        this.init();
        return this;
    };
    Video.prototype.init = function() {
        var _this = this;
        _this.core.$el.on('hasVideo.lg.tm', function(event, index, src, html) {
            _this.core.$slide.eq(index).find('.lg-video').append(_this.loadVideo(src, 'lg-object', true, index, html));
            if (html) {
                if (_this.core.s.videojs) {
                    try {
                        videojs(_this.core.$slide.eq(index).find('.lg-html5').get(0), _this.core.s.videojsOptions, function() {
                            if (!_this.videoLoaded) {
                                this.play();
                            }
                        });
                    } catch (e) {
                        console.error('Make sure you have included videojs');
                    }
                } else {
                    _this.core.$slide.eq(index).find('.lg-html5').get(0).play();
                }
            }
        });
        _this.core.$el.on('onAferAppendSlide.lg.tm', function(event, index) {
            _this.core.$slide.eq(index).find('.lg-video-cont').css('max-width', _this.core.s.videoMaxWidth);
            _this.videoLoaded = true;
        });
        var loadOnClick = function($el) {
            if ($el.find('.lg-object').hasClass('lg-has-poster') && $el.find('.lg-object').is(':visible')) {
                if (!$el.hasClass('lg-has-video')) {
                    $el.addClass('lg-video-playing lg-has-video');
                    var _src;
                    var _html;
                    var _loadVideo = function(_src, _html) {
                        $el.find('.lg-video').append(_this.loadVideo(_src, '', false, _this.core.index, _html));
                        if (_html) {
                            if (_this.core.s.videojs) {
                                try {
                                    videojs(_this.core.$slide.eq(_this.core.index).find('.lg-html5').get(0), _this.core.s.videojsOptions, function() {
                                        this.play();
                                    });
                                } catch (e) {
                                    console.error('Make sure you have included videojs');
                                }
                            } else {
                                _this.core.$slide.eq(_this.core.index).find('.lg-html5').get(0).play();
                            }
                        }
                    };
                    if (_this.core.s.dynamic) {
                        _src = _this.core.s.dynamicEl[_this.core.index].src;
                        _html = _this.core.s.dynamicEl[_this.core.index].html;
                        _loadVideo(_src, _html);
                    } else {
                        _src = _this.core.$items.eq(_this.core.index).attr('href') || _this.core.$items.eq(_this.core.index).attr('data-src');
                        _html = _this.core.$items.eq(_this.core.index).attr('data-html');
                        _loadVideo(_src, _html);
                    }
                    var $tempImg = $el.find('.lg-object');
                    $el.find('.lg-video').append($tempImg);
                    if (!$el.find('.lg-video-object').hasClass('lg-html5')) {
                        $el.removeClass('lg-complete');
                        $el.find('.lg-video-object').on('load.lg error.lg', function() {
                            $el.addClass('lg-complete');
                        });
                    }
                } else {
                    var youtubePlayer = $el.find('.lg-youtube').get(0);
                    var vimeoPlayer = $el.find('.lg-vimeo').get(0);
                    var dailymotionPlayer = $el.find('.lg-dailymotion').get(0);
                    var html5Player = $el.find('.lg-html5').get(0);
                    if (youtubePlayer) {
                        youtubePlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                    } else if (vimeoPlayer) {
                        try {
                            $f(vimeoPlayer).api('play');
                        } catch (e) {
                            console.error('Make sure you have included froogaloop2 js');
                        }
                    } else if (dailymotionPlayer) {
                        dailymotionPlayer.contentWindow.postMessage('play', '*');
                    } else if (html5Player) {
                        if (_this.core.s.videojs) {
                            try {
                                videojs(html5Player).play();
                            } catch (e) {
                                console.error('Make sure you have included videojs');
                            }
                        } else {
                            html5Player.play();
                        }
                    }
                    $el.addClass('lg-video-playing');
                }
            }
        };
        if (_this.core.doCss() && _this.core.$items.length > 1 && ((_this.core.s.enableSwipe && _this.core.isTouch) || (_this.core.s.enableDrag && !_this.core.isTouch))) {
            _this.core.$el.on('onSlideClick.lg.tm', function() {
                var $el = _this.core.$slide.eq(_this.core.index);
                loadOnClick($el);
            });
        } else {
            _this.core.$slide.on('click.lg', function() {
                loadOnClick($(this));
            });
        }
        _this.core.$el.on('onBeforeSlide.lg.tm', function(event, prevIndex, index) {
            var $videoSlide = _this.core.$slide.eq(prevIndex);
            var youtubePlayer = $videoSlide.find('.lg-youtube').get(0);
            var vimeoPlayer = $videoSlide.find('.lg-vimeo').get(0);
            var dailymotionPlayer = $videoSlide.find('.lg-dailymotion').get(0);
            var vkPlayer = $videoSlide.find('.lg-vk').get(0);
            var html5Player = $videoSlide.find('.lg-html5').get(0);
            if (youtubePlayer) {
                youtubePlayer.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            } else if (vimeoPlayer) {
                try {
                    $f(vimeoPlayer).api('pause');
                } catch (e) {
                    console.error('Make sure you have included froogaloop2 js');
                }
            } else if (dailymotionPlayer) {
                dailymotionPlayer.contentWindow.postMessage('pause', '*');
            } else if (html5Player) {
                if (_this.core.s.videojs) {
                    try {
                        videojs(html5Player).pause();
                    } catch (e) {
                        console.error('Make sure you have included videojs');
                    }
                } else {
                    html5Player.pause();
                }
            }
            if (vkPlayer) {
                $(vkPlayer).attr('src', $(vkPlayer).attr('src').replace('&autoplay', '&noplay'));
            }
            var _src;
            if (_this.core.s.dynamic) {
                _src = _this.core.s.dynamicEl[index].src;
            } else {
                _src = _this.core.$items.eq(index).attr('href') || _this.core.$items.eq(index).attr('data-src');
            }
            var _isVideo = _this.core.isVideo(_src, index) || {};
            if (_isVideo.youtube || _isVideo.vimeo || _isVideo.dailymotion || _isVideo.vk) {
                _this.core.$outer.addClass('lg-hide-download');
            }
        });
        _this.core.$el.on('onAfterSlide.lg.tm', function(event, prevIndex) {
            _this.core.$slide.eq(prevIndex).removeClass('lg-video-playing');
        });
    }
    ;
    Video.prototype.loadVideo = function(src, addClass, noposter, index, html) {
        var video = '';
        var autoplay = 1;
        var a = '';
        var isVideo = this.core.isVideo(src, index) || {};
        if (noposter) {
            if (this.videoLoaded) {
                autoplay = 0;
            } else {
                autoplay = 1;
            }
        }
        if (isVideo.youtube) {
            a = '?wmode=opaque&autoplay=' + autoplay + '&enablejsapi=1';
            if (this.core.s.youtubePlayerParams) {
                a = a + '&' + $.param(this.core.s.youtubePlayerParams);
            }
            video = '<iframe class="lg-video-object lg-youtube ' + addClass + '" width="560" height="315" src="//www.youtube.com/embed/' + isVideo.youtube[1] + a + '" frameborder="0" allowfullscreen></iframe>';
        } else if (isVideo.vimeo) {
            a = '?autoplay=' + autoplay + '&api=1';
            if (this.core.s.vimeoPlayerParams) {
                a = a + '&' + $.param(this.core.s.vimeoPlayerParams);
            }
            video = '<iframe class="lg-video-object lg-vimeo ' + addClass + '" width="560" height="315"  src="//player.vimeo.com/video/' + isVideo.vimeo[1] + a + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
        } else if (isVideo.dailymotion) {
            a = '?wmode=opaque&autoplay=' + autoplay + '&api=postMessage';
            if (this.core.s.dailymotionPlayerParams) {
                a = a + '&' + $.param(this.core.s.dailymotionPlayerParams);
            }
            video = '<iframe class="lg-video-object lg-dailymotion ' + addClass + '" width="560" height="315" src="//www.dailymotion.com/embed/video/' + isVideo.dailymotion[1] + a + '" frameborder="0" allowfullscreen></iframe>';
        } else if (isVideo.html5) {
            var fL = html.substring(0, 1);
            if (fL === '.' || fL === '#') {
                html = $(html).html();
            }
            video = html;
        } else if (isVideo.vk) {
            a = '&autoplay=' + autoplay;
            if (this.core.s.vkPlayerParams) {
                a = a + '&' + $.param(this.core.s.vkPlayerParams);
            }
            video = '<iframe class="lg-video-object lg-vk ' + addClass + '" width="560" height="315" src="http://vk.com/video_ext.php?' + isVideo.vk[1] + a + '" frameborder="0" allowfullscreen></iframe>';
        }
        return video;
    }
    ;
    Video.prototype.destroy = function() {
        this.videoLoaded = false;
    }
    ;
    $.fn.lightGallery.modules.video = Video;
}
)(jQuery, window, document);
(function($, window, document, undefined) {
    'use strict';
    var defaults = {
        scale: 1,
        zoom: true,
        actualSize: true,
        enableZoomAfter: 300
    };
    var Zoom = function(element) {
        this.core = $(element).data('lightGallery');
        this.core.s = $.extend({}, defaults, this.core.s);
        if (this.core.s.zoom && this.core.doCss()) {
            this.init();
            this.zoomabletimeout = false;
            this.pageX = $(window).width() / 2;
            this.pageY = ($(window).height() / 2) + $(window).scrollTop();
        }
        return this;
    };
    Zoom.prototype.init = function() {
        var _this = this;
        var zoomIcons = '<span id="lg-zoom-in" class="lg-icon"></span><span id="lg-zoom-out" class="lg-icon"></span>';
        if (_this.core.s.actualSize) {
            zoomIcons += '<span id="lg-actual-size" class="lg-icon"></span>';
        }
        this.core.$outer.find('.lg-toolbar').append(zoomIcons);
        _this.core.$el.on('onSlideItemLoad.lg.tm.zoom', function(event, index, delay) {
            var _speed = _this.core.s.enableZoomAfter + delay;
            if ($('body').hasClass('lg-from-hash') && delay) {
                _speed = 0;
            } else {
                $('body').removeClass('lg-from-hash');
            }
            _this.zoomabletimeout = setTimeout(function() {
                _this.core.$slide.eq(index).addClass('lg-zoomable');
            }, _speed + 30);
        });
        var scale = 1;
        var zoom = function(scaleVal) {
            var $image = _this.core.$outer.find('.lg-current .lg-image');
            var _x;
            var _y;
            var offsetX = ($(window).width() - $image.width()) / 2;
            var offsetY = (($(window).height() - $image.height()) / 2) + $(window).scrollTop();
            _x = _this.pageX - offsetX;
            _y = _this.pageY - offsetY;
            var x = (scaleVal - 1) * (_x);
            var y = (scaleVal - 1) * (_y);
            $image.css('transform', 'scale3d(' + scaleVal + ', ' + scaleVal + ', 1)').attr('data-scale', scaleVal);
            $image.parent().css('transform', 'translate3d(-' + x + 'px, -' + y + 'px, 0)').attr('data-x', x).attr('data-y', y);
        };
        var callScale = function() {
            if (scale > 1) {
                _this.core.$outer.addClass('lg-zoomed');
            } else {
                _this.resetZoom();
            }
            if (scale < 1) {
                scale = 1;
            }
            zoom(scale);
        };
        var actualSize = function(event, $image, index, fromIcon) {
            var w = $image.width();
            var nw;
            if (_this.core.s.dynamic) {
                nw = _this.core.s.dynamicEl[index].width || $image[0].naturalWidth || w;
            } else {
                nw = _this.core.$items.eq(index).attr('data-width') || $image[0].naturalWidth || w;
            }
            var _scale;
            if (_this.core.$outer.hasClass('lg-zoomed')) {
                scale = 1;
            } else {
                if (nw > w) {
                    _scale = nw / w;
                    scale = _scale || 2;
                }
            }
            if (fromIcon) {
                _this.pageX = $(window).width() / 2;
                _this.pageY = ($(window).height() / 2) + $(window).scrollTop();
            } else {
                _this.pageX = event.pageX || event.originalEvent.targetTouches[0].pageX;
                _this.pageY = event.pageY || event.originalEvent.targetTouches[0].pageY;
            }
            callScale();
            setTimeout(function() {
                _this.core.$outer.removeClass('lg-grabbing').addClass('lg-grab');
            }, 10);
        };
        var tapped = false;
        _this.core.$el.on('onAferAppendSlide.lg.tm.zoom', function(event, index) {
            var $image = _this.core.$slide.eq(index).find('.lg-image');
            $image.on('dblclick', function(event) {
                actualSize(event, $image, index);
            });
            $image.on('touchstart', function(event) {
                if (!tapped) {
                    tapped = setTimeout(function() {
                        tapped = null;
                    }, 300);
                } else {
                    clearTimeout(tapped);
                    tapped = null;
                    actualSize(event, $image, index);
                }
                event.preventDefault();
            });
        });
        $(window).on('resize.lg.zoom scroll.lg.zoom orientationchange.lg.zoom', function() {
            _this.pageX = $(window).width() / 2;
            _this.pageY = ($(window).height() / 2) + $(window).scrollTop();
            zoom(scale);
        });
        $('#lg-zoom-out').on('click.lg', function() {
            if (_this.core.$outer.find('.lg-current .lg-image').length) {
                scale -= _this.core.s.scale;
                callScale();
            }
        });
        $('#lg-zoom-in').on('click.lg', function() {
            if (_this.core.$outer.find('.lg-current .lg-image').length) {
                scale += _this.core.s.scale;
                callScale();
            }
        });
        $('#lg-actual-size').on('click.lg', function(event) {
            actualSize(event, _this.core.$slide.eq(_this.core.index).find('.lg-image'), _this.core.index, true);
        });
        _this.core.$el.on('onBeforeSlide.lg.tm', function() {
            scale = 1;
            _this.resetZoom();
        });
        if (!_this.core.isTouch) {
            _this.zoomDrag();
        }
        if (_this.core.isTouch) {
            _this.zoomSwipe();
        }
    }
    ;
    Zoom.prototype.resetZoom = function() {
        this.core.$outer.removeClass('lg-zoomed');
        this.core.$slide.find('.lg-img-wrap').removeAttr('style data-x data-y');
        this.core.$slide.find('.lg-image').removeAttr('style data-scale');
        this.pageX = $(window).width() / 2;
        this.pageY = ($(window).height() / 2) + $(window).scrollTop();
    }
    ;
    Zoom.prototype.zoomSwipe = function() {
        var _this = this;
        var startCoords = {};
        var endCoords = {};
        var isMoved = false;
        var allowX = false;
        var allowY = false;
        _this.core.$slide.on('touchstart.lg', function(e) {
            if (_this.core.$outer.hasClass('lg-zoomed')) {
                var $image = _this.core.$slide.eq(_this.core.index).find('.lg-object');
                allowY = $image.outerHeight() * $image.attr('data-scale') > _this.core.$outer.find('.lg').height();
                allowX = $image.outerWidth() * $image.attr('data-scale') > _this.core.$outer.find('.lg').width();
                if ((allowX || allowY)) {
                    e.preventDefault();
                    startCoords = {
                        x: e.originalEvent.targetTouches[0].pageX,
                        y: e.originalEvent.targetTouches[0].pageY
                    };
                }
            }
        });
        _this.core.$slide.on('touchmove.lg', function(e) {
            if (_this.core.$outer.hasClass('lg-zoomed')) {
                var _$el = _this.core.$slide.eq(_this.core.index).find('.lg-img-wrap');
                var distanceX;
                var distanceY;
                e.preventDefault();
                isMoved = true;
                endCoords = {
                    x: e.originalEvent.targetTouches[0].pageX,
                    y: e.originalEvent.targetTouches[0].pageY
                };
                _this.core.$outer.addClass('lg-zoom-dragging');
                if (allowY) {
                    distanceY = (-Math.abs(_$el.attr('data-y'))) + (endCoords.y - startCoords.y);
                } else {
                    distanceY = -Math.abs(_$el.attr('data-y'));
                }
                if (allowX) {
                    distanceX = (-Math.abs(_$el.attr('data-x'))) + (endCoords.x - startCoords.x);
                } else {
                    distanceX = -Math.abs(_$el.attr('data-x'));
                }
                if ((Math.abs(endCoords.x - startCoords.x) > 15) || (Math.abs(endCoords.y - startCoords.y) > 15)) {
                    _$el.css('transform', 'translate3d(' + distanceX + 'px, ' + distanceY + 'px, 0)');
                }
            }
        });
        _this.core.$slide.on('touchend.lg', function() {
            if (_this.core.$outer.hasClass('lg-zoomed')) {
                if (isMoved) {
                    isMoved = false;
                    _this.core.$outer.removeClass('lg-zoom-dragging');
                    _this.touchendZoom(startCoords, endCoords, allowX, allowY);
                }
            }
        });
    }
    ;
    Zoom.prototype.zoomDrag = function() {
        var _this = this;
        var startCoords = {};
        var endCoords = {};
        var isDraging = false;
        var isMoved = false;
        var allowX = false;
        var allowY = false;
        _this.core.$slide.on('mousedown.lg.zoom', function(e) {
            var $image = _this.core.$slide.eq(_this.core.index).find('.lg-object');
            allowY = $image.outerHeight() * $image.attr('data-scale') > _this.core.$outer.find('.lg').height();
            allowX = $image.outerWidth() * $image.attr('data-scale') > _this.core.$outer.find('.lg').width();
            if (_this.core.$outer.hasClass('lg-zoomed')) {
                if ($(e.target).hasClass('lg-object') && (allowX || allowY)) {
                    e.preventDefault();
                    startCoords = {
                        x: e.pageX,
                        y: e.pageY
                    };
                    isDraging = true;
                    _this.core.$outer.scrollLeft += 1;
                    _this.core.$outer.scrollLeft -= 1;
                    _this.core.$outer.removeClass('lg-grab').addClass('lg-grabbing');
                }
            }
        });
        $(window).on('mousemove.lg.zoom', function(e) {
            if (isDraging) {
                var _$el = _this.core.$slide.eq(_this.core.index).find('.lg-img-wrap');
                var distanceX;
                var distanceY;
                isMoved = true;
                endCoords = {
                    x: e.pageX,
                    y: e.pageY
                };
                _this.core.$outer.addClass('lg-zoom-dragging');
                if (allowY) {
                    distanceY = (-Math.abs(_$el.attr('data-y'))) + (endCoords.y - startCoords.y);
                } else {
                    distanceY = -Math.abs(_$el.attr('data-y'));
                }
                if (allowX) {
                    distanceX = (-Math.abs(_$el.attr('data-x'))) + (endCoords.x - startCoords.x);
                } else {
                    distanceX = -Math.abs(_$el.attr('data-x'));
                }
                _$el.css('transform', 'translate3d(' + distanceX + 'px, ' + distanceY + 'px, 0)');
            }
        });
        $(window).on('mouseup.lg.zoom', function(e) {
            if (isDraging) {
                isDraging = false;
                _this.core.$outer.removeClass('lg-zoom-dragging');
                if (isMoved && ((startCoords.x !== endCoords.x) || (startCoords.y !== endCoords.y))) {
                    endCoords = {
                        x: e.pageX,
                        y: e.pageY
                    };
                    _this.touchendZoom(startCoords, endCoords, allowX, allowY);
                }
                isMoved = false;
            }
            _this.core.$outer.removeClass('lg-grabbing').addClass('lg-grab');
        });
    }
    ;
    Zoom.prototype.touchendZoom = function(startCoords, endCoords, allowX, allowY) {
        var _this = this;
        var _$el = _this.core.$slide.eq(_this.core.index).find('.lg-img-wrap');
        var $image = _this.core.$slide.eq(_this.core.index).find('.lg-object');
        var distanceX = (-Math.abs(_$el.attr('data-x'))) + (endCoords.x - startCoords.x);
        var distanceY = (-Math.abs(_$el.attr('data-y'))) + (endCoords.y - startCoords.y);
        var minY = (_this.core.$outer.find('.lg').height() - $image.outerHeight()) / 2;
        var maxY = Math.abs(($image.outerHeight() * Math.abs($image.attr('data-scale'))) - _this.core.$outer.find('.lg').height() + minY);
        var minX = (_this.core.$outer.find('.lg').width() - $image.outerWidth()) / 2;
        var maxX = Math.abs(($image.outerWidth() * Math.abs($image.attr('data-scale'))) - _this.core.$outer.find('.lg').width() + minX);
        if ((Math.abs(endCoords.x - startCoords.x) > 15) || (Math.abs(endCoords.y - startCoords.y) > 15)) {
            if (allowY) {
                if (distanceY <= -maxY) {
                    distanceY = -maxY;
                } else if (distanceY >= -minY) {
                    distanceY = -minY;
                }
            }
            if (allowX) {
                if (distanceX <= -maxX) {
                    distanceX = -maxX;
                } else if (distanceX >= -minX) {
                    distanceX = -minX;
                }
            }
            if (allowY) {
                _$el.attr('data-y', Math.abs(distanceY));
            } else {
                distanceY = -Math.abs(_$el.attr('data-y'));
            }
            if (allowX) {
                _$el.attr('data-x', Math.abs(distanceX));
            } else {
                distanceX = -Math.abs(_$el.attr('data-x'));
            }
            _$el.css('transform', 'translate3d(' + distanceX + 'px, ' + distanceY + 'px, 0)');
        }
    }
    ;
    Zoom.prototype.destroy = function() {
        var _this = this;
        _this.core.$el.off('.lg.zoom');
        $(window).off('.lg.zoom');
        _this.core.$slide.off('.lg.zoom');
        _this.core.$el.off('.lg.tm.zoom');
        _this.resetZoom();
        clearTimeout(_this.zoomabletimeout);
        _this.zoomabletimeout = false;
    }
    ;
    $.fn.lightGallery.modules.zoom = Zoom;
}
)(jQuery, window, document);
(function($, window, document, undefined) {
    'use strict';
    var defaults = {
        hash: true
    };
    var Hash = function(element) {
        this.core = $(element).data('lightGallery');
        this.core.s = $.extend({}, defaults, this.core.s);
        if (this.core.s.hash) {
            this.oldHash = window.location.hash;
            this.init();
        }
        return this;
    };
    Hash.prototype.init = function() {
        var _this = this;
        var _hash;
        if (window.location.hash.indexOf('lg=') < 0) {
            window.location.hash = 'lg=' + _this.core.s.galleryId + '&slide=' + _this.core.$outer.find('.lg-current').index();
        }
        $(window).on('hashchange.lg.hash', function() {
            _hash = window.location.hash;
            var _idx = parseInt(_hash.split('&slide=')[1], 10);
            if ((_hash.indexOf('lg=' + _this.core.s.galleryId) > -1)) {
                _this.core.slide(_idx, false, false);
            } else if (_this.core.lGalleryOn) {
                _this.core.destroy();
            }
        });
    }
    ;
    Hash.prototype.destroy = function() {
        if (!this.core.s.hash) {
            return;
        }
        if (window.location.hash.indexOf('lg=') >= 0)
            window.history.go(-1);
        this.core.$el.off('.lg.hash');
    }
    ;
    $.fn.lightGallery.modules.hash = Hash;
}
)(jQuery, window, document);
!function(a, b, c, d) {
    function e(b, c) {
        this.settings = null,
        this.options = a.extend({}, e.Defaults, c),
        this.$element = a(b),
        this.drag = a.extend({}, m),
        this.state = a.extend({}, n),
        this.e = a.extend({}, o),
        this._plugins = {},
        this._supress = {},
        this._current = null,
        this._speed = null,
        this._coordinates = [],
        this._breakpoint = null,
        this._width = null,
        this._items = [],
        this._clones = [],
        this._mergers = [],
        this._invalidated = {},
        this._pipe = [],
        a.each(e.Plugins, a.proxy(function(a, b) {
            this._plugins[a[0].toLowerCase() + a.slice(1)] = new b(this)
        }, this)),
        a.each(e.Pipe, a.proxy(function(b, c) {
            this._pipe.push({
                filter: c.filter,
                run: a.proxy(c.run, this)
            })
        }, this)),
        this.setup(),
        this.initialize()
    }
    function f(a) {
        if (a.touches !== d)
            return {
                x: a.touches[0].pageX,
                y: a.touches[0].pageY
            };
        if (a.touches === d) {
            if (a.pageX !== d)
                return {
                    x: a.pageX,
                    y: a.pageY
                };
            if (a.pageX === d)
                return {
                    x: a.clientX,
                    y: a.clientY
                }
        }
    }
    function g(a) {
        var b, d, e = c.createElement("div"), f = a;
        for (b in f)
            if (d = f[b],
            "undefined" != typeof e.style[d])
                return e = null,
                [d, b];
        return [!1]
    }
    function h() {
        return g(["transition", "WebkitTransition", "MozTransition", "OTransition"])[1]
    }
    function i() {
        return g(["transform", "WebkitTransform", "MozTransform", "OTransform", "msTransform"])[0]
    }
    function j() {
        return g(["perspective", "webkitPerspective", "MozPerspective", "OPerspective", "MsPerspective"])[0]
    }
    function k() {
        return "ontouchstart"in b || !!navigator.msMaxTouchPoints
    }
    function l() {
        return b.navigator.msPointerEnabled
    }
    var m, n, o;
    m = {
        start: 0,
        startX: 0,
        startY: 0,
        current: 0,
        currentX: 0,
        currentY: 0,
        offsetX: 0,
        offsetY: 0,
        distance: null,
        startTime: 0,
        endTime: 0,
        updatedX: 0,
        targetEl: null
    },
    n = {
        isTouch: !1,
        isScrolling: !1,
        isSwiping: !1,
        direction: !1,
        inMotion: !1
    },
    o = {
        _onDragStart: null,
        _onDragMove: null,
        _onDragEnd: null,
        _transitionEnd: null,
        _resizer: null,
        _responsiveCall: null,
        _goToLoop: null,
        _checkVisibile: null
    },
    e.Defaults = {
        items: 3,
        loop: !1,
        center: !1,
        mouseDrag: !0,
        touchDrag: !0,
        pullDrag: !0,
        freeDrag: !1,
        margin: 0,
        stagePadding: 0,
        merge: !1,
        mergeFit: !0,
        autoWidth: !1,
        startPosition: 0,
        rtl: !1,
        smartSpeed: 250,
        fluidSpeed: !1,
        dragEndSpeed: !1,
        responsive: {},
        responsiveRefreshRate: 200,
        responsiveBaseElement: b,
        responsiveClass: !1,
        fallbackEasing: "swing",
        info: !1,
        nestedItemSelector: !1,
        itemElement: "div",
        stageElement: "div",
        themeClass: "owl-theme",
        baseClass: "owl-carousel",
        itemClass: "owl-item",
        centerClass: "center",
        activeClass: "active"
    },
    e.Width = {
        Default: "default",
        Inner: "inner",
        Outer: "outer"
    },
    e.Plugins = {},
    e.Pipe = [{
        filter: ["width", "items", "settings"],
        run: function(a) {
            a.current = this._items && this._items[this.relative(this._current)]
        }
    }, {
        filter: ["items", "settings"],
        run: function() {
            var a = this._clones
              , b = this.$stage.children(".cloned");
            (b.length !== a.length || !this.settings.loop && a.length > 0) && (this.$stage.children(".cloned").remove(),
            this._clones = [])
        }
    }, {
        filter: ["items", "settings"],
        run: function() {
            var a, b, c = this._clones, d = this._items, e = this.settings.loop ? c.length - Math.max(2 * this.settings.items, 4) : 0;
            for (a = 0,
            b = Math.abs(e / 2); b > a; a++)
                e > 0 ? (this.$stage.children().eq(d.length + c.length - 1).remove(),
                c.pop(),
                this.$stage.children().eq(0).remove(),
                c.pop()) : (c.push(c.length / 2),
                this.$stage.append(d[c[c.length - 1]].clone().addClass("cloned")),
                c.push(d.length - 1 - (c.length - 1) / 2),
                this.$stage.prepend(d[c[c.length - 1]].clone().addClass("cloned")))
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function() {
            var a, b, c, d = this.settings.rtl ? 1 : -1, e = (this.width() / this.settings.items).toFixed(3), f = 0;
            for (this._coordinates = [],
            b = 0,
            c = this._clones.length + this._items.length; c > b; b++)
                a = this._mergers[this.relative(b)],
                a = this.settings.mergeFit && Math.min(a, this.settings.items) || a,
                f += (this.settings.autoWidth ? this._items[this.relative(b)].width() + this.settings.margin : e * a) * d,
                this._coordinates.push(f)
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function() {
            var b, c, d = (this.width() / this.settings.items).toFixed(3), e = {
                width: Math.abs(this._coordinates[this._coordinates.length - 1]) + 2 * this.settings.stagePadding,
                "padding-left": this.settings.stagePadding || "",
                "padding-right": this.settings.stagePadding || ""
            };
            if (this.$stage.css(e),
            e = {
                width: this.settings.autoWidth ? "auto" : d - this.settings.margin
            },
            e[this.settings.rtl ? "margin-left" : "margin-right"] = this.settings.margin,
            !this.settings.autoWidth && a.grep(this._mergers, function(a) {
                return a > 1
            }).length > 0)
                for (b = 0,
                c = this._coordinates.length; c > b; b++)
                    e.width = Math.abs(this._coordinates[b]) - Math.abs(this._coordinates[b - 1] || 0) - this.settings.margin,
                    this.$stage.children().eq(b).css(e);
            else
                this.$stage.children().css(e)
        }
    }, {
        filter: ["width", "items", "settings"],
        run: function(a) {
            a.current && this.reset(this.$stage.children().index(a.current))
        }
    }, {
        filter: ["position"],
        run: function() {
            this.animate(this.coordinates(this._current))
        }
    }, {
        filter: ["width", "position", "items", "settings"],
        run: function() {
            var a, b, c, d, e = this.settings.rtl ? 1 : -1, f = 2 * this.settings.stagePadding, g = this.coordinates(this.current()) + f, h = g + this.width() * e, i = [];
            for (c = 0,
            d = this._coordinates.length; d > c; c++)
                a = this._coordinates[c - 1] || 0,
                b = Math.abs(this._coordinates[c]) + f * e,
                (this.op(a, "<=", g) && this.op(a, ">", h) || this.op(b, "<", g) && this.op(b, ">", h)) && i.push(c);
            this.$stage.children("." + this.settings.activeClass).removeClass(this.settings.activeClass),
            this.$stage.children(":eq(" + i.join("), :eq(") + ")").addClass(this.settings.activeClass),
            this.settings.center && (this.$stage.children("." + this.settings.centerClass).removeClass(this.settings.centerClass),
            this.$stage.children().eq(this.current()).addClass(this.settings.centerClass))
        }
    }],
    e.prototype.initialize = function() {
        if (this.trigger("initialize"),
        this.$element.addClass(this.settings.baseClass).addClass(this.settings.themeClass).toggleClass("owl-rtl", this.settings.rtl),
        this.browserSupport(),
        this.settings.autoWidth && this.state.imagesLoaded !== !0) {
            var b, c, e;
            if (b = this.$element.find("img"),
            c = this.settings.nestedItemSelector ? "." + this.settings.nestedItemSelector : d,
            e = this.$element.children(c).width(),
            b.length && 0 >= e)
                return this.preloadAutoWidthImages(b),
                !1
        }
        this.$element.addClass("owl-loading"),
        this.$stage = a("<" + this.settings.stageElement + ' class="owl-stage"/>').wrap('<div class="owl-stage-outer">'),
        this.$element.append(this.$stage.parent()),
        this.replace(this.$element.children().not(this.$stage.parent())),
        this._width = this.$element.width(),
        this.refresh(),
        this.$element.removeClass("owl-loading").addClass("owl-loaded"),
        this.eventsCall(),
        this.internalEvents(),
        this.addTriggerableEvents(),
        this.trigger("initialized")
    }
    ,
    e.prototype.setup = function() {
        var b = this.viewport()
          , c = this.options.responsive
          , d = -1
          , e = null;
        c ? (a.each(c, function(a) {
            b >= a && a > d && (d = Number(a))
        }),
        e = a.extend({}, this.options, c[d]),
        delete e.responsive,
        e.responsiveClass && this.$element.attr("class", function(a, b) {
            return b.replace(/\b owl-responsive-\S+/g, "")
        }).addClass("owl-responsive-" + d)) : e = a.extend({}, this.options),
        (null === this.settings || this._breakpoint !== d) && (this.trigger("change", {
            property: {
                name: "settings",
                value: e
            }
        }),
        this._breakpoint = d,
        this.settings = e,
        this.invalidate("settings"),
        this.trigger("changed", {
            property: {
                name: "settings",
                value: this.settings
            }
        }))
    }
    ,
    e.prototype.optionsLogic = function() {
        this.$element.toggleClass("owl-center", this.settings.center),
        this.settings.loop && this._items.length < this.settings.items && (this.settings.loop = !1),
        this.settings.autoWidth && (this.settings.stagePadding = !1,
        this.settings.merge = !1)
    }
    ,
    e.prototype.prepare = function(b) {
        var c = this.trigger("prepare", {
            content: b
        });
        return c.data || (c.data = a("<" + this.settings.itemElement + "/>").addClass(this.settings.itemClass).append(b)),
        this.trigger("prepared", {
            content: c.data
        }),
        c.data
    }
    ,
    e.prototype.update = function() {
        for (var b = 0, c = this._pipe.length, d = a.proxy(function(a) {
            return this[a]
        }, this._invalidated), e = {}; c > b; )
            (this._invalidated.all || a.grep(this._pipe[b].filter, d).length > 0) && this._pipe[b].run(e),
            b++;
        this._invalidated = {}
    }
    ,
    e.prototype.width = function(a) {
        switch (a = a || e.Width.Default) {
        case e.Width.Inner:
        case e.Width.Outer:
            return this._width;
        default:
            return this._width - 2 * this.settings.stagePadding + this.settings.margin
        }
    }
    ,
    e.prototype.refresh = function() {
        if (0 === this._items.length)
            return !1;
        (new Date).getTime();
        this.trigger("refresh"),
        this.setup(),
        this.optionsLogic(),
        this.$stage.addClass("owl-refresh"),
        this.update(),
        this.$stage.removeClass("owl-refresh"),
        this.state.orientation = b.orientation,
        this.watchVisibility(),
        this.trigger("refreshed")
    }
    ,
    e.prototype.eventsCall = function() {
        this.e._onDragStart = a.proxy(function(a) {
            this.onDragStart(a)
        }, this),
        this.e._onDragMove = a.proxy(function(a) {
            this.onDragMove(a)
        }, this),
        this.e._onDragEnd = a.proxy(function(a) {
            this.onDragEnd(a)
        }, this),
        this.e._onResize = a.proxy(function(a) {
            this.onResize(a)
        }, this),
        this.e._transitionEnd = a.proxy(function(a) {
            this.transitionEnd(a)
        }, this),
        this.e._preventClick = a.proxy(function(a) {
            this.preventClick(a)
        }, this)
    }
    ,
    e.prototype.onThrottledResize = function() {
        b.clearTimeout(this.resizeTimer),
        this.resizeTimer = b.setTimeout(this.e._onResize, this.settings.responsiveRefreshRate)
    }
    ,
    e.prototype.onResize = function() {
        return this._items.length ? this._width === this.$element.width() ? !1 : this.trigger("resize").isDefaultPrevented() ? !1 : (this._width = this.$element.width(),
        this.invalidate("width"),
        this.refresh(),
        void this.trigger("resized")) : !1
    }
    ,
    e.prototype.eventsRouter = function(a) {
        var b = a.type;
        "mousedown" === b || "touchstart" === b ? this.onDragStart(a) : "mousemove" === b || "touchmove" === b ? this.onDragMove(a) : "mouseup" === b || "touchend" === b ? this.onDragEnd(a) : "touchcancel" === b && this.onDragEnd(a)
    }
    ,
    e.prototype.internalEvents = function() {
        var c = (k(),
        l());
        this.settings.mouseDrag ? (this.$stage.on("mousedown", a.proxy(function(a) {
            this.eventsRouter(a)
        }, this)),
        this.$stage.on("dragstart", function() {
            return !1
        }),
        this.$stage.get(0).onselectstart = function() {
            return !1
        }
        ) : this.$element.addClass("owl-text-select-on"),
        this.settings.touchDrag && !c && this.$stage.on("touchstart touchcancel", a.proxy(function(a) {
            this.eventsRouter(a)
        }, this)),
        this.transitionEndVendor && this.on(this.$stage.get(0), this.transitionEndVendor, this.e._transitionEnd, !1),
        this.settings.responsive !== !1 && this.on(b, "resize", a.proxy(this.onThrottledResize, this))
    }
    ,
    e.prototype.onDragStart = function(d) {
        var e, g, h, i;
        if (e = d.originalEvent || d || b.event,
        3 === e.which || this.state.isTouch)
            return !1;
        if ("mousedown" === e.type && this.$stage.addClass("owl-grab"),
        this.trigger("drag"),
        this.drag.startTime = (new Date).getTime(),
        this.speed(0),
        this.state.isTouch = !0,
        this.state.isScrolling = !1,
        this.state.isSwiping = !1,
        this.drag.distance = 0,
        g = f(e).x,
        h = f(e).y,
        this.drag.offsetX = this.$stage.position().left,
        this.drag.offsetY = this.$stage.position().top,
        this.settings.rtl && (this.drag.offsetX = this.$stage.position().left + this.$stage.width() - this.width() + this.settings.margin),
        this.state.inMotion && this.support3d)
            i = this.getTransformProperty(),
            this.drag.offsetX = i,
            this.animate(i),
            this.state.inMotion = !0;
        else if (this.state.inMotion && !this.support3d)
            return this.state.inMotion = !1,
            !1;
        this.drag.startX = g - this.drag.offsetX,
        this.drag.startY = h - this.drag.offsetY,
        this.drag.start = g - this.drag.startX,
        this.drag.targetEl = e.target || e.srcElement,
        this.drag.updatedX = this.drag.start,
        ("IMG" === this.drag.targetEl.tagName || "A" === this.drag.targetEl.tagName) && (this.drag.targetEl.draggable = !1),
        a(c).on("mousemove.owl.dragEvents mouseup.owl.dragEvents touchmove.owl.dragEvents touchend.owl.dragEvents", a.proxy(function(a) {
            this.eventsRouter(a)
        }, this))
    }
    ,
    e.prototype.onDragMove = function(a) {
        var c, e, g, h, i, j;
        this.state.isTouch && (this.state.isScrolling || (c = a.originalEvent || a || b.event,
        e = f(c).x,
        g = f(c).y,
        this.drag.currentX = e - this.drag.startX,
        this.drag.currentY = g - this.drag.startY,
        this.drag.distance = this.drag.currentX - this.drag.offsetX,
        this.drag.distance < 0 ? this.state.direction = this.settings.rtl ? "right" : "left" : this.drag.distance > 0 && (this.state.direction = this.settings.rtl ? "left" : "right"),
        this.settings.loop ? this.op(this.drag.currentX, ">", this.coordinates(this.minimum())) && "right" === this.state.direction ? this.drag.currentX -= (this.settings.center && this.coordinates(0)) - this.coordinates(this._items.length) : this.op(this.drag.currentX, "<", this.coordinates(this.maximum())) && "left" === this.state.direction && (this.drag.currentX += (this.settings.center && this.coordinates(0)) - this.coordinates(this._items.length)) : (h = this.coordinates(this.settings.rtl ? this.maximum() : this.minimum()),
        i = this.coordinates(this.settings.rtl ? this.minimum() : this.maximum()),
        j = this.settings.pullDrag ? this.drag.distance / 5 : 0,
        this.drag.currentX = Math.max(Math.min(this.drag.currentX, h + j), i + j)),
        (this.drag.distance > 8 || this.drag.distance < -8) && (c.preventDefault !== d ? c.preventDefault() : c.returnValue = !1,
        this.state.isSwiping = !0),
        this.drag.updatedX = this.drag.currentX,
        (this.drag.currentY > 16 || this.drag.currentY < -16) && this.state.isSwiping === !1 && (this.state.isScrolling = !0,
        this.drag.updatedX = this.drag.start),
        this.animate(this.drag.updatedX)))
    }
    ,
    e.prototype.onDragEnd = function(b) {
        var d, e, f;
        if (this.state.isTouch) {
            if ("mouseup" === b.type && this.$stage.removeClass("owl-grab"),
            this.trigger("dragged"),
            this.drag.targetEl.removeAttribute("draggable"),
            this.state.isTouch = !1,
            this.state.isScrolling = !1,
            this.state.isSwiping = !1,
            0 === this.drag.distance && this.state.inMotion !== !0)
                return this.state.inMotion = !1,
                !1;
            this.drag.endTime = (new Date).getTime(),
            d = this.drag.endTime - this.drag.startTime,
            e = Math.abs(this.drag.distance),
            (e > 3 || d > 300) && this.removeClick(this.drag.targetEl),
            f = this.closest(this.drag.updatedX),
            this.speed(this.settings.dragEndSpeed || this.settings.smartSpeed),
            this.current(f),
            this.invalidate("position"),
            this.update(),
            this.settings.pullDrag || this.drag.updatedX !== this.coordinates(f) || this.transitionEnd(),
            this.drag.distance = 0,
            a(c).off(".owl.dragEvents")
        }
    }
    ,
    e.prototype.removeClick = function(c) {
        this.drag.targetEl = c,
        a(c).on("click.preventClick", this.e._preventClick),
        b.setTimeout(function() {
            a(c).off("click.preventClick")
        }, 300)
    }
    ,
    e.prototype.preventClick = function(b) {
        b.preventDefault ? b.preventDefault() : b.returnValue = !1,
        b.stopPropagation && b.stopPropagation(),
        a(b.target).off("click.preventClick")
    }
    ,
    e.prototype.getTransformProperty = function() {
        var a, c;
        return a = b.getComputedStyle(this.$stage.get(0), null).getPropertyValue(this.vendorName + "transform"),
        a = a.replace(/matrix(3d)?\(|\)/g, "").split(","),
        c = 16 === a.length,
        c !== !0 ? a[4] : a[12]
    }
    ,
    e.prototype.closest = function(b) {
        var c = -1
          , d = 30
          , e = this.width()
          , f = this.coordinates();
        return this.settings.freeDrag || a.each(f, a.proxy(function(a, g) {
            return b > g - d && g + d > b ? c = a : this.op(b, "<", g) && this.op(b, ">", f[a + 1] || g - e) && (c = "left" === this.state.direction ? a + 1 : a),
            -1 === c
        }, this)),
        this.settings.loop || (this.op(b, ">", f[this.minimum()]) ? c = b = this.minimum() : this.op(b, "<", f[this.maximum()]) && (c = b = this.maximum())),
        c
    }
    ,
    e.prototype.animate = function(b) {
        this.trigger("translate"),
        this.state.inMotion = this.speed() > 0,
        this.support3d ? this.$stage.css({
            transform: "translate3d(" + b + "px,0px, 0px)",
            transition: this.speed() / 1e3 + "s"
        }) : this.state.isTouch ? this.$stage.css({
            left: b + "px"
        }) : this.$stage.animate({
            left: b
        }, this.speed() / 1e3, this.settings.fallbackEasing, a.proxy(function() {
            this.state.inMotion && this.transitionEnd()
        }, this))
    }
    ,
    e.prototype.current = function(a) {
        if (a === d)
            return this._current;
        if (0 === this._items.length)
            return d;
        if (a = this.normalize(a),
        this._current !== a) {
            var b = this.trigger("change", {
                property: {
                    name: "position",
                    value: a
                }
            });
            b.data !== d && (a = this.normalize(b.data)),
            this._current = a,
            this.invalidate("position"),
            this.trigger("changed", {
                property: {
                    name: "position",
                    value: this._current
                }
            })
        }
        return this._current
    }
    ,
    e.prototype.invalidate = function(a) {
        this._invalidated[a] = !0
    }
    ,
    e.prototype.reset = function(a) {
        a = this.normalize(a),
        a !== d && (this._speed = 0,
        this._current = a,
        this.suppress(["translate", "translated"]),
        this.animate(this.coordinates(a)),
        this.release(["translate", "translated"]))
    }
    ,
    e.prototype.normalize = function(b, c) {
        var e = c ? this._items.length : this._items.length + this._clones.length;
        return !a.isNumeric(b) || 1 > e ? d : b = this._clones.length ? (b % e + e) % e : Math.max(this.minimum(c), Math.min(this.maximum(c), b))
    }
    ,
    e.prototype.relative = function(a) {
        return a = this.normalize(a),
        a -= this._clones.length / 2,
        this.normalize(a, !0)
    }
    ,
    e.prototype.maximum = function(a) {
        var b, c, d, e = 0, f = this.settings;
        if (a)
            return this._items.length - 1;
        if (!f.loop && f.center)
            b = this._items.length - 1;
        else if (f.loop || f.center)
            if (f.loop || f.center)
                b = this._items.length + f.items;
            else {
                if (!f.autoWidth && !f.merge)
                    throw "Can not detect maximum absolute position.";
                for (revert = f.rtl ? 1 : -1,
                c = this.$stage.width() - this.$element.width(); (d = this.coordinates(e)) && !(d * revert >= c); )
                    b = ++e
            }
        else
            b = this._items.length - f.items;
        return b
    }
    ,
    e.prototype.minimum = function(a) {
        return a ? 0 : this._clones.length / 2
    }
    ,
    e.prototype.items = function(a) {
        return a === d ? this._items.slice() : (a = this.normalize(a, !0),
        this._items[a])
    }
    ,
    e.prototype.mergers = function(a) {
        return a === d ? this._mergers.slice() : (a = this.normalize(a, !0),
        this._mergers[a])
    }
    ,
    e.prototype.clones = function(b) {
        var c = this._clones.length / 2
          , e = c + this._items.length
          , f = function(a) {
            return a % 2 === 0 ? e + a / 2 : c - (a + 1) / 2
        };
        return b === d ? a.map(this._clones, function(a, b) {
            return f(b)
        }) : a.map(this._clones, function(a, c) {
            return a === b ? f(c) : null
        })
    }
    ,
    e.prototype.speed = function(a) {
        return a !== d && (this._speed = a),
        this._speed
    }
    ,
    e.prototype.coordinates = function(b) {
        var c = null;
        return b === d ? a.map(this._coordinates, a.proxy(function(a, b) {
            return this.coordinates(b)
        }, this)) : (this.settings.center ? (c = this._coordinates[b],
        c += (this.width() - c + (this._coordinates[b - 1] || 0)) / 2 * (this.settings.rtl ? -1 : 1)) : c = this._coordinates[b - 1] || 0,
        c)
    }
    ,
    e.prototype.duration = function(a, b, c) {
        return Math.min(Math.max(Math.abs(b - a), 1), 6) * Math.abs(c || this.settings.smartSpeed)
    }
    ,
    e.prototype.to = function(c, d) {
        if (this.settings.loop) {
            var e = c - this.relative(this.current())
              , f = this.current()
              , g = this.current()
              , h = this.current() + e
              , i = 0 > g - h ? !0 : !1
              , j = this._clones.length + this._items.length;
            h < this.settings.items && i === !1 ? (f = g + this._items.length,
            this.reset(f)) : h >= j - this.settings.items && i === !0 && (f = g - this._items.length,
            this.reset(f)),
            b.clearTimeout(this.e._goToLoop),
            this.e._goToLoop = b.setTimeout(a.proxy(function() {
                this.speed(this.duration(this.current(), f + e, d)),
                this.current(f + e),
                this.update()
            }, this), 30)
        } else
            this.speed(this.duration(this.current(), c, d)),
            this.current(c),
            this.update()
    }
    ,
    e.prototype.next = function(a) {
        a = a || !1,
        this.to(this.relative(this.current()) + 1, a)
    }
    ,
    e.prototype.prev = function(a) {
        a = a || !1,
        this.to(this.relative(this.current()) - 1, a)
    }
    ,
    e.prototype.transitionEnd = function(a) {
        return a !== d && (a.stopPropagation(),
        (a.target || a.srcElement || a.originalTarget) !== this.$stage.get(0)) ? !1 : (this.state.inMotion = !1,
        void this.trigger("translated"))
    }
    ,
    e.prototype.viewport = function() {
        var d;
        if (this.options.responsiveBaseElement !== b)
            d = a(this.options.responsiveBaseElement).width();
        else if (b.innerWidth)
            d = b.innerWidth;
        else {
            if (!c.documentElement || !c.documentElement.clientWidth)
                throw "Can not detect viewport width.";
            d = c.documentElement.clientWidth
        }
        return d
    }
    ,
    e.prototype.replace = function(b) {
        this.$stage.empty(),
        this._items = [],
        b && (b = b instanceof jQuery ? b : a(b)),
        this.settings.nestedItemSelector && (b = b.find("." + this.settings.nestedItemSelector)),
        b.filter(function() {
            return 1 === this.nodeType
        }).each(a.proxy(function(a, b) {
            b = this.prepare(b),
            this.$stage.append(b),
            this._items.push(b),
            this._mergers.push(1 * b.find("[data-merge]").andSelf("[data-merge]").attr("data-merge") || 1)
        }, this)),
        this.reset(a.isNumeric(this.settings.startPosition) ? this.settings.startPosition : 0),
        this.invalidate("items")
    }
    ,
    e.prototype.add = function(a, b) {
        b = b === d ? this._items.length : this.normalize(b, !0),
        this.trigger("add", {
            content: a,
            position: b
        }),
        0 === this._items.length || b === this._items.length ? (this.$stage.append(a),
        this._items.push(a),
        this._mergers.push(1 * a.find("[data-merge]").andSelf("[data-merge]").attr("data-merge") || 1)) : (this._items[b].before(a),
        this._items.splice(b, 0, a),
        this._mergers.splice(b, 0, 1 * a.find("[data-merge]").andSelf("[data-merge]").attr("data-merge") || 1)),
        this.invalidate("items"),
        this.trigger("added", {
            content: a,
            position: b
        })
    }
    ,
    e.prototype.remove = function(a) {
        a = this.normalize(a, !0),
        a !== d && (this.trigger("remove", {
            content: this._items[a],
            position: a
        }),
        this._items[a].remove(),
        this._items.splice(a, 1),
        this._mergers.splice(a, 1),
        this.invalidate("items"),
        this.trigger("removed", {
            content: null,
            position: a
        }))
    }
    ,
    e.prototype.addTriggerableEvents = function() {
        var b = a.proxy(function(b, c) {
            return a.proxy(function(a) {
                a.relatedTarget !== this && (this.suppress([c]),
                b.apply(this, [].slice.call(arguments, 1)),
                this.release([c]))
            }, this)
        }, this);
        a.each({
            next: this.next,
            prev: this.prev,
            to: this.to,
            destroy: this.destroy,
            refresh: this.refresh,
            replace: this.replace,
            add: this.add,
            remove: this.remove
        }, a.proxy(function(a, c) {
            this.$element.on(a + ".owl.carousel", b(c, a + ".owl.carousel"))
        }, this))
    }
    ,
    e.prototype.watchVisibility = function() {
        function c(a) {
            return a.offsetWidth > 0 && a.offsetHeight > 0
        }
        function d() {
            c(this.$element.get(0)) && (this.$element.removeClass("owl-hidden"),
            this.refresh(),
            b.clearInterval(this.e._checkVisibile))
        }
        c(this.$element.get(0)) || (this.$element.addClass("owl-hidden"),
        b.clearInterval(this.e._checkVisibile),
        this.e._checkVisibile = b.setInterval(a.proxy(d, this), 500))
    }
    ,
    e.prototype.preloadAutoWidthImages = function(b) {
        var c, d, e, f;
        c = 0,
        d = this,
        b.each(function(g, h) {
            e = a(h),
            f = new Image,
            f.onload = function() {
                c++,
                e.attr("src", f.src),
                e.css("opacity", 1),
                c >= b.length && (d.state.imagesLoaded = !0,
                d.initialize())
            }
            ,
            f.src = e.attr("src") || e.attr("data-src") || e.attr("data-src-retina")
        })
    }
    ,
    e.prototype.destroy = function() {
        this.$element.hasClass(this.settings.themeClass) && this.$element.removeClass(this.settings.themeClass),
        this.settings.responsive !== !1 && a(b).off("resize.owl.carousel"),
        this.transitionEndVendor && this.off(this.$stage.get(0), this.transitionEndVendor, this.e._transitionEnd);
        for (var d in this._plugins)
            this._plugins[d].destroy();
        (this.settings.mouseDrag || this.settings.touchDrag) && (this.$stage.off("mousedown touchstart touchcancel"),
        a(c).off(".owl.dragEvents"),
        this.$stage.get(0).onselectstart = function() {}
        ,
        this.$stage.off("dragstart", function() {
            return !1
        })),
        this.$element.off(".owl"),
        this.$stage.children(".cloned").remove(),
        this.e = null,
        this.$element.removeData("owlCarousel"),
        this.$stage.children().contents().unwrap(),
        this.$stage.children().unwrap(),
        this.$stage.unwrap()
    }
    ,
    e.prototype.op = function(a, b, c) {
        var d = this.settings.rtl;
        switch (b) {
        case "<":
            return d ? a > c : c > a;
        case ">":
            return d ? c > a : a > c;
        case ">=":
            return d ? c >= a : a >= c;
        case "<=":
            return d ? a >= c : c >= a
        }
    }
    ,
    e.prototype.on = function(a, b, c, d) {
        a.addEventListener ? a.addEventListener(b, c, d) : a.attachEvent && a.attachEvent("on" + b, c)
    }
    ,
    e.prototype.off = function(a, b, c, d) {
        a.removeEventListener ? a.removeEventListener(b, c, d) : a.detachEvent && a.detachEvent("on" + b, c)
    }
    ,
    e.prototype.trigger = function(b, c, d) {
        var e = {
            item: {
                count: this._items.length,
                index: this.current()
            }
        }
          , f = a.camelCase(a.grep(["on", b, d], function(a) {
            return a
        }).join("-").toLowerCase())
          , g = a.Event([b, "owl", d || "carousel"].join(".").toLowerCase(), a.extend({
            relatedTarget: this
        }, e, c));
        return this._supress[b] || (a.each(this._plugins, function(a, b) {
            b.onTrigger && b.onTrigger(g)
        }),
        this.$element.trigger(g),
        this.settings && "function" == typeof this.settings[f] && this.settings[f].apply(this, g)),
        g
    }
    ,
    e.prototype.suppress = function(b) {
        a.each(b, a.proxy(function(a, b) {
            this._supress[b] = !0
        }, this))
    }
    ,
    e.prototype.release = function(b) {
        a.each(b, a.proxy(function(a, b) {
            delete this._supress[b]
        }, this))
    }
    ,
    e.prototype.browserSupport = function() {
        if (this.support3d = j(),
        this.support3d) {
            this.transformVendor = i();
            var a = ["transitionend", "webkitTransitionEnd", "transitionend", "oTransitionEnd"];
            this.transitionEndVendor = a[h()],
            this.vendorName = this.transformVendor.replace(/Transform/i, ""),
            this.vendorName = "" !== this.vendorName ? "-" + this.vendorName.toLowerCase() + "-" : ""
        }
        this.state.orientation = b.orientation
    }
    ,
    a.fn.owlCarousel = function(b) {
        return this.each(function() {
            a(this).data("owlCarousel") || a(this).data("owlCarousel", new e(this,b))
        })
    }
    ,
    a.fn.owlCarousel.Constructor = e
}(window.Zepto || window.jQuery, window, document),
function(a, b) {
    var c = function(b) {
        this._core = b,
        this._loaded = [],
        this._handlers = {
            "initialized.owl.carousel change.owl.carousel": a.proxy(function(b) {
                if (b.namespace && this._core.settings && this._core.settings.lazyLoad && (b.property && "position" == b.property.name || "initialized" == b.type))
                    for (var c = this._core.settings, d = c.center && Math.ceil(c.items / 2) || c.items, e = c.center && -1 * d || 0, f = (b.property && b.property.value || this._core.current()) + e, g = this._core.clones().length, h = a.proxy(function(a, b) {
                        this.load(b)
                    }, this); e++ < d; )
                        this.load(g / 2 + this._core.relative(f)),
                        g && a.each(this._core.clones(this._core.relative(f++)), h)
            }, this)
        },
        this._core.options = a.extend({}, c.Defaults, this._core.options),
        this._core.$element.on(this._handlers)
    };
    c.Defaults = {
        lazyLoad: !1
    },
    c.prototype.load = function(c) {
        var d = this._core.$stage.children().eq(c)
          , e = d && d.find(".owl-lazy");
        !e || a.inArray(d.get(0), this._loaded) > -1 || (e.each(a.proxy(function(c, d) {
            var e, f = a(d), g = b.devicePixelRatio > 1 && f.attr("data-src-retina") || f.attr("data-src");
            this._core.trigger("load", {
                element: f,
                url: g
            }, "lazy"),
            f.is("img") ? f.one("load.owl.lazy", a.proxy(function() {
                f.css("opacity", 1),
                this._core.trigger("loaded", {
                    element: f,
                    url: g
                }, "lazy")
            }, this)).attr("src", g) : (e = new Image,
            e.onload = a.proxy(function() {
                f.css({
                    "background-image": "url(" + g + ")",
                    opacity: "1"
                }),
                this._core.trigger("loaded", {
                    element: f,
                    url: g
                }, "lazy")
            }, this),
            e.src = g)
        }, this)),
        this._loaded.push(d.get(0)))
    }
    ,
    c.prototype.destroy = function() {
        var a, b;
        for (a in this.handlers)
            this._core.$element.off(a, this.handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
            "function" != typeof this[b] && (this[b] = null)
    }
    ,
    a.fn.owlCarousel.Constructor.Plugins.Lazy = c
}(window.Zepto || window.jQuery, window, document),
function(a) {
    var b = function(c) {
        this._core = c,
        this._handlers = {
            "initialized.owl.carousel": a.proxy(function() {
                this._core.settings.autoHeight && this.update()
            }, this),
            "changed.owl.carousel": a.proxy(function(a) {
                this._core.settings.autoHeight && "position" == a.property.name && this.update()
            }, this),
            "loaded.owl.lazy": a.proxy(function(a) {
                this._core.settings.autoHeight && a.element.closest("." + this._core.settings.itemClass) === this._core.$stage.children().eq(this._core.current()) && this.update()
            }, this)
        },
        this._core.options = a.extend({}, b.Defaults, this._core.options),
        this._core.$element.on(this._handlers)
    };
    b.Defaults = {
        autoHeight: !1,
        autoHeightClass: "owl-height"
    },
    b.prototype.update = function() {
        this._core.$stage.parent().height(this._core.$stage.children().eq(this._core.current()).height()).addClass(this._core.settings.autoHeightClass)
    }
    ,
    b.prototype.destroy = function() {
        var a, b;
        for (a in this._handlers)
            this._core.$element.off(a, this._handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
            "function" != typeof this[b] && (this[b] = null)
    }
    ,
    a.fn.owlCarousel.Constructor.Plugins.AutoHeight = b
}(window.Zepto || window.jQuery, window, document),
function(a, b, c) {
    var d = function(b) {
        this._core = b,
        this._videos = {},
        this._playing = null,
        this._fullscreen = !1,
        this._handlers = {
            "resize.owl.carousel": a.proxy(function(a) {
                this._core.settings.video && !this.isInFullScreen() && a.preventDefault()
            }, this),
            "refresh.owl.carousel changed.owl.carousel": a.proxy(function() {
                this._playing && this.stop()
            }, this),
            "prepared.owl.carousel": a.proxy(function(b) {
                var c = a(b.content).find(".owl-video");
                c.length && (c.css("display", "none"),
                this.fetch(c, a(b.content)))
            }, this)
        },
        this._core.options = a.extend({}, d.Defaults, this._core.options),
        this._core.$element.on(this._handlers),
        this._core.$element.on("click.owl.video", ".owl-video-play-icon", a.proxy(function(a) {
            this.play(a)
        }, this))
    };
    d.Defaults = {
        video: !1,
        videoHeight: !1,
        videoWidth: !1
    },
    d.prototype.fetch = function(a, b) {
        var c = a.attr("data-vimeo-id") ? "vimeo" : "youtube"
          , d = a.attr("data-vimeo-id") || a.attr("data-youtube-id")
          , e = a.attr("data-width") || this._core.settings.videoWidth
          , f = a.attr("data-height") || this._core.settings.videoHeight
          , g = a.attr("href");
        if (!g)
            throw new Error("Missing video URL.");
        if (d = g.match(/(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(\&\S+)?/),
        d[3].indexOf("youtu") > -1)
            c = "youtube";
        else {
            if (!(d[3].indexOf("vimeo") > -1))
                throw new Error("Video URL not supported.");
            c = "vimeo"
        }
        d = d[6],
        this._videos[g] = {
            type: c,
            id: d,
            width: e,
            height: f
        },
        b.attr("data-video", g),
        this.thumbnail(a, this._videos[g])
    }
    ,
    d.prototype.thumbnail = function(b, c) {
        var d, e, f, g = c.width && c.height ? 'style="width:' + c.width + "px;height:" + c.height + 'px;"' : "", h = b.find("img"), i = "src", j = "", k = this._core.settings, l = function(a) {
            e = '<div class="owl-video-play-icon"></div>',
            d = k.lazyLoad ? '<div class="owl-video-tn ' + j + '" ' + i + '="' + a + '"></div>' : '<div class="owl-video-tn" style="opacity:1;background-image:url(' + a + ')"></div>',
            b.after(d),
            b.after(e)
        };
        return b.wrap('<div class="owl-video-wrapper"' + g + "></div>"),
        this._core.settings.lazyLoad && (i = "data-src",
        j = "owl-lazy"),
        h.length ? (l(h.attr(i)),
        h.remove(),
        !1) : void ("youtube" === c.type ? (f = "http://img.youtube.com/vi/" + c.id + "/hqdefault.jpg",
        l(f)) : "vimeo" === c.type && a.ajax({
            type: "GET",
            url: "http://vimeo.com/api/v2/video/" + c.id + ".json",
            jsonp: "callback",
            dataType: "jsonp",
            success: function(a) {
                f = a[0].thumbnail_large,
                l(f)
            }
        }))
    }
    ,
    d.prototype.stop = function() {
        this._core.trigger("stop", null, "video"),
        this._playing.find(".owl-video-frame").remove(),
        this._playing.removeClass("owl-video-playing"),
        this._playing = null
    }
    ,
    d.prototype.play = function(b) {
        this._core.trigger("play", null, "video"),
        this._playing && this.stop();
        var c, d, e = a(b.target || b.srcElement), f = e.closest("." + this._core.settings.itemClass), g = this._videos[f.attr("data-video")], h = g.width || "100%", i = g.height || this._core.$stage.height();
        "youtube" === g.type ? c = '<iframe width="' + h + '" height="' + i + '" src="http://www.youtube.com/embed/' + g.id + "?autoplay=1&v=" + g.id + '" frameborder="0" allowfullscreen></iframe>' : "vimeo" === g.type && (c = '<iframe src="http://player.vimeo.com/video/' + g.id + '?autoplay=1" width="' + h + '" height="' + i + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'),
        f.addClass("owl-video-playing"),
        this._playing = f,
        d = a('<div style="height:' + i + "px; width:" + h + 'px" class="owl-video-frame">' + c + "</div>"),
        e.after(d)
    }
    ,
    d.prototype.isInFullScreen = function() {
        var d = c.fullscreenElement || c.mozFullScreenElement || c.webkitFullscreenElement;
        return d && a(d).parent().hasClass("owl-video-frame") && (this._core.speed(0),
        this._fullscreen = !0),
        d && this._fullscreen && this._playing ? !1 : this._fullscreen ? (this._fullscreen = !1,
        !1) : this._playing && this._core.state.orientation !== b.orientation ? (this._core.state.orientation = b.orientation,
        !1) : !0
    }
    ,
    d.prototype.destroy = function() {
        var a, b;
        this._core.$element.off("click.owl.video");
        for (a in this._handlers)
            this._core.$element.off(a, this._handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
            "function" != typeof this[b] && (this[b] = null)
    }
    ,
    a.fn.owlCarousel.Constructor.Plugins.Video = d
}(window.Zepto || window.jQuery, window, document),
function(a, b, c, d) {
    var e = function(b) {
        this.core = b,
        this.core.options = a.extend({}, e.Defaults, this.core.options),
        this.swapping = !0,
        this.previous = d,
        this.next = d,
        this.handlers = {
            "change.owl.carousel": a.proxy(function(a) {
                "position" == a.property.name && (this.previous = this.core.current(),
                this.next = a.property.value)
            }, this),
            "drag.owl.carousel dragged.owl.carousel translated.owl.carousel": a.proxy(function(a) {
                this.swapping = "translated" == a.type
            }, this),
            "translate.owl.carousel": a.proxy(function() {
                this.swapping && (this.core.options.animateOut || this.core.options.animateIn) && this.swap()
            }, this)
        },
        this.core.$element.on(this.handlers)
    };
    e.Defaults = {
        animateOut: !1,
        animateIn: !1
    },
    e.prototype.swap = function() {
        if (1 === this.core.settings.items && this.core.support3d) {
            this.core.speed(0);
            var b, c = a.proxy(this.clear, this), d = this.core.$stage.children().eq(this.previous), e = this.core.$stage.children().eq(this.next), f = this.core.settings.animateIn, g = this.core.settings.animateOut;
            this.core.current() !== this.previous && (g && (b = this.core.coordinates(this.previous) - this.core.coordinates(this.next),
            d.css({
                left: b + "px"
            }).addClass("animated owl-animated-out").addClass(g).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", c)),
            f && e.addClass("animated owl-animated-in").addClass(f).one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", c))
        }
    }
    ,
    e.prototype.clear = function(b) {
        a(b.target).css({
            left: ""
        }).removeClass("animated owl-animated-out owl-animated-in").removeClass(this.core.settings.animateIn).removeClass(this.core.settings.animateOut),
        this.core.transitionEnd()
    }
    ,
    e.prototype.destroy = function() {
        var a, b;
        for (a in this.handlers)
            this.core.$element.off(a, this.handlers[a]);
        for (b in Object.getOwnPropertyNames(this))
            "function" != typeof this[b] && (this[b] = null)
    }
    ,
    a.fn.owlCarousel.Constructor.Plugins.Animate = e
}(window.Zepto || window.jQuery, window, document),
function(a, b, c) {
    var d = function(b) {
        this.core = b,
        this.core.options = a.extend({}, d.Defaults, this.core.options),
        this.handlers = {
            "translated.owl.carousel refreshed.owl.carousel": a.proxy(function() {
                this.autoplay()
            }, this),
            "play.owl.autoplay": a.proxy(function(a, b, c) {
                this.play(b, c)
            }, this),
            "stop.owl.autoplay": a.proxy(function() {
                this.stop()
            }, this),
            "mouseover.owl.autoplay": a.proxy(function() {
                this.core.settings.autoplayHoverPause && this.pause()
            }, this),
            "mouseleave.owl.autoplay": a.proxy(function() {
                this.core.settings.autoplayHoverPause && this.autoplay()
            }, this)
        },
        this.core.$element.on(this.handlers)
    };
    d.Defaults = {
        autoplay: !1,
        autoplayTimeout: 5e3,
        autoplayHoverPause: !1,
        autoplaySpeed: !1
    },
    d.prototype.autoplay = function() {
        this.core.settings.autoplay && !this.core.state.videoPlay ? (b.clearInterval(this.interval),
        this.interval = b.setInterval(a.proxy(function() {
            this.play()
        }, this), this.core.settings.autoplayTimeout)) : b.clearInterval(this.interval)
    }
    ,
    d.prototype.play = function() {
        return c.hidden === !0 || this.core.state.isTouch || this.core.state.isScrolling || this.core.state.isSwiping || this.core.state.inMotion ? void 0 : this.core.settings.autoplay === !1 ? void b.clearInterval(this.interval) : void this.core.next(this.core.settings.autoplaySpeed)
    }
    ,
    d.prototype.stop = function() {
        b.clearInterval(this.interval)
    }
    ,
    d.prototype.pause = function() {
        b.clearInterval(this.interval)
    }
    ,
    d.prototype.destroy = function() {
        var a, c;
        b.clearInterval(this.interval);
        for (a in this.handlers)
            this.core.$element.off(a, this.handlers[a]);
        for (c in Object.getOwnPropertyNames(this))
            "function" != typeof this[c] && (this[c] = null)
    }
    ,
    a.fn.owlCarousel.Constructor.Plugins.autoplay = d
}(window.Zepto || window.jQuery, window, document),
function(a) {
    "use strict";
    var b = function(c) {
        this._core = c,
        this._initialized = !1,
        this._pages = [],
        this._controls = {},
        this._templates = [],
        this.$element = this._core.$element,
        this._overrides = {
            next: this._core.next,
            prev: this._core.prev,
            to: this._core.to
        },
        this._handlers = {
            "prepared.owl.carousel": a.proxy(function(b) {
                this._core.settings.dotsData && this._templates.push(a(b.content).find("[data-dot]").andSelf("[data-dot]").attr("data-dot"))
            }, this),
            "add.owl.carousel": a.proxy(function(b) {
                this._core.settings.dotsData && this._templates.splice(b.position, 0, a(b.content).find("[data-dot]").andSelf("[data-dot]").attr("data-dot"))
            }, this),
            "remove.owl.carousel prepared.owl.carousel": a.proxy(function(a) {
                this._core.settings.dotsData && this._templates.splice(a.position, 1)
            }, this),
            "change.owl.carousel": a.proxy(function(a) {
                if ("position" == a.property.name && !this._core.state.revert && !this._core.settings.loop && this._core.settings.navRewind) {
                    var b = this._core.current()
                      , c = this._core.maximum()
                      , d = this._core.minimum();
                    a.data = a.property.value > c ? b >= c ? d : c : a.property.value < d ? c : a.property.value
                }
            }, this),
            "changed.owl.carousel": a.proxy(function(a) {
                "position" == a.property.name && this.draw()
            }, this),
            "refreshed.owl.carousel": a.proxy(function() {
                this._initialized || (this.initialize(),
                this._initialized = !0),
                this._core.trigger("refresh", null, "navigation"),
                this.update(),
                this.draw(),
                this._core.trigger("refreshed", null, "navigation")
            }, this)
        },
        this._core.options = a.extend({}, b.Defaults, this._core.options),
        this.$element.on(this._handlers)
    };
    b.Defaults = {
        nav: !1,
        navRewind: !0,
        navText: ["prev", "next"],
        navSpeed: !1,
        navElement: "div",
        navContainer: !1,
        navContainerClass: "owl-nav",
        navClass: ["owl-prev", "owl-next"],
        slideBy: 1,
        dotClass: "owl-dot",
        dotsClass: "owl-dots",
        dots: !0,
        dotsEach: !1,
        dotData: !1,
        dotsSpeed: !1,
        dotsContainer: !1,
        controlsClass: "owl-controls"
    },
    b.prototype.initialize = function() {
        var b, c, d = this._core.settings;
        d.dotsData || (this._templates = [a("<div>").addClass(d.dotClass).append(a("<span>")).prop("outerHTML")]),
        d.navContainer && d.dotsContainer || (this._controls.$container = a("<div>").addClass(d.controlsClass).appendTo(this.$element)),
        this._controls.$indicators = d.dotsContainer ? a(d.dotsContainer) : a("<div>").hide().addClass(d.dotsClass).appendTo(this._controls.$container),
        this._controls.$indicators.on("click", "div", a.proxy(function(b) {
            var c = a(b.target).parent().is(this._controls.$indicators) ? a(b.target).index() : a(b.target).parent().index();
            b.preventDefault(),
            this.to(c, d.dotsSpeed)
        }, this)),
        b = d.navContainer ? a(d.navContainer) : a("<div>").addClass(d.navContainerClass).prependTo(this._controls.$container),
        this._controls.$next = a("<" + d.navElement + ">"),
        this._controls.$previous = this._controls.$next.clone(),
        this._controls.$previous.addClass(d.navClass[0]).html(d.navText[0]).hide().prependTo(b).on("click", a.proxy(function() {
            this.prev(d.navSpeed)
        }, this)),
        this._controls.$next.addClass(d.navClass[1]).html(d.navText[1]).hide().appendTo(b).on("click", a.proxy(function() {
            this.next(d.navSpeed)
        }, this));
        for (c in this._overrides)
            this._core[c] = a.proxy(this[c], this)
    }
    ,
    b.prototype.destroy = function() {
        var a, b, c, d;
        for (a in this._handlers)
            this.$element.off(a, this._handlers[a]);
        for (b in this._controls)
            this._controls[b].remove();
        for (d in this.overides)
            this._core[d] = this._overrides[d];
        for (c in Object.getOwnPropertyNames(this))
            "function" != typeof this[c] && (this[c] = null)
    }
    ,
    b.prototype.update = function() {
        var a, b, c, d = this._core.settings, e = this._core.clones().length / 2, f = e + this._core.items().length, g = d.center || d.autoWidth || d.dotData ? 1 : d.dotsEach || d.items;
        if ("page" !== d.slideBy && (d.slideBy = Math.min(d.slideBy, d.items)),
        d.dots || "page" == d.slideBy)
            for (this._pages = [],
            a = e,
            b = 0,
            c = 0; f > a; a++)
                (b >= g || 0 === b) && (this._pages.push({
                    start: a - e,
                    end: a - e + g - 1
                }),
                b = 0,
                ++c),
                b += this._core.mergers(this._core.relative(a))
    }
    ,
    b.prototype.draw = function() {
        var b, c, d = "", e = this._core.settings, f = (this._core.$stage.children(),
        this._core.relative(this._core.current()));
        if (!e.nav || e.loop || e.navRewind || (this._controls.$previous.toggleClass("disabled", 0 >= f),
        this._controls.$next.toggleClass("disabled", f >= this._core.maximum())),
        this._controls.$previous.toggle(e.nav),
        this._controls.$next.toggle(e.nav),
        e.dots) {
            if (b = this._pages.length - this._controls.$indicators.children().length,
            e.dotData && 0 !== b) {
                for (c = 0; c < this._controls.$indicators.children().length; c++)
                    d += this._templates[this._core.relative(c)];
                this._controls.$indicators.html(d)
            } else
                b > 0 ? (d = new Array(b + 1).join(this._templates[0]),
                this._controls.$indicators.append(d)) : 0 > b && this._controls.$indicators.children().slice(b).remove();
            this._controls.$indicators.find(".active").removeClass("active"),
            this._controls.$indicators.children().eq(a.inArray(this.current(), this._pages)).addClass("active")
        }
        this._controls.$indicators.toggle(e.dots)
    }
    ,
    b.prototype.onTrigger = function(b) {
        var c = this._core.settings;
        b.page = {
            index: a.inArray(this.current(), this._pages),
            count: this._pages.length,
            size: c && (c.center || c.autoWidth || c.dotData ? 1 : c.dotsEach || c.items)
        }
    }
    ,
    b.prototype.current = function() {
        var b = this._core.relative(this._core.current());
        return a.grep(this._pages, function(a) {
            return a.start <= b && a.end >= b
        }).pop()
    }
    ,
    b.prototype.getPosition = function(b) {
        var c, d, e = this._core.settings;
        return "page" == e.slideBy ? (c = a.inArray(this.current(), this._pages),
        d = this._pages.length,
        b ? ++c : --c,
        c = this._pages[(c % d + d) % d].start) : (c = this._core.relative(this._core.current()),
        d = this._core.items().length,
        b ? c += e.slideBy : c -= e.slideBy),
        c
    }
    ,
    b.prototype.next = function(b) {
        a.proxy(this._overrides.to, this._core)(this.getPosition(!0), b)
    }
    ,
    b.prototype.prev = function(b) {
        a.proxy(this._overrides.to, this._core)(this.getPosition(!1), b)
    }
    ,
    b.prototype.to = function(b, c, d) {
        var e;
        d ? a.proxy(this._overrides.to, this._core)(b, c) : (e = this._pages.length,
        a.proxy(this._overrides.to, this._core)(this._pages[(b % e + e) % e].start, c))
    }
    ,
    a.fn.owlCarousel.Constructor.Plugins.Navigation = b
}(window.Zepto || window.jQuery, window, document),
function(a, b) {
    "use strict";
    var c = function(d) {
        this._core = d,
        this._hashes = {},
        this.$element = this._core.$element,
        this._handlers = {
            "initialized.owl.carousel": a.proxy(function() {
                "URLHash" == this._core.settings.startPosition && a(b).trigger("hashchange.owl.navigation")
            }, this),
            "prepared.owl.carousel": a.proxy(function(b) {
                var c = a(b.content).find("[data-hash]").andSelf("[data-hash]").attr("data-hash");
                this._hashes[c] = b.content
            }, this)
        },
        this._core.options = a.extend({}, c.Defaults, this._core.options),
        this.$element.on(this._handlers),
        a(b).on("hashchange.owl.navigation", a.proxy(function() {
            var a = b.location.hash.substring(1)
              , c = this._core.$stage.children()
              , d = this._hashes[a] && c.index(this._hashes[a]) || 0;
            return a ? void this._core.to(d, !1, !0) : !1
        }, this))
    };
    c.Defaults = {
        URLhashListener: !1
    },
    c.prototype.destroy = function() {
        var c, d;
        a(b).off("hashchange.owl.navigation");
        for (c in this._handlers)
            this._core.$element.off(c, this._handlers[c]);
        for (d in Object.getOwnPropertyNames(this))
            "function" != typeof this[d] && (this[d] = null)
    }
    ,
    a.fn.owlCarousel.Constructor.Plugins.Hash = c
}(window.Zepto || window.jQuery, window, document);
/*! svg.js v2.6.5 MIT*/
;!function(t, e) {
    "function" == typeof define && define.amd ? define(function() {
        return e(t, t.document)
    }) : "object" == typeof exports ? module.exports = t.document ? e(t, t.document) : function(t) {
        return e(t, t.document)
    }
    : t.SVG = e(t, t.document)
}("undefined" != typeof window ? window : this, function(t, e) {
    function i(t, e, i, n) {
        return i + n.replace(w.regex.dots, " .")
    }
    function n(t) {
        for (var e = t.slice(0), i = e.length; i--; )
            Array.isArray(e[i]) && (e[i] = n(e[i]));
        return e
    }
    function r(t, e) {
        return t instanceof e
    }
    function s(t, e) {
        return (t.matches || t.matchesSelector || t.msMatchesSelector || t.mozMatchesSelector || t.webkitMatchesSelector || t.oMatchesSelector).call(t, e)
    }
    function o(t) {
        return t.toLowerCase().replace(/-(.)/g, function(t, e) {
            return e.toUpperCase()
        })
    }
    function a(t) {
        return t.charAt(0).toUpperCase() + t.slice(1)
    }
    function h(t) {
        return 4 == t.length ? ["#", t.substring(1, 2), t.substring(1, 2), t.substring(2, 3), t.substring(2, 3), t.substring(3, 4), t.substring(3, 4)].join("") : t
    }
    function u(t) {
        var e = t.toString(16);
        return 1 == e.length ? "0" + e : e
    }
    function l(t, e, i) {
        if (null == e || null == i) {
            var n = t.bbox();
            null == e ? e = n.width / n.height * i : null == i && (i = n.height / n.width * e)
        }
        return {
            width: e,
            height: i
        }
    }
    function c(t, e, i) {
        return {
            x: e * t.a + i * t.c + 0,
            y: e * t.b + i * t.d + 0
        }
    }
    function f(t) {
        return {
            a: t[0],
            b: t[1],
            c: t[2],
            d: t[3],
            e: t[4],
            f: t[5]
        }
    }
    function d(t) {
        return t instanceof w.Matrix || (t = new w.Matrix(t)),
        t
    }
    function p(t, e) {
        t.cx = null == t.cx ? e.bbox().cx : t.cx,
        t.cy = null == t.cy ? e.bbox().cy : t.cy
    }
    function m(t) {
        for (var e = 0, i = t.length, n = ""; e < i; e++)
            n += t[e][0],
            null != t[e][1] && (n += t[e][1],
            null != t[e][2] && (n += " ",
            n += t[e][2],
            null != t[e][3] && (n += " ",
            n += t[e][3],
            n += " ",
            n += t[e][4],
            null != t[e][5] && (n += " ",
            n += t[e][5],
            n += " ",
            n += t[e][6],
            null != t[e][7] && (n += " ",
            n += t[e][7])))));
        return n + " "
    }
    function x(e) {
        for (var i = e.childNodes.length - 1; i >= 0; i--)
            e.childNodes[i]instanceof t.SVGElement && x(e.childNodes[i]);
        return w.adopt(e).id(w.eid(e.nodeName))
    }
    function y(t) {
        return null == t.x && (t.x = 0,
        t.y = 0,
        t.width = 0,
        t.height = 0),
        t.w = t.width,
        t.h = t.height,
        t.x2 = t.x + t.width,
        t.y2 = t.y + t.height,
        t.cx = t.x + t.width / 2,
        t.cy = t.y + t.height / 2,
        t
    }
    function v(t) {
        var e = (t || "").toString().match(w.regex.reference);
        if (e)
            return e[1]
    }
    function g(t) {
        return Math.abs(t) > 1e-37 ? t : 0
    }
    var w = this.SVG = function(t) {
        if (w.supported)
            return t = new w.Doc(t),
            w.parser.draw || w.prepare(),
            t
    }
    ;
    if (w.ns = "http://www.w3.org/2000/svg",
    w.xmlns = "http://www.w3.org/2000/xmlns/",
    w.xlink = "http://www.w3.org/1999/xlink",
    w.svgjs = "http://svgjs.com/svgjs",
    w.supported = function() {
        return !!e.createElementNS && !!e.createElementNS(w.ns, "svg").createSVGRect
    }(),
    !w.supported)
        return !1;
    w.did = 1e3,
    w.eid = function(t) {
        return "Svgjs" + a(t) + w.did++
    }
    ,
    w.create = function(t) {
        var i = e.createElementNS(this.ns, t);
        return i.setAttribute("id", this.eid(t)),
        i
    }
    ,
    w.extend = function() {
        var t, e, i, n;
        for (t = [].slice.call(arguments),
        e = t.pop(),
        n = t.length - 1; n >= 0; n--)
            if (t[n])
                for (i in e)
                    t[n].prototype[i] = e[i];
        w.Set && w.Set.inherit && w.Set.inherit()
    }
    ,
    w.invent = function(t) {
        var e = "function" == typeof t.create ? t.create : function() {
            this.constructor.call(this, w.create(t.create))
        }
        ;
        return t.inherit && (e.prototype = new t.inherit),
        t.extend && w.extend(e, t.extend),
        t.construct && w.extend(t.parent || w.Container, t.construct),
        e
    }
    ,
    w.adopt = function(e) {
        if (!e)
            return null;
        if (e.instance)
            return e.instance;
        var i;
        return i = "svg" == e.nodeName ? e.parentNode instanceof t.SVGElement ? new w.Nested : new w.Doc : "linearGradient" == e.nodeName ? new w.Gradient("linear") : "radialGradient" == e.nodeName ? new w.Gradient("radial") : w[a(e.nodeName)] ? new (w[a(e.nodeName)]) : new w.Element(e),
        i.type = e.nodeName,
        i.node = e,
        e.instance = i,
        i instanceof w.Doc && i.namespace().defs(),
        i.setData(JSON.parse(e.getAttribute("svgjs:data")) || {}),
        i
    }
    ,
    w.prepare = function() {
        var t = e.getElementsByTagName("body")[0]
          , i = (t ? new w.Doc(t) : w.adopt(e.documentElement).nested()).size(2, 0);
        w.parser = {
            body: t || e.documentElement,
            draw: i.style("opacity:0;position:absolute;left:-100%;top:-100%;overflow:hidden").node,
            poly: i.polyline().node,
            path: i.path().node,
            native: w.create("svg")
        }
    }
    ,
    w.parser = {
        native: w.create("svg")
    },
    e.addEventListener("DOMContentLoaded", function() {
        w.parser.draw || w.prepare()
    }, !1),
    w.regex = {
        numberAndUnit: /^([+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?)([a-z%]*)$/i,
        hex: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
        rgb: /rgb\((\d+),(\d+),(\d+)\)/,
        reference: /#([a-z0-9\-_]+)/i,
        transforms: /\)\s*,?\s*/,
        whitespace: /\s/g,
        isHex: /^#[a-f0-9]{3,6}$/i,
        isRgb: /^rgb\(/,
        isCss: /[^:]+:[^;]+;?/,
        isBlank: /^(\s+)?$/,
        isNumber: /^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        isPercent: /^-?[\d\.]+%$/,
        isImage: /\.(jpg|jpeg|png|gif|svg)(\?[^=]+.*)?/i,
        delimiter: /[\s,]+/,
        hyphen: /([^e])\-/gi,
        pathLetters: /[MLHVCSQTAZ]/gi,
        isPathLetter: /[MLHVCSQTAZ]/i,
        numbersWithDots: /((\d?\.\d+(?:e[+-]?\d+)?)((?:\.\d+(?:e[+-]?\d+)?)+))+/gi,
        dots: /\./g
    },
    w.utils = {
        map: function(t, e) {
            var i, n = t.length, r = [];
            for (i = 0; i < n; i++)
                r.push(e(t[i]));
            return r
        },
        filter: function(t, e) {
            var i, n = t.length, r = [];
            for (i = 0; i < n; i++)
                e(t[i]) && r.push(t[i]);
            return r
        },
        radians: function(t) {
            return t % 360 * Math.PI / 180
        },
        degrees: function(t) {
            return 180 * t / Math.PI % 360
        },
        filterSVGElements: function(e) {
            return this.filter(e, function(e) {
                return e instanceof t.SVGElement
            })
        }
    },
    w.defaults = {
        attrs: {
            "fill-opacity": 1,
            "stroke-opacity": 1,
            "stroke-width": 0,
            "stroke-linejoin": "miter",
            "stroke-linecap": "butt",
            fill: "#000000",
            stroke: "#000000",
            opacity: 1,
            x: 0,
            y: 0,
            cx: 0,
            cy: 0,
            width: 0,
            height: 0,
            r: 0,
            rx: 0,
            ry: 0,
            offset: 0,
            "stop-opacity": 1,
            "stop-color": "#000000",
            "font-size": 16,
            "font-family": "Helvetica, Arial, sans-serif",
            "text-anchor": "start"
        }
    },
    w.Color = function(t) {
        var e;
        this.r = 0,
        this.g = 0,
        this.b = 0,
        t && ("string" == typeof t ? w.regex.isRgb.test(t) ? (e = w.regex.rgb.exec(t.replace(w.regex.whitespace, "")),
        this.r = parseInt(e[1]),
        this.g = parseInt(e[2]),
        this.b = parseInt(e[3])) : w.regex.isHex.test(t) && (e = w.regex.hex.exec(h(t)),
        this.r = parseInt(e[1], 16),
        this.g = parseInt(e[2], 16),
        this.b = parseInt(e[3], 16)) : "object" == typeof t && (this.r = t.r,
        this.g = t.g,
        this.b = t.b))
    }
    ,
    w.extend(w.Color, {
        toString: function() {
            return this.toHex()
        },
        toHex: function() {
            return "#" + u(this.r) + u(this.g) + u(this.b)
        },
        toRgb: function() {
            return "rgb(" + [this.r, this.g, this.b].join() + ")"
        },
        brightness: function() {
            return this.r / 255 * .3 + this.g / 255 * .59 + this.b / 255 * .11
        },
        morph: function(t) {
            return this.destination = new w.Color(t),
            this
        },
        at: function(t) {
            return this.destination ? (t = t < 0 ? 0 : t > 1 ? 1 : t,
            new w.Color({
                r: ~~(this.r + (this.destination.r - this.r) * t),
                g: ~~(this.g + (this.destination.g - this.g) * t),
                b: ~~(this.b + (this.destination.b - this.b) * t)
            })) : this
        }
    }),
    w.Color.test = function(t) {
        return t += "",
        w.regex.isHex.test(t) || w.regex.isRgb.test(t)
    }
    ,
    w.Color.isRgb = function(t) {
        return t && "number" == typeof t.r && "number" == typeof t.g && "number" == typeof t.b
    }
    ,
    w.Color.isColor = function(t) {
        return w.Color.isRgb(t) || w.Color.test(t)
    }
    ,
    w.Array = function(t, e) {
        t = (t || []).valueOf(),
        0 == t.length && e && (t = e.valueOf()),
        this.value = this.parse(t)
    }
    ,
    w.extend(w.Array, {
        morph: function(t) {
            if (this.destination = this.parse(t),
            this.value.length != this.destination.length) {
                for (var e = this.value[this.value.length - 1], i = this.destination[this.destination.length - 1]; this.value.length > this.destination.length; )
                    this.destination.push(i);
                for (; this.value.length < this.destination.length; )
                    this.value.push(e)
            }
            return this
        },
        settle: function() {
            for (var t = 0, e = this.value.length, i = []; t < e; t++)
                -1 == i.indexOf(this.value[t]) && i.push(this.value[t]);
            return this.value = i
        },
        at: function(t) {
            if (!this.destination)
                return this;
            for (var e = 0, i = this.value.length, n = []; e < i; e++)
                n.push(this.value[e] + (this.destination[e] - this.value[e]) * t);
            return new w.Array(n)
        },
        toString: function() {
            return this.value.join(" ")
        },
        valueOf: function() {
            return this.value
        },
        parse: function(t) {
            return t = t.valueOf(),
            Array.isArray(t) ? t : this.split(t)
        },
        split: function(t) {
            return t.trim().split(w.regex.delimiter).map(parseFloat)
        },
        reverse: function() {
            return this.value.reverse(),
            this
        },
        clone: function() {
            var t = new this.constructor;
            return t.value = n(this.value),
            t
        }
    }),
    w.PointArray = function(t, e) {
        w.Array.call(this, t, e || [[0, 0]])
    }
    ,
    w.PointArray.prototype = new w.Array,
    w.PointArray.prototype.constructor = w.PointArray,
    w.extend(w.PointArray, {
        toString: function() {
            for (var t = 0, e = this.value.length, i = []; t < e; t++)
                i.push(this.value[t].join(","));
            return i.join(" ")
        },
        toLine: function() {
            return {
                x1: this.value[0][0],
                y1: this.value[0][1],
                x2: this.value[1][0],
                y2: this.value[1][1]
            }
        },
        at: function(t) {
            if (!this.destination)
                return this;
            for (var e = 0, i = this.value.length, n = []; e < i; e++)
                n.push([this.value[e][0] + (this.destination[e][0] - this.value[e][0]) * t, this.value[e][1] + (this.destination[e][1] - this.value[e][1]) * t]);
            return new w.PointArray(n)
        },
        parse: function(t) {
            var e = [];
            if (t = t.valueOf(),
            Array.isArray(t)) {
                if (Array.isArray(t[0]))
                    return t.map(function(t) {
                        return t.slice()
                    });
                if (null != t[0].x)
                    return t.map(function(t) {
                        return [t.x, t.y]
                    })
            } else
                t = t.trim().split(w.regex.delimiter).map(parseFloat);
            t.length % 2 != 0 && t.pop();
            for (var i = 0, n = t.length; i < n; i += 2)
                e.push([t[i], t[i + 1]]);
            return e
        },
        move: function(t, e) {
            var i = this.bbox();
            if (t -= i.x,
            e -= i.y,
            !isNaN(t) && !isNaN(e))
                for (var n = this.value.length - 1; n >= 0; n--)
                    this.value[n] = [this.value[n][0] + t, this.value[n][1] + e];
            return this
        },
        size: function(t, e) {
            var i, n = this.bbox();
            for (i = this.value.length - 1; i >= 0; i--)
                n.width && (this.value[i][0] = (this.value[i][0] - n.x) * t / n.width + n.x),
                n.height && (this.value[i][1] = (this.value[i][1] - n.y) * e / n.height + n.y);
            return this
        },
        bbox: function() {
            return w.parser.poly.setAttribute("points", this.toString()),
            w.parser.poly.getBBox()
        }
    });
    for (var b = {
        M: function(t, e, i) {
            return e.x = i.x = t[0],
            e.y = i.y = t[1],
            ["M", e.x, e.y]
        },
        L: function(t, e) {
            return e.x = t[0],
            e.y = t[1],
            ["L", t[0], t[1]]
        },
        H: function(t, e) {
            return e.x = t[0],
            ["H", t[0]]
        },
        V: function(t, e) {
            return e.y = t[0],
            ["V", t[0]]
        },
        C: function(t, e) {
            return e.x = t[4],
            e.y = t[5],
            ["C", t[0], t[1], t[2], t[3], t[4], t[5]]
        },
        S: function(t, e) {
            return e.x = t[2],
            e.y = t[3],
            ["S", t[0], t[1], t[2], t[3]]
        },
        Q: function(t, e) {
            return e.x = t[2],
            e.y = t[3],
            ["Q", t[0], t[1], t[2], t[3]]
        },
        T: function(t, e) {
            return e.x = t[0],
            e.y = t[1],
            ["T", t[0], t[1]]
        },
        Z: function(t, e, i) {
            return e.x = i.x,
            e.y = i.y,
            ["Z"]
        },
        A: function(t, e) {
            return e.x = t[5],
            e.y = t[6],
            ["A", t[0], t[1], t[2], t[3], t[4], t[5], t[6]]
        }
    }, C = "mlhvqtcsaz".split(""), N = 0, A = C.length; N < A; ++N)
        b[C[N]] = function(t) {
            return function(e, i, n) {
                if ("H" == t)
                    e[0] = e[0] + i.x;
                else if ("V" == t)
                    e[0] = e[0] + i.y;
                else if ("A" == t)
                    e[5] = e[5] + i.x,
                    e[6] = e[6] + i.y;
                else
                    for (var r = 0, s = e.length; r < s; ++r)
                        e[r] = e[r] + (r % 2 ? i.y : i.x);
                return b[t](e, i, n)
            }
        }(C[N].toUpperCase());
    w.PathArray = function(t, e) {
        w.Array.call(this, t, e || [["M", 0, 0]])
    }
    ,
    w.PathArray.prototype = new w.Array,
    w.PathArray.prototype.constructor = w.PathArray,
    w.extend(w.PathArray, {
        toString: function() {
            return m(this.value)
        },
        move: function(t, e) {
            var i = this.bbox();
            if (t -= i.x,
            e -= i.y,
            !isNaN(t) && !isNaN(e))
                for (var n, r = this.value.length - 1; r >= 0; r--)
                    n = this.value[r][0],
                    "M" == n || "L" == n || "T" == n ? (this.value[r][1] += t,
                    this.value[r][2] += e) : "H" == n ? this.value[r][1] += t : "V" == n ? this.value[r][1] += e : "C" == n || "S" == n || "Q" == n ? (this.value[r][1] += t,
                    this.value[r][2] += e,
                    this.value[r][3] += t,
                    this.value[r][4] += e,
                    "C" == n && (this.value[r][5] += t,
                    this.value[r][6] += e)) : "A" == n && (this.value[r][6] += t,
                    this.value[r][7] += e);
            return this
        },
        size: function(t, e) {
            var i, n, r = this.bbox();
            for (i = this.value.length - 1; i >= 0; i--)
                n = this.value[i][0],
                "M" == n || "L" == n || "T" == n ? (this.value[i][1] = (this.value[i][1] - r.x) * t / r.width + r.x,
                this.value[i][2] = (this.value[i][2] - r.y) * e / r.height + r.y) : "H" == n ? this.value[i][1] = (this.value[i][1] - r.x) * t / r.width + r.x : "V" == n ? this.value[i][1] = (this.value[i][1] - r.y) * e / r.height + r.y : "C" == n || "S" == n || "Q" == n ? (this.value[i][1] = (this.value[i][1] - r.x) * t / r.width + r.x,
                this.value[i][2] = (this.value[i][2] - r.y) * e / r.height + r.y,
                this.value[i][3] = (this.value[i][3] - r.x) * t / r.width + r.x,
                this.value[i][4] = (this.value[i][4] - r.y) * e / r.height + r.y,
                "C" == n && (this.value[i][5] = (this.value[i][5] - r.x) * t / r.width + r.x,
                this.value[i][6] = (this.value[i][6] - r.y) * e / r.height + r.y)) : "A" == n && (this.value[i][1] = this.value[i][1] * t / r.width,
                this.value[i][2] = this.value[i][2] * e / r.height,
                this.value[i][6] = (this.value[i][6] - r.x) * t / r.width + r.x,
                this.value[i][7] = (this.value[i][7] - r.y) * e / r.height + r.y);
            return this
        },
        equalCommands: function(t) {
            var e, i, n;
            for (t = new w.PathArray(t),
            n = this.value.length === t.value.length,
            e = 0,
            i = this.value.length; n && e < i; e++)
                n = this.value[e][0] === t.value[e][0];
            return n
        },
        morph: function(t) {
            return t = new w.PathArray(t),
            this.equalCommands(t) ? this.destination = t : this.destination = null,
            this
        },
        at: function(t) {
            if (!this.destination)
                return this;
            var e, i, n, r, s = this.value, o = this.destination.value, a = [], h = new w.PathArray;
            for (e = 0,
            i = s.length; e < i; e++) {
                for (a[e] = [s[e][0]],
                n = 1,
                r = s[e].length; n < r; n++)
                    a[e][n] = s[e][n] + (o[e][n] - s[e][n]) * t;
                "A" === a[e][0] && (a[e][4] = +(0 != a[e][4]),
                a[e][5] = +(0 != a[e][5]))
            }
            return h.value = a,
            h
        },
        parse: function(t) {
            if (t instanceof w.PathArray)
                return t.valueOf();
            var e, n, r = {
                M: 2,
                L: 2,
                H: 1,
                V: 1,
                C: 6,
                S: 4,
                Q: 4,
                T: 2,
                A: 7,
                Z: 0
            };
            t = "string" == typeof t ? t.replace(w.regex.numbersWithDots, i).replace(w.regex.pathLetters, " $& ").replace(w.regex.hyphen, "$1 -").trim().split(w.regex.delimiter) : t.reduce(function(t, e) {
                return [].concat.call(t, e)
            }, []);
            var n = []
              , s = new w.Point
              , o = new w.Point
              , a = 0
              , h = t.length;
            do {
                w.regex.isPathLetter.test(t[a]) ? (e = t[a],
                ++a) : "M" == e ? e = "L" : "m" == e && (e = "l"),
                n.push(b[e].call(null, t.slice(a, a += r[e.toUpperCase()]).map(parseFloat), s, o))
            } while (h > a);return n
        },
        bbox: function() {
            return w.parser.path.setAttribute("d", this.toString()),
            w.parser.path.getBBox()
        }
    }),
    w.Number = w.invent({
        create: function(t, e) {
            this.value = 0,
            this.unit = e || "",
            "number" == typeof t ? this.value = isNaN(t) ? 0 : isFinite(t) ? t : t < 0 ? -3.4e38 : 3.4e38 : "string" == typeof t ? (e = t.match(w.regex.numberAndUnit)) && (this.value = parseFloat(e[1]),
            "%" == e[5] ? this.value /= 100 : "s" == e[5] && (this.value *= 1e3),
            this.unit = e[5]) : t instanceof w.Number && (this.value = t.valueOf(),
            this.unit = t.unit)
        },
        extend: {
            toString: function() {
                return ("%" == this.unit ? ~~(1e8 * this.value) / 1e6 : "s" == this.unit ? this.value / 1e3 : this.value) + this.unit
            },
            toJSON: function() {
                return this.toString()
            },
            valueOf: function() {
                return this.value
            },
            plus: function(t) {
                return t = new w.Number(t),
                new w.Number(this + t,this.unit || t.unit)
            },
            minus: function(t) {
                return t = new w.Number(t),
                new w.Number(this - t,this.unit || t.unit)
            },
            times: function(t) {
                return t = new w.Number(t),
                new w.Number(this * t,this.unit || t.unit)
            },
            divide: function(t) {
                return t = new w.Number(t),
                new w.Number(this / t,this.unit || t.unit)
            },
            to: function(t) {
                var e = new w.Number(this);
                return "string" == typeof t && (e.unit = t),
                e
            },
            morph: function(t) {
                return this.destination = new w.Number(t),
                t.relative && (this.destination.value += this.value),
                this
            },
            at: function(t) {
                return this.destination ? new w.Number(this.destination).minus(this).times(t).plus(this) : this
            }
        }
    }),
    w.Element = w.invent({
        create: function(t) {
            this._stroke = w.defaults.attrs.stroke,
            this._event = null,
            this.dom = {},
            (this.node = t) && (this.type = t.nodeName,
            this.node.instance = this,
            this._stroke = t.getAttribute("stroke") || this._stroke)
        },
        extend: {
            x: function(t) {
                return this.attr("x", t)
            },
            y: function(t) {
                return this.attr("y", t)
            },
            cx: function(t) {
                return null == t ? this.x() + this.width() / 2 : this.x(t - this.width() / 2)
            },
            cy: function(t) {
                return null == t ? this.y() + this.height() / 2 : this.y(t - this.height() / 2)
            },
            move: function(t, e) {
                return this.x(t).y(e)
            },
            center: function(t, e) {
                return this.cx(t).cy(e)
            },
            width: function(t) {
                return this.attr("width", t)
            },
            height: function(t) {
                return this.attr("height", t)
            },
            size: function(t, e) {
                var i = l(this, t, e);
                return this.width(new w.Number(i.width)).height(new w.Number(i.height))
            },
            clone: function(t) {
                this.writeDataToDom();
                var e = x(this.node.cloneNode(!0));
                return t ? t.add(e) : this.after(e),
                e
            },
            remove: function() {
                return this.parent() && this.parent().removeElement(this),
                this
            },
            replace: function(t) {
                return this.after(t).remove(),
                t
            },
            addTo: function(t) {
                return t.put(this)
            },
            putIn: function(t) {
                return t.add(this)
            },
            id: function(t) {
                return this.attr("id", t)
            },
            inside: function(t, e) {
                var i = this.bbox();
                return t > i.x && e > i.y && t < i.x + i.width && e < i.y + i.height
            },
            show: function() {
                return this.style("display", "")
            },
            hide: function() {
                return this.style("display", "none")
            },
            visible: function() {
                return "none" != this.style("display")
            },
            toString: function() {
                return this.attr("id")
            },
            classes: function() {
                var t = this.attr("class");
                return null == t ? [] : t.trim().split(w.regex.delimiter)
            },
            hasClass: function(t) {
                return -1 != this.classes().indexOf(t)
            },
            addClass: function(t) {
                if (!this.hasClass(t)) {
                    var e = this.classes();
                    e.push(t),
                    this.attr("class", e.join(" "))
                }
                return this
            },
            removeClass: function(t) {
                return this.hasClass(t) && this.attr("class", this.classes().filter(function(e) {
                    return e != t
                }).join(" ")),
                this
            },
            toggleClass: function(t) {
                return this.hasClass(t) ? this.removeClass(t) : this.addClass(t)
            },
            reference: function(t) {
                return w.get(this.attr(t))
            },
            parent: function(e) {
                var i = this;
                if (!i.node.parentNode)
                    return null;
                if (i = w.adopt(i.node.parentNode),
                !e)
                    return i;
                for (; i && i.node instanceof t.SVGElement; ) {
                    if ("string" == typeof e ? i.matches(e) : i instanceof e)
                        return i;
                    if (!i.node.parentNode || "#document" == i.node.parentNode.nodeName)
                        return null;
                    i = w.adopt(i.node.parentNode)
                }
            },
            doc: function() {
                return this instanceof w.Doc ? this : this.parent(w.Doc)
            },
            parents: function(t) {
                var e = []
                  , i = this;
                do {
                    if (!(i = i.parent(t)) || !i.node)
                        break;
                    e.push(i)
                } while (i.parent);return e
            },
            matches: function(t) {
                return s(this.node, t)
            },
            native: function() {
                return this.node
            },
            svg: function(t) {
                var i = e.createElement("svg");
                if (!(t && this instanceof w.Parent))
                    return i.appendChild(t = e.createElement("svg")),
                    this.writeDataToDom(),
                    t.appendChild(this.node.cloneNode(!0)),
                    i.innerHTML.replace(/^<svg>/, "").replace(/<\/svg>$/, "");
                i.innerHTML = "<svg>" + t.replace(/\n/, "").replace(/<([\w:-]+)([^<]+?)\/>/g, "<$1$2></$1>") + "</svg>";
                for (var n = 0, r = i.firstChild.childNodes.length; n < r; n++)
                    this.node.appendChild(i.firstChild.firstChild);
                return this
            },
            writeDataToDom: function() {
                if (this.each || this.lines) {
                    (this.each ? this : this.lines()).each(function() {
                        this.writeDataToDom()
                    })
                }
                return this.node.removeAttribute("svgjs:data"),
                Object.keys(this.dom).length && this.node.setAttribute("svgjs:data", JSON.stringify(this.dom)),
                this
            },
            setData: function(t) {
                return this.dom = t,
                this
            },
            is: function(t) {
                return r(this, t)
            }
        }
    }),
    w.easing = {
        "-": function(t) {
            return t
        },
        "<>": function(t) {
            return -Math.cos(t * Math.PI) / 2 + .5
        },
        ">": function(t) {
            return Math.sin(t * Math.PI / 2)
        },
        "<": function(t) {
            return 1 - Math.cos(t * Math.PI / 2)
        }
    },
    w.morph = function(t) {
        return function(e, i) {
            return new w.MorphObj(e,i).at(t)
        }
    }
    ,
    w.Situation = w.invent({
        create: function(t) {
            this.init = !1,
            this.reversed = !1,
            this.reversing = !1,
            this.duration = new w.Number(t.duration).valueOf(),
            this.delay = new w.Number(t.delay).valueOf(),
            this.start = +new Date + this.delay,
            this.finish = this.start + this.duration,
            this.ease = t.ease,
            this.loop = 0,
            this.loops = !1,
            this.animations = {},
            this.attrs = {},
            this.styles = {},
            this.transforms = [],
            this.once = {}
        }
    }),
    w.FX = w.invent({
        create: function(t) {
            this._target = t,
            this.situations = [],
            this.active = !1,
            this.situation = null,
            this.paused = !1,
            this.lastPos = 0,
            this.pos = 0,
            this.absPos = 0,
            this._speed = 1
        },
        extend: {
            animate: function(t, e, i) {
                "object" == typeof t && (e = t.ease,
                i = t.delay,
                t = t.duration);
                var n = new w.Situation({
                    duration: t || 1e3,
                    delay: i || 0,
                    ease: w.easing[e || "-"] || e
                });
                return this.queue(n),
                this
            },
            delay: function(t) {
                var e = new w.Situation({
                    duration: t,
                    delay: 0,
                    ease: w.easing["-"]
                });
                return this.queue(e)
            },
            target: function(t) {
                return t && t instanceof w.Element ? (this._target = t,
                this) : this._target
            },
            timeToAbsPos: function(t) {
                return (t - this.situation.start) / (this.situation.duration / this._speed)
            },
            absPosToTime: function(t) {
                return this.situation.duration / this._speed * t + this.situation.start
            },
            startAnimFrame: function() {
                this.stopAnimFrame(),
                this.animationFrame = t.requestAnimationFrame(function() {
                    this.step()
                }
                .bind(this))
            },
            stopAnimFrame: function() {
                t.cancelAnimationFrame(this.animationFrame)
            },
            start: function() {
                return !this.active && this.situation && (this.active = !0,
                this.startCurrent()),
                this
            },
            startCurrent: function() {
                return this.situation.start = +new Date + this.situation.delay / this._speed,
                this.situation.finish = this.situation.start + this.situation.duration / this._speed,
                this.initAnimations().step()
            },
            queue: function(t) {
                return ("function" == typeof t || t instanceof w.Situation) && this.situations.push(t),
                this.situation || (this.situation = this.situations.shift()),
                this
            },
            dequeue: function() {
                return this.stop(),
                this.situation = this.situations.shift(),
                this.situation && (this.situation instanceof w.Situation ? this.start() : this.situation.call(this)),
                this
            },
            initAnimations: function() {
                var t, e, i, n = this.situation;
                if (n.init)
                    return this;
                for (t in n.animations)
                    for (i = this.target()[t](),
                    Array.isArray(i) || (i = [i]),
                    Array.isArray(n.animations[t]) || (n.animations[t] = [n.animations[t]]),
                    e = i.length; e--; )
                        n.animations[t][e]instanceof w.Number && (i[e] = new w.Number(i[e])),
                        n.animations[t][e] = i[e].morph(n.animations[t][e]);
                for (t in n.attrs)
                    n.attrs[t] = new w.MorphObj(this.target().attr(t),n.attrs[t]);
                for (t in n.styles)
                    n.styles[t] = new w.MorphObj(this.target().style(t),n.styles[t]);
                return n.initialTransformation = this.target().matrixify(),
                n.init = !0,
                this
            },
            clearQueue: function() {
                return this.situations = [],
                this
            },
            clearCurrent: function() {
                return this.situation = null,
                this
            },
            stop: function(t, e) {
                var i = this.active;
                return this.active = !1,
                e && this.clearQueue(),
                t && this.situation && (!i && this.startCurrent(),
                this.atEnd()),
                this.stopAnimFrame(),
                this.clearCurrent()
            },
            reset: function() {
                if (this.situation) {
                    var t = this.situation;
                    this.stop(),
                    this.situation = t,
                    this.atStart()
                }
                return this
            },
            finish: function() {
                for (this.stop(!0, !1); this.dequeue().situation && this.stop(!0, !1); )
                    ;
                return this.clearQueue().clearCurrent(),
                this
            },
            atStart: function() {
                return this.at(0, !0)
            },
            atEnd: function() {
                return !0 === this.situation.loops && (this.situation.loops = this.situation.loop + 1),
                "number" == typeof this.situation.loops ? this.at(this.situation.loops, !0) : this.at(1, !0)
            },
            at: function(t, e) {
                var i = this.situation.duration / this._speed;
                return this.absPos = t,
                e || (this.situation.reversed && (this.absPos = 1 - this.absPos),
                this.absPos += this.situation.loop),
                this.situation.start = +new Date - this.absPos * i,
                this.situation.finish = this.situation.start + i,
                this.step(!0)
            },
            speed: function(t) {
                return 0 === t ? this.pause() : t ? (this._speed = t,
                this.at(this.absPos, !0)) : this._speed
            },
            loop: function(t, e) {
                var i = this.last();
                return i.loops = null == t || t,
                i.loop = 0,
                e && (i.reversing = !0),
                this
            },
            pause: function() {
                return this.paused = !0,
                this.stopAnimFrame(),
                this
            },
            play: function() {
                return this.paused ? (this.paused = !1,
                this.at(this.absPos, !0)) : this
            },
            reverse: function(t) {
                var e = this.last();
                return e.reversed = void 0 === t ? !e.reversed : t,
                this
            },
            progress: function(t) {
                return t ? this.situation.ease(this.pos) : this.pos
            },
            after: function(t) {
                var e = this.last()
                  , i = function i(n) {
                    n.detail.situation == e && (t.call(this, e),
                    this.off("finished.fx", i))
                };
                return this.target().on("finished.fx", i),
                this._callStart()
            },
            during: function(t) {
                var e = this.last()
                  , i = function(i) {
                    i.detail.situation == e && t.call(this, i.detail.pos, w.morph(i.detail.pos), i.detail.eased, e)
                };
                return this.target().off("during.fx", i).on("during.fx", i),
                this.after(function() {
                    this.off("during.fx", i)
                }),
                this._callStart()
            },
            afterAll: function(t) {
                var e = function e(i) {
                    t.call(this),
                    this.off("allfinished.fx", e)
                };
                return this.target().off("allfinished.fx", e).on("allfinished.fx", e),
                this._callStart()
            },
            duringAll: function(t) {
                var e = function(e) {
                    t.call(this, e.detail.pos, w.morph(e.detail.pos), e.detail.eased, e.detail.situation)
                };
                return this.target().off("during.fx", e).on("during.fx", e),
                this.afterAll(function() {
                    this.off("during.fx", e)
                }),
                this._callStart()
            },
            last: function() {
                return this.situations.length ? this.situations[this.situations.length - 1] : this.situation
            },
            add: function(t, e, i) {
                return this.last()[i || "animations"][t] = e,
                this._callStart()
            },
            step: function(t) {
                if (t || (this.absPos = this.timeToAbsPos(+new Date)),
                !1 !== this.situation.loops) {
                    var e, i, n;
                    e = Math.max(this.absPos, 0),
                    i = Math.floor(e),
                    !0 === this.situation.loops || i < this.situation.loops ? (this.pos = e - i,
                    n = this.situation.loop,
                    this.situation.loop = i) : (this.absPos = this.situation.loops,
                    this.pos = 1,
                    n = this.situation.loop - 1,
                    this.situation.loop = this.situation.loops),
                    this.situation.reversing && (this.situation.reversed = this.situation.reversed != Boolean((this.situation.loop - n) % 2))
                } else
                    this.absPos = Math.min(this.absPos, 1),
                    this.pos = this.absPos;
                this.pos < 0 && (this.pos = 0),
                this.situation.reversed && (this.pos = 1 - this.pos);
                var r = this.situation.ease(this.pos);
                for (var s in this.situation.once)
                    s > this.lastPos && s <= r && (this.situation.once[s].call(this.target(), this.pos, r),
                    delete this.situation.once[s]);
                return this.active && this.target().fire("during", {
                    pos: this.pos,
                    eased: r,
                    fx: this,
                    situation: this.situation
                }),
                this.situation ? (this.eachAt(),
                1 == this.pos && !this.situation.reversed || this.situation.reversed && 0 == this.pos ? (this.stopAnimFrame(),
                this.target().fire("finished", {
                    fx: this,
                    situation: this.situation
                }),
                this.situations.length || (this.target().fire("allfinished"),
                this.situations.length || (this.target().off(".fx"),
                this.active = !1)),
                this.active ? this.dequeue() : this.clearCurrent()) : !this.paused && this.active && this.startAnimFrame(),
                this.lastPos = r,
                this) : this
            },
            eachAt: function() {
                var t, e, i, n = this, r = this.target(), s = this.situation;
                for (t in s.animations)
                    i = [].concat(s.animations[t]).map(function(t) {
                        return "string" != typeof t && t.at ? t.at(s.ease(n.pos), n.pos) : t
                    }),
                    r[t].apply(r, i);
                for (t in s.attrs)
                    i = [t].concat(s.attrs[t]).map(function(t) {
                        return "string" != typeof t && t.at ? t.at(s.ease(n.pos), n.pos) : t
                    }),
                    r.attr.apply(r, i);
                for (t in s.styles)
                    i = [t].concat(s.styles[t]).map(function(t) {
                        return "string" != typeof t && t.at ? t.at(s.ease(n.pos), n.pos) : t
                    }),
                    r.style.apply(r, i);
                if (s.transforms.length) {
                    for (i = s.initialTransformation,
                    t = 0,
                    e = s.transforms.length; t < e; t++) {
                        var o = s.transforms[t];
                        o instanceof w.Matrix ? i = o.relative ? i.multiply((new w.Matrix).morph(o).at(s.ease(this.pos))) : i.morph(o).at(s.ease(this.pos)) : (o.relative || o.undo(i.extract()),
                        i = i.multiply(o.at(s.ease(this.pos))))
                    }
                    r.matrix(i)
                }
                return this
            },
            once: function(t, e, i) {
                var n = this.last();
                return i || (t = n.ease(t)),
                n.once[t] = e,
                this
            },
            _callStart: function() {
                return setTimeout(function() {
                    this.start()
                }
                .bind(this), 0),
                this
            }
        },
        parent: w.Element,
        construct: {
            animate: function(t, e, i) {
                return (this.fx || (this.fx = new w.FX(this))).animate(t, e, i)
            },
            delay: function(t) {
                return (this.fx || (this.fx = new w.FX(this))).delay(t)
            },
            stop: function(t, e) {
                return this.fx && this.fx.stop(t, e),
                this
            },
            finish: function() {
                return this.fx && this.fx.finish(),
                this
            },
            pause: function() {
                return this.fx && this.fx.pause(),
                this
            },
            play: function() {
                return this.fx && this.fx.play(),
                this
            },
            speed: function(t) {
                if (this.fx) {
                    if (null == t)
                        return this.fx.speed();
                    this.fx.speed(t)
                }
                return this
            }
        }
    }),
    w.MorphObj = w.invent({
        create: function(t, e) {
            return w.Color.isColor(e) ? new w.Color(t).morph(e) : w.regex.delimiter.test(t) ? w.regex.pathLetters.test(t) ? new w.PathArray(t).morph(e) : new w.Array(t).morph(e) : w.regex.numberAndUnit.test(e) ? new w.Number(t).morph(e) : (this.value = t,
            void (this.destination = e))
        },
        extend: {
            at: function(t, e) {
                return e < 1 ? this.value : this.destination
            },
            valueOf: function() {
                return this.value
            }
        }
    }),
    w.extend(w.FX, {
        attr: function(t, e, i) {
            if ("object" == typeof t)
                for (var n in t)
                    this.attr(n, t[n]);
            else
                this.add(t, e, "attrs");
            return this
        },
        style: function(t, e) {
            if ("object" == typeof t)
                for (var i in t)
                    this.style(i, t[i]);
            else
                this.add(t, e, "styles");
            return this
        },
        x: function(t, e) {
            if (this.target()instanceof w.G)
                return this.transform({
                    x: t
                }, e),
                this;
            var i = new w.Number(t);
            return i.relative = e,
            this.add("x", i)
        },
        y: function(t, e) {
            if (this.target()instanceof w.G)
                return this.transform({
                    y: t
                }, e),
                this;
            var i = new w.Number(t);
            return i.relative = e,
            this.add("y", i)
        },
        cx: function(t) {
            return this.add("cx", new w.Number(t))
        },
        cy: function(t) {
            return this.add("cy", new w.Number(t))
        },
        move: function(t, e) {
            return this.x(t).y(e)
        },
        center: function(t, e) {
            return this.cx(t).cy(e)
        },
        size: function(t, e) {
            if (this.target()instanceof w.Text)
                this.attr("font-size", t);
            else {
                var i;
                t && e || (i = this.target().bbox()),
                t || (t = i.width / i.height * e),
                e || (e = i.height / i.width * t),
                this.add("width", new w.Number(t)).add("height", new w.Number(e))
            }
            return this
        },
        width: function(t) {
            return this.add("width", new w.Number(t))
        },
        height: function(t) {
            return this.add("height", new w.Number(t))
        },
        plot: function(t, e, i, n) {
            return 4 == arguments.length ? this.plot([t, e, i, n]) : this.add("plot", new (this.target().morphArray)(t))
        },
        leading: function(t) {
            return this.target().leading ? this.add("leading", new w.Number(t)) : this
        },
        viewbox: function(t, e, i, n) {
            return this.target()instanceof w.Container && this.add("viewbox", new w.ViewBox(t,e,i,n)),
            this
        },
        update: function(t) {
            if (this.target()instanceof w.Stop) {
                if ("number" == typeof t || t instanceof w.Number)
                    return this.update({
                        offset: arguments[0],
                        color: arguments[1],
                        opacity: arguments[2]
                    });
                null != t.opacity && this.attr("stop-opacity", t.opacity),
                null != t.color && this.attr("stop-color", t.color),
                null != t.offset && this.attr("offset", t.offset)
            }
            return this
        }
    }),
    w.Box = w.invent({
        create: function(t, e, i, n) {
            if (!("object" != typeof t || t instanceof w.Element))
                return w.Box.call(this, null != t.left ? t.left : t.x, null != t.top ? t.top : t.y, t.width, t.height);
            4 == arguments.length && (this.x = t,
            this.y = e,
            this.width = i,
            this.height = n),
            y(this)
        },
        extend: {
            merge: function(t) {
                var e = new this.constructor;
                return e.x = Math.min(this.x, t.x),
                e.y = Math.min(this.y, t.y),
                e.width = Math.max(this.x + this.width, t.x + t.width) - e.x,
                e.height = Math.max(this.y + this.height, t.y + t.height) - e.y,
                y(e)
            },
            transform: function(t) {
                var e, i = 1 / 0, n = -1 / 0, r = 1 / 0, s = -1 / 0;
                return [new w.Point(this.x,this.y), new w.Point(this.x2,this.y), new w.Point(this.x,this.y2), new w.Point(this.x2,this.y2)].forEach(function(e) {
                    e = e.transform(t),
                    i = Math.min(i, e.x),
                    n = Math.max(n, e.x),
                    r = Math.min(r, e.y),
                    s = Math.max(s, e.y)
                }),
                e = new this.constructor,
                e.x = i,
                e.width = n - i,
                e.y = r,
                e.height = s - r,
                y(e),
                e
            }
        }
    }),
    w.BBox = w.invent({
        create: function(t) {
            if (w.Box.apply(this, [].slice.call(arguments)),
            t instanceof w.Element) {
                var i;
                try {
                    if (e.documentElement.contains) {
                        if (!e.documentElement.contains(t.node))
                            throw new Exception("Element not in the dom")
                    } else {
                        for (var n = t.node; n.parentNode; )
                            n = n.parentNode;
                        if (n != e)
                            throw new Exception("Element not in the dom")
                    }
                    i = t.node.getBBox()
                } catch (e) {
                    if (t instanceof w.Shape) {
                        var r = t.clone(w.parser.draw.instance).show();
                        i = r.node.getBBox(),
                        r.remove()
                    } else
                        i = {
                            x: t.node.clientLeft,
                            y: t.node.clientTop,
                            width: t.node.clientWidth,
                            height: t.node.clientHeight
                        }
                }
                w.Box.call(this, i)
            }
        },
        inherit: w.Box,
        parent: w.Element,
        construct: {
            bbox: function() {
                return new w.BBox(this)
            }
        }
    }),
    w.BBox.prototype.constructor = w.BBox,
    w.extend(w.Element, {
        tbox: function() {
            return console.warn("Use of TBox is deprecated and mapped to RBox. Use .rbox() instead."),
            this.rbox(this.doc())
        }
    }),
    w.RBox = w.invent({
        create: function(t) {
            w.Box.apply(this, [].slice.call(arguments)),
            t instanceof w.Element && w.Box.call(this, t.node.getBoundingClientRect())
        },
        inherit: w.Box,
        parent: w.Element,
        extend: {
            addOffset: function() {
                return this.x += t.pageXOffset,
                this.y += t.pageYOffset,
                this
            }
        },
        construct: {
            rbox: function(t) {
                return t ? new w.RBox(this).transform(t.screenCTM().inverse()) : new w.RBox(this).addOffset()
            }
        }
    }),
    w.RBox.prototype.constructor = w.RBox,
    w.Matrix = w.invent({
        create: function(t) {
            var e, i = f([1, 0, 0, 1, 0, 0]);
            for (t = t instanceof w.Element ? t.matrixify() : "string" == typeof t ? f(t.split(w.regex.delimiter).map(parseFloat)) : 6 == arguments.length ? f([].slice.call(arguments)) : Array.isArray(t) ? f(t) : "object" == typeof t ? t : i,
            e = P.length - 1; e >= 0; --e)
                this[P[e]] = null != t[P[e]] ? t[P[e]] : i[P[e]]
        },
        extend: {
            extract: function() {
                var t = c(this, 0, 1)
                  , e = c(this, 1, 0)
                  , i = 180 / Math.PI * Math.atan2(t.y, t.x) - 90;
                return {
                    x: this.e,
                    y: this.f,
                    transformedX: (this.e * Math.cos(i * Math.PI / 180) + this.f * Math.sin(i * Math.PI / 180)) / Math.sqrt(this.a * this.a + this.b * this.b),
                    transformedY: (this.f * Math.cos(i * Math.PI / 180) + this.e * Math.sin(-i * Math.PI / 180)) / Math.sqrt(this.c * this.c + this.d * this.d),
                    skewX: -i,
                    skewY: 180 / Math.PI * Math.atan2(e.y, e.x),
                    scaleX: Math.sqrt(this.a * this.a + this.b * this.b),
                    scaleY: Math.sqrt(this.c * this.c + this.d * this.d),
                    rotation: i,
                    a: this.a,
                    b: this.b,
                    c: this.c,
                    d: this.d,
                    e: this.e,
                    f: this.f,
                    matrix: new w.Matrix(this)
                }
            },
            clone: function() {
                return new w.Matrix(this)
            },
            morph: function(t) {
                return this.destination = new w.Matrix(t),
                this
            },
            at: function(t) {
                return this.destination ? new w.Matrix({
                    a: this.a + (this.destination.a - this.a) * t,
                    b: this.b + (this.destination.b - this.b) * t,
                    c: this.c + (this.destination.c - this.c) * t,
                    d: this.d + (this.destination.d - this.d) * t,
                    e: this.e + (this.destination.e - this.e) * t,
                    f: this.f + (this.destination.f - this.f) * t
                }) : this
            },
            multiply: function(t) {
                return new w.Matrix(this.native().multiply(d(t).native()))
            },
            inverse: function() {
                return new w.Matrix(this.native().inverse())
            },
            translate: function(t, e) {
                return new w.Matrix(this.native().translate(t || 0, e || 0))
            },
            scale: function(t, e, i, n) {
                return 1 == arguments.length ? e = t : 3 == arguments.length && (n = i,
                i = e,
                e = t),
                this.around(i, n, new w.Matrix(t,0,0,e,0,0))
            },
            rotate: function(t, e, i) {
                return t = w.utils.radians(t),
                this.around(e, i, new w.Matrix(Math.cos(t),Math.sin(t),-Math.sin(t),Math.cos(t),0,0))
            },
            flip: function(t, e) {
                return "x" == t ? this.scale(-1, 1, e, 0) : "y" == t ? this.scale(1, -1, 0, e) : this.scale(-1, -1, t, null != e ? e : t)
            },
            skew: function(t, e, i, n) {
                return 1 == arguments.length ? e = t : 3 == arguments.length && (n = i,
                i = e,
                e = t),
                t = w.utils.radians(t),
                e = w.utils.radians(e),
                this.around(i, n, new w.Matrix(1,Math.tan(e),Math.tan(t),1,0,0))
            },
            skewX: function(t, e, i) {
                return this.skew(t, 0, e, i)
            },
            skewY: function(t, e, i) {
                return this.skew(0, t, e, i)
            },
            around: function(t, e, i) {
                return this.multiply(new w.Matrix(1,0,0,1,t || 0,e || 0)).multiply(i).multiply(new w.Matrix(1,0,0,1,-t || 0,-e || 0))
            },
            native: function() {
                for (var t = w.parser.native.createSVGMatrix(), e = P.length - 1; e >= 0; e--)
                    t[P[e]] = this[P[e]];
                return t
            },
            toString: function() {
                return "matrix(" + g(this.a) + "," + g(this.b) + "," + g(this.c) + "," + g(this.d) + "," + g(this.e) + "," + g(this.f) + ")"
            }
        },
        parent: w.Element,
        construct: {
            ctm: function() {
                return new w.Matrix(this.node.getCTM())
            },
            screenCTM: function() {
                if (this instanceof w.Nested) {
                    var t = this.rect(1, 1)
                      , e = t.node.getScreenCTM();
                    return t.remove(),
                    new w.Matrix(e)
                }
                return new w.Matrix(this.node.getScreenCTM())
            }
        }
    }),
    w.Point = w.invent({
        create: function(t, e) {
            var i, n = {
                x: 0,
                y: 0
            };
            i = Array.isArray(t) ? {
                x: t[0],
                y: t[1]
            } : "object" == typeof t ? {
                x: t.x,
                y: t.y
            } : null != t ? {
                x: t,
                y: null != e ? e : t
            } : n,
            this.x = i.x,
            this.y = i.y
        },
        extend: {
            clone: function() {
                return new w.Point(this)
            },
            morph: function(t, e) {
                return this.destination = new w.Point(t,e),
                this
            },
            at: function(t) {
                return this.destination ? new w.Point({
                    x: this.x + (this.destination.x - this.x) * t,
                    y: this.y + (this.destination.y - this.y) * t
                }) : this
            },
            native: function() {
                var t = w.parser.native.createSVGPoint();
                return t.x = this.x,
                t.y = this.y,
                t
            },
            transform: function(t) {
                return new w.Point(this.native().matrixTransform(t.native()))
            }
        }
    }),
    w.extend(w.Element, {
        point: function(t, e) {
            return new w.Point(t,e).transform(this.screenCTM().inverse())
        }
    }),
    w.extend(w.Element, {
        attr: function(t, e, i) {
            if (null == t) {
                for (t = {},
                e = this.node.attributes,
                i = e.length - 1; i >= 0; i--)
                    t[e[i].nodeName] = w.regex.isNumber.test(e[i].nodeValue) ? parseFloat(e[i].nodeValue) : e[i].nodeValue;
                return t
            }
            if ("object" == typeof t)
                for (e in t)
                    this.attr(e, t[e]);
            else if (null === e)
                this.node.removeAttribute(t);
            else {
                if (null == e)
                    return e = this.node.getAttribute(t),
                    null == e ? w.defaults.attrs[t] : w.regex.isNumber.test(e) ? parseFloat(e) : e;
                "stroke-width" == t ? this.attr("stroke", parseFloat(e) > 0 ? this._stroke : null) : "stroke" == t && (this._stroke = e),
                "fill" != t && "stroke" != t || (w.regex.isImage.test(e) && (e = this.doc().defs().image(e, 0, 0)),
                e instanceof w.Image && (e = this.doc().defs().pattern(0, 0, function() {
                    this.add(e)
                }))),
                "number" == typeof e ? e = new w.Number(e) : w.Color.isColor(e) ? e = new w.Color(e) : Array.isArray(e) && (e = new w.Array(e)),
                "leading" == t ? this.leading && this.leading(e) : "string" == typeof i ? this.node.setAttributeNS(i, t, e.toString()) : this.node.setAttribute(t, e.toString()),
                !this.rebuild || "font-size" != t && "x" != t || this.rebuild(t, e)
            }
            return this
        }
    }),
    w.extend(w.Element, {
        transform: function(t, e) {
            var i, n, r = this;
            if ("object" != typeof t)
                return i = new w.Matrix(r).extract(),
                "string" == typeof t ? i[t] : i;
            if (i = new w.Matrix(r),
            e = !!e || !!t.relative,
            null != t.a)
                i = e ? i.multiply(new w.Matrix(t)) : new w.Matrix(t);
            else if (null != t.rotation)
                p(t, r),
                i = e ? i.rotate(t.rotation, t.cx, t.cy) : i.rotate(t.rotation - i.extract().rotation, t.cx, t.cy);
            else if (null != t.scale || null != t.scaleX || null != t.scaleY) {
                if (p(t, r),
                t.scaleX = null != t.scale ? t.scale : null != t.scaleX ? t.scaleX : 1,
                t.scaleY = null != t.scale ? t.scale : null != t.scaleY ? t.scaleY : 1,
                !e) {
                    var s = i.extract();
                    t.scaleX = 1 * t.scaleX / s.scaleX,
                    t.scaleY = 1 * t.scaleY / s.scaleY
                }
                i = i.scale(t.scaleX, t.scaleY, t.cx, t.cy)
            } else if (null != t.skew || null != t.skewX || null != t.skewY) {
                if (p(t, r),
                t.skewX = null != t.skew ? t.skew : null != t.skewX ? t.skewX : 0,
                t.skewY = null != t.skew ? t.skew : null != t.skewY ? t.skewY : 0,
                !e) {
                    var s = i.extract();
                    i = i.multiply((new w.Matrix).skew(s.skewX, s.skewY, t.cx, t.cy).inverse())
                }
                i = i.skew(t.skewX, t.skewY, t.cx, t.cy)
            } else
                t.flip ? ("x" == t.flip || "y" == t.flip ? t.offset = null == t.offset ? r.bbox()["c" + t.flip] : t.offset : null == t.offset ? (n = r.bbox(),
                t.flip = n.cx,
                t.offset = n.cy) : t.flip = t.offset,
                i = (new w.Matrix).flip(t.flip, t.offset)) : null == t.x && null == t.y || (e ? i = i.translate(t.x, t.y) : (null != t.x && (i.e = t.x),
                null != t.y && (i.f = t.y)));
            return this.attr("transform", i)
        }
    }),
    w.extend(w.FX, {
        transform: function(t, e) {
            var i, n, r = this.target();
            return "object" != typeof t ? (i = new w.Matrix(r).extract(),
            "string" == typeof t ? i[t] : i) : (e = !!e || !!t.relative,
            null != t.a ? i = new w.Matrix(t) : null != t.rotation ? (p(t, r),
            i = new w.Rotate(t.rotation,t.cx,t.cy)) : null != t.scale || null != t.scaleX || null != t.scaleY ? (p(t, r),
            t.scaleX = null != t.scale ? t.scale : null != t.scaleX ? t.scaleX : 1,
            t.scaleY = null != t.scale ? t.scale : null != t.scaleY ? t.scaleY : 1,
            i = new w.Scale(t.scaleX,t.scaleY,t.cx,t.cy)) : null != t.skewX || null != t.skewY ? (p(t, r),
            t.skewX = null != t.skewX ? t.skewX : 0,
            t.skewY = null != t.skewY ? t.skewY : 0,
            i = new w.Skew(t.skewX,t.skewY,t.cx,t.cy)) : t.flip ? ("x" == t.flip || "y" == t.flip ? t.offset = null == t.offset ? r.bbox()["c" + t.flip] : t.offset : null == t.offset ? (n = r.bbox(),
            t.flip = n.cx,
            t.offset = n.cy) : t.flip = t.offset,
            i = (new w.Matrix).flip(t.flip, t.offset)) : null == t.x && null == t.y || (i = new w.Translate(t.x,t.y)),
            i ? (i.relative = e,
            this.last().transforms.push(i),
            this._callStart()) : this)
        }
    }),
    w.extend(w.Element, {
        untransform: function() {
            return this.attr("transform", null)
        },
        matrixify: function() {
            return (this.attr("transform") || "").split(w.regex.transforms).slice(0, -1).map(function(t) {
                var e = t.trim().split("(");
                return [e[0], e[1].split(w.regex.delimiter).map(function(t) {
                    return parseFloat(t)
                })]
            }).reduce(function(t, e) {
                return "matrix" == e[0] ? t.multiply(f(e[1])) : t[e[0]].apply(t, e[1])
            }, new w.Matrix)
        },
        toParent: function(t) {
            if (this == t)
                return this;
            var e = this.screenCTM()
              , i = t.screenCTM().inverse();
            return this.addTo(t).untransform().transform(i.multiply(e)),
            this
        },
        toDoc: function() {
            return this.toParent(this.doc())
        }
    }),
    w.Transformation = w.invent({
        create: function(t, e) {
            if (arguments.length > 1 && "boolean" != typeof e)
                return this.constructor.call(this, [].slice.call(arguments));
            if (Array.isArray(t))
                for (var i = 0, n = this.arguments.length; i < n; ++i)
                    this[this.arguments[i]] = t[i];
            else if ("object" == typeof t)
                for (var i = 0, n = this.arguments.length; i < n; ++i)
                    this[this.arguments[i]] = t[this.arguments[i]];
            this.inversed = !1,
            !0 === e && (this.inversed = !0)
        },
        extend: {
            arguments: [],
            method: "",
            at: function(t) {
                for (var e = [], i = 0, n = this.arguments.length; i < n; ++i)
                    e.push(this[this.arguments[i]]);
                var r = this._undo || new w.Matrix;
                return r = (new w.Matrix).morph(w.Matrix.prototype[this.method].apply(r, e)).at(t),
                this.inversed ? r.inverse() : r
            },
            undo: function(t) {
                for (var e = 0, i = this.arguments.length; e < i; ++e)
                    t[this.arguments[e]] = void 0 === this[this.arguments[e]] ? 0 : t[this.arguments[e]];
                return t.cx = this.cx,
                t.cy = this.cy,
                this._undo = new (w[a(this.method)])(t,!0).at(1),
                this
            }
        }
    }),
    w.Translate = w.invent({
        parent: w.Matrix,
        inherit: w.Transformation,
        create: function(t, e) {
            this.constructor.apply(this, [].slice.call(arguments))
        },
        extend: {
            arguments: ["transformedX", "transformedY"],
            method: "translate"
        }
    }),
    w.Rotate = w.invent({
        parent: w.Matrix,
        inherit: w.Transformation,
        create: function(t, e) {
            this.constructor.apply(this, [].slice.call(arguments))
        },
        extend: {
            arguments: ["rotation", "cx", "cy"],
            method: "rotate",
            at: function(t) {
                var e = (new w.Matrix).rotate((new w.Number).morph(this.rotation - (this._undo ? this._undo.rotation : 0)).at(t), this.cx, this.cy);
                return this.inversed ? e.inverse() : e
            },
            undo: function(t) {
                return this._undo = t,
                this
            }
        }
    }),
    w.Scale = w.invent({
        parent: w.Matrix,
        inherit: w.Transformation,
        create: function(t, e) {
            this.constructor.apply(this, [].slice.call(arguments))
        },
        extend: {
            arguments: ["scaleX", "scaleY", "cx", "cy"],
            method: "scale"
        }
    }),
    w.Skew = w.invent({
        parent: w.Matrix,
        inherit: w.Transformation,
        create: function(t, e) {
            this.constructor.apply(this, [].slice.call(arguments))
        },
        extend: {
            arguments: ["skewX", "skewY", "cx", "cy"],
            method: "skew"
        }
    }),
    w.extend(w.Element, {
        style: function(t, e) {
            if (0 == arguments.length)
                return this.node.style.cssText || "";
            if (arguments.length < 2)
                if ("object" == typeof t)
                    for (e in t)
                        this.style(e, t[e]);
                else {
                    if (!w.regex.isCss.test(t))
                        return this.node.style[o(t)];
                    for (t = t.split(/\s*;\s*/).filter(function(t) {
                        return !!t
                    }).map(function(t) {
                        return t.split(/\s*:\s*/)
                    }); e = t.pop(); )
                        this.style(e[0], e[1])
                }
            else
                this.node.style[o(t)] = null === e || w.regex.isBlank.test(e) ? "" : e;
            return this
        }
    }),
    w.Parent = w.invent({
        create: function(t) {
            this.constructor.call(this, t)
        },
        inherit: w.Element,
        extend: {
            children: function() {
                return w.utils.map(w.utils.filterSVGElements(this.node.childNodes), function(t) {
                    return w.adopt(t)
                })
            },
            add: function(t, e) {
                return null == e ? this.node.appendChild(t.node) : t.node != this.node.childNodes[e] && this.node.insertBefore(t.node, this.node.childNodes[e]),
                this
            },
            put: function(t, e) {
                return this.add(t, e),
                t
            },
            has: function(t) {
                return this.index(t) >= 0
            },
            index: function(t) {
                return [].slice.call(this.node.childNodes).indexOf(t.node)
            },
            get: function(t) {
                return w.adopt(this.node.childNodes[t])
            },
            first: function() {
                return this.get(0)
            },
            last: function() {
                return this.get(this.node.childNodes.length - 1)
            },
            each: function(t, e) {
                var i, n, r = this.children();
                for (i = 0,
                n = r.length; i < n; i++)
                    r[i]instanceof w.Element && t.apply(r[i], [i, r]),
                    e && r[i]instanceof w.Container && r[i].each(t, e);
                return this
            },
            removeElement: function(t) {
                return this.node.removeChild(t.node),
                this
            },
            clear: function() {
                for (; this.node.hasChildNodes(); )
                    this.node.removeChild(this.node.lastChild);
                return delete this._defs,
                this
            },
            defs: function() {
                return this.doc().defs()
            }
        }
    }),
    w.extend(w.Parent, {
        ungroup: function(t, e) {
            return 0 === e || this instanceof w.Defs || this.node == w.parser.draw ? this : (t = t || (this instanceof w.Doc ? this : this.parent(w.Parent)),
            e = e || 1 / 0,
            this.each(function() {
                return this instanceof w.Defs ? this : this instanceof w.Parent ? this.ungroup(t, e - 1) : this.toParent(t)
            }),
            this.node.firstChild || this.remove(),
            this)
        },
        flatten: function(t, e) {
            return this.ungroup(t, e)
        }
    }),
    w.Container = w.invent({
        create: function(t) {
            this.constructor.call(this, t)
        },
        inherit: w.Parent
    }),
    w.ViewBox = w.invent({
        create: function(t) {
            var e, i, n, r, s, o, a, h = [0, 0, 0, 0], u = 1, l = 1, c = /[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/gi;
            if (t instanceof w.Element) {
                for (o = t,
                a = t,
                s = (t.attr("viewBox") || "").match(c),
                t.bbox,
                n = new w.Number(t.width()),
                r = new w.Number(t.height()); "%" == n.unit; )
                    u *= n.value,
                    n = new w.Number(o instanceof w.Doc ? o.parent().offsetWidth : o.parent().width()),
                    o = o.parent();
                for (; "%" == r.unit; )
                    l *= r.value,
                    r = new w.Number(a instanceof w.Doc ? a.parent().offsetHeight : a.parent().height()),
                    a = a.parent();
                this.x = 0,
                this.y = 0,
                this.width = n * u,
                this.height = r * l,
                this.zoom = 1,
                s && (e = parseFloat(s[0]),
                i = parseFloat(s[1]),
                n = parseFloat(s[2]),
                r = parseFloat(s[3]),
                this.zoom = this.width / this.height > n / r ? this.height / r : this.width / n,
                this.x = e,
                this.y = i,
                this.width = n,
                this.height = r)
            } else
                t = "string" == typeof t ? t.match(c).map(function(t) {
                    return parseFloat(t)
                }) : Array.isArray(t) ? t : "object" == typeof t ? [t.x, t.y, t.width, t.height] : 4 == arguments.length ? [].slice.call(arguments) : h,
                this.x = t[0],
                this.y = t[1],
                this.width = t[2],
                this.height = t[3]
        },
        extend: {
            toString: function() {
                return this.x + " " + this.y + " " + this.width + " " + this.height
            },
            morph: function(t, e, i, n) {
                return this.destination = new w.ViewBox(t,e,i,n),
                this
            },
            at: function(t) {
                return this.destination ? new w.ViewBox([this.x + (this.destination.x - this.x) * t, this.y + (this.destination.y - this.y) * t, this.width + (this.destination.width - this.width) * t, this.height + (this.destination.height - this.height) * t]) : this
            }
        },
        parent: w.Container,
        construct: {
            viewbox: function(t, e, i, n) {
                return 0 == arguments.length ? new w.ViewBox(this) : this.attr("viewBox", new w.ViewBox(t,e,i,n))
            }
        }
    }),
    ["click", "dblclick", "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "touchstart", "touchmove", "touchleave", "touchend", "touchcancel"].forEach(function(t) {
        w.Element.prototype[t] = function(e) {
            return w.on(this.node, t, e),
            this
        }
    }),
    w.listeners = [],
    w.handlerMap = [],
    w.listenerId = 0,
    w.on = function(t, e, i, n, r) {
        var s = i.bind(n || t.instance || t)
          , o = (w.handlerMap.indexOf(t) + 1 || w.handlerMap.push(t)) - 1
          , a = e.split(".")[0]
          , h = e.split(".")[1] || "*";
        w.listeners[o] = w.listeners[o] || {},
        w.listeners[o][a] = w.listeners[o][a] || {},
        w.listeners[o][a][h] = w.listeners[o][a][h] || {},
        i._svgjsListenerId || (i._svgjsListenerId = ++w.listenerId),
        w.listeners[o][a][h][i._svgjsListenerId] = s,
        t.addEventListener(a, s, r || !1)
    }
    ,
    w.off = function(t, e, i) {
        var n = w.handlerMap.indexOf(t)
          , r = e && e.split(".")[0]
          , s = e && e.split(".")[1]
          , o = "";
        if (-1 != n)
            if (i) {
                if ("function" == typeof i && (i = i._svgjsListenerId),
                !i)
                    return;
                w.listeners[n][r] && w.listeners[n][r][s || "*"] && (t.removeEventListener(r, w.listeners[n][r][s || "*"][i], !1),
                delete w.listeners[n][r][s || "*"][i])
            } else if (s && r) {
                if (w.listeners[n][r] && w.listeners[n][r][s]) {
                    for (i in w.listeners[n][r][s])
                        w.off(t, [r, s].join("."), i);
                    delete w.listeners[n][r][s]
                }
            } else if (s)
                for (e in w.listeners[n])
                    for (o in w.listeners[n][e])
                        s === o && w.off(t, [e, s].join("."));
            else if (r) {
                if (w.listeners[n][r]) {
                    for (o in w.listeners[n][r])
                        w.off(t, [r, o].join("."));
                    delete w.listeners[n][r]
                }
            } else {
                for (e in w.listeners[n])
                    w.off(t, e);
                delete w.listeners[n],
                delete w.handlerMap[n]
            }
    }
    ,
    w.extend(w.Element, {
        on: function(t, e, i, n) {
            return w.on(this.node, t, e, i, n),
            this
        },
        off: function(t, e) {
            return w.off(this.node, t, e),
            this
        },
        fire: function(e, i) {
            return e instanceof t.Event ? this.node.dispatchEvent(e) : this.node.dispatchEvent(e = new w.CustomEvent(e,{
                detail: i,
                cancelable: !0
            })),
            this._event = e,
            this
        },
        event: function() {
            return this._event
        }
    }),
    w.Defs = w.invent({
        create: "defs",
        inherit: w.Container
    }),
    w.G = w.invent({
        create: "g",
        inherit: w.Container,
        extend: {
            x: function(t) {
                return null == t ? this.transform("x") : this.transform({
                    x: t - this.x()
                }, !0)
            },
            y: function(t) {
                return null == t ? this.transform("y") : this.transform({
                    y: t - this.y()
                }, !0)
            },
            cx: function(t) {
                return null == t ? this.gbox().cx : this.x(t - this.gbox().width / 2)
            },
            cy: function(t) {
                return null == t ? this.gbox().cy : this.y(t - this.gbox().height / 2)
            },
            gbox: function() {
                var t = this.bbox()
                  , e = this.transform();
                return t.x += e.x,
                t.x2 += e.x,
                t.cx += e.x,
                t.y += e.y,
                t.y2 += e.y,
                t.cy += e.y,
                t
            }
        },
        construct: {
            group: function() {
                return this.put(new w.G)
            }
        }
    }),
    w.Doc = w.invent({
        create: function(t) {
            t && (t = "string" == typeof t ? e.getElementById(t) : t,
            "svg" == t.nodeName ? this.constructor.call(this, t) : (this.constructor.call(this, w.create("svg")),
            t.appendChild(this.node),
            this.size("100%", "100%")),
            this.namespace().defs())
        },
        inherit: w.Container,
        extend: {
            namespace: function() {
                return this.attr({
                    xmlns: w.ns,
                    version: "1.1"
                }).attr("xmlns:xlink", w.xlink, w.xmlns).attr("xmlns:svgjs", w.svgjs, w.xmlns)
            },
            defs: function() {
                if (!this._defs) {
                    var t;
                    (t = this.node.getElementsByTagName("defs")[0]) ? this._defs = w.adopt(t) : this._defs = new w.Defs,
                    this.node.appendChild(this._defs.node)
                }
                return this._defs
            },
            parent: function() {
                return this.node.parentNode && "#document" != this.node.parentNode.nodeName ? this.node.parentNode : null
            },
            spof: function() {
                var t = this.node.getScreenCTM();
                return t && this.style("left", -t.e % 1 + "px").style("top", -t.f % 1 + "px"),
                this
            },
            remove: function() {
                return this.parent() && this.parent().removeChild(this.node),
                this
            },
            clear: function() {
                for (; this.node.hasChildNodes(); )
                    this.node.removeChild(this.node.lastChild);
                return delete this._defs,
                w.parser.draw.parentNode || this.node.appendChild(w.parser.draw),
                this
            },
            clone: function(t) {
                this.writeDataToDom();
                var e = this.node
                  , i = x(e.cloneNode(!0));
                return t ? (t.node || t).appendChild(i.node) : e.parentNode.insertBefore(i.node, e.nextSibling),
                i
            }
        }
    }),
    w.extend(w.Element, {
        siblings: function() {
            return this.parent().children()
        },
        position: function() {
            return this.parent().index(this)
        },
        next: function() {
            return this.siblings()[this.position() + 1]
        },
        previous: function() {
            return this.siblings()[this.position() - 1]
        },
        forward: function() {
            var t = this.position() + 1
              , e = this.parent();
            return e.removeElement(this).add(this, t),
            e instanceof w.Doc && e.node.appendChild(e.defs().node),
            this
        },
        backward: function() {
            var t = this.position();
            return t > 0 && this.parent().removeElement(this).add(this, t - 1),
            this
        },
        front: function() {
            var t = this.parent();
            return t.node.appendChild(this.node),
            t instanceof w.Doc && t.node.appendChild(t.defs().node),
            this
        },
        back: function() {
            return this.position() > 0 && this.parent().removeElement(this).add(this, 0),
            this
        },
        before: function(t) {
            t.remove();
            var e = this.position();
            return this.parent().add(t, e),
            this
        },
        after: function(t) {
            t.remove();
            var e = this.position();
            return this.parent().add(t, e + 1),
            this
        }
    }),
    w.Mask = w.invent({
        create: function() {
            this.constructor.call(this, w.create("mask")),
            this.targets = []
        },
        inherit: w.Container,
        extend: {
            remove: function() {
                for (var t = this.targets.length - 1; t >= 0; t--)
                    this.targets[t] && this.targets[t].unmask();
                return this.targets = [],
                w.Element.prototype.remove.call(this),
                this
            }
        },
        construct: {
            mask: function() {
                return this.defs().put(new w.Mask)
            }
        }
    }),
    w.extend(w.Element, {
        maskWith: function(t) {
            return this.masker = t instanceof w.Mask ? t : this.parent().mask().add(t),
            this.masker.targets.push(this),
            this.attr("mask", 'url("#' + this.masker.attr("id") + '")')
        },
        unmask: function() {
            return delete this.masker,
            this.attr("mask", null)
        }
    }),
    w.ClipPath = w.invent({
        create: function() {
            this.constructor.call(this, w.create("clipPath")),
            this.targets = []
        },
        inherit: w.Container,
        extend: {
            remove: function() {
                for (var t = this.targets.length - 1; t >= 0; t--)
                    this.targets[t] && this.targets[t].unclip();
                return this.targets = [],
                this.parent().removeElement(this),
                this
            }
        },
        construct: {
            clip: function() {
                return this.defs().put(new w.ClipPath)
            }
        }
    }),
    w.extend(w.Element, {
        clipWith: function(t) {
            return this.clipper = t instanceof w.ClipPath ? t : this.parent().clip().add(t),
            this.clipper.targets.push(this),
            this.attr("clip-path", 'url("#' + this.clipper.attr("id") + '")')
        },
        unclip: function() {
            return delete this.clipper,
            this.attr("clip-path", null)
        }
    }),
    w.Gradient = w.invent({
        create: function(t) {
            this.constructor.call(this, w.create(t + "Gradient")),
            this.type = t
        },
        inherit: w.Container,
        extend: {
            at: function(t, e, i) {
                return this.put(new w.Stop).update(t, e, i)
            },
            update: function(t) {
                return this.clear(),
                "function" == typeof t && t.call(this, this),
                this
            },
            fill: function() {
                return "url(#" + this.id() + ")"
            },
            toString: function() {
                return this.fill()
            },
            attr: function(t, e, i) {
                return "transform" == t && (t = "gradientTransform"),
                w.Container.prototype.attr.call(this, t, e, i)
            }
        },
        construct: {
            gradient: function(t, e) {
                return this.defs().gradient(t, e)
            }
        }
    }),
    w.extend(w.Gradient, w.FX, {
        from: function(t, e) {
            return "radial" == (this._target || this).type ? this.attr({
                fx: new w.Number(t),
                fy: new w.Number(e)
            }) : this.attr({
                x1: new w.Number(t),
                y1: new w.Number(e)
            })
        },
        to: function(t, e) {
            return "radial" == (this._target || this).type ? this.attr({
                cx: new w.Number(t),
                cy: new w.Number(e)
            }) : this.attr({
                x2: new w.Number(t),
                y2: new w.Number(e)
            })
        }
    }),
    w.extend(w.Defs, {
        gradient: function(t, e) {
            return this.put(new w.Gradient(t)).update(e)
        }
    }),
    w.Stop = w.invent({
        create: "stop",
        inherit: w.Element,
        extend: {
            update: function(t) {
                return ("number" == typeof t || t instanceof w.Number) && (t = {
                    offset: arguments[0],
                    color: arguments[1],
                    opacity: arguments[2]
                }),
                null != t.opacity && this.attr("stop-opacity", t.opacity),
                null != t.color && this.attr("stop-color", t.color),
                null != t.offset && this.attr("offset", new w.Number(t.offset)),
                this
            }
        }
    }),
    w.Pattern = w.invent({
        create: "pattern",
        inherit: w.Container,
        extend: {
            fill: function() {
                return "url(#" + this.id() + ")"
            },
            update: function(t) {
                return this.clear(),
                "function" == typeof t && t.call(this, this),
                this
            },
            toString: function() {
                return this.fill()
            },
            attr: function(t, e, i) {
                return "transform" == t && (t = "patternTransform"),
                w.Container.prototype.attr.call(this, t, e, i)
            }
        },
        construct: {
            pattern: function(t, e, i) {
                return this.defs().pattern(t, e, i)
            }
        }
    }),
    w.extend(w.Defs, {
        pattern: function(t, e, i) {
            return this.put(new w.Pattern).update(i).attr({
                x: 0,
                y: 0,
                width: t,
                height: e,
                patternUnits: "userSpaceOnUse"
            })
        }
    }),
    w.Shape = w.invent({
        create: function(t) {
            this.constructor.call(this, t)
        },
        inherit: w.Element
    }),
    w.Bare = w.invent({
        create: function(t, e) {
            if (this.constructor.call(this, w.create(t)),
            e)
                for (var i in e.prototype)
                    "function" == typeof e.prototype[i] && (this[i] = e.prototype[i])
        },
        inherit: w.Element,
        extend: {
            words: function(t) {
                for (; this.node.hasChildNodes(); )
                    this.node.removeChild(this.node.lastChild);
                return this.node.appendChild(e.createTextNode(t)),
                this
            }
        }
    }),
    w.extend(w.Parent, {
        element: function(t, e) {
            return this.put(new w.Bare(t,e))
        }
    }),
    w.Symbol = w.invent({
        create: "symbol",
        inherit: w.Container,
        construct: {
            symbol: function() {
                return this.put(new w.Symbol)
            }
        }
    }),
    w.Use = w.invent({
        create: "use",
        inherit: w.Shape,
        extend: {
            element: function(t, e) {
                return this.attr("href", (e || "") + "#" + t, w.xlink)
            }
        },
        construct: {
            use: function(t, e) {
                return this.put(new w.Use).element(t, e)
            }
        }
    }),
    w.Rect = w.invent({
        create: "rect",
        inherit: w.Shape,
        construct: {
            rect: function(t, e) {
                return this.put(new w.Rect).size(t, e)
            }
        }
    }),
    w.Circle = w.invent({
        create: "circle",
        inherit: w.Shape,
        construct: {
            circle: function(t) {
                return this.put(new w.Circle).rx(new w.Number(t).divide(2)).move(0, 0)
            }
        }
    }),
    w.extend(w.Circle, w.FX, {
        rx: function(t) {
            return this.attr("r", t)
        },
        ry: function(t) {
            return this.rx(t)
        }
    }),
    w.Ellipse = w.invent({
        create: "ellipse",
        inherit: w.Shape,
        construct: {
            ellipse: function(t, e) {
                return this.put(new w.Ellipse).size(t, e).move(0, 0)
            }
        }
    }),
    w.extend(w.Ellipse, w.Rect, w.FX, {
        rx: function(t) {
            return this.attr("rx", t)
        },
        ry: function(t) {
            return this.attr("ry", t)
        }
    }),
    w.extend(w.Circle, w.Ellipse, {
        x: function(t) {
            return null == t ? this.cx() - this.rx() : this.cx(t + this.rx())
        },
        y: function(t) {
            return null == t ? this.cy() - this.ry() : this.cy(t + this.ry())
        },
        cx: function(t) {
            return null == t ? this.attr("cx") : this.attr("cx", t)
        },
        cy: function(t) {
            return null == t ? this.attr("cy") : this.attr("cy", t)
        },
        width: function(t) {
            return null == t ? 2 * this.rx() : this.rx(new w.Number(t).divide(2))
        },
        height: function(t) {
            return null == t ? 2 * this.ry() : this.ry(new w.Number(t).divide(2))
        },
        size: function(t, e) {
            var i = l(this, t, e);
            return this.rx(new w.Number(i.width).divide(2)).ry(new w.Number(i.height).divide(2))
        }
    }),
    w.Line = w.invent({
        create: "line",
        inherit: w.Shape,
        extend: {
            array: function() {
                return new w.PointArray([[this.attr("x1"), this.attr("y1")], [this.attr("x2"), this.attr("y2")]])
            },
            plot: function(t, e, i, n) {
                return null == t ? this.array() : (t = void 0 !== e ? {
                    x1: t,
                    y1: e,
                    x2: i,
                    y2: n
                } : new w.PointArray(t).toLine(),
                this.attr(t))
            },
            move: function(t, e) {
                return this.attr(this.array().move(t, e).toLine())
            },
            size: function(t, e) {
                var i = l(this, t, e);
                return this.attr(this.array().size(i.width, i.height).toLine())
            }
        },
        construct: {
            line: function(t, e, i, n) {
                return w.Line.prototype.plot.apply(this.put(new w.Line), null != t ? [t, e, i, n] : [0, 0, 0, 0])
            }
        }
    }),
    w.Polyline = w.invent({
        create: "polyline",
        inherit: w.Shape,
        construct: {
            polyline: function(t) {
                return this.put(new w.Polyline).plot(t || new w.PointArray)
            }
        }
    }),
    w.Polygon = w.invent({
        create: "polygon",
        inherit: w.Shape,
        construct: {
            polygon: function(t) {
                return this.put(new w.Polygon).plot(t || new w.PointArray)
            }
        }
    }),
    w.extend(w.Polyline, w.Polygon, {
        array: function() {
            return this._array || (this._array = new w.PointArray(this.attr("points")))
        },
        plot: function(t) {
            return null == t ? this.array() : this.clear().attr("points", "string" == typeof t ? t : this._array = new w.PointArray(t))
        },
        clear: function() {
            return delete this._array,
            this
        },
        move: function(t, e) {
            return this.attr("points", this.array().move(t, e))
        },
        size: function(t, e) {
            var i = l(this, t, e);
            return this.attr("points", this.array().size(i.width, i.height))
        }
    }),
    w.extend(w.Line, w.Polyline, w.Polygon, {
        morphArray: w.PointArray,
        x: function(t) {
            return null == t ? this.bbox().x : this.move(t, this.bbox().y)
        },
        y: function(t) {
            return null == t ? this.bbox().y : this.move(this.bbox().x, t)
        },
        width: function(t) {
            var e = this.bbox();
            return null == t ? e.width : this.size(t, e.height)
        },
        height: function(t) {
            var e = this.bbox();
            return null == t ? e.height : this.size(e.width, t)
        }
    }),
    w.Path = w.invent({
        create: "path",
        inherit: w.Shape,
        extend: {
            morphArray: w.PathArray,
            array: function() {
                return this._array || (this._array = new w.PathArray(this.attr("d")))
            },
            plot: function(t) {
                return null == t ? this.array() : this.clear().attr("d", "string" == typeof t ? t : this._array = new w.PathArray(t))
            },
            clear: function() {
                return delete this._array,
                this
            },
            move: function(t, e) {
                return this.attr("d", this.array().move(t, e))
            },
            x: function(t) {
                return null == t ? this.bbox().x : this.move(t, this.bbox().y)
            },
            y: function(t) {
                return null == t ? this.bbox().y : this.move(this.bbox().x, t)
            },
            size: function(t, e) {
                var i = l(this, t, e);
                return this.attr("d", this.array().size(i.width, i.height))
            },
            width: function(t) {
                return null == t ? this.bbox().width : this.size(t, this.bbox().height)
            },
            height: function(t) {
                return null == t ? this.bbox().height : this.size(this.bbox().width, t)
            }
        },
        construct: {
            path: function(t) {
                return this.put(new w.Path).plot(t || new w.PathArray)
            }
        }
    }),
    w.Image = w.invent({
        create: "image",
        inherit: w.Shape,
        extend: {
            load: function(e) {
                if (!e)
                    return this;
                var i = this
                  , n = new t.Image;
                return w.on(n, "load", function() {
                    w.off(n);
                    var t = i.parent(w.Pattern);
                    null !== t && (0 == i.width() && 0 == i.height() && i.size(n.width, n.height),
                    t && 0 == t.width() && 0 == t.height() && t.size(i.width(), i.height()),
                    "function" == typeof i._loaded && i._loaded.call(i, {
                        width: n.width,
                        height: n.height,
                        ratio: n.width / n.height,
                        url: e
                    }))
                }),
                w.on(n, "error", function(t) {
                    w.off(n),
                    "function" == typeof i._error && i._error.call(i, t)
                }),
                this.attr("href", n.src = this.src = e, w.xlink)
            },
            loaded: function(t) {
                return this._loaded = t,
                this
            },
            error: function(t) {
                return this._error = t,
                this
            }
        },
        construct: {
            image: function(t, e, i) {
                return this.put(new w.Image).load(t).size(e || 0, i || e || 0)
            }
        }
    }),
    w.Text = w.invent({
        create: function() {
            this.constructor.call(this, w.create("text")),
            this.dom.leading = new w.Number(1.3),
            this._rebuild = !0,
            this._build = !1,
            this.attr("font-family", w.defaults.attrs["font-family"])
        },
        inherit: w.Shape,
        extend: {
            x: function(t) {
                return null == t ? this.attr("x") : this.attr("x", t)
            },
            y: function(t) {
                var e = this.attr("y")
                  , i = "number" == typeof e ? e - this.bbox().y : 0;
                return null == t ? "number" == typeof e ? e - i : e : this.attr("y", "number" == typeof t.valueOf() ? t + i : t)
            },
            cx: function(t) {
                return null == t ? this.bbox().cx : this.x(t - this.bbox().width / 2)
            },
            cy: function(t) {
                return null == t ? this.bbox().cy : this.y(t - this.bbox().height / 2)
            },
            text: function(t) {
                if (void 0 === t) {
                    for (var t = "", e = this.node.childNodes, i = 0, n = e.length; i < n; ++i)
                        0 != i && 3 != e[i].nodeType && 1 == w.adopt(e[i]).dom.newLined && (t += "\n"),
                        t += e[i].textContent;
                    return t
                }
                if (this.clear().build(!0),
                "function" == typeof t)
                    t.call(this, this);
                else {
                    t = t.split("\n");
                    for (var i = 0, r = t.length; i < r; i++)
                        this.tspan(t[i]).newLine()
                }
                return this.build(!1).rebuild()
            },
            size: function(t) {
                return this.attr("font-size", t).rebuild()
            },
            leading: function(t) {
                return null == t ? this.dom.leading : (this.dom.leading = new w.Number(t),
                this.rebuild())
            },
            lines: function() {
                var t = (this.textPath && this.textPath() || this).node
                  , e = w.utils.map(w.utils.filterSVGElements(t.childNodes), function(t) {
                    return w.adopt(t)
                });
                return new w.Set(e)
            },
            rebuild: function(t) {
                if ("boolean" == typeof t && (this._rebuild = t),
                this._rebuild) {
                    var e = this
                      , i = 0
                      , n = this.dom.leading * new w.Number(this.attr("font-size"));
                    this.lines().each(function() {
                        this.dom.newLined && (e.textPath() || this.attr("x", e.attr("x")),
                        "\n" == this.text() ? i += n : (this.attr("dy", n + i),
                        i = 0))
                    }),
                    this.fire("rebuild")
                }
                return this
            },
            build: function(t) {
                return this._build = !!t,
                this
            },
            setData: function(t) {
                return this.dom = t,
                this.dom.leading = new w.Number(t.leading || 1.3),
                this
            }
        },
        construct: {
            text: function(t) {
                return this.put(new w.Text).text(t)
            },
            plain: function(t) {
                return this.put(new w.Text).plain(t)
            }
        }
    }),
    w.Tspan = w.invent({
        create: "tspan",
        inherit: w.Shape,
        extend: {
            text: function(t) {
                return null == t ? this.node.textContent + (this.dom.newLined ? "\n" : "") : ("function" == typeof t ? t.call(this, this) : this.plain(t),
                this)
            },
            dx: function(t) {
                return this.attr("dx", t)
            },
            dy: function(t) {
                return this.attr("dy", t)
            },
            newLine: function() {
                var t = this.parent(w.Text);
                return this.dom.newLined = !0,
                this.dy(t.dom.leading * t.attr("font-size")).attr("x", t.x())
            }
        }
    }),
    w.extend(w.Text, w.Tspan, {
        plain: function(t) {
            return !1 === this._build && this.clear(),
            this.node.appendChild(e.createTextNode(t)),
            this
        },
        tspan: function(t) {
            var e = (this.textPath && this.textPath() || this).node
              , i = new w.Tspan;
            return !1 === this._build && this.clear(),
            e.appendChild(i.node),
            i.text(t)
        },
        clear: function() {
            for (var t = (this.textPath && this.textPath() || this).node; t.hasChildNodes(); )
                t.removeChild(t.lastChild);
            return this
        },
        length: function() {
            return this.node.getComputedTextLength()
        }
    }),
    w.TextPath = w.invent({
        create: "textPath",
        inherit: w.Parent,
        parent: w.Text,
        construct: {
            morphArray: w.PathArray,
            path: function(t) {
                for (var e = new w.TextPath, i = this.doc().defs().path(t); this.node.hasChildNodes(); )
                    e.node.appendChild(this.node.firstChild);
                return this.node.appendChild(e.node),
                e.attr("href", "#" + i, w.xlink),
                this
            },
            array: function() {
                var t = this.track();
                return t ? t.array() : null
            },
            plot: function(t) {
                var e = this.track()
                  , i = null;
                return e && (i = e.plot(t)),
                null == t ? i : this
            },
            track: function() {
                var t = this.textPath();
                if (t)
                    return t.reference("href")
            },
            textPath: function() {
                if (this.node.firstChild && "textPath" == this.node.firstChild.nodeName)
                    return w.adopt(this.node.firstChild)
            }
        }
    }),
    w.Nested = w.invent({
        create: function() {
            this.constructor.call(this, w.create("svg")),
            this.style("overflow", "visible")
        },
        inherit: w.Container,
        construct: {
            nested: function() {
                return this.put(new w.Nested)
            }
        }
    }),
    w.A = w.invent({
        create: "a",
        inherit: w.Container,
        extend: {
            to: function(t) {
                return this.attr("href", t, w.xlink)
            },
            show: function(t) {
                return this.attr("show", t, w.xlink)
            },
            target: function(t) {
                return this.attr("target", t)
            }
        },
        construct: {
            link: function(t) {
                return this.put(new w.A).to(t)
            }
        }
    }),
    w.extend(w.Element, {
        linkTo: function(t) {
            var e = new w.A;
            return "function" == typeof t ? t.call(e, e) : e.to(t),
            this.parent().put(e).put(this)
        }
    }),
    w.Marker = w.invent({
        create: "marker",
        inherit: w.Container,
        extend: {
            width: function(t) {
                return this.attr("markerWidth", t)
            },
            height: function(t) {
                return this.attr("markerHeight", t)
            },
            ref: function(t, e) {
                return this.attr("refX", t).attr("refY", e)
            },
            update: function(t) {
                return this.clear(),
                "function" == typeof t && t.call(this, this),
                this
            },
            toString: function() {
                return "url(#" + this.id() + ")"
            }
        },
        construct: {
            marker: function(t, e, i) {
                return this.defs().marker(t, e, i)
            }
        }
    }),
    w.extend(w.Defs, {
        marker: function(t, e, i) {
            return this.put(new w.Marker).size(t, e).ref(t / 2, e / 2).viewbox(0, 0, t, e).attr("orient", "auto").update(i)
        }
    }),
    w.extend(w.Line, w.Polyline, w.Polygon, w.Path, {
        marker: function(t, e, i, n) {
            var r = ["marker"];
            return "all" != t && r.push(t),
            r = r.join("-"),
            t = arguments[1]instanceof w.Marker ? arguments[1] : this.doc().marker(e, i, n),
            this.attr(r, t)
        }
    });
    var M = {
        stroke: ["color", "width", "opacity", "linecap", "linejoin", "miterlimit", "dasharray", "dashoffset"],
        fill: ["color", "opacity", "rule"],
        prefix: function(t, e) {
            return "color" == e ? t : t + "-" + e
        }
    };
    ["fill", "stroke"].forEach(function(t) {
        var e, i = {};
        i[t] = function(i) {
            if (void 0 === i)
                return this;
            if ("string" == typeof i || w.Color.isRgb(i) || i && "function" == typeof i.fill)
                this.attr(t, i);
            else
                for (e = M[t].length - 1; e >= 0; e--)
                    null != i[M[t][e]] && this.attr(M.prefix(t, M[t][e]), i[M[t][e]]);
            return this
        }
        ,
        w.extend(w.Element, w.FX, i)
    }),
    w.extend(w.Element, w.FX, {
        rotate: function(t, e, i) {
            return this.transform({
                rotation: t,
                cx: e,
                cy: i
            })
        },
        skew: function(t, e, i, n) {
            return 1 == arguments.length || 3 == arguments.length ? this.transform({
                skew: t,
                cx: e,
                cy: i
            }) : this.transform({
                skewX: t,
                skewY: e,
                cx: i,
                cy: n
            })
        },
        scale: function(t, e, i, n) {
            return 1 == arguments.length || 3 == arguments.length ? this.transform({
                scale: t,
                cx: e,
                cy: i
            }) : this.transform({
                scaleX: t,
                scaleY: e,
                cx: i,
                cy: n
            })
        },
        translate: function(t, e) {
            return this.transform({
                x: t,
                y: e
            })
        },
        flip: function(t, e) {
            return e = "number" == typeof t ? t : e,
            this.transform({
                flip: t || "both",
                offset: e
            })
        },
        matrix: function(t) {
            return this.attr("transform", new w.Matrix(6 == arguments.length ? [].slice.call(arguments) : t))
        },
        opacity: function(t) {
            return this.attr("opacity", t)
        },
        dx: function(t) {
            return this.x(new w.Number(t).plus(this instanceof w.FX ? 0 : this.x()), !0)
        },
        dy: function(t) {
            return this.y(new w.Number(t).plus(this instanceof w.FX ? 0 : this.y()), !0)
        },
        dmove: function(t, e) {
            return this.dx(t).dy(e)
        }
    }),
    w.extend(w.Rect, w.Ellipse, w.Circle, w.Gradient, w.FX, {
        radius: function(t, e) {
            var i = (this._target || this).type;
            return "radial" == i || "circle" == i ? this.attr("r", new w.Number(t)) : this.rx(t).ry(null == e ? t : e)
        }
    }),
    w.extend(w.Path, {
        length: function() {
            return this.node.getTotalLength()
        },
        pointAt: function(t) {
            return this.node.getPointAtLength(t)
        }
    }),
    w.extend(w.Parent, w.Text, w.Tspan, w.FX, {
        font: function(t, e) {
            if ("object" == typeof t)
                for (e in t)
                    this.font(e, t[e]);
            return "leading" == t ? this.leading(e) : "anchor" == t ? this.attr("text-anchor", e) : "size" == t || "family" == t || "weight" == t || "stretch" == t || "variant" == t || "style" == t ? this.attr("font-" + t, e) : this.attr(t, e)
        }
    }),
    w.Set = w.invent({
        create: function(t) {
            Array.isArray(t) ? this.members = t : this.clear()
        },
        extend: {
            add: function() {
                var t, e, i = [].slice.call(arguments);
                for (t = 0,
                e = i.length; t < e; t++)
                    this.members.push(i[t]);
                return this
            },
            remove: function(t) {
                var e = this.index(t);
                return e > -1 && this.members.splice(e, 1),
                this
            },
            each: function(t) {
                for (var e = 0, i = this.members.length; e < i; e++)
                    t.apply(this.members[e], [e, this.members]);
                return this
            },
            clear: function() {
                return this.members = [],
                this
            },
            length: function() {
                return this.members.length
            },
            has: function(t) {
                return this.index(t) >= 0
            },
            index: function(t) {
                return this.members.indexOf(t)
            },
            get: function(t) {
                return this.members[t]
            },
            first: function() {
                return this.get(0)
            },
            last: function() {
                return this.get(this.members.length - 1)
            },
            valueOf: function() {
                return this.members
            },
            bbox: function() {
                if (0 == this.members.length)
                    return new w.RBox;
                var t = this.members[0].rbox(this.members[0].doc());
                return this.each(function() {
                    t = t.merge(this.rbox(this.doc()))
                }),
                t
            }
        },
        construct: {
            set: function(t) {
                return new w.Set(t)
            }
        }
    }),
    w.FX.Set = w.invent({
        create: function(t) {
            this.set = t
        }
    }),
    w.Set.inherit = function() {
        var t, e = [];
        for (var t in w.Shape.prototype)
            "function" == typeof w.Shape.prototype[t] && "function" != typeof w.Set.prototype[t] && e.push(t);
        e.forEach(function(t) {
            w.Set.prototype[t] = function() {
                for (var e = 0, i = this.members.length; e < i; e++)
                    this.members[e] && "function" == typeof this.members[e][t] && this.members[e][t].apply(this.members[e], arguments);
                return "animate" == t ? this.fx || (this.fx = new w.FX.Set(this)) : this
            }
        }),
        e = [];
        for (var t in w.FX.prototype)
            "function" == typeof w.FX.prototype[t] && "function" != typeof w.FX.Set.prototype[t] && e.push(t);
        e.forEach(function(t) {
            w.FX.Set.prototype[t] = function() {
                for (var e = 0, i = this.set.members.length; e < i; e++)
                    this.set.members[e].fx[t].apply(this.set.members[e].fx, arguments);
                return this
            }
        })
    }
    ,
    w.extend(w.Element, {
        data: function(t, e, i) {
            if ("object" == typeof t)
                for (e in t)
                    this.data(e, t[e]);
            else if (arguments.length < 2)
                try {
                    return JSON.parse(this.attr("data-" + t))
                } catch (e) {
                    return this.attr("data-" + t)
                }
            else
                this.attr("data-" + t, null === e ? null : !0 === i || "string" == typeof e || "number" == typeof e ? e : JSON.stringify(e));
            return this
        }
    }),
    w.extend(w.Element, {
        remember: function(t, e) {
            if ("object" == typeof arguments[0])
                for (var e in t)
                    this.remember(e, t[e]);
            else {
                if (1 == arguments.length)
                    return this.memory()[t];
                this.memory()[t] = e
            }
            return this
        },
        forget: function() {
            if (0 == arguments.length)
                this._memory = {};
            else
                for (var t = arguments.length - 1; t >= 0; t--)
                    delete this.memory()[arguments[t]];
            return this
        },
        memory: function() {
            return this._memory || (this._memory = {})
        }
    }),
    w.get = function(t) {
        var i = e.getElementById(v(t) || t);
        return w.adopt(i)
    }
    ,
    w.select = function(t, i) {
        return new w.Set(w.utils.map((i || e).querySelectorAll(t), function(t) {
            return w.adopt(t)
        }))
    }
    ,
    w.extend(w.Parent, {
        select: function(t) {
            return w.select(t, this.node)
        }
    });
    var P = "abcdef".split("");
    if ("function" != typeof t.CustomEvent) {
        var k = function(t, i) {
            i = i || {
                bubbles: !1,
                cancelable: !1,
                detail: void 0
            };
            var n = e.createEvent("CustomEvent");
            return n.initCustomEvent(t, i.bubbles, i.cancelable, i.detail),
            n
        };
        k.prototype = t.Event.prototype,
        w.CustomEvent = k
    } else
        w.CustomEvent = t.CustomEvent;
    return function(e) {
        for (var i = 0, n = ["moz", "webkit"], r = 0; r < n.length && !t.requestAnimationFrame; ++r)
            e.requestAnimationFrame = e[n[r] + "RequestAnimationFrame"],
            e.cancelAnimationFrame = e[n[r] + "CancelAnimationFrame"] || e[n[r] + "CancelRequestAnimationFrame"];
        e.requestAnimationFrame = e.requestAnimationFrame || function(t) {
            var n = (new Date).getTime()
              , r = Math.max(0, 16 - (n - i))
              , s = e.setTimeout(function() {
                t(n + r)
            }, r);
            return i = n + r,
            s
        }
        ,
        e.cancelAnimationFrame = e.cancelAnimationFrame || e.clearTimeout
    }(t),
    w
});
function doFeedback() {
    var form = $("#feedbackModal");
    form.find("button[type=submit]").prop('disabled', true);
    form.find("button[type=submit]").addClass("loadWait");
    var form_data = new FormData();
    form_data.append("action", "doFeedback");
    form_data.append("name", form.find("input[name=name]").val());
    form_data.append("email", form.find("input[name=email]").val());
    form_data.append("phone", form.find("input[name=phone]").val());
    form_data.append("addinfo", form.find("textarea[name=addinfo]").val());
    form.find(".upload-item input").each(function($index) {
        form_data.append("filearr[]", $(this).prop('files')[0]);
    });
    $.ajax({
        url: "/scripts/recall.php",
        method: "POST",
        cache: "false",
        contentType: false,
        processData: false,
        type: 'post',
        data: form_data
    }).done(function($obj) {
        if ($obj.error) {
            return;
        }
        form.find("button[type=submit]").removeClass("loadWait");
        form.find(".form-result").html($obj.data.html);
        form.find(".btn-doAction").addClass('hidden');
        form.find(".form-result").removeClass('hidden');
        form.find(".form-fields").fadeOut('fast', function() {
            form.find(".btn-doClose").removeClass('hidden');
        });
        ym(43364589, 'reachGoal', 'feedback');
    });
}
$(document).ready(function() {
    $(document).on('submit', '#feedbackModal form', function(event) {
        doFeedback();
    });
});
function initGalleryFromText() {
    $(".gallery p > *").unwrap();
    $(".gallery").addClass("photoSliderText owl-carousel owl-theme lightgalleryText");
    $(".gallery img").wrap(function() {
        return "<a href='" + $(this).attr("src") + "'></a>";
    });
    $(".lightgalleryText").lightGallery();
    $('.photoSliderText').owlCarousel({
        autoPlay: true,
        items: 1,
        navRewind: true,
        loop: true,
        stopOnHover: true,
        nav: true,
        pagination: true,
        navText: ["<span class='fa fa-chevron-circle-left'></span>", "<span class='fa fa-chevron-circle-right'></span>"]
    });
}
function htmlEncode(value) {
    $r = $('<div/>').text(value).html();
    $re = new RegExp('"',"gi");
    return $r.replace($re, '&quot;');
}
function htmlDecode(value) {
    return $('<div/>').html(value).text();
}
function doMask($obj, $complete) {
    $('#maskLayer').positionOn($obj).css('display', 'table-cell');
}
function initClickByAllDivItem() {
    $(".item-list .item").click(function(evt) {
        $an = "";
        if ($(evt.target).hasClass("btn-cart"))
            return;
        if ($(evt.target).hasClass("fa-shopping-cart"))
            return;
        if ($(evt.target).hasClass("speedViewBtn"))
            return;
        if ($(evt.target).hasClass("speedView"))
            return;
        if ($(evt.target).hasClass("btn-no-avail"))
            return;
        if ($(evt.target).parent().hasClass("sizes")) {
            $an = "size-" + $(evt.target).text();
        }
        window.location = $(this).find("a.item-ref").attr('href') + ($an ? ("#" + $an) : "");
    });
}
function initChageImageOnItem() {
    $(".item-list .item").hover(function() {
        var img = $(this).find("img[data-img2]");
        var s = img.attr("src");
        img.attr("src", img.attr("data-img2"));
        img.attr("data-img2", s);
    });
}
function doActiveMenu() {
    var r = document.location.pathname + (document.location.search ? ("\\" + document.location.search) : "");
    $('a[href="' + r + '"]').each(function() {
        var item = $(this);
        if (!item.hasClass('noactive'))
            item.toggleClass('aselect');
    });
}
function initPageNavigation() {
    $("body").keydown(function(e) {
        $ref = "";
        if (e.keyCode == 37 && e.ctrlKey) {
            $ref = $('[rel=prev]').attr('href');
        } else if (e.keyCode == 39 && e.ctrlKey) {
            $ref = $('[rel=next]').attr('href');
        }
        if ($ref)
            document.location = $ref;
    });
}
function fixTabClickRef() {
    $('.nav-tabs>li>a').click(function(e) {
        e.preventDefault();
        $(this).tab('show');
    });
}
function initScrollTopButton() {
    $('.scrollToTop').click(function() {
        $('html, body').animate({
            scrollTop: 0
        }, 800);
        return false;
    });
}
function setPositionMainMenu() {
    var top = $('.klxMainMenu').offset().top + $('.klxMainMenu').height() - $(window).scrollTop() + 10;
    var left = $('.klxMainMenu').offset().left;
    var width = $('.klxMainMenu').width();
    $('.klxMainMenu .li-lvl-1>.dropdown-menu').css({
        top: top + 'px',
        left: left + 'px',
        width: width + 'px'
    });
}
function fixPositionMainMenu() {
    if ($('.klxMainMenu').length < 1)
        return;
    $(window).scroll(function() {
        setPositionMainMenu.call(this);
    });
    $(window).resize(function() {
        setPositionMainMenu.call(this);
    });
    setPositionMainMenu.call(window);
}
function initMainMenuCatalog() {
    $(".klxMainMenu li.li-lvl-1").hover(function() {
        $(this).addClass("sel");
    }, function() {
        $(this).removeClass("sel");
    });
}
function initRangeSlider() {
    $("input[data-from]").ionRangeSlider();
}
function initCarousel() {
    $('#main-carousel .carousel-inner>div:first-child').addClass('active');
    $("#main-container .owl-carousel, #seria-product").owlCarousel({
        autoplay: true,
        autoplayHoverPause: true,
        items: 4,
        dots: false,
        nav: true,
        navText: ["<span class='fa fa-chevron-circle-left'></span>", "<span class='fa fa-chevron-circle-right'></span>"],
        responsiveClass: true,
        responsive: {
            0: {
                items: 1
            },
            970: {
                items: 2
            },
            1200: {
                items: 4
            }
        }
    });
}
if (!('ontouchstart'in document.documentElement) && !navigator.MaxTouchPoints && !navigator.msMaxTouchPoints) {
    document.body.className += ' touch_no';
} else {
    document.body.className += ' touch_yes';
}
(function() {
    var AnimatedText, AnimatedTextFactory, Bar, BaseDonut, BaseGauge, Donut, Gauge, GaugePointer, TextRenderer, ValueUpdater, addCommas, cutHex, formatNumber, mergeObjects, secondsToString, slice = [].slice, hasProp = {}.hasOwnProperty, extend = function(child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key))
                child[key] = parent[key];
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    (function() {
        var browserRequestAnimationFrame, isCancelled, j, lastId, len, vendor, vendors;
        vendors = ['ms', 'moz', 'webkit', 'o'];
        for (j = 0,
        len = vendors.length; j < len; j++) {
            vendor = vendors[j];
            if (window.requestAnimationFrame) {
                break;
            }
            window.requestAnimationFrame = window[vendor + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendor + 'CancelAnimationFrame'] || window[vendor + 'CancelRequestAnimationFrame'];
        }
        browserRequestAnimationFrame = null;
        lastId = 0;
        isCancelled = {};
        if (!requestAnimationFrame) {
            window.requestAnimationFrame = function(callback, element) {
                var currTime, id, lastTime, timeToCall;
                currTime = new Date().getTime();
                timeToCall = Math.max(0, 16 - (currTime - lastTime));
                id = window.setTimeout(function() {
                    return callback(currTime + timeToCall);
                }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            }
            ;
            return window.cancelAnimationFrame = function(id) {
                return clearTimeout(id);
            }
            ;
        } else if (!window.cancelAnimationFrame) {
            browserRequestAnimationFrame = window.requestAnimationFrame;
            window.requestAnimationFrame = function(callback, element) {
                var myId;
                myId = ++lastId;
                browserRequestAnimationFrame(function() {
                    if (!isCancelled[myId]) {
                        return callback();
                    }
                }, element);
                return myId;
            }
            ;
            return window.cancelAnimationFrame = function(id) {
                return isCancelled[id] = true;
            }
            ;
        }
    }
    )();
    secondsToString = function(sec) {
        var hr, min;
        hr = Math.floor(sec / 3600);
        min = Math.floor((sec - (hr * 3600)) / 60);
        sec -= (hr * 3600) + (min * 60);
        sec += '';
        min += '';
        while (min.length < 2) {
            min = '0' + min;
        }
        while (sec.length < 2) {
            sec = '0' + sec;
        }
        hr = hr ? hr + ':' : '';
        return hr + min + ':' + sec;
    }
    ;
    formatNumber = function() {
        var digits, num, value;
        num = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        value = Math.abs(num[0]);
        digits = 0 || num[1];
        return addCommas(value.toFixed(digits));
    }
    ;
    mergeObjects = function(obj1, obj2) {
        var key, out, val;
        out = {};
        for (key in obj1) {
            if (!hasProp.call(obj1, key))
                continue;
            val = obj1[key];
            out[key] = val;
        }
        for (key in obj2) {
            if (!hasProp.call(obj2, key))
                continue;
            val = obj2[key];
            out[key] = val;
        }
        return out;
    }
    ;
    addCommas = function(nStr) {
        var rgx, x, x1, x2;
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = '';
        if (x.length > 1) {
            x2 = '.' + x[1];
        }
        rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }
    ;
    cutHex = function(nStr) {
        if (nStr.charAt(0) === "#") {
            return nStr.substring(1, 7);
        }
        return nStr;
    }
    ;
    ValueUpdater = (function() {
        ValueUpdater.prototype.animationSpeed = 32;
        function ValueUpdater(addToAnimationQueue, clear) {
            if (addToAnimationQueue == null) {
                addToAnimationQueue = true;
            }
            this.clear = clear != null ? clear : true;
            if (addToAnimationQueue) {
                AnimationUpdater.add(this);
            }
        }
        ValueUpdater.prototype.update = function(force) {
            var diff;
            if (force == null) {
                force = false;
            }
            if (force || this.displayedValue !== this.value) {
                if (this.ctx && this.clear) {
                    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                }
                diff = this.value - this.displayedValue;
                if (Math.abs(diff / this.animationSpeed) <= 0.001) {
                    this.displayedValue = this.value;
                } else {
                    this.displayedValue = this.displayedValue + diff / this.animationSpeed;
                }
                this.render();
                return true;
            }
            return false;
        }
        ;
        return ValueUpdater;
    }
    )();
    BaseGauge = (function(superClass) {
        extend(BaseGauge, superClass);
        function BaseGauge() {
            return BaseGauge.__super__.constructor.apply(this, arguments);
        }
        BaseGauge.prototype.displayScale = 1;
        BaseGauge.prototype.forceUpdate = true;
        BaseGauge.prototype.setTextField = function(textField, fractionDigits) {
            return this.textField = textField instanceof TextRenderer ? textField : new TextRenderer(textField,fractionDigits);
        }
        ;
        BaseGauge.prototype.setMinValue = function(minValue, updateStartValue) {
            var gauge, j, len, ref, results;
            this.minValue = minValue;
            if (updateStartValue == null) {
                updateStartValue = true;
            }
            if (updateStartValue) {
                this.displayedValue = this.minValue;
                ref = this.gp || [];
                results = [];
                for (j = 0,
                len = ref.length; j < len; j++) {
                    gauge = ref[j];
                    results.push(gauge.displayedValue = this.minValue);
                }
                return results;
            }
        }
        ;
        BaseGauge.prototype.setOptions = function(options) {
            if (options == null) {
                options = null;
            }
            this.options = mergeObjects(this.options, options);
            if (this.textField) {
                this.textField.el.style.fontSize = options.fontSize + 'px';
            }
            if (this.options.angle > .5) {
                this.options.angle = .5;
            }
            this.configDisplayScale();
            return this;
        }
        ;
        BaseGauge.prototype.configDisplayScale = function() {
            var backingStorePixelRatio, devicePixelRatio, height, prevDisplayScale, width;
            prevDisplayScale = this.displayScale;
            if (this.options.highDpiSupport === false) {
                delete this.displayScale;
            } else {
                devicePixelRatio = window.devicePixelRatio || 1;
                backingStorePixelRatio = this.ctx.webkitBackingStorePixelRatio || this.ctx.mozBackingStorePixelRatio || this.ctx.msBackingStorePixelRatio || this.ctx.oBackingStorePixelRatio || this.ctx.backingStorePixelRatio || 1;
                this.displayScale = devicePixelRatio / backingStorePixelRatio;
            }
            if (this.displayScale !== prevDisplayScale) {
                width = this.canvas.G__width || this.canvas.width;
                height = this.canvas.G__height || this.canvas.height;
                this.canvas.width = width * this.displayScale;
                this.canvas.height = height * this.displayScale;
                this.canvas.style.width = width + "px";
                this.canvas.style.height = height + "px";
                this.canvas.G__width = width;
                this.canvas.G__height = height;
            }
            return this;
        }
        ;
        BaseGauge.prototype.parseValue = function(value) {
            value = parseFloat(value) || Number(value);
            if (isFinite(value)) {
                return value;
            } else {
                return 0;
            }
        }
        ;
        return BaseGauge;
    }
    )(ValueUpdater);
    TextRenderer = (function() {
        function TextRenderer(el, fractionDigits1) {
            this.el = el;
            this.fractionDigits = fractionDigits1;
        }
        TextRenderer.prototype.render = function(gauge) {
            return this.el.innerHTML = formatNumber(gauge.displayedValue, this.fractionDigits);
        }
        ;
        return TextRenderer;
    }
    )();
    AnimatedText = (function(superClass) {
        extend(AnimatedText, superClass);
        AnimatedText.prototype.displayedValue = 0;
        AnimatedText.prototype.value = 0;
        AnimatedText.prototype.setVal = function(value) {
            return this.value = 1 * value;
        }
        ;
        function AnimatedText(elem1, text) {
            this.elem = elem1;
            this.text = text != null ? text : false;
            this.value = 1 * this.elem.innerHTML;
            if (this.text) {
                this.value = 0;
            }
        }
        AnimatedText.prototype.render = function() {
            var textVal;
            if (this.text) {
                textVal = secondsToString(this.displayedValue.toFixed(0));
            } else {
                textVal = addCommas(formatNumber(this.displayedValue));
            }
            return this.elem.innerHTML = textVal;
        }
        ;
        return AnimatedText;
    }
    )(ValueUpdater);
    AnimatedTextFactory = {
        create: function(objList) {
            var elem, j, len, out;
            out = [];
            for (j = 0,
            len = objList.length; j < len; j++) {
                elem = objList[j];
                out.push(new AnimatedText(elem));
            }
            return out;
        }
    };
    GaugePointer = (function(superClass) {
        extend(GaugePointer, superClass);
        GaugePointer.prototype.displayedValue = 0;
        GaugePointer.prototype.value = 0;
        GaugePointer.prototype.options = {
            strokeWidth: 0.035,
            length: 0.1,
            color: "#000000",
            iconPath: null,
            iconScale: 1.0,
            iconAngle: 0
        };
        GaugePointer.prototype.img = null;
        function GaugePointer(gauge1) {
            this.gauge = gauge1;
            this.ctx = this.gauge.ctx;
            this.canvas = this.gauge.canvas;
            GaugePointer.__super__.constructor.call(this, false, false);
            this.setOptions();
        }
        GaugePointer.prototype.setOptions = function(options) {
            if (options == null) {
                options = null;
            }
            this.options = mergeObjects(this.options, options);
            this.length = 2 * this.gauge.radius * this.gauge.options.radiusScale * this.options.length;
            this.strokeWidth = this.canvas.height * this.options.strokeWidth;
            this.maxValue = this.gauge.maxValue;
            this.minValue = this.gauge.minValue;
            this.animationSpeed = this.gauge.animationSpeed;
            this.options.angle = this.gauge.options.angle;
            if (this.options.iconPath) {
                this.img = new Image();
                return this.img.src = this.options.iconPath;
            }
        }
        ;
        GaugePointer.prototype.render = function() {
            var angle, endX, endY, imgX, imgY, startX, startY, x, y;
            angle = this.gauge.getAngle.call(this, this.displayedValue);
            x = Math.round(this.length * Math.cos(angle));
            y = Math.round(this.length * Math.sin(angle));
            startX = Math.round(this.strokeWidth * Math.cos(angle - Math.PI / 2));
            startY = Math.round(this.strokeWidth * Math.sin(angle - Math.PI / 2));
            endX = Math.round(this.strokeWidth * Math.cos(angle + Math.PI / 2));
            endY = Math.round(this.strokeWidth * Math.sin(angle + Math.PI / 2));
            this.ctx.fillStyle = this.options.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.strokeWidth, 0, Math.PI * 2, true);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(x, y);
            this.ctx.lineTo(endX, endY);
            this.ctx.fill();
            if (this.img) {
                imgX = Math.round(this.img.width * this.options.iconScale);
                imgY = Math.round(this.img.height * this.options.iconScale);
                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(angle + Math.PI / 180.0 * (90 + this.options.iconAngle));
                this.ctx.drawImage(this.img, -imgX / 2, -imgY / 2, imgX, imgY);
                return this.ctx.restore();
            }
        }
        ;
        return GaugePointer;
    }
    )(ValueUpdater);
    Bar = (function() {
        function Bar(elem1) {
            this.elem = elem1;
        }
        Bar.prototype.updateValues = function(arrValues) {
            this.value = arrValues[0];
            this.maxValue = arrValues[1];
            this.avgValue = arrValues[2];
            return this.render();
        }
        ;
        Bar.prototype.render = function() {
            var avgPercent, valPercent;
            if (this.textField) {
                this.textField.text(formatNumber(this.value));
            }
            if (this.maxValue === 0) {
                this.maxValue = this.avgValue * 2;
            }
            valPercent = (this.value / this.maxValue) * 100;
            avgPercent = (this.avgValue / this.maxValue) * 100;
            $(".bar-value", this.elem).css({
                "width": valPercent + "%"
            });
            return $(".typical-value", this.elem).css({
                "width": avgPercent + "%"
            });
        }
        ;
        return Bar;
    }
    )();
    Gauge = (function(superClass) {
        extend(Gauge, superClass);
        Gauge.prototype.elem = null;
        Gauge.prototype.value = [20];
        Gauge.prototype.maxValue = 80;
        Gauge.prototype.minValue = 0;
        Gauge.prototype.displayedAngle = 0;
        Gauge.prototype.displayedValue = 0;
        Gauge.prototype.lineWidth = 40;
        Gauge.prototype.paddingTop = 0.1;
        Gauge.prototype.paddingBottom = 0.1;
        Gauge.prototype.percentColors = null;
        Gauge.prototype.options = {
            colorStart: "#6fadcf",
            colorStop: void 0,
            gradientType: 0,
            strokeColor: "#e0e0e0",
            pointer: {
                length: 0.8,
                strokeWidth: 0.035,
                iconScale: 1.0
            },
            angle: 0.15,
            lineWidth: 0.44,
            radiusScale: 1.0,
            fontSize: 40,
            limitMax: false,
            limitMin: false
        };
        function Gauge(canvas) {
            var h, w;
            this.canvas = canvas;
            Gauge.__super__.constructor.call(this);
            this.percentColors = null;
            if (typeof G_vmlCanvasManager !== 'undefined') {
                this.canvas = window.G_vmlCanvasManager.initElement(this.canvas);
            }
            this.ctx = this.canvas.getContext('2d');
            h = this.canvas.clientHeight;
            w = this.canvas.clientWidth;
            this.canvas.height = h;
            this.canvas.width = w;
            this.gp = [new GaugePointer(this)];
            this.setOptions();
            this.render();
        }
        Gauge.prototype.setOptions = function(options) {
            var gauge, j, len, phi, ref;
            if (options == null) {
                options = null;
            }
            Gauge.__super__.setOptions.call(this, options);
            this.configPercentColors();
            this.extraPadding = 0;
            if (this.options.angle < 0) {
                phi = Math.PI * (1 + this.options.angle);
                this.extraPadding = Math.sin(phi);
            }
            this.availableHeight = this.canvas.height * (1 - this.paddingTop - this.paddingBottom);
            this.lineWidth = this.availableHeight * this.options.lineWidth;
            this.radius = (this.availableHeight - this.lineWidth / 2) / (1.0 + this.extraPadding);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ref = this.gp;
            for (j = 0,
            len = ref.length; j < len; j++) {
                gauge = ref[j];
                gauge.setOptions(this.options.pointer);
                gauge.render();
            }
            return this;
        }
        ;
        Gauge.prototype.configPercentColors = function() {
            var bval, gval, i, j, ref, results, rval;
            this.percentColors = null;
            if (this.options.percentColors !== void 0) {
                this.percentColors = new Array();
                results = [];
                for (i = j = 0,
                ref = this.options.percentColors.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
                    rval = parseInt((cutHex(this.options.percentColors[i][1])).substring(0, 2), 16);
                    gval = parseInt((cutHex(this.options.percentColors[i][1])).substring(2, 4), 16);
                    bval = parseInt((cutHex(this.options.percentColors[i][1])).substring(4, 6), 16);
                    results.push(this.percentColors[i] = {
                        pct: this.options.percentColors[i][0],
                        color: {
                            r: rval,
                            g: gval,
                            b: bval
                        }
                    });
                }
                return results;
            }
        }
        ;
        Gauge.prototype.set = function(value) {
            var gp, i, j, k, l, len, ref, ref1, val;
            if (!(value instanceof Array)) {
                value = [value];
            }
            for (i = j = 0,
            ref = value.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
                value[i] = this.parseValue(value[i]);
            }
            if (value.length > this.gp.length) {
                for (i = k = 0,
                ref1 = value.length - this.gp.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
                    gp = new GaugePointer(this);
                    gp.setOptions(this.options.pointer);
                    this.gp.push(gp);
                }
            } else if (value.length < this.gp.length) {
                this.gp = this.gp.slice(this.gp.length - value.length);
            }
            i = 0;
            for (l = 0,
            len = value.length; l < len; l++) {
                val = value[l];
                if (val > this.maxValue) {
                    if (this.options.limitMax) {
                        val = this.maxValue;
                    } else {
                        this.maxValue = val + 1;
                    }
                } else if (val < this.minValue) {
                    if (this.options.limitMin) {
                        val = this.minValue;
                    } else {
                        this.minValue = val - 1;
                    }
                }
                this.gp[i].value = val;
                this.gp[i++].setOptions({
                    minValue: this.minValue,
                    maxValue: this.maxValue,
                    angle: this.options.angle
                });
            }
            this.value = Math.max(Math.min(value[value.length - 1], this.maxValue), this.minValue);
            AnimationUpdater.run(this.forceUpdate);
            return this.forceUpdate = false;
        }
        ;
        Gauge.prototype.getAngle = function(value) {
            return (1 + this.options.angle) * Math.PI + ((value - this.minValue) / (this.maxValue - this.minValue)) * (1 - this.options.angle * 2) * Math.PI;
        }
        ;
        Gauge.prototype.getColorForPercentage = function(pct, grad) {
            var color, endColor, i, j, rangePct, ref, startColor;
            if (pct === 0) {
                color = this.percentColors[0].color;
            } else {
                color = this.percentColors[this.percentColors.length - 1].color;
                for (i = j = 0,
                ref = this.percentColors.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
                    if (pct <= this.percentColors[i].pct) {
                        if (grad === true) {
                            startColor = this.percentColors[i - 1] || this.percentColors[0];
                            endColor = this.percentColors[i];
                            rangePct = (pct - startColor.pct) / (endColor.pct - startColor.pct);
                            color = {
                                r: Math.floor(startColor.color.r * (1 - rangePct) + endColor.color.r * rangePct),
                                g: Math.floor(startColor.color.g * (1 - rangePct) + endColor.color.g * rangePct),
                                b: Math.floor(startColor.color.b * (1 - rangePct) + endColor.color.b * rangePct)
                            };
                        } else {
                            color = this.percentColors[i].color;
                        }
                        break;
                    }
                }
            }
            return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
        }
        ;
        Gauge.prototype.getColorForValue = function(val, grad) {
            var pct;
            pct = (val - this.minValue) / (this.maxValue - this.minValue);
            return this.getColorForPercentage(pct, grad);
        }
        ;
        Gauge.prototype.renderStaticLabels = function(staticLabels, w, h, radius) {
            var font, fontsize, j, len, match, re, ref, rest, rotationAngle, value;
            this.ctx.save();
            this.ctx.translate(w, h);
            font = staticLabels.font || "10px Times";
            re = /\d+\.?\d?/;
            match = font.match(re)[0];
            rest = font.slice(match.length);
            fontsize = parseFloat(match) * this.displayScale;
            this.ctx.font = fontsize + rest;
            this.ctx.fillStyle = staticLabels.color || "#000000";
            this.ctx.textBaseline = "bottom";
            this.ctx.textAlign = "center";
            ref = staticLabels.labels;
            for (j = 0,
            len = ref.length; j < len; j++) {
                value = ref[j];
                if ((!this.options.limitMin || value >= this.minValue) && (!this.options.limitMax || value <= this.maxValue)) {
                    rotationAngle = this.getAngle(value) - 3 * Math.PI / 2;
                    this.ctx.rotate(rotationAngle);
                    this.ctx.fillText(staticLabels.labelsText[j], 0, -radius - this.lineWidth / 2);
                    this.ctx.rotate(-rotationAngle);
                }
            }
            return this.ctx.restore();
        }
        ;
        Gauge.prototype.render = function() {
            var displayedAngle, fillStyle, gauge, h, j, k, len, len1, max, min, radius, ref, ref1, w, zone;
            w = this.canvas.width / 2;
            h = this.canvas.height * this.paddingTop + this.availableHeight - (this.radius + this.lineWidth / 2) * this.extraPadding;
            displayedAngle = this.getAngle(this.displayedValue);
            if (this.textField) {
                this.textField.render(this);
            }
            this.ctx.lineCap = "butt";
            radius = this.radius * this.options.radiusScale;
            if (this.options.staticLabels) {
                this.renderStaticLabels(this.options.staticLabels, w, h, radius);
            }
            if (this.options.staticZones) {
                this.ctx.save();
                this.ctx.translate(w, h);
                this.ctx.lineWidth = this.lineWidth;
                ref = this.options.staticZones;
                for (j = 0,
                len = ref.length; j < len; j++) {
                    zone = ref[j];
                    min = zone.min;
                    if (this.options.limitMin && min < this.minValue) {
                        min = this.minValue;
                    }
                    max = zone.max;
                    if (this.options.limitMax && max > this.maxValue) {
                        max = this.maxValue;
                    }
                    this.ctx.strokeStyle = zone.strokeStyle;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, radius, this.getAngle(min), this.getAngle(max), false);
                    this.ctx.stroke();
                }
                this.ctx.restore();
            } else {
                if (this.options.customFillStyle !== void 0) {
                    fillStyle = this.options.customFillStyle(this);
                } else if (this.percentColors !== null) {
                    fillStyle = this.getColorForValue(this.displayedValue, this.options.generateGradient);
                } else if (this.options.colorStop !== void 0) {
                    if (this.options.gradientType === 0) {
                        fillStyle = this.ctx.createRadialGradient(w, h, 9, w, h, 70);
                    } else {
                        fillStyle = this.ctx.createLinearGradient(0, 0, w, 0);
                    }
                    fillStyle.addColorStop(0, this.options.colorStart);
                    fillStyle.addColorStop(1, this.options.colorStop);
                } else {
                    fillStyle = this.options.colorStart;
                }
                this.ctx.strokeStyle = fillStyle;
                this.ctx.beginPath();
                this.ctx.arc(w, h, radius, (1 + this.options.angle) * Math.PI, displayedAngle, false);
                this.ctx.lineWidth = this.lineWidth;
                this.ctx.stroke();
                this.ctx.strokeStyle = this.options.strokeColor;
                this.ctx.beginPath();
                this.ctx.arc(w, h, radius, displayedAngle, (2 - this.options.angle) * Math.PI, false);
                this.ctx.stroke();
            }
            this.ctx.translate(w, h);
            ref1 = this.gp;
            for (k = 0,
            len1 = ref1.length; k < len1; k++) {
                gauge = ref1[k];
                gauge.update(true);
            }
            return this.ctx.translate(-w, -h);
        }
        ;
        return Gauge;
    }
    )(BaseGauge);
    BaseDonut = (function(superClass) {
        extend(BaseDonut, superClass);
        BaseDonut.prototype.lineWidth = 15;
        BaseDonut.prototype.displayedValue = 0;
        BaseDonut.prototype.value = 33;
        BaseDonut.prototype.maxValue = 80;
        BaseDonut.prototype.minValue = 0;
        BaseDonut.prototype.options = {
            lineWidth: 0.10,
            colorStart: "#6f6ea0",
            colorStop: "#c0c0db",
            strokeColor: "#eeeeee",
            shadowColor: "#d5d5d5",
            angle: 0.35,
            radiusScale: 1.0
        };
        function BaseDonut(canvas) {
            this.canvas = canvas;
            BaseDonut.__super__.constructor.call(this);
            if (typeof G_vmlCanvasManager !== 'undefined') {
                this.canvas = window.G_vmlCanvasManager.initElement(this.canvas);
            }
            this.ctx = this.canvas.getContext('2d');
            this.setOptions();
            this.render();
        }
        BaseDonut.prototype.getAngle = function(value) {
            return (1 - this.options.angle) * Math.PI + ((value - this.minValue) / (this.maxValue - this.minValue)) * ((2 + this.options.angle) - (1 - this.options.angle)) * Math.PI;
        }
        ;
        BaseDonut.prototype.setOptions = function(options) {
            if (options == null) {
                options = null;
            }
            BaseDonut.__super__.setOptions.call(this, options);
            this.lineWidth = this.canvas.height * this.options.lineWidth;
            this.radius = this.options.radiusScale * (this.canvas.height / 2 - this.lineWidth / 2);
            return this;
        }
        ;
        BaseDonut.prototype.set = function(value) {
            this.value = this.parseValue(value);
            if (this.value > this.maxValue) {
                if (this.options.limitMax) {
                    this.value = this.maxValue;
                } else {
                    this.maxValue = this.value;
                }
            } else if (this.value < this.minValue) {
                if (this.options.limitMin) {
                    this.value = this.minValue;
                } else {
                    this.minValue = this.value;
                }
            }
            AnimationUpdater.run(this.forceUpdate);
            return this.forceUpdate = false;
        }
        ;
        BaseDonut.prototype.render = function() {
            var displayedAngle, grdFill, h, start, stop, w;
            displayedAngle = this.getAngle(this.displayedValue);
            w = this.canvas.width / 2;
            h = this.canvas.height / 2;
            if (this.textField) {
                this.textField.render(this);
            }
            grdFill = this.ctx.createRadialGradient(w, h, 39, w, h, 70);
            grdFill.addColorStop(0, this.options.colorStart);
            grdFill.addColorStop(1, this.options.colorStop);
            start = this.radius - this.lineWidth / 2;
            stop = this.radius + this.lineWidth / 2;
            this.ctx.strokeStyle = this.options.strokeColor;
            this.ctx.beginPath();
            this.ctx.arc(w, h, this.radius, (1 - this.options.angle) * Math.PI, (2 + this.options.angle) * Math.PI, false);
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.lineCap = "round";
            this.ctx.stroke();
            this.ctx.strokeStyle = grdFill;
            this.ctx.beginPath();
            this.ctx.arc(w, h, this.radius, (1 - this.options.angle) * Math.PI, displayedAngle, false);
            return this.ctx.stroke();
        }
        ;
        return BaseDonut;
    }
    )(BaseGauge);
    Donut = (function(superClass) {
        extend(Donut, superClass);
        function Donut() {
            return Donut.__super__.constructor.apply(this, arguments);
        }
        Donut.prototype.strokeGradient = function(w, h, start, stop) {
            var grd;
            grd = this.ctx.createRadialGradient(w, h, start, w, h, stop);
            grd.addColorStop(0, this.options.shadowColor);
            grd.addColorStop(0.12, this.options._orgStrokeColor);
            grd.addColorStop(0.88, this.options._orgStrokeColor);
            grd.addColorStop(1, this.options.shadowColor);
            return grd;
        }
        ;
        Donut.prototype.setOptions = function(options) {
            var h, start, stop, w;
            if (options == null) {
                options = null;
            }
            Donut.__super__.setOptions.call(this, options);
            w = this.canvas.width / 2;
            h = this.canvas.height / 2;
            start = this.radius - this.lineWidth / 2;
            stop = this.radius + this.lineWidth / 2;
            this.options._orgStrokeColor = this.options.strokeColor;
            this.options.strokeColor = this.strokeGradient(w, h, start, stop);
            return this;
        }
        ;
        return Donut;
    }
    )(BaseDonut);
    window.AnimationUpdater = {
        elements: [],
        animId: null,
        addAll: function(list) {
            var elem, j, len, results;
            results = [];
            for (j = 0,
            len = list.length; j < len; j++) {
                elem = list[j];
                results.push(AnimationUpdater.elements.push(elem));
            }
            return results;
        },
        add: function(object) {
            return AnimationUpdater.elements.push(object);
        },
        run: function(force) {
            var elem, finished, isCallback, j, len, ref;
            if (force == null) {
                force = false;
            }
            isCallback = isFinite(parseFloat(force));
            if (isCallback || force === true) {
                finished = true;
                ref = AnimationUpdater.elements;
                for (j = 0,
                len = ref.length; j < len; j++) {
                    elem = ref[j];
                    if (elem.update(force === true)) {
                        finished = false;
                    }
                }
                return AnimationUpdater.animId = finished ? null : requestAnimationFrame(AnimationUpdater.run);
            } else if (force === false) {
                if (AnimationUpdater.animId === !null) {
                    cancelAnimationFrame(AnimationUpdater.animId);
                }
                return AnimationUpdater.animId = requestAnimationFrame(AnimationUpdater.run);
            }
        }
    };
    if (typeof window.define === 'function' && (window.define.amd != null)) {
        define(function() {
            return {
                Gauge: Gauge,
                Donut: Donut,
                BaseDonut: BaseDonut,
                TextRenderer: TextRenderer
            };
        });
    } else if (typeof module !== 'undefined' && (module.exports != null)) {
        module.exports = {
            Gauge: Gauge,
            Donut: Donut,
            BaseDonut: BaseDonut,
            TextRenderer: TextRenderer
        };
    } else {
        window.Gauge = Gauge;
        window.Donut = Donut;
        window.BaseDonut = BaseDonut;
        window.TextRenderer = TextRenderer;
    }
}
).call(this);
var version = '0.2.054';
$(document).ready(function() {
    jsll(contInit);
});
function contInit() {
    initCustomMenu();
    $('body').click(function(event) {
        if ($STATEGame)
            return;
        if (!$(event.target).hasClass('centerBlock') && !$(event.target).parent().hasClass('centerBlock') && !$(event.target).parent().parent().hasClass('centerBlock'))
            return;
        if ($STATE == stPause) {
            stopRecognition();
            $STATE = afterPauseState >= 0 ? afterPauseState : stRun;
            afterPauseState = -1;
        } else {
            if ($STATE == stRun) {
                stopRecognition();
                $STATE = stPause;
            }
        }
    });
    $('body').on('keypress', function(e) {
        if (e.which === 32) {
            if ($STATE == stPause) {
                $STATE = afterPauseState >= 0 ? afterPauseState : stRun;
                afterPauseState = -1;
            } else {
                if ($STATE == stRun) {
                    $STATE = stPause;
                }
            }
        }
    });
    if (window.hasOwnProperty('speechSynthesis')) {
        window.speechSynthesis.onvoiceschanged = function() {
            loadVoices();
        }
        ;
    }
    switch (window.location.hash.substr(1)) {
    case "game-abakus":
        $("body").show();
        setTimeout(function() {
            game_abakus_run();
        }, 1000);
        return;
        break;
    }
    initTrains();
    $("body").show();
}
var $STATE;
var stInit = 0;
var stRun = 1;
var stPause = 2;
var stInput = 3;
var stWriteAnswer = 4;
var stShowResult = 5;
var stSayAnswer = 6;
var stShowAnswer = 7;
var stGame = 8;
$STATE = stInit;
var $STATEGame = false;
var $currentIndex_Train = 0;
var $currentIndex_Task = 0;
var $currentIndex_TaskItem = 0;
var $countProgress;
var $countProgressAll;
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
var recognition;
var viocesLoaded = false;
var $flag_micEnable = false;
var afterPauseState = -1;
var $trains = [];
function initTrains($initTrains) {
    $trains = $initTrains;
    var t = $('#trains').html();
    if (t) {
        $trains = JSON.parse(t);
        $(".navbar").hide();
    }
    if (!$trains || !$trains.length) {
        say('Добро пожаловать в тренажер счёта!');
        $('#navbarParams').collapse('show');
        return;
    }
    msg = null;
    $STATEGame = false;
    $STATE = stInit;
    doTick(100);
}
var timerPause;
var $mainTimer;
function doTick(wainMS) {
    clearTimeout($mainTimer);
    $mainTimer = setTimeout(tick, wainMS);
}
function doActionsByStatus() {
    ($STATE == stRun) ? $('body').addClass("statusRun") : $('body').removeClass("statusRun");
}
function tick() {
    doActionsByStatus();
    if ($currentIndex_Train >= $trains.length && ($STATE != stShowResult)) {
        $STATE = stShowResult;
        doTick(10);
        return;
    }
    $train = $currentIndex_Train < $trains.length ? $trains[$currentIndex_Train] : null;
    switch ($STATE) {
    case stInit:
        $('.centerBlock').removeClass("pauseBlock");
        $('.centerBlock').removeClass("bigFont");
        $('.centerBlock').removeClass('enterReply');
        $('.centerBlock').removeClass('startImg');
        if ($currentIndex_Train == 0) {
            if ($train.flag_show_voiceDisable) {
                recognition = null;
            } else {
                initSpeechRecognition();
            }
            if (!$train.hasOwnProperty('pause_start2')) {
                $train.pause_start2 = $train.pause_start;
                $train.counterStart = new klx_counter($(window).width() / 1.1,$(window).height() / 1.3);
                $('.centerBlock').html('');
                $(".centerBlock").append($train.counterStart.svg);
            }
            if ($train.pause_start == -1) {
                if ($train.textHTML_start) {
                    $('.centerBlock').html('<span style="font-size: 10vw;">' + $train.textHTML_start + '</span>');
                    $train.pause_start = 15;
                    $train.pause_start2 = $train.pause_start;
                    afterPauseState = stInit;
                } else {
                    $('.centerBlock').html('<span style="font-size: 10vw;">Нажмите кнопку для старта</span>');
                }
                sayhint("Нажмите кнопку для старта");
                waitCommandRec({
                    command: 'дальше',
                    func: function() {
                        $STATE = stRun;
                        doTick(10);
                    }
                });
                $STATE = stPause;
                doTick(10);
                return;
            } else {
                if ($train.pause_start2 > 0) {
                    if ($train.pause_start2 == $train.pause_start) {
                        $sec = "секунд";
                        switch ($train.pause_start2) {
                        case "1":
                            $sec = "секунду";
                            break;
                        case "2":
                        case "3":
                        case "4":
                            $sec = "секунды";
                            break;
                        }
                        sayhint("Старт через " + $train.pause_start2 + " " + $sec);
                        waitCommandRec({
                            command: 'дальше',
                            func: function() {
                                $train.pause_start2 = 0;
                            }
                        });
                    }
                    $train.pause_start2 = $train.pause_start2 - 1;
                    $train.counterStart.setPercent($train.pause_start2 * 100 / ($train.pause_start), $train.pause_start2 > 0 ? $train.pause_start2 : "Старт");
                    doTick(1000);
                    return;
                } else {
                    $train.counterStart.remove();
                    $train.counterStart = null;
                    stopRecognition();
                    $STATE = stRun;
                    doTick(10);
                    return;
                }
            }
        }
        break;
    case stRun:
        $('.centerBlock').removeClass("pauseBlock");
        $('.centerBlock').addClass("bigFont");
        $('.centerBlock').removeClass('enterReply');
        break;
    case stPause:
        $('.centerBlock').addClass("pauseBlock");
        doTick(100);
        return;
        break;
    case stSayAnswer:
        $('.centerBlock').removeClass('bigFont');
        $('.centerBlock').addClass('pauseBlock');
        $('.centerBlock').addClass('enterReply');
        if ($train.flag_show_twoScreen) {
            $('.centerBlock #screen1').html('<span style="font-size: 5vw;">Скажите ответ вслух</span>');
            $('.centerBlock #screen2').html('<span style="font-size: 5vw;">Скажите ответ вслух</span>');
        } else {
            $('.centerBlock').html('<span style="font-size: 7vw;">Скажите ответ вслух</span>');
        }
        sayhint("Скажите ответ вслух");
        waitCommandRec({
            command: 'дальше',
            func: function() {
                progressInit(-1);
                $STATE = stShowAnswer;
                doTick(10);
            }
        });
        $STATE = stShowAnswer;
        doTick($train.pause_answer * 1000);
        progressInit($train.pause_answer);
        return;
        break;
    case stShowAnswer:
        $('.centerBlock').removeClass('bigFont');
        $('.centerBlock').addClass('pauseBlock');
        $('.centerBlock').addClass('enterReply');
        $t = $tasks[$currentIndex_Task - 1];
        if ($train.flag_show_twoScreen) {
            $t = $tasks[$currentIndex_Task - 2];
            $('.centerBlock #screen1').html('<span style="font-size: 15vw;">' + $t.result + '</span><div id="res"></div><progress max="' + $tasks.length + '" value="' + $currentIndex_Task + '" style="width:70%;height:10px;"></progress><div id="counter" style="font-size: 4vw;"></div>');
            $('.centerBlock #screen1 #counter').html("Показано " + $currentIndex_Task + " из " + $tasks.length);
            $t = $tasks[$currentIndex_Task - 1];
            $('.centerBlock #screen2').html('<span style="font-size: 15vw;">' + $t.result + '</span><div id="res"></div><progress max="' + $tasks.length + '" value="' + $currentIndex_Task + '" style="width:70%;height:10px;"></progress><div id="counter" style="font-size: 4vw;"></div>');
            $('.centerBlock #screen2 #counter').html("Показано " + $currentIndex_Task + " из " + $tasks.length);
        } else {
            $('.centerBlock').html('<span style="font-size: 15vw;">' + $t.result + '</span><div id="res"></div><progress max="' + $tasks.length + '" value="' + $currentIndex_Task + '" style="width:70%;height:10px;"></progress><div id="counter" style="font-size: 4vw;"></div>');
            $('.centerBlock #counter').html("Показано " + $currentIndex_Task + " из " + $tasks.length);
            sayhint("Правильный ответ " + $t.result);
        }
        waitCommandRec({
            command: 'дальше',
            func: function() {
                progressInit(-1);
                $STATE = stRun;
                doTick(10);
            }
        });
        $STATE = stRun;
        doTick($train.pause_result * 1000);
        progressInit($train.pause_result);
        return;
        break;
    case stInput:
        $('.centerBlock').removeClass('bigFont');
        $('.centerBlock').addClass('pauseBlock');
        $('.centerBlock').addClass('enterReply');
        var $classInput = 'inputReply' + $currentIndex_Task;
        if ($train.flag_show_twoScreen) {
            $('.centerBlock #screen1').html('<h3>Введите ' + ($flag_micEnable ? 'или скажите ' : '') + 'ответ:</h3><input id="inputReply" type="number" class="' + $classInput + '"><br><button onclick="' + "event.stopPropagation();$('#inputReply." + $classInput + "').trigger(jQuery.Event('keypress',{ which:13 }));" + '">OK</button>');
            $('#screen1 #inputReply').focus();
            $('.centerBlock #screen2').html('<h3>Введите ' + ($flag_micEnable ? 'или скажите ' : '') + 'ответ:</h3><input id="inputReply2" type="number" class="' + $classInput + '"><br><button onclick="' + "event.stopPropagation();$('#inputReply." + $classInput + "').trigger(jQuery.Event('keypress',{ which:13 }));" + '">OK</button>');
        } else {
            if ($flag_micEnable) {
                sayhint("Введите или скажите ответ");
            } else {
                sayhint("Введите ответ");
            }
            startRecognition();
            $('.centerBlock').html('<h2>Введите ' + ($flag_micEnable ? 'или скажите ' : '') + 'ответ:</h2><input id="inputReply" type="number" class="' + $classInput + '"><br><button onclick="' + "event.stopPropagation();$('#inputReply." + $classInput + "').trigger(jQuery.Event('keypress',{ which:13 }));" + '">OK</button>');
            $('#inputReply').focus();
        }
        $('#inputReply, #inputReply2').on('keyup', function(e) {
            $t = $tasks[$currentIndex_Task - 1];
            if ($train.flag_show_twoScreen) {
                $t = $tasks[$currentIndex_Task - ($(this).attr('id') == "inputReply" ? 2 : 1)];
            }
            $len = ($t.result + "").length;
            $len2 = ($(this).val() + "").length;
            if ($len == $len2) {
                $(this).trigger(jQuery.Event('keypress', {
                    which: 13
                }));
            }
        });
        $('#inputReply, #inputReply2').on('keypress', function(e) {
            if (e.which === 13) {
                $twoScreen = $(this).attr('id') == "inputReply2";
                $classTwo = $train.flag_show_twoScreen ? ($twoScreen ? "#screen2" : "#screen1") : "";
                stopRecognition();
                $t = $tasks[$currentIndex_Task - 1];
                if ($train.flag_show_twoScreen) {
                    $t = $tasks[$currentIndex_Task - ($(this).attr('id') == "inputReply" ? 2 : 1)];
                }
                $t.result2 = $(this).val();
                $t.result_flag = $(this).val() == $t.result;
                $('.centerBlock ' + $classTwo).html('<div class="res" style="font-size: 6vw;"></div><div class="res2" style="font-size: 4vw;"></div><progress max="' + $tasks.length + '" value="' + $currentIndex_Task + '" style="width:70%;height:10px;"></progress><div class="counter" style="font-size: 4vw;"></div>');
                if (!$train.flag_show_noTrueAnswer) {
                    if ($t.result_flag) {
                        $('.centerBlock ' + $classTwo + ' .res').html("Верно!");
                        sayhint('Верно');
                    } else {
                        $('.centerBlock ' + $classTwo + ' .res').html("Ошибка!");
                        $('.centerBlock ' + $classTwo + ' .res2').html('<span style="color:red;">' + (($(this).val() + "").length > 0 ? $(this).val() : '?') + '</span> ≠ ' + $t.result);
                        sayhint('Ошибка');
                    }
                }
                $('.centerBlock ' + $classTwo + ' .counter').html("Показано " + $currentIndex_Task + " из " + $tasks.length);
                $flagAllDone = false;
                if ($train.flag_show_twoScreen) {
                    $('.centerBlock input').focus();
                    $flagAllDone = $('.centerBlock .res').length == 2;
                } else {
                    $flagAllDone = $('.centerBlock .res').length == 1;
                }
                if ($flagAllDone) {
                    progressInit(-1);
                    $('.centerBlock').removeClass('enterReply');
                    $('.centerBlock').removeClass('pauseBlock');
                    if ($train.pause_result >= 0) {
                        $STATE = stRun;
                        doTick($train.pause_result * 1000);
                        progressInit($train.pause_result);
                    } else {
                        $STATE = stPause;
                        doTick(100);
                    }
                }
            }
        });
        if ($train.pause_answer >= 5) {
            setTimeout(function() {
                $('input.' + $classInput).trigger(jQuery.Event('keypress', {
                    which: 13
                }));
            }, $train.pause_answer * 1000);
            waitCommandRec({
                command: 'дальше',
                func: function() {
                    progressInit(-1);
                    $('#inputReply.' + $classInput).trigger(jQuery.Event('keypress', {
                        which: 13
                    }));
                }
            });
            progressInit($train.pause_answer);
        }
        return;
        break;
    case stWriteAnswer:
        $('.centerBlock').removeClass('bigFont');
        $('.centerBlock').addClass('pauseBlock');
        $('.centerBlock').addClass('enterReply');
        $('.centerBlock').html('<h2>Запишите ответ</h2><div id="res"></div><progress max="' + $tasks.length + '" value="' + $currentIndex_Task + '" style="width:70%;height:10px;"></progress><div id="counter" style="font-size: 4vw;"></div>');
        $('.centerBlock #counter').html("Показано " + $currentIndex_Task + " из " + $tasks.length);
        sayhint('Запишите ответ');
        waitCommandRec({
            command: 'дальше',
            func: function() {
                progressInit(-1);
                $STATE = stRun;
                doTick(10);
            }
        });
        $STATE = stRun;
        doTick($train.pause_answer * 1000);
        progressInit($train.pause_answer);
        return;
        break;
    case stShowResult:
        $('.centerBlock').removeClass('bigFont');
        var $train = $trains[0];
        if ($train.type_view == 1) {
            var $res = '<div class="showAllResult"><table>';
            if ($train.name)
                $res += writeLineResult('Имя:', $train.name);
            $colorTime = '';
            for (var i = 0; i < staticZones.length; i++) {
                if (staticZones[i].min <= -$train.pause_default && staticZones[i].max >= -$train.pause_default) {
                    $colorTime = staticZones[i].strokeStyle;
                }
            }
            $res += writeLineResult('Пауза при показе:', '<span style="color:' + ($colorTime ? $colorTime : '') + '">' + $train.pause_default + ' сек.</span>');
            $res += writeLineResult('Всего примеров:', $train.taskText.length + ' по ' + $train.taskText[0].values.length);
            $options = [];
            if ($train.flag_show_twoScreen)
                $options.push("Два экрана");
            if ($train.flag_show_changePosition)
                $options.push("Изменение позиции");
            $res += writeLineResult('Усложнения:', ($options.length ? $options.join(', ') : "Нет"));
            $trueCount = 0;
            for (var i = 0; i < $train.taskText.length; i++) {
                if ($train.taskText[i].result_flag)
                    $trueCount++;
            }
            $falseCount = $train.taskText.length - $trueCount;
            $percent = Math.ceil(100 * $trueCount / $train.taskText.length);
            if (!$train.flag_show_replyOne) {
                $res += writeLineResult('Правильно:', $trueCount + ' - ' + parseInt(100 * $trueCount / $train.taskText.length) + '%');
                $res += writeLineResult('Ошибок:', '<span style="color:' + ($falseCount ? 'red' : 'green') + '">' + $falseCount + ' - ' + parseInt(100 * $falseCount / $train.taskText.length) + '%</span>');
                $res += '<tr><td colspan="2" style="text-align:center;"><progress id="resultProgress" max="100" value="' + $percent + '"></progress><br>';
                $res += '<span class="resultProc" style="color:' + ($falseCount ? 'red' : 'green') + '">' + $percent + '%</span></td></tr>';
            } else {
                sayhint($percent + '% примеров решено верно!');
            }
            $res += '<tr><td colspan="2" style="text-align:center;">' + (new Date()).toLocaleString() + '</td></tr>';
            $res += '<tr><td colspan="2" style="text-align:center;"><button type="button" class="btn btn-primary d-print-none" style="width:50%;font-size: 3vw;" onclick="initOptionAndStart();">⚡️ Повторить</button></td></tr>';
            $res += '</table></div>';
            if ($train.name)
                sayhint($train.name + ' тренировка окончена.');
            waitCommandRec({
                command: 'повторить',
                func: function() {
                    initOptionAndStart();
                }
            });
        } else {
            var $res = '<div class="showAllResult2">';
            if ($train.textHTML_end) {
                $res += $train.textHTML_end;
            }
            if ($train.flag_show_allResults) {
                for (var i = 0; i < $train.taskText.length; i++) {
                    $res += '<div class="resultItem"><div class="cap">' + (i + 1) + '</div>' + $train.taskText[i].result + '</div>';
                }
            }
            $res += '<br><div>' + (new Date()).toLocaleString() + '</div>';
            if ($train.flag_show_allResults) {
                $res += '<br><button type="button" class="btn btn-primary d-print-none" style="width:50%;font-size: 3vw;" onclick="initOptionAndStart();">⚡️ Повторить</button>';
            }
            $res += '</div>';
            sayhint('На экране таблица с ответами.');
            waitCommandRec({
                command: 'повторить',
                func: function() {
                    initOptionAndStart();
                }
            });
        }
        $('.centerBlock').html($res);
        return;
        break;
    }
    if ($train.type_view == 1) {}
    if (Array.isArray($train.taskText)) {
        $tasks = $train.taskText;
    } else {
        $tasks = jQuery.parseJSON($train.taskText);
    }
    if ($currentIndex_Task >= $tasks.length) {
        $currentIndex_Train++;
        $currentIndex_Task = 0;
        doTick(10);
        return;
    }
    $task = $tasks[$currentIndex_Task];
    $taskItems = $task;
    if ($currentIndex_TaskItem >= $taskItems.values.length) {
        $currentIndex_Task++;
        if ($train.flag_show_twoScreen)
            $currentIndex_Task++;
        $currentIndex_TaskItem = 0;
        if ($train.flag_show_replyOne) {
            $STATE = stSayAnswer;
            doTick(10);
            return;
        } else {
            if ($train.type_view == 1) {
                $STATE = stInput;
                doTick(10);
                return;
            } else {
                $STATE = stWriteAnswer;
                doTick(10);
                return;
            }
        }
        return;
    }
    if ($currentIndex_TaskItem == 0) {
        $('.centerBlock').html('');
    }
    $taskItem = $taskItems.values[$currentIndex_TaskItem];
    $('.centerBlock').fadeOut(50, function() {
        if (Math.abs(parseInt($taskItem)) > 0) {
            $('.centerBlock').addClass('bigFont');
            if ($train.flag_show_twoScreen) {
                var twoScreenDIV = $(".centerBlock #twoScreenDIV");
                if (!twoScreenDIV.length) {
                    var twoScreenDIV = $(".centerBlock").append('<div class="row" id="twoScreenDIV"><div class="col-6"><div id="screen1"></div></div><div class="col-6"><div id="screen2"></div></div></div>');
                }
                $('.centerBlock #screen1').html('<span>' + $taskItem + '</span>');
                setFontNumber($taskItem, $train, "#screen1", 1);
                $taskItem2 = $tasks[$currentIndex_Task + 1].values[$currentIndex_TaskItem];
                $('.centerBlock #screen2').html('<span>' + $taskItem2 + '</span>');
                setFontNumber($taskItem2, $train, "#screen2", 2);
            } else {
                $type_calc = $('input[type=radio][name=type_calc]:checked').val();
                if ($type_calc == 3) {
                    $(".centerBlock").html("");
                    $("#abakus").remove();
                    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    $(svg).attr('id', 'abakus');
                    $(svg).attr('preserveAspectRatio', "xMidYMin meet");
                    $('<link xmlns="http://www.w3.org/1999/xhtml" rel="stylesheet" href="/style/games-train.css" type="text/css"/>').appendTo($(svg));
                    $(".centerBlock").append(svg);
                    var draw = SVG('abakus');
                    abakusObj = new klx_abakus(draw,($taskItem + "").length,1);
                    abakusObj.flagNoAnimate = true;
                    abakusObj.setValue($taskItem);
                    draw.viewbox(0, 0, abakusObj.width, abakusObj.height);
                    draw.size("100%", "50vh");
                } else {
                    $('.centerBlock').html('<span>' + $taskItem + '</span>');
                    setFontNumber($taskItem, $train);
                }
            }
        } else {
            $('.centerBlock').removeClass('bigFont');
        }
        $('.centerBlock').fadeIn(50, function() {
            $currentIndex_TaskItem++;
            $mainTimer = doTick($train.pause_default * 1000);
        });
    });
}
var twoScreenDIV = null
function writeLineResult($name, $result) {
    var $res = '';
    $res += '<tr>';
    $res += '<th>';
    $res += $name;
    $res += '</th>';
    $res += '<td>';
    $res += $result;
    $res += '</td>';
    $res += '</tr>';
    return $res;
}
function writeLineResult2($name, $result) {
    var $res = '';
    $res += '<div class="row">';
    $res += '<div class="col-sm-6" style="text-align: right;">';
    $res += $name;
    $res += '</div>';
    $res += '<div class="col-sm-6" style="text-align: left;">';
    $res += $result;
    $res += '</div>';
    $res += '</div>';
    return $res;
}
$.fn.textWidth = function(text, font) {
    if (!$.fn.textWidth.fakeEl)
        $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
    $.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
    return [$.fn.textWidth.fakeEl.width(), $.fn.textWidth.fakeEl.height()];
}
;
function setFontNumber($val, $train, $place, $indexPlace) {
    $place = $place ? $place : "";
    $train.param_font_size ? $('.bigFont').css('font-size', $train.param_font_size + 'vw') : $('.bigFont').css('font-size', $train.param_font_size + '45vw');
    $len = ($val + "").length;
    if ($len > 3) {
        $('.centerBlock span').css('font-size', (100 - ($len < 9 ? $len : 8) * 10) + '%');
    }
    if ($train.param_font_color) {
        $('.centerBlock ' + $place + ' span').css('color', $train.param_font_color);
    } else {
        if ($train.flag_show_changeColor)
            $('.centerBlock ' + $place + ' span').css('color', getRandomColor3(0));
    }
    if ($train.flag_show_changePosition) {
        $('.centerBlock ' + $place + ' span').css('font-size', (100 - $len * 10) / 2 + '%');
        $('.centerBlock ' + $place + ' span').css('position', 'absolute');
        $ww = $('.centerBlock ' + $place + ' span').textWidth();
        $left = ($('.centerBlock').parent().width() - $ww[0] - 30 * $len) * Math.random();
        $top = ($('.centerBlock').height() - $ww[1] - 30 * $len) * Math.random();
        if ($top < 50)
            $top = 50;
        if ($train.flag_show_twoScreen) {
            if ($indexPlace == 1) {
                $left = $left / 2;
            } else {
                $left = $left / 2 - 50;
            }
            $top = $top - $('.centerBlock').height() / 2;
        }
        $('.centerBlock ' + $place + ' span').css('left', parseInt($left) + 'px');
        $('.centerBlock ' + $place + ' span').css('top', parseInt($top) + 'px');
    }
    if ($train.flag_show_changeFont) {
        var $fontType = ["Arial", "Verdana", "Helvetica"];
        $('.centerBlock ' + $place + ' span').css('fontFamily', $fontType[Math.floor(Math.random() * $fontType.length)]);
        $('.centerBlock ' + $place + ' span').css('font-size', ((100 - $len * 10) / 2 + (10 * Math.random() - 5)) + '%');
    }
    if ($train.flag_show_soundNumbers && !$train.flag_show_twoScreen) {
        sayNumber($val);
    }
}
function getRandomColor3(brightness) {
    var rgb = [Math.random() * 256, Math.random() * 256, Math.random() * 256];
    var mix = [brightness * 51, brightness * 51, brightness * 51];
    var mixedrgb = [rgb[0] + mix[0], rgb[1] + mix[1], rgb[2] + mix[2]].map(function(x) {
        return Math.round(x / 2.0)
    })
    return "rgb(" + mixedrgb.join(",") + ")";
}
var gauge;
var staticZones = [{
    strokeStyle: "#DFE3FE",
    color: "white",
    min: -4,
    max: -3
}, {
    strokeStyle: "#CACFFA",
    color: "white",
    min: -3,
    max: -2
}, {
    strokeStyle: "#8D9AFF",
    color: "white",
    min: -2,
    max: -1.5
}, {
    strokeStyle: "#30B32D",
    color: "white",
    min: -1.5,
    max: -1
}, {
    strokeStyle: "#FFDD00",
    color: "black",
    min: -1,
    max: -0.5
}, {
    strokeStyle: "#F03E3E",
    color: "white",
    min: -0.5,
    max: -0.1
}];
function changeTypeView() {
    var $val = $('input[type=radio][name=type_view]:checked').val();
    $(".type_view1").hide();
    $(".type_view2").hide();
    if ($val == '1') {
        $(".type_view1").fadeIn('fast');
    } else if ($val == '2') {
        $(".type_view2").fadeIn('fast');
    }
}
function changeTypeCalc() {
    var $val = $('input[type=radio][name=type_calc]:checked').val();
    $(".type_calc1").hide();
    $(".type_calc2").hide();
    $(".type_calc3").hide();
    switch ($val) {
    case '1':
        $(".type_calc1").fadeIn('fast');
        break;
    case '2':
        $(".type_calc2").fadeIn('fast');
        break;
    case '3':
        $(".type_calc3").fadeIn('fast');
        break;
    }
}
function initCustomMenu() {
    if ($("#param_speed").length == 0) {
        return;
    }
    $(".RangeSlider").ionRangeSlider();
    $('input:radio[name=type_view]').change(changeTypeView);
    $('input:radio[name=type_calc]').change(changeTypeCalc);
    $("#param_speed").on("change", function() {
        var $this = $(this)
          , value = $this.prop("value");
        if (gauge) {
            gauge.set(value);
        }
        for (var i = 0; i < staticZones.length; i++) {
            if (staticZones[i].min <= value && staticZones[i].max >= value) {
                $(".gaugePlace .irs-single").css("background-color", staticZones[i].strokeStyle);
                $(".gaugePlace .irs-single::after").css("border-top-color", staticZones[i].strokeStyle);
                if (staticZones[i].color) {
                    $(".gaugePlace .irs-single").css("color", staticZones[i].color);
                }
            }
        }
    });
    $("#param_speed").data("ionRangeSlider").update({
        prettify: function(num) {
            return Math.abs(num);
        }
    });
    $("#pause_start").data("ionRangeSlider").update({
        prettify: function(num) {
            return num < 0 ? "Стоп" : num;
        }
    });
    $("#pause_answer").data("ionRangeSlider").update({
        prettify: function(num) {
            return num < 5 ? "Стоп" : num;
        }
    });
    $("#pause_result").data("ionRangeSlider").update({
        prettify: function(num) {
            return num < 0 ? "Стоп" : num;
        }
    });
    $('#navbarParams').on('shown.bs.collapse', function() {
        $STATE = stPause;
        initGauge();
        setTimeout(loadOptions, 100);
        $('main').hide();
        $('body').addClass("paramsOpen");
        $('body').removeClass("paramsClose");
    });
    $('#navbarParams').on('hidden.bs.collapse', function() {
        $('main').show();
        $('body').removeClass("paramsOpen");
        $('body').addClass("paramsClose");
    });
    var formatSelect2 = function(icon) {
        var originalOption = icon.element;
        return '<i class="fa ' + $(originalOption).data('icon') + '"></i> ' + icon.text;
    }
    $('.Select2').select2({
        width: "100%",
        templateSelection: formatSelect2,
        templateResult: formatSelect2,
        minimumResultsForSearch: Infinity,
        escapeMarkup: function(text) {
            return text;
        }
    });
    $("#doTrainButton").on('click', function() {
        initOptionAndStart()
    });
}
var jsarr = ['https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js', 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.2.0/js/ion.rangeSlider.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.4/js/select2.min.js'];
var jsl = 0;
var cssarr = ['https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css', 'https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.2.0/css/ion.rangeSlider.min.css', 'https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.2.0/css/ion.rangeSlider.skinModern.min.css', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.4/css/select2.min.css', 'https://use.fontawesome.com/releases/v5.2.0/css/all.css', '/style/css-full-train.css?vv=2' + version];
var cssl = 0;
function jsll($f) {
    if (!jsl) {
        cssarr.forEach(function(it) {
            $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', it + '?' + version));
        });
    }
    $.getScript(jsarr[jsl], function() {
        jsl++;
        if (jsl < jsarr.length) {
            jsll($f);
        } else {
            $f.call();
        }
    });
}
function initGauge() {
    var opts = {
        angle: 0.15,
        lineWidth: 0.1,
        radiusScale: 1,
        pointer: {
            length: 0.45,
            strokeWidth: 0.03,
            color: '#20b426'
        },
        staticLabels: {
            font: "10px sans-serif",
            labels: [-4, -3, -2, -1.5, -1, -0.5, -0.1],
            labelsText: [4, 3, 2, 1.5, 1, 0.5, 0.1],
            fractionDigits: 1
        },
        staticZones: staticZones,
        limitMax: false,
        limitMin: false,
        highDpiSupport: true
    };
    var target = document.getElementById('canvas-speed');
    gauge = new Gauge(target).setOptions(opts);
    gauge.maxValue = -0.05;
    gauge.setMinValue(-4.1);
    gauge.animationSpeed = 32;
    gauge.set(-1);
}
var timerWaitId;
function progressInit($sec) {
    $countProgress = $sec;
    $countProgressAll = $sec;
    if ($sec < 1) {
        clearTimeout(timerWaitId);
        $('#mainProgress').hide();
        return;
    }
    progressStart();
}
function progressShow(hide) {
    $('#mainProgress').prop('value', 100);
    hide ? $('#mainProgress').hide() : $('#mainProgress').show();
}
function progressSet(val) {
    $('#mainProgress').prop('value', val);
    $('#mainProgress').show();
    if (val < 5)
        $('#mainProgress').hide();
}
function progressStart() {
    timerWaitId = setTimeout(progressStart_tick, 1000);
}
function progressStart_tick() {
    $countProgress--;
    progressSet(100 * $countProgress / $countProgressAll);
    if ($countProgress >= 0) {
        progressStart();
    }
}
function initOptionAndStart() {
    window.history.pushState({}, "", "#");
    $currentIndex_Train = 0;
    $currentIndex_Task = 0;
    $currentIndex_TaskItem = 0;
    var $sliderDigits = $("#param_digits").data("ionRangeSlider");
    var $sliderDigits1 = $("#param_digits1").data("ionRangeSlider");
    var $sliderDigits2 = $("#param_digits2").data("ionRangeSlider");
    var $sliderDecimalPlaces1 = $("#param_decimal_places1").data("ionRangeSlider");
    var $sliderDecimalPlaces2 = $("#param_decimal_places2").data("ionRangeSlider");
    var $sliderDigits3 = $("#param_digits3").data("ionRangeSlider");
    var $sliderDigits4 = $("#param_digits4").data("ionRangeSlider");
    var $sliderDecimalPlaces3 = $("#param_decimal_places3").data("ionRangeSlider");
    var $sliderDecimalPlaces4 = $("#param_decimal_places4").data("ionRangeSlider");
    $train = {
        name: $('#inputName').val(),
        taskText: "",
        param_zakon5: $("#zak5").val(),
        param_zakon10: $("#zak10").val(),
        param_otrab: $("#otrab").val(),
        type_calc: $('input[type=radio][name=type_calc]:checked').val(),
        param_raz: [$sliderDigits.result.from, $sliderDigits.result.to],
        param_raz1: [$sliderDigits1.result.from, $sliderDigits1.result.to],
        param_raz2: [$sliderDigits2.result.from, $sliderDigits2.result.to],
        param_raz3: [$sliderDigits3.result.from, $sliderDigits3.result.to],
        param_raz4: [$sliderDigits4.result.from, $sliderDigits4.result.to],
        param_decimal_places1: [$sliderDecimalPlaces1.result.from, $sliderDecimalPlaces1.result.to],
        param_decimal_places2: [$sliderDecimalPlaces2.result.from, $sliderDecimalPlaces2.result.to],
        param_decimal_places3: [$sliderDecimalPlaces3.result.from, $sliderDecimalPlaces3.result.to],
        param_decimal_places4: [$sliderDecimalPlaces4.result.from, $sliderDecimalPlaces4.result.to],
        param_count: $("#param_count").val(),
        param_count_example: $("#param_count_example").val(),
        type_view: $('input[type=radio][name=type_view]:checked').val(),
        pause_default: Math.abs($("#param_speed").val()),
        pause_answer: $("#pause_answer").val(),
        pause_start: $("#pause_start").val(),
        pause_result: $("#pause_result").val(),
        param_arifmetika: $("#myTabCalcMethod .active").attr("data-id")
    };
    $('.saveParam').each(function() {
        if (($(this).prop("id") + "").indexOf("flag_") == 0) {
            $train[$(this).prop("id")] = $(this).prop('checked') ? 1 : 0;
        }
        if (($(this).prop("id") + "").indexOf("select_") == 0) {
            $train[$(this).prop("id")] = $(this).val();
        }
        if (($(this).prop("id") + "").indexOf("param_") == 0) {
            $train[$(this).prop("id")] = $(this).val();
        }
    });
    if ($train.flag_show_twoScreen && ($train.param_count_example % 2)) {
        $train.param_count_example++;
    }
    if ($train.flag_show_twoScreen && ($train.param_font_size > 25)) {
        $train.param_font_size = 25;
    }
    saveOptions($train);
    $trains = [];
    $trains.push($train);
    $.ajax({
        url: "scripts/train.php",
        method: "POST",
        cache: "false",
        data: {
            action: "getTrain",
            data: JSON.stringify($train),
            param_zakon5: $train.param_zakon5,
            param_zakon10: $train.param_zakon10,
            type_calc: $train.type_calc,
            param_otrab: $train.param_otrab,
            param_raz: $train.param_raz,
            param_raz1: $train.param_raz1,
            param_raz2: $train.param_raz2,
            param_raz3: $train.param_raz3,
            param_raz4: $train.param_raz4,
            param_decimal_places1: $train.param_decimal_places1,
            param_decimal_places2: $train.param_decimal_places2,
            param_decimal_places3: $train.param_decimal_places3,
            param_decimal_places4: $train.param_decimal_places4,
            param_count: $train.param_count,
            param_count_example: $train.param_count_example,
            param_arifmetika: $train.param_arifmetika
        }
    }).done(function($obj) {
        if ($obj.error) {
            alert($obj.error.errorText + " [Код ошибки: " + $obj.error.errorNumber + "]");
            return;
        }
        $trains[0].taskText = $obj.data.info;
        $('#navbarParams').collapse('hide');
        initTrains($trains);
    });
}
function saveOptions($train) {
    var $data = JSON.stringify($train);
    localStorage.setItem('klx_club_train_save_002_', $data);
}
function loadOptions() {
    loadVoices();
    calcStat();
    var $data = localStorage.getItem('klx_club_train_save_002_');
    if (!$data)
        return;
    $data = JSON.parse($data);
    $('#inputName').val($data.name);
    $("#zak5").val($data.param_zakon5);
    $("#zak5").trigger('change');
    $("#zak10").val($data.param_zakon10);
    $("#zak10").trigger('change');
    $("#otrab").val($data.param_otrab);
    $("#otrab").trigger('change');
    $("#param_count").data("ionRangeSlider").update({
        from: $data.param_count
    });
    $("#param_count_example").data("ionRangeSlider").update({
        from: $data.param_count_example
    });
    $('input:radio[name=type_view][value=' + $data.type_view + ']').prop('checked', true);
    $('input:radio[name=type_view]').trigger('change');
    $('input:radio[name=type_calc][value=' + $data.type_calc + ']').prop('checked', true);
    $('input:radio[name=type_calc]').trigger('change');
    $('#myTabCalcMethod a[data-id=' + $data.param_arifmetika + ']').tab('show');
    $("#param_speed").data("ionRangeSlider").update({
        from: -parseFloat($data.pause_default)
    });
    if (gauge) {
        gauge.set(-parseFloat($data.pause_default));
    }
    $("#pause_answer").data("ionRangeSlider").update({
        from: $data.pause_answer
    });
    $("#pause_start").data("ionRangeSlider").update({
        from: $data.pause_start
    });
    $("#pause_result").data("ionRangeSlider").update({
        from: $data.pause_result
    });
    $("#param_digits").data("ionRangeSlider").update({
        from: $data.param_raz[0],
        to: $data.param_raz[1]
    });
    $("#param_digits1").data("ionRangeSlider").update({
        from: $data.param_raz1[0],
        to: $data.param_raz1[1]
    });
    $("#param_digits2").data("ionRangeSlider").update({
        from: $data.param_raz2[0],
        to: $data.param_raz2[1]
    });
    $("#param_digits3").data("ionRangeSlider").update({
        from: $data.param_raz3[0],
        to: $data.param_raz3[1]
    });
    $("#param_digits4").data("ionRangeSlider").update({
        from: $data.param_raz4[0],
        to: $data.param_raz4[1]
    });
    $("#param_decimal_places1").data("ionRangeSlider").update({
        from: $data.param_decimal_places1[0],
        to: $data.param_decimal_places1[1]
    });
    $("#param_decimal_places2").data("ionRangeSlider").update({
        from: $data.param_decimal_places2[0],
        to: $data.param_decimal_places2[1]
    });
    $("#param_decimal_places3").data("ionRangeSlider").update({
        from: $data.param_decimal_places3[0],
        to: $data.param_decimal_places3[1]
    });
    $("#param_decimal_places4").data("ionRangeSlider").update({
        from: $data.param_decimal_places4[0],
        to: $data.param_decimal_places4[1]
    });
    $('.saveParam').each(function(index) {
        if (!$data[$(this).prop("id")])
            return;
        if (($(this).prop("id") + "").indexOf("flag_") == 0) {
            $(this).prop('checked', $data[$(this).prop("id")] == 1);
        }
        if (($(this).prop("id") + "").indexOf("select_") == 0) {
            $(this).val($data[$(this).prop("id")]);
        }
        if (($(this).prop("id") + "").indexOf("param_") == 0) {
            if ($(this).hasClass("RangeSlider")) {
                $(this).data("ionRangeSlider").update({
                    from: $data[$(this).prop("id")]
                });
            } else {
                $(this).val($data[$(this).prop("id")]);
            }
        }
    });
    calcStat();
}
function calcStat() {
    var $timeAll = parseInt($("#param_count").val()) * parseInt($("#param_count_example").val()) * Math.abs($("#param_speed").val()) + parseInt($("#pause_answer").val()) * parseInt($("#param_count_example").val()) + parseInt($("#pause_result").val()) * parseInt($("#param_count_example").val()) + parseInt($("#pause_start").val());
    $("#infoStat").html('Ориентировочное время: <b>' + prettyTime($timeAll) + '</b>');
}
function prettyTime($val) {
    $val = parseInt($val);
    $min = Math.floor($val / 60);
    $sec = $val - $min * 60;
    return $min + " мин. " + $sec + " сек.";
}
function isMobile() {
    return typeof window.orientation !== 'undefined';
}
function isNumeric(value) {
    return !isNaN(value - parseFloat(value));
}
function initSpeechRecognition() {
    if (!('webkitSpeechRecognition'in window) && !('SpeechRecognition'in window)) {
        $("#micBlock").hide();
        return false;
    }
    if ('webkitSpeechRecognition'in window) {
        recognition = new webkitSpeechRecognition();
    }
    if ('SpeechRecognition'in window) {
        recognition = new SpeechRecognition();
    }
    recognition.onstart = function() {
        recognizing = true;
        microphoneIcon(true);
        $flag_micEnable = true;
    }
    ;
    recognition.onerror = function(event) {
        if (event.error == 'no-speech') {
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                console.log('info_blocked');
            } else {
                console.log('info_denied');
            }
            ignore_onend = true;
            $flag_micEnable = false;
        }
    }
    ;
    recognition.onend = function() {
        recognizing = false;
        microphoneIcon(false);
        if (ignore_onend) {
            return;
        }
        console.log('onend: ' + final_transcript);
        if ($('#inputReply').length && final_transcript && isNumeric(final_transcript) && ($('#inputReply').val() + 0 != final_transcript + 0)) {
            $('#inputReply').val(parseFloat(final_transcript));
            $t = $tasks[$currentIndex_Task - 1];
            $len = ($t.result + "").length;
            $len2 = ($('#inputReply').val() + "").length;
            if ($len == $len2) {
                $('#inputReply').trigger(jQuery.Event('keypress', {
                    which: 13
                }));
            }
        }
        if (waitCommand) {
            if (waitCommand.command == final_transcript || waitCommand.command == '') {
                waitCommand.func.call(waitCommand, final_transcript);
                if (!waitCommand.noStopRecognition)
                    stopRecognition();
            }
        }
    }
    ;
    recognition.onresult = function(event) {
        var interim_transcript = '';
        if (typeof (event.results) == 'undefined') {
            recognition.onend = null;
            recognition.stop();
            return;
        }
        if (!final_transcript) {
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                    break;
                } else {}
            }
        }
    }
    return true;
}
function startRecognition() {
    if (!recognition)
        return;
    if (recognizing) {
        return;
    }
    final_transcript = '';
    recognition.lang = 'ru-RU';
    try {
        recognition.start();
    } catch (e) {
        return;
    }
    ignore_onend = false;
    console.log('start');
}
var waitCommand;
function stopRecognition() {
    if (!recognition)
        return;
    recognition.stop();
    waitCommand = null;
}
function waitCommandRec($commandText) {
    if (waitCommand) {}
    waitCommand = $commandText;
    startRecognition();
}
function doInputName() {
    waitCommandRec({
        command: '',
        commandHint: 'Скажите имя ученика',
        func: function($val) {
            $('#inputName').val($val);
        }
    });
}
function microphoneIcon(state) {
    if (state) {
        $("#micBlock").show();
        $("#micBlock").addClass("micActive");
        $("#micIcon").addClass("faa-flash animated");
        if (waitCommand) {
            if (waitCommand.commandHint) {
                $('#showCommand').html(waitCommand.commandHint);
            } else {
                $('#showCommand').html(waitCommand.command ? ('Скажите: <b>' + waitCommand.command + '</b>') : '');
            }
        }
    } else {
        $("#micBlock").removeClass("micActive");
        $("#micIcon").removeClass("faa-flash animated");
        $('#showCommand').html('');
        $("#micBlock").hide();
    }
}
function removeFromSelect($obj, $val) {
    $arr = $obj.val();
    if ($arr.length > 1) {
        $res = [];
        $flagRemove = false;
        for (var i = 0; i < $arr.length; i++) {
            if ($arr[i] + "" != $val + "") {
                $res.push($arr[i]);
            } else {
                $flagRemove = true;
            }
        }
        if ($flagRemove)
            $obj.val($res).trigger('change');
    }
}
var sytext = '';
var srate = 1;
var msg = null;
function stext() {
    try {
        var SpeechSynthesisUtterance = window.webkitSpeechSynthesisUtterance || window.mozSpeechSynthesisUtterance || window.msSpeechSynthesisUtterance || window.oSpeechSynthesisUtterance || window.SpeechSynthesisUtterance;
        if (SpeechSynthesisUtterance !== undefined) {
            if (!msg) {
                msg = new SpeechSynthesisUtterance();
                msg.voice = window.speechSynthesis.getVoices()[$('#select_voice_name').val()];
                msg.volume = 1;
                msg.pitch = 1;
            }
            msg.rate = srate ? srate : 1;
            msg.text = sytext;
            if (window.speechSynthesis.pending) {
                $("#errorVoiceBlock").show();
                $("#errorVoiceIcon").addClass("faa-flash animated");
                if (msg.text == sytext)
                    return;
            } else {
                $("#errorVoiceIcon").removeClass("faa-flash animated");
                $("#errorVoiceBlock").hide();
            }
            speechSynthesis.speak(msg);
        }
    } catch (e) {}
}
function loadVoices() {
    if (!window.hasOwnProperty('speechSynthesis'))
        return;
    if (viocesLoaded)
        return;
    var voices = window.speechSynthesis.getVoices();
    for (var i = 0; i < voices.length; i++) {
        $('#select_voice_name').append('<option value="' + i + '" ' + (voices[i].default ? "SELECTED" : "") + '>' + voices[i].name + '</option>');
    }
    viocesLoaded = true;
}
sayTestTimer = null;
function sayTest() {
    clearTimeout(sayTestTimer);
    sayTestTimer = setTimeout(function() {
        say($("#help_test_voice").text(), $("#param_voice_rate").val());
    }, 1000);
}
function sayhint($text, $rate) {
    var $train = $trains[0];
    if ($train.flag_show_soundHelp)
        say($text, $rate);
}
function sayNumber($val, $rate) {
    var $train = $trains[0];
    $len = ($val + "").length;
    $rate = parseInt($train.param_voice_rate ? $train.param_voice_rate : 2);
    if ($len > 2) {
        $rate = $rate * 1.5;
    }
    if ($train.pause_default < 0.6) {
        $rate = $rate * 1.5;
    }
    if ($train.pause_default < 0.7 && $len > 3) {
        $rate = $rate * 1.5;
    }
    $rate = Math.ceil($rate);
    say($val, $rate);
}
function say($text, $rate) {
    sytext = $text;
    if ((typeof $trains !== 'undefined') && $trains.length > 0) {
        var $train = $trains[0];
        srate = $rate ? $rate : parseInt($train.param_voice_rate ? $train.param_voice_rate : 2);
    } else {
        srate = $rate ? $rate : 2;
    }
    $('#trigger_me').trigger('click');
}
textDiv = null;
fontTestTimer = null;
function fontTest() {
    if (!textDiv) {
        textDiv = $("body").append('<div id="testFontDiv" style="position:absolute;top:0px;left:0px;display:none;z-index:55555555;"></div>');
    }
    clearTimeout(fontTestTimer);
    fontTestTimer = setTimeout(function() {
        $('#testFontDiv').css('font-size', $("#param_font_size").val() + 'vw');
        $('#testFontDiv').css('top', $("body").scrollTop());
        $('#testFontDiv').html($("#param_font_size").val());
        $('#testFontDiv').fadeIn('fast', function() {
            $('#testFontDiv').fadeOut('fast', function() {});
        });
    }, 1000);
}
$(document).ready(function() {
    $("html").on("cart.afterInit", function() {
        if ($glob_cart.loginOK) {
            $(".loginRef").html(($glob_cart.visitor.name ? $glob_cart.visitor.name : $glob_cart.visitor.phone) + ($glob_cart.visitor.balance_summ < 0 ? ('<span class="balance-minus">' + parseInt($glob_cart.visitor.balance_summ) + ' руб.</span>') : ''));
            $(".lkTab").removeClass("hidden");
            $(".btn-out").removeClass("hidden");
        }
        initSelectActiveChild();
    });
    $('a.loginRef').click(function(event) {
        if (!$glob_cart.loginOK) {
            event.preventDefault();
            event.stopPropagation();
            $('#loginClubModal').modal();
        } else {
            $('.topParams').collapse('show');
            $('.lkTab a').tab('show');
        }
    });
    $(".klx-form-win .add-image-btn input").on("change", function() {
        var winForm = $(this).closest(".row");
        $(this).clone(true).appendTo(winForm.find(".add-image-btn"));
        $(this).hide();
        var input = this;
        if (input.files && input.files[0]) {
            if (input.files[0].type.match('image.*')) {
                var img = $('<img>');
                var uploadItem = $('<div class="upload-item" title="' + input.files[0].name + '"></div>');
                uploadItem.append(img);
                $(this).appendTo(uploadItem);
                winForm.find(".list-upload-files .list-files-images").append(uploadItem);
                var reader = new FileReader();
                reader.onload = function(e) {
                    img.attr('src', e.target.result);
                }
                reader.readAsDataURL(input.files[0]);
            } else {
                var ft = input.files[0].type.split('/');
                ft = ft.length > 1 ? ft[1].toLocaleLowerCase() : "";
                var icon = "fa-file";
                icon = ft.match("pdf") ? "fa-file-pdf" : icon;
                debugger icon = (ft.match("excel") || ft.match("sheet")) ? "fa-file-excel" : icon;
                icon = ft.match("word") ? "fa-file-word" : icon;
                icon = ft.match("zip") ? "fa-file-archive" : icon;
                var uploadItem = $('<div class="upload-item fileType" title="' + input.files[0].name + '"><i class="fa ' + icon + '" aria-hidden="true"></i></div>');
                $(this).appendTo(uploadItem);
                winForm.find(".list-upload-files .list-files-images").append(uploadItem);
            }
        }
    });
});
function showProfile() {
    if (!$glob_cart.loginOK) {
        $('#loginClubModal').modal();
    }
}
function lk_addChild() {
    $('#lk-addChild form').get(0).reset();
    $('#lk-addChild').modal();
}
function lk_selectChild() {}
function initSelectActiveChild() {
    $('select[name=selectActiveChild]').empty();
    if ($glob_cart.loginOK) {
        $('.block-selectActiveChild').removeClass('hidden');
        $('.block-selectActiveChild-help').addClass('hidden');
        for (var i = 0; i < $glob_cart.childs.length; i++) {
            child = $glob_cart.childs[i];
            $('select[name=selectActiveChild]').append('<option value="' + child.id + '" >' + child.name + '</option>');
        }
    } else {
        $('.block-selectActiveChild').addClass('hidden');
        $('.block-selectActiveChild-help').removeClass('hidden');
        $('select[name=selectActiveChild]').append('<option value="">Войдите на сайт</option>');
    }
}
$(document).ready(function() {
    $("body").append('<div id="klx_divSvgLib" style="height: 0; width: 0; position: absolute; visibility: hidden;"></div>');
    $("#klx_divSvgLib").append('<svg id="klx_svgLib" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>');
    $('#klx_svgLib').load('/sym.php', function() {
        klx_addSVGSymToLib('klx_svgLib');
    });
});
function klx_addSVGSymToLib(libID) {
    var svgLib = SVG(libID);
    klx_addSVGSymToLib_generateStone(svgLib, 2, 'green', '#0f9');
    klx_addSVGSymToLib_generateStone(svgLib, 3, '#FFAE00', '#FFAE00');
    klx_addSVGSymToLib_generateStone(svgLib, 4, '#FFAE00', 'red');
    klx_addSVGSymToLib_generateStone(svgLib, 5, '#0600FF', 'white');
    klx_addSVGSymToLib_generateStone(svgLib, 6, '#FF003C', 'white');
    klx_addSVGSymToLib_generateStone(svgLib, 7, '#00C6FF', 'white');
    klx_addSVGSymToLib_generateStone(svgLib, 8, '#BA00FF', 'white');
    klx_addSVGSymToLib_generateStone(svgLib, 9, 'blue', 'white');
    var width = 21
      , height = 50 * 7;
    var symbol = svgLib.symbol().id('lib_spica');
    symbol.viewbox(0, 0, width, height);
    var line = symbol.line(Math.ceil(width / 2) + 1, 0, Math.ceil(width / 2) + 1, height).stroke({
        width: Math.ceil(width / 2),
        color: '#887D22'
    });
    var width = 101
      , height = 25;
    var symbol = svgLib.symbol().id('lib_planka');
    symbol.viewbox(0, 0, width, height);
    var line = symbol.line(0, Math.ceil(height / 2) + 1, width, Math.ceil(height / 2) + 1).stroke({
        width: Math.ceil(height / 2),
        color: 'black'
    });
}
function klx_addSVGSymToLib_generateStone(svgLib, id, colorStroke, colorMiddle) {
    var width = 100
      , height = 50;
    var symbol = svgLib.symbol().id('lib_stone' + id);
    symbol.viewbox(0, 0, width, height);
    var pTop = symbol.path('M0 ' + (height / 2) + ' q ' + (width / 2) + ' -' + height + ' ' + width + ' ' + (0) + ' z');
    pTop.attr({
        fill: 'white'
    });
    pTop.attr({
        stroke: colorStroke
    });
    var pBottom = symbol.path('M0 ' + (height / 2) + ' q ' + (width / 2) + '  ' + height + ' ' + width + ' ' + (0) + ' z');
    pBottom.attr({
        stroke: colorStroke
    });
    var linear = svgLib.gradient('linear', function(stop) {
        stop.at(0, colorStroke);
        stop.at(0.5, colorMiddle);
        stop.at(1, colorStroke);
    }).id('gradientStone' + id);
    pBottom.fill(linear);
}
function klx_abakus(draw, ammountSpica, idStyle, showNumbers) {
    this.ammountSpica = ammountSpica;
    this.idStyle = parseInt(idStyle) ? parseInt(idStyle) : 1;
    this.showNumbers = showNumbers ? true : false;
    this.flagNoAnimate = false;
    this.abakus = {
        spica: []
    };
    this.currentStyleInfo = this.checkStyle(this.idStyle);
    var x = 60
      , y = 50;
    for (var s = 0; s <= ammountSpica - 1; s++) {
        var spica = draw.use(this.currentStyleInfo.spica).size(21, 50 * 7 + 53).move(x + 50 - 12, 0);
        var stones = [];
        stones.push(draw.use(this.currentStyleInfo.stone).addClass('stone').addClass('stateOff').size(100, 50).move(x, y - 22));
        for (var i = 0; i < 4; i++) {
            if (i == 0 && (((ammountSpica - s) % 3) == 0) && ammountSpica > 3) {
                stones.push(draw.use(this.currentStyleInfo.stone_flash).addClass('stone').addClass('stone_flash').addClass('stateOff').size(100, 50).move(x, y + 122 + 51 * i));
            } else {
                stones.push(draw.use(this.currentStyleInfo.stone).addClass('stone').addClass('stateOff').size(100, 50).move(x, y + 122 + 51 * i));
            }
        }
        this.abakus.spica.unshift({
            stones: stones,
            spica: spica
        });
        x = x + 110;
    }
    this.abakus.planka = draw.line(30, y + 60, x + 16, y + 60).stroke({
        width: 20,
        color: 'black'
    }).style('cursor', 'pointer');
    this.abakus.planka.abakus = this.abakus;
    if (this.showNumbers) {
        this.abakus.planka.on('click', function(sender) {
            for (var s = 0; s < this.abakus.spica.length; s++) {
                this.abakus.spica[s].circle.visible() ? this.abakus.spica[s].circle.hide() : this.abakus.spica[s].circle.show();
                this.abakus.spica[s].text.visible() ? this.abakus.spica[s].text.hide() : this.abakus.spica[s].text.show();
            }
        });
    }
    if (ammountSpica > 10 && ammountSpica < 15) {
        this.abakus.obodokTop = draw.use(this.currentStyleInfo.obodokTop).size(x + 5, null).move(25, 0);
        this.abakus.obodokBottom = draw.use(this.currentStyleInfo.obodokBottom).size(x + 5, null).move(25, 50 * 8 - 24);
        this.abakus.obodokLeft = draw.use(this.currentStyleInfo.obodokLeft).size(null, 50 * 8 + 5).move(0, 0);
        this.abakus.obodokRight = draw.use(this.currentStyleInfo.obodokRight).size(null, 50 * 8 + 5).move(x, 0).transform({
            rotation: 180,
            relative: true
        });
    }
    if (this.showNumbers && !$("body").hasClass("sourceOuter")) {
        var text = draw.plain('Клуб ментальной арифметики').move("50%", 50 * 8 - 50);
        text.font({
            family: 'Helvetica',
            size: 20,
            anchor: 'middle',
            weight: 'bold',
            fill: "white",
            stroke: "red"
        });
    }
    if (this.showNumbers) {
        for (var i = 0; i < this.abakus.spica.length; i++) {
            var circle = draw.circle(27).move(this.abakus.spica[i].spica.x() - 1, 1);
            circle.attr({
                fill: 'white',
                stroke: 'red'
            });
            var text = draw.plain('').move(this.abakus.spica[i].spica.x() + 12, 21);
            text.font({
                family: 'Helvetica',
                size: 20,
                anchor: 'middle',
                weight: 'bold'
            });
            this.abakus.spica[i].circle = circle;
            this.abakus.spica[i].text = text;
        }
    }
    if (this.showNumbers)
        for (var i = 0; i < this.abakus.spica.length; i++) {
            var stones = this.abakus.spica[i].stones;
            for (var s = 0; s < stones.length; s++) {
                stones[s].abakus = this;
                stones[s].statusOn = false;
                stones[s].stoneNo = s;
                stones[s].spicaNo = i;
                stones[s].on('click', function() {
                    this.abakus.valueCurrent = parseInt(this.abakus.valueCurrent);
                    this.abakus.valueCurrent = this.abakus.valueCurrent ? this.abakus.valueCurrent : 0;
                    this.abakus.valueCurrent = this.abakus.valueCurrent + "";
                    if (this.spicaNo + 1 > (this.abakus.valueCurrent + "").length) {
                        var cnt = this.spicaNo + 1 - (this.abakus.valueCurrent + "").length;
                        for (var i = 0; i < cnt; i++) {
                            this.abakus.valueCurrent = "0" + this.abakus.valueCurrent;
                        }
                    }
                    var digit = parseInt((this.abakus.valueCurrent + "").substr(-(this.spicaNo + 1), 1));
                    var digitNew = -1;
                    if (this.stoneNo == 0) {
                        if (this.statusOn) {
                            digitNew = digit - 5;
                        } else {
                            digitNew = digit + 5;
                        }
                    }
                    if (this.stoneNo == 1) {
                        if (this.statusOn) {
                            digitNew = (digit < 5) ? 0 : 5;
                        } else {
                            digitNew = (digit < 5) ? 1 : 6;
                        }
                    }
                    if (this.stoneNo == 2) {
                        if (this.statusOn) {
                            digitNew = (digit < 5) ? 1 : 6;
                        } else {
                            digitNew = (digit < 5) ? 2 : 7;
                        }
                    }
                    if (this.stoneNo == 3) {
                        if (this.statusOn) {
                            digitNew = (digit < 5) ? 2 : 7;
                        } else {
                            digitNew = (digit < 5) ? 3 : 8;
                        }
                    }
                    if (this.stoneNo == 4) {
                        if (this.statusOn) {
                            digitNew = (digit < 5) ? 3 : 8;
                        } else {
                            digitNew = (digit < 5) ? 4 : 9;
                        }
                    }
                    if (digitNew >= 0) {
                        digitNew = digitNew + "";
                        var newValue = this.abakus.valueCurrent + "";
                        var index = newValue.length - 1 - this.spicaNo;
                        newValue = parseInt(newValue.substr(0, index) + digitNew + newValue.substr(index + digitNew.length));
                        this.abakus.setValue(newValue ? newValue : 0);
                        $(document).trigger("games_abakus_value:change");
                    }
                });
            }
        }
    this.width = x + 50;
    this.height = 50 * 8 + 5;
}
klx_abakus.prototype.refresh = function() {}
klx_abakus.prototype.setValue = function(value) {
    if ((parseInt(value) < 0) || (parseInt(value) > Math.pow(10, this.abakus.spica.length) - 1))
        return;
    var valueStr = value + "";
    if (valueStr.length < (this.valueCurrent + "").length) {
        for (var d = valueStr.length; d < this.ammountSpica; d++) {
            this.setValueSpica(this.abakus.spica[d], 0);
            if (this.abakus.spica[d].text)
                this.abakus.spica[d].text.plain('');
        }
    }
    for (var d = 0; d < valueStr.length; d++) {
        var digit = valueStr.substr(-(d + 1), 1);
        var spica = this.abakus.spica[d];
        this.setValueSpica(spica, parseInt(digit));
        if (spica.text)
            spica.text.plain(digit);
    }
    this.valueCurrent = value;
}
klx_abakus.prototype.setValueSpica = function(spica, digit) {
    this.stoneOnOff(spica.stones[0], digit >= 5, -22);
    this.stoneOnOff(spica.stones[1], (digit >= 1 && digit <= 4) || (digit >= 6), 52);
    this.stoneOnOff(spica.stones[2], (digit >= 2 && digit <= 4) || (digit >= 7), 52);
    this.stoneOnOff(spica.stones[3], (digit >= 3 && digit <= 4) || (digit >= 8), 52);
    this.stoneOnOff(spica.stones[4], (digit >= 4 && digit <= 4) || (digit >= 9), 52);
}
klx_abakus.prototype.stoneOnOff = function(stone, flagOnOff, dy) {
    if (flagOnOff) {
        if (!stone.statusOn) {
            this.flagNoAnimate ? stone.dy(-dy) : stone.animate(100, '>', 100).dy(-dy);
            stone.statusOn = true;
            stone.addClass('stateOn');
            stone.removeClass('stateOff');
        }
    } else {
        if (stone.statusOn) {
            this.flagNoAnimate ? stone.dy(dy) : stone.animate(100, '>', 100).dy(dy);
            stone.statusOn = false;
            stone.addClass('stateOff');
            stone.removeClass('stateOn');
        }
    }
}
function klx_SVG_object(width, height, svg) {
    this.svg = svg ? svg : this.createSVGElement('svg', true);
    if (width)
        $(this.svg).attr('width', width);
    if (height)
        $(this.svg).attr('height', height);
}
klx_SVG_object.prototype.remove = function() {
    $(this.svg).remove();
}
;
klx_SVG_object.prototype.createSVGElement = function(name, flagNoAddToSVG) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', name);
    if (!flagNoAddToSVG) {
        $(this.svg).append(el);
    }
    return el;
}
;
function klx_counter(width, height, svg) {
    klx_SVG_object.apply(this, arguments);
    var strokeMainWidth = Math.ceil((Math.min(width, height) / 2) * 0.2);
    var r = Math.min(width, height) / 2 - strokeMainWidth / 2;
    this.circleOuter = this.createSVGElement('circle');
    $(this.circleOuter).attr({
        r: r,
        cx: width / 2,
        cy: height / 2,
        stroke: "lightskyblue",
        "stroke-width": strokeMainWidth,
        "stroke-miterlimit": "10",
        fill: "white"
    });
    this.lineHor = this.createSVGElement('line');
    $(this.lineHor).attr({
        x1: width / 2 - r - strokeMainWidth / 2,
        y1: height / 2,
        x2: width / 2 + r + strokeMainWidth / 2,
        y2: height / 2,
        "stroke-width": Math.ceil(height / 80),
        stroke: "lightskyblue"
    });
    this.lineVer = this.createSVGElement('line');
    $(this.lineVer).attr({
        x1: width / 2,
        y1: height / 2 - r - strokeMainWidth / 2,
        x2: width / 2,
        y2: height / 2 + r + strokeMainWidth / 2,
        "stroke-width": Math.ceil(height / 80),
        stroke: "lightskyblue"
    });
    this.dashAll = 2 * Math.PI * r;
    this.circleTimeColor = "red";
    this.circleTime = this.createSVGElement('circle');
    $(this.circleTime).attr({
        id: "bluecircle",
        r: r,
        cx: width / 2,
        cy: height / 2,
        stroke: this.circleTimeColor,
        "stroke-width": strokeMainWidth,
        "stroke-miterlimit": "10",
        fill: "white",
        "fill-opacity": 0,
        transform: "rotate(-90 " + (width / 2) + " " + (height / 2) + ")",
        "stroke-dasharray": this.dashAll,
        "stroke-dashoffset": this.dashAll
    });
    $(this.circleTime).css({
        "-webkit-transition": "all 0.3s ease",
        "transition": "all 0.3s ease"
    });
    this.circleInner = this.createSVGElement('circle');
    $(this.circleInner).attr({
        r: width / 7,
        cx: width / 2,
        cy: height / 2,
        stroke: "red",
        "stroke-width": Math.ceil(height / 40),
        "stroke-miterlimit": "10",
        fill: "white"
    });
    this.percent = 0;
    this.textInner = this.createSVGElement('text');
    $(this.textInner).attr({
        x: width / 2,
        y: height / 2 + Math.ceil(width / 18),
        "text-anchor": "middle",
        "font-size": Math.ceil(width / 8) + "px",
        fill: "red"
    });
    $(this.textInner).css({
        "font-weight": "bold"
    });
}
klx_counter.prototype = Object.create(klx_SVG_object.prototype);
klx_counter.prototype.constructor = klx_counter;
klx_counter.prototype.setPercent = function(percent, text) {
    this.percent = percent;
    this.text = text;
    if (this.percent > 0)
        this.circleTimeColor = "red";
    if (this.percent > 25)
        this.circleTimeColor = "darkorange";
    if (this.percent > 50)
        this.circleTimeColor = "green";
    $(this.circleTime).css({
        "stroke": this.circleTimeColor,
        "stroke-dashoffset": this.dashAll * this.percent / 100
    });
    $(this.circleInner).css({
        "stroke": this.circleTimeColor
    });
    this.textInner.textContent = this.text;
    if (this.percent < 1) {
        $(this.circleInner).css({
            "display": "none"
        });
        $(this.circleTime).css({
            "fill-opacity": 100
        });
        var counterLight = 10;
        var thisScope = this;
        var timerIdLight = setInterval(function() {
            counterLight = counterLight - 1;
            $(thisScope.circleInner).css({
                "fill": counterLight % 2 ? thisScope.circleTimeColor : "white"
            });
            $(thisScope.textInner).css({
                "fill": counterLight % 2 ? "white" : thisScope.circleTimeColor
            });
            if (counterLight <= 0)
                clearInterval(timerIdLight);
        }, 100);
    }
}
klx_abakus.prototype.checkStyle = function(idStyle) {
    idStyle = parseInt(idStyle);
    var currentStyleInfo = {
        spica: 'lib_spica',
        stone: 'lib_stone',
        stone_flash: 'lib_stone_flash',
        obodokTop: 'lib_obodokTop',
        obodokBottom: 'lib_obodokBottom',
        obodokLeft: 'lib_obodok1',
        obodokRight: 'lib_obodok1'
    };
    if (idStyle == 2)
        currentStyleInfo.stone = currentStyleInfo.stone + parseInt(idStyle);
    if (idStyle > 2) {
        if (idStyle >= 10) {
            currentStyleInfo.stone_flash = currentStyleInfo.stone + parseInt(idStyle);
        }
        currentStyleInfo.stone = currentStyleInfo.stone + parseInt(idStyle);
    }
    return currentStyleInfo;
}
$(document).ready(function() {
    $("#games>div.row").on('click', function(sender) {
        var idGame = $(this).find("button").attr("id");
        setTimeout(function() {
            $('#navbarParams').collapse('hide');
            $('.wrapCenter').empty();
            $('<div class="centerBlock"></div>').appendTo($(".wrapCenter"));
            switch (idGame) {
            case "game_abakus":
                game_abakus_run();
                break;
            }
        }, 100);
    });
    $(window).focus(function() {
        $('body').addClass('statusFocus');
        $('body').removeClass('statusNoFocus');
    }).blur(function() {
        $('body').removeClass('statusFocus');
        $('body').addClass('statusNoFocus');
    });
});
function checkChromeBrowser() {
    var isChromium = window.chrome;
    var winNav = window.navigator;
    var vendorName = winNav.vendor;
    var isOpera = typeof window.opr !== "undefined";
    var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
    var isIOSChrome = winNav.userAgent.match("CriOS");
    if (isIOSChrome) {
        return true;
    } else if (isChromium !== null && typeof isChromium !== "undefined" && vendorName === "Google Inc." && isOpera === false && isIEedge === false) {
        return true;
    } else {}
}
var abakusObj;
function game_abakus_run() {
    if (!checkChromeBrowser() && !$("body").hasClass("sourceOuter")) {
        alert("Рекомендуем использовать браузер Chrome и его производные. В других браузерах возможны неточности отображения.");
    }
    window.history.pushState({}, "", "#game-abakus");
    $STATEGame = true;
    $('#navbarParams').collapse('hide');
    $('.centerBlock').removeClass('startImg');
    if (abakusObj && abakusObj.timerId) {
        clearInterval(abakusObj.timerId);
    }
    $(".centerBlock").html("");
    var isMobile = $(window).width() < 900;
    game_abakus_init(isMobile ? 5 : 13, 1);
    initSpeechRecognition();
    var $row = $('<div id="gameAbakusOptions" class="row" style="padding-bottom: 20px;font-size:90%;"></div>').appendTo(".centerBlock");
    if ($("body").hasClass("sourceOuter")) {
        $row.hide();
    }
    var d1 = $('<div class="col-md-3" style="padding: 5px 0px; white-space: nowrap;"><span class="fieldCaption">Спиц:</span> <SELECT id="gameAbakus_param_digits" onchange="game_abakus_changeDigits()"/></SELECT>\
      <button style="margin-left: 10px;" id="gameAbakus_param_recognition" onclick="game_abakus_clickRecog();" title="Управление голосом"><i class="fas ' + (isMobile ? "fa-microphone-slash" : "fa-microphone") + '"></i></button>\
            <button style="margin-left: 10px;" id="gameAbakus_param_custom" onclick="game_abakus_clickCustom();" title="Стиль отображения"><i class="fas fa-wrench"></i> &nbsp;<span id="game_abakus_style_id">1</span></button>\
            </div>').appendTo($row);
    if (recognition) {}
    for (var i = 1; i <= 20; i++)
        $('#gameAbakus_param_digits').append($("<option " + (i == (isMobile ? 5 : 13) ? "SELECTED" : "") + "></option>").attr("value", i).text(i));
    var d1 = $('<div class="col-md-4" style="padding: 5px 0px; white-space: nowrap;"><span class="fieldCaption">Значение:</span> \
            <input type="number" id="gameAbakus_param_val" value="1" style="width:10%;min-width:15px;text-align: right;" onkeypress="var e=(event||window.event);if(e.keyCode==13){$(\'#gameAbakus_btnSet\').click();return false;}else{return true;}">\
            <button id="gameAbakus_btnSet" title="Установить значение" style="color:green;cursor:pointer;" onclick="game_abakus_changeVal()">&nbsp;<i class="fa fa-check-double"></i>&nbsp;</button></div>').appendTo($row);
    var d1 = $('<div class="col-md-5" style="padding: 5px 0px; white-space: nowrap;"><span>От:</span> \
            <input type="number" id="gameAbakus_param_val_from" value="1" style="width:10%;min-width:60px;text-align: right;" onkeypress="var e=(event||window.event);if(e.keyCode==13){$(\'#gameAbakus_param_val_to\').focus().select();return false;}else{return true;}">\
                                    <span>До:</span> \
                                    <input type="number" id="gameAbakus_param_val_to" value="1000" style="width:10%;min-width:60px;text-align: right;" onkeypress="var e=(event||window.event);if(e.keyCode==13){$(\'#gameAbakus_param_val_step\').focus().select();return false;}else{return true;}">\
                                    <span>Шаг: </span><input type="number" id="gameAbakus_param_val_step" value="1" style="width:10%;min-width:40px;text-align: right;" onkeypress="var e=(event||window.event);if(e.keyCode==13){$(\'#gameAbakus_btnStep\').click();return false;}else{return true;}">\
                                    <button id="gameAbakus_btnStep" title="Запустить перебор" onclick="game_abakus_changeValFrom()" style="color:green;cursor:pointer;">&nbsp;<i class="fas fa-walking"></i>&nbsp;</button></div>').appendTo($row);
    var $row = $('<div class="row"></div>').appendTo(".centerBlock");
    if ($("body").hasClass("sourceOuter")) {
        $row.css("height", "100%");
    }
    var dd = $('<div class="col-sm-12" id="game_abakus_place"></div>').appendTo($row);
    $("#abakus").detach().appendTo($("#game_abakus_place"));
    var val = 0;
    abakusObj.timerId = setInterval(function() {
        if ($(".topParams").hasClass('show') || $("body").hasClass('statusNoFocus'))
            return;
        val = val + 1;
        abakusObj.setValue(val);
    }, 500);
    game_abakus_recognition();
    $(document).on('games_abakus_value:change', function() {
        game_abakus_clearTimer();
        $("#gameAbakus_param_val").val(parseInt(abakusObj.valueCurrent));
    });
}
function game_abakus_clearTimer() {
    if (abakusObj && abakusObj.timerId) {
        clearInterval(abakusObj.timerId);
    }
}
function game_abakus_clickRecog() {
    var s = $('#gameAbakus_param_recognition i').hasClass('fa-microphone');
    $('#gameAbakus_param_recognition i').removeClass('fa-microphone').removeClass('fa-microphone-slash');
    s ? $('#gameAbakus_param_recognition i').addClass('fa-microphone-slash') : $('#gameAbakus_param_recognition i').addClass('fa-microphone');
    game_abakus_recognition();
}
function game_abakus_recognition() {
    if (!recognition)
        return;
    if ($('#gameAbakus_param_recognition i').hasClass('fa-microphone-slash')) {
        stopRecognition();
        return;
    }
    waitCommandRec({
        command: '',
        commandHint: 'Назовите число для показа',
        noStopRecognition: true,
        func: function($val) {
            if (parseInt($val) > 0) {
                $("#gameAbakus_param_val").css("border", "");
                $("#gameAbakus_param_val").val(parseInt($val));
                game_abakus_changeVal();
            } else {
                if ($val) {
                    $("#gameAbakus_param_val").css("border", "1px solid red");
                }
            }
            setTimeout(game_abakus_recognition, 1000);
        }
    });
}
function game_abakus_init(digits, style) {
    $("#abakus").remove();
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    $(svg).attr('id', 'abakus');
    $(svg).attr('preserveAspectRatio', "xMidYMin meet");
    $('<link xmlns="http://www.w3.org/1999/xhtml" rel="stylesheet" href="/style/games-train.css" type="text/css"/>').appendTo($(svg));
    $("body").append(svg);
    var draw = SVG('abakus');
    abakusObj = new klx_abakus(draw,digits,style,true);
    draw.viewbox(0, 0, abakusObj.width, abakusObj.height);
    if ($("body").hasClass("sourceOuter")) {
        draw.size("100%", "100%");
    } else {
        draw.size("100%", "50vh");
    }
}
function game_abakus_clickCustom() {
    $idStyle = parseInt($("#game_abakus_style_id").html());
    if ($idStyle >= 13) {
        $idStyle = 0;
        $("#game_abakus_style_id").html(1);
    }
    $idStyle = $idStyle + 1;
    $("#game_abakus_style_id").html($idStyle);
    game_abakus_changeDigits();
}
function game_abakus_changeDigits() {
    game_abakus_clearTimer();
    game_abakus_init($("#gameAbakus_param_digits").val(), parseInt($("#game_abakus_style_id").html()));
    $("#abakus").detach().appendTo($("#game_abakus_place"));
}
function game_abakus_changeVal() {
    game_abakus_clearTimer();
    abakusObj.setValue($("#gameAbakus_param_val").val());
}
function game_abakus_changeValFrom() {
    game_abakus_clearTimer();
    var val = parseInt($("#gameAbakus_param_val_from").val());
    abakusObj.timerId = setInterval(function() {
        if ($(".topParams").hasClass('show') || $("body").hasClass('statusNoFocus'))
            return;
        abakusObj.setValue(val);
        val = val + (parseInt($("#gameAbakus_param_val_from").val()) < parseInt($("#gameAbakus_param_val_to").val()) ? 1 : -1) * parseInt($("#gameAbakus_param_val_step").val());
        if (val == parseInt($("#gameAbakus_param_val_to").val())) {
            clearInterval(abakusObj.timerId);
        }
    }, 1000);
}
var $glob_cart = null;
var $glob_fav = null;
var $glob_orderPage = null;
function formatMoney($summa) {
    return (Math.round(parseFloat($summa)) + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ");
}
function doFavForm() {
    $.ajax({
        url: "/scripts/cart.php",
        method: "POST",
        cache: "false",
        data: {
            action: "doFavForm",
            phone: $("#inputPhoneFav").val(),
            email: $("#inputEMailFav").val(),
            addInfo: $("#inputInfoFav").val()
        }
    }).done(function($obj) {
        if ($obj.error) {
            return;
        }
        getCart();
        $('#favForm .result').html($obj.data.html);
    });
}
function initAutoSave() {
    $(".autoSave").off("change");
    $(".autoSave").each(function() {
        if (typeof (Storage = window.sessionStorage) !== "undefined") {
            if ($value = Storage.getItem($(this).attr("id")))
                $(this).val($value);
        }
    });
    $(".autoSave").change(function(event) {
        if (typeof (Storage = window.sessionStorage) !== "undefined") {
            var $val = $(event.target).val();
            Storage.setItem($(event.target).attr("id"), $val);
        }
    });
    $('.dropdown-menu input, .dropdown-menu label, .dropdown-menu textarea, button[type=submit]').click(function(e) {
        e.stopPropagation();
    });
}
function initClickAddToCartButton() {
    $(".btn-cart-list").off("click");
    $(".btn-cart-list").click(function(event) {
        event.preventDefault();
        event.stopPropagation();
        var $amount = 1;
        if ($(event.target).hasClass('cart-down')) {
            $amount = -1;
        }
        if ($(event.target).hasClass('amount')) {
            $amountCur = parseInt($(event.target).html());
            $amount = prompt('Введите нужное количество', $amountCur);
            if (!$amount)
                return;
            $amount = parseInt($amount);
            $amount = $amount - $amountCur;
            if ($amount == 0)
                return;
        }
        addToCart($(this).attr("data-itemno"), $amount, this, 1);
    });
    $(".btn-fav-list").off("click");
    $(".btn-fav-list").click(function(event) {
        event.preventDefault();
        event.stopPropagation();
        addToCart($(this).attr("data-itemno"), 1, this, 2);
    });
}
function createOrder() {
    $.ajax({
        url: "/scripts/order.php",
        method: "POST",
        cache: "false",
        data: {
            action: "getOrderPage"
        }
    }).done(function($obj) {
        if ($obj.error) {
            return;
        }
        $glob_orderPage = $obj.data;
        initOrderPage();
    });
}
function setInfoItems($infoItems) {
    if (typeof $glob_infoItems === 'undefined') {
        $glob_infoItems = [];
    }
    if (!$infoItems)
        return;
    for (var $key in $infoItems) {
        if ($key === 'length' || !$infoItems.hasOwnProperty($key))
            continue;
        if (!$glob_infoItems[$key]) {
            $glob_infoItems[$key] = $infoItems[$key][0];
        }
    }
}
function getInfoItems() {
    if (typeof $glob_infoItems === 'undefined') {
        $glob_infoItems = [];
    }
    var infoItems = [];
    $(".item").each(function() {
        if ($id_item = parseInt($(this).attr("data-id-item"))) {
            if (!$glob_infoItems[$id_item]) {
                infoItems.push($id_item);
            }
        }
    });
    return infoItems;
}
function getCart($elementAction, $doAfter) {
    var id_item = $('.item-container').attr('data-id-item');
    id_item = id_item ? id_item : null;
    var viewItems = [];
    if (id_item && 'localStorage'in window && window['localStorage'] !== null && window.dataLayer && ($('.viewItemsHTML').html() < 10)) {
        try {
            if (localStorage["viewItems"]) {
                viewItems = JSON.parse(localStorage["viewItems"]);
            }
        } catch (e) {}
    }
    var infoItems = getInfoItems();
    $.ajax({
        url: "/scripts/cart.php",
        method: "POST",
        cache: "false",
        data: {
            action: "getCart",
            id_item: id_item,
            viewItems: viewItems.toString(),
            infoItems: infoItems.toString()
        }
    }).done(function($obj) {
        if ($obj.error) {
            return;
        }
        $glob_cart = $obj.data.cart;
        $glob_fav = $obj.data.fav;
        setInfoItems($obj.data.infoItems);
        $('.item, .item-container').removeClass('cartStatus-yes').addClass('cartStatus-no').removeClass('favStatus-yes').addClass('favStatus-no');
        if ($glob_fav && $glob_fav.favHTML) {
            $('#fav-content').html($glob_fav.favHTML);
            $('#fav-total span').html(($glob_fav.lines.length ? $glob_fav.lines.length : "") + " шт.");
        }
        $('.cart-content').html($glob_cart.cartHTML);
        if ($glob_cart.lines.length) {
            $('.cartMini').html('<span>' + $glob_cart.amountPosition + '</span>');
            $('.cart-total span').html('<span class="cartAmount">' + $glob_cart.amountPosition + '<span class="cartEd">шт.</span>' + '</span>' + '<span class="cartSumm">' + formatMoney($glob_cart.summ) + '<span class="cartValuta">руб.</span>' + '</span>');
        } else {
            $('.cart-total span').html('<span class="cartNoAmount">Корзина <br>пустая</span>');
        }
        if ($obj.data.viewItemsHTML && $('.viewItemsHTML').html() < 10) {
            $('.viewItemsHTML').html($obj.data.viewItemsHTML);
            $(".viewItemsHTML").owlCarousel({
                autoplay: true,
                items: 4,
                autoplayHoverPause: true,
                dots: false,
                nav: true,
                navText: ["<span class='fa fa-chevron-circle-left'></span>", "<span class='fa fa-chevron-circle-right'></span>"],
                responsiveClass: true,
                responsive: {
                    0: {
                        items: 1,
                        nav: false
                    },
                    530: {
                        items: 2,
                        nav: false
                    },
                    768: {
                        items: 3,
                        nav: false
                    },
                    992: {
                        items: 4,
                        nav: false
                    },
                    1200: {
                        items: 5
                    }
                }
            });
        }
        if (!$obj.data.needItemsHTML) {
            $('.needItems-block').hide();
        }
        if ($obj.data.needItemsHTML && $('.needItemsHTML').html() < 10) {
            $('.needItems-block').show();
            $('.needItemsHTML').html($obj.data.needItemsHTML);
            $(".needItemsHTML").owlCarousel({
                autoplay: true,
                items: 4,
                autoplayHoverPause: true,
                dots: false,
                nav: true,
                navText: ["<span class='fa fa-chevron-circle-left'></span>", "<span class='fa fa-chevron-circle-right'></span>"],
                responsiveClass: true,
                responsive: {
                    0: {
                        items: 1,
                        nav: false
                    },
                    530: {
                        items: 2,
                        nav: false
                    },
                    768: {
                        items: 3,
                        nav: false
                    },
                    992: {
                        items: 4,
                        nav: false
                    },
                    1200: {
                        items: 5
                    }
                }
            });
        }
        initClickByAllDivItem();
        $.each($glob_cart.lines, function($i, $line) {
            $('.item-' + $line.id_item + ' .amount').html(formatMoney($line.amount));
            $('.item-' + $line.id_item + ' .item-cost').html(formatMoney($line.cost));
            $('.item-' + $line.id_item + ' .item-summ').html(formatMoney($line.summ));
            if ($line.size_value) {
                $('.item-' + $line.id_item + ':not(.item-container,.item-inlist)').removeClass('cartStatus-no').addClass('cartStatus-yes').removeClass('deletedFromCart');
            } else {
                $('.item-' + $line.id_item).removeClass('cartStatus-no').addClass('cartStatus-yes').removeClass('deletedFromCart');
            }
        });
        if ($glob_fav) {
            $.each($glob_fav.lines, function($i, $line) {
                $('.item-' + $line.id_item).removeClass('favStatus-no').addClass('favStatus-yes');
            });
            if ($glob_fav.lines.length) {
                $('#fav-total i').removeClass('fa-heart-o').addClass('fa-heart');
            } else {
                $('#fav-total i').removeClass('fa-heart').addClass('fa-heart-o');
            }
        }
        $('.cart-summ').html(formatMoney($glob_cart.summ));
        $('.cart .btn-delete, .hcart .btn-delete').click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (confirm("Вы уверены?")) {
                addToCart($(this).attr("data-itemid"), -$(this).attr("data-amount"), this, 1);
            }
        });
        $('#fav .btn-delete').click(function(event) {
            event.preventDefault();
            event.stopPropagation();
            addToCart($(this).attr("data-itemid"), -$(this).attr("data-amount"), this, 2);
        });
        $(document).on('submit', '#favForm', function(event) {
            event.preventDefault();
            event.stopPropagation();
            doFavForm();
        });
        $('.cart .btn-createOrder').click(function(event) {
            $('.cart-content').dropdown('toggle');
            createOrder();
        });
        checkLogin();
        if ($glob_cart.visitor.phone) {
            $('#inputPhoneRecall').val($glob_cart.visitor.phone);
            $('#inputPhoneFav').val($glob_cart.visitor.phone);
        }
        initClickAddToCartButton();
        initAutoSave();
        $('.noShowBeforeCart').removeClass('noShowBeforeCart');
        $("html").trigger("cart.afterInit");
        if ($doAfter)
            $doAfter.call($obj);
    });
}
function addToCart($itemNo, $amount, $elementAction, $kind) {
    if ($elementAction) {
        $itemEl = $($elementAction).closest('.info-block, .item');
        $sizeBlock = $itemEl.find('.size-block');
        if ($sizeBlock.length) {
            $size_id_item = $itemEl.find('.size-block').attr('data-select-id-item');
            if (!$size_id_item) {
                $sizeBlock.addClass('flash animated flashBlock').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                    $(this).removeClass('animated').removeClass('flash').removeClass('flashBlock');
                });
                return;
            } else {
                $itemNo = $size_id_item;
            }
        }
    }
    window.info_addToCart = [$itemNo, $amount];
    $('.item-' + $itemNo + ' .item-cost').html('');
    $('.item-' + $itemNo + ' .item-summ').html('');
    $('.item-' + $itemNo).addClass('deletedFromCart');
    if ($amount < 0) {
        $.each($glob_cart.lines, function($i, $line) {
            if ($line.id_item == window.info_addToCart[0]) {
                dataLayer.push({
                    "ecommerce": {
                        "remove": {
                            "products": [{
                                "id": $line.id_item,
                                "name": $line.itemInfo.name,
                                "category": $line.itemInfo.cat_name
                            }]
                        }
                    }
                });
            }
        });
    }
    $.ajax({
        url: "/scripts/cart.php",
        method: "POST",
        cache: "false",
        data: {
            action: "addToCart",
            kind: $kind,
            idItem: parseInt($itemNo),
            amount: parseInt($amount)
        }
    }).done(function($obj) {
        if ($obj.error) {
            return;
        }
        getCart($elementAction, function() {
            if (window.info_addToCart[1] > 0) {
                $.each($glob_cart.lines, function($i, $line) {
                    if ($line.id_item == window.info_addToCart[0]) {
                        dataLayer.push({
                            "ecommerce": {
                                "add": {
                                    "products": [{
                                        "id": $line.id_item,
                                        "name": $line.itemInfo.name,
                                        "price": $line.cost,
                                        "brand": $line.itemInfo.brand_name,
                                        "category": $line.itemInfo.cat_name,
                                        "quantity": window.info_addToCart[1]
                                    }]
                                }
                            }
                        });
                    }
                });
            }
            if (window.info_addToCart[1] < 0) {
                $foundItem = false;
                $.each($glob_cart.lines, function($i, $line) {
                    if ($line.id_item == window.info_addToCart[0]) {
                        $foundItem = true;
                    }
                })
                if (!$foundItem) {
                    if ($('.orderPage').length) {
                        createOrder();
                    }
                }
            }
        });
    });
}
$(document).ready(function() {
    $("html").on("cart.afterInit", function() {
        if ($glob_fav && $glob_fav.lines && $glob_fav.lines.length) {
            $(".divShowFav").removeClass('FavOff').addClass('FavOn');
        } else {
            $(".divShowFav").removeClass('FavOn').addClass('FavOff');
        }
    });
    $('.header-cart').on('show.bs.dropdown', function() {
        if ($(window).width() < 770) {
            if (!$glob_cart.lines.length) {
                alert("В корзине пока нет ни одного товара");
            } else {
                $('#mainMenuCollapse').collapse('hide');
                createOrder();
            }
            return false;
        }
    });
    $("html").on("cart.afterInit", function() {
        if ($(".orderPage .blockMinCostOrder").length) {
            if ($glob_cart.minCostOrder > 0 && $glob_cart.summ < $glob_cart.minCostOrder) {
                $(".orderPage .blockMinCostOrder").removeClass('hidden');
                $(".orderPage #orderForm").addClass('hidden');
            } else {
                $(".orderPage .blockMinCostOrder").addClass('hidden');
                $(".orderPage #orderForm").removeClass('hidden');
            }
        }
    });
    getCart();
});
function checkLogin() {
    if ($glob_cart.visitor.id_client && $glob_cart.visitor.client && $glob_cart.visitor.client.id) {
        $glob_cart.loginOK = true;
        $('.menu-login span').html($glob_cart.visitor.client.name);
        $('.menu-login i').attr('data-original-title', $glob_cart.visitor.client.name);
        $('.menu-login').addClass('login-on').attr('title', $glob_cart.visitor.client.name);
    } else {
        $glob_cart.loginOK = false;
        $('.menu-login span').html("Кабинет");
        $('.menu-login i').attr('data-original-title', "Кабинет");
        $('.menu-login').removeClass('login-on').attr('title', '');
    }
}
function submitLogin() {
    $("#loginClubModal #loginErrors").addClass('hidden');
    $('#loginClubModal form button[type="submit"]').prop('disabled', true);
    $.ajax({
        url: "/scripts/login-club.php",
        method: "POST",
        cache: "false",
        data: {
            action: $("#loginClubModal input[name=action]").val(),
            service: $("#loginClubModal input[name=service]").val(),
            phone: $("#loginClubModal input[name=phone]").val(),
            codeSMS: $("#loginClubModal input[name=reminderSMSCode]").val()
        }
    }).done(function($obj) {
        ym(43364589, 'reachGoal', 'register');
        $('#loginClubModal form button[type="submit"]').prop('disabled', false);
        if ($obj.error) {
            $("#loginClubModal #loginErrors").removeClass('hidden').html($obj.errorText ? $obj.errorText : "Ошибка.");
            return;
        }
        $('#loginClubModal #reminderSMSCodeBlock').removeClass('hidden');
        $('#loginClubModal #reminderSMSCode').prop('required', true);
        if ($('#loginClubModal input[name=action]').val() != 'secondStep-Code') {
            if ($obj.data ? $obj.data : "")
                alert($obj.data ? $obj.data : "");
            $('#loginClubModal input[name=action]').val('secondStep-Code');
        } else {
            if ($('#loginClubModal input[name=flagAfterLoginCancel]').val() == 1) {} else {
                document.location = "/";
            }
            $("html").trigger("login.afterLogin");
        }
    });
}
$(document).ready(function() {
    $(document).on('submit', '#loginClubModal form', function(event) {
        event.preventDefault();
        event.stopPropagation();
        submitLogin();
    });
    $("html").on("cart.afterInit", function() {
        if ($glob_cart.visitor && $glob_cart.visitor.phone) {
            $phone = $("input[name=phone]").val();
            if ($phone)
                $("input[name=phone]").val($glob_cart.visitor.phone);
        }
    });
    $('.menu-login a').click(function(event) {
        if (!$glob_cart.loginOK) {
            event.preventDefault();
            event.stopPropagation();
            $('#loginClubModal').modal();
        }
    });
    $('#loginClubModal').on('show.bs.modal', function(e) {
        if ($glob_cart.loginOK)
            document.location = "/lk/home.html";
    })
});
function initLk() {
    if (!$glob_cart.loginOK) {
        $(".notLogin").removeClass("hidden");
        return;
    }
    if (!$("#lkPlace").length)
        return;
    $.ajax({
        url: "/scripts/lk.php",
        method: "POST",
        cache: "false",
        data: {
            action: "getLk"
        }
    }).done(function($obj) {
        if ($obj.error) {
            alert($obj.errorText ? $obj.errorText : "Error");
            return;
        }
        $("#lkPlace").html($obj.data.html);
        $(".onLogin h1").text('Кабинет - ' + $obj.data.visitor.name);
        $(".onLogin").removeClass("hidden");
        $('.lk-caption-tabs a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            lk_showPage(e.target, e.relatedTarget);
        });
        lk_showPage($('.lk-caption-tabs a[data-toggle="tab"]')[0]);
    });
}
function lk_showPage($newPage, $prevPage) {
    $(".lk-tabs " + $newPage.hash).html('<p>Подождите..</p>');
    $.ajax({
        url: "/scripts/lk.php",
        method: "POST",
        cache: "false",
        data: {
            action: "getPageLk",
            page: $newPage.hash
        }
    }).done(function($obj) {
        if ($obj.error) {
            alert($obj.errorText ? $obj.errorText : "Error");
            return;
        }
        $(".lk-tabs " + $newPage.hash).html($obj.data.html);
        lk_afterShowPage($newPage);
    });
}
function lk_afterShowPage($newPage) {
    $('#inputChangePassword').change(function() {
        $('.newpass-menu').toggleClass('hidden');
        $('.newpass-menu input').prop('required', $(this).prop('checked'));
    });
    if ($newPage.hash == "#home") {
        $('.child .btn-quest').click(function() {
            $.ajax({
                url: "/scripts/lk.php",
                method: "POST",
                cache: "false",
                data: {
                    action: "page-home-questNewSubs",
                    childId: $(this).attr("data-child-id")
                }
            }).done(function($obj) {
                if ($obj.error) {
                    alert($obj.errorText ? $obj.errorText : "Error");
                    return;
                }
                alert("Запрошен новый абонемент, он появится в списке после подтверждения.");
                lk_showPage($newPage);
            });
        });
    }
}
function lk_submitChangeProfile($form) {
    var $params = {};
    $.each($($form).serializeArray(), function(_, $p) {
        $params[$p.name] = $p.value;
    });
    $($form).find('input[type=password]').val("");
    $.ajax({
        url: "/scripts/lk.php",
        method: "POST",
        cache: "false",
        data: {
            action: "changeProfile",
            id_region: $glob_cart.region ? $glob_cart.region.id : null,
            p: $params
        }
    }).done(function($obj) {
        $('.btn-lk-changeProfile').prop('disabled', false);
        if ($obj.error) {
            alert($obj.errorText ? $obj.errorText : "Error");
            return;
        }
        getCart();
        $("body").scrollTop(0);
        $(".resultText").html($obj.data.html);
    });
}
$(document).ready(function() {
    $("html").on("cart.afterInit", function() {
        initLk();
    });
    $('.btn-out').click(function() {
        document.cookie = 'idd=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.location.href = "/";
    });
    $(document).on('submit', '#lk-changeProfile', function(event) {
        event.preventDefault();
        event.stopPropagation();
        $('.btn-lk-changeProfile').prop('disabled', true);
        lk_submitChangeProfile(this);
    });
});
