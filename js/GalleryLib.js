var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var config = {
        thumbWidth: 290,
        thumbHeight: 290,
        minWidth: 320,
        minHeight: 240
    };
    var GalleryLib = (function () {
        function GalleryLib(data) {
            var _this = this;
            this.type = "thumbs";
            this.slideshowInterval = 5;
            this.slideshowSpeed = 400;
            this.images = [];
            this.imageIndex = 0;
            this.slideshowTimer = 0;
            this.displayedImage = null;
            this.loadingImage = null;
            this.listImgCont = null;
            this.thumbImgCont = null;
            this.fullThumbWidth = 0;
            this.fullThumbHeight = 0;
            this.bgColor = "";
            this.padding = 0;
            this.imageCover = false;
            this.disablePopup = false;
            this.thumbOpacity = 100;
            this.thumbWidth = config.thumbWidth;
            this.thumbHeight = config.thumbHeight;
            this.thumbAlign = "left";
            this.thumbPadding = 6;
            this.showPictureCaption = "always";
            this.captionBackground = "rgba(0,0,0,0.66)";
            this.imageElems = {};
            this.elem = $('<div>').addClass('wb_gallery');
            this.id = data.id ? data.id : 'wb-gallery-id';
            this.border = data.border ? data.border : { border: '5px none #FFFFFF' };
            this.thumbWidth = (typeof data.thumbWidth === 'number' && data.thumbWidth > 0)
                ? data.thumbWidth
                : config.thumbWidth;
            this.thumbHeight = (typeof data.thumbHeight === 'number' && data.thumbHeight > 0)
                ? data.thumbHeight
                : config.thumbHeight;
            this.thumbAlign = data.thumbAlign ? data.thumbAlign : this.thumbAlign;
            this.thumbPadding = data.thumbPadding ? data.thumbPadding : this.thumbPadding;
            this.padding = (data.padding || data.padding === 0) ? data.padding : 0;
            this.type = data.type ? data.type : this.type;
            this.slideshowInterval = (typeof data.interval === 'number') ? data.interval : 10;
            this.imageCover = (typeof data.imageCover === 'boolean') ? data.imageCover : this.imageCover;
            this.disablePopup = (typeof data.disablePopup === 'boolean') ? data.disablePopup : this.disablePopup;
            this.thumbOpacity = (typeof data.thumbOpacity === 'number') ? data.thumbOpacity : this.thumbOpacity;
            this.slideshowSpeed = (typeof data.speed === 'number') ? data.speed : 400;
            this.setBgColor(data.bgColor ? data.bgColor : 'transparent');
            this.showPictureCaption = (typeof data.showPictureCaption === 'string') ? data.showPictureCaption : this.showPictureCaption;
            if (data.captionBackground)
                this.setCaptionBackground(data.captionBackground);
            if (data.captionTitleStyle)
                this.setCaptionTitleStyle(data.captionTitleStyle);
            if (data.captionDescriptionStyle)
                this.setCaptionDescriptionStyle(data.captionDescriptionStyle);
            this.setImages((data.images && data.images.length) ? data.images : []);
            if (data.trackResize) {
                $(window).on('resize', function () { return _this.handleResize(); });
            }
        }
        GalleryLib.prototype.setVisible = function (visible) {
            this.elem.css('display', visible ? 'block' : 'none');
        };
        GalleryLib.prototype.appendTo = function (container) {
            $(container).append(this.elem);
            this.handleResize();
        };
        GalleryLib.prototype.reset = function (callback) {
            var _this = this;
            if (this.slideshowTimer)
                clearInterval(this.slideshowTimer);
            if (this.slideshowInterval && this.images.length > 1) {
                this.slideshowTimer = setInterval(function () { return _this.slideshowNext(callback); }, this.slideshowInterval * 1000);
            }
            else
                this.slideshowTimer = 0;
        };
        GalleryLib.prototype.render = function () {
            if (this.slideshowTimer)
                clearInterval(this.slideshowTimer);
            this.slideshowTimer = 0;
            this.listImgCont = null;
            this.displayedImage = null;
            this.loadingImage = null;
            this.elem.empty();
            if (this.images.length == 0)
                return;
            switch (this.type) {
                case "slideshow":
                    this.renderSlideshow();
                    break;
                case "list":
                    this.renderList();
                    break;
                case "masonry":
                    this.renderMasonry();
                    break;
                default:
                    this.renderThumbs();
                    break;
            }
        };
        GalleryLib.prototype.renderThumbs = function () {
            this.elem.html('<div class="wb-thumbs-only" style="width: 100%; height: 100%; overflow: auto;"></div>');
            this.elem.css("text-align", this.thumbAlign);
            var elem = this.elem.children().first();
            for (var _i = 0, _a = this.images; _i < _a.length; _i++) {
                var image = _a[_i];
                this.addImage(elem, image);
            }
            elem.children('.wb_thumb').css('padding', (this.thumbPadding / 2) + 'px');
        };
        GalleryLib.prototype.renderSlideshow = function () {
            var _this = this;
            this.elem.html('<div class="gallery-slideshow">' +
                '<div class="gallery-slide-image" style="overflow: hidden;"></div>' +
                '<div class="gallery-slide-left"><i class="fa fa-chevron-left"></i></div>' +
                '<div class="gallery-slide-right"><i class="fa fa-chevron-right"></i></div>' +
                '</div>');
            var cont = this.elem.children().first();
            var larr = cont.children(".gallery-slide-left");
            var rarr = cont.children(".gallery-slide-right");
            this.listImgCont = cont.children(".gallery-slide-image");
            this.listImgCont.css('opacity', this.thumbOpacity / 100);
            larr.click(function () { return _this.slideshowPrev(); });
            rarr.click(function () { return _this.slideshowNext(); });
            this.reset();
            this.imageIndex = -1;
            this.slideshowNext();
        };
        GalleryLib.prototype.renderList = function () {
            var _this = this;
            var h = this.elem.height();
            var tw = this.getThumbWidth();
            var th = this.getThumbHeight();
            var thumbcont = $("<div></div>");
            var callback = function () {
                var img = _this.imageElems[_this.imageIndex];
                if (!img.parentNode || !img.parentNode.parentNode || !img.parentNode.parentNode.parentNode)
                    return;
                $(img.parentNode.parentNode.parentNode).children(".tmb-selected").removeClass("tmb-selected");
                $(img.parentNode.parentNode).addClass("tmb-selected");
            };
            this.imageElems = {};
            var _loop_1 = function (i) {
                var image = this_1.images[i];
                var img = this_1.addImage(thumbcont, image, true);
                img.css({ cursor: "pointer" });
                this_1.imageElems[i] = img.get(0);
                img.click(function () {
                    if (!_this.listImgCont)
                        return;
                    _this.imageIndex = _this.images.indexOf(image);
                    _this.displayImage(_this.listImgCont, callback);
                });
                var par = img.parent().parent();
                if (i === this_1.imageIndex) {
                    par.addClass("tmb-selected");
                    tw = this_1.getThumbWidth() + 8;
                    th = this_1.getThumbHeight() + 8;
                }
            };
            var this_1 = this;
            for (var i = 0; i < this.images.length; i++) {
                _loop_1(i);
            }
            this.fullThumbWidth = tw;
            this.fullThumbHeight = th;
            thumbcont.css({ position: "absolute", left: "0", top: "5px", width: (tw * this.images.length) + "px", height: th + "px" });
            var galcont = document.createElement("DIV");
            $(galcont).css({ position: "relative", height: h + "px" });
            galcont.className = "gallery-list";
            var imgcont = document.createElement("DIV");
            $(imgcont).css({ position: "relative", height: (h - th - 10) + "px", overflow: "hidden" });
            imgcont.className = "gallery-list-image";
            var icon;
            var thumbdiv_in1 = document.createElement("DIV");
            $(thumbdiv_in1).css({ position: "relative", "float": "left", width: "16px", height: (th + 10) + "px", cursor: "pointer" });
            thumbdiv_in1.className = "gallery-list-left";
            $(thumbdiv_in1).click(function () { return _this.slideBy(-_this.fullThumbWidth * 3); });
            icon = document.createElement("I");
            icon.setAttribute("class", "fa fa-chevron-left");
            thumbdiv_in1.appendChild(icon);
            var thumbdiv_in2 = document.createElement("DIV");
            $(thumbdiv_in2).css({ position: "relative", "float": "none", margin: "0 17px", height: (th + 10) + "px", overflow: "hidden" });
            thumbdiv_in2.className = "gallery-list-thumbs";
            var thumbdiv_in3 = document.createElement("DIV");
            $(thumbdiv_in3).css({ position: "relative", "float": "right", width: "16px", height: (th + 10) + "px", cursor: "pointer" });
            thumbdiv_in3.className = "gallery-list-right";
            $(thumbdiv_in3).click(function () { return _this.slideBy(_this.fullThumbWidth * 3); });
            icon = document.createElement("I");
            icon.setAttribute("class", "fa fa-chevron-right");
            thumbdiv_in3.appendChild(icon);
            var thumbdiv = document.createElement("DIV");
            $(thumbdiv).css({ position: "relative", height: (th + 10) + "px", overflow: "hidden" });
            $(thumbdiv_in2).append(thumbcont);
            thumbdiv.appendChild(thumbdiv_in1);
            thumbdiv.appendChild(thumbdiv_in3);
            thumbdiv.appendChild(thumbdiv_in2);
            galcont.appendChild(imgcont);
            galcont.appendChild(thumbdiv);
            this.listImgCont = $(imgcont);
            this.thumbImgCont = $(thumbdiv_in2);
            this.elem.append(galcont);
            this.reset(callback);
            this.imageIndex = -1;
            this.slideshowNext(callback);
        };
        GalleryLib.prototype.renderMasonry = function () {
            var elem = $('<div class="wb-masonry-items"/>');
            var cont = $('<div class="wb-masonry" style="width: 100%; height: 100%; overflow: auto;"/>');
            cont.append(elem);
            this.elem.append(cont);
            if (this.thumbAlign === "left")
                elem.css("float", "left");
            else if (this.thumbAlign === "right")
                elem.css("float", "right");
            else
                elem.css("margin", "0 auto");
            for (var _i = 0, _a = this.images; _i < _a.length; _i++) {
                var image = _a[_i];
                this.addImage(elem, image);
            }
            elem.children('.wb_thumb').css('padding', (this.thumbPadding / 2) + 'px');
            var brd = this.getBorder();
            elem.masonry({
                itemSelector: ".wb_thumb",
                columnWidth: this.getThumbWidth() + (brd ? this.getBorderWidth(brd, 1) + this.getBorderWidth(brd, 3) : 0) + this.thumbPadding,
                fitWidth: true,
                transitionDuration: 0
            });
            this.listImgCont = elem;
        };
        GalleryLib.prototype.getBorderWidth = function (css, side) {
            if (side === void 0) { side = 0; }
            var border = '';
            if (side == 1 && typeof css.borderLeft === 'string')
                border = css.borderLeft;
            if (side == 1 && typeof css['border-left'] === 'string')
                border = css['border-left'];
            if (side == 3 && typeof css.borderRight === 'string')
                border = css.borderRight;
            if (side == 3 && typeof css['border-right'] === 'string')
                border = css['border-right'];
            if (!border && typeof css.border === 'string')
                border = css.border;
            var res = border.match(/^([0-9]+)px(?:| .+)$/);
            if (res)
                return parseFloat(res[1]);
            return 0;
        };
        GalleryLib.prototype.slideBy = function (delta) {
            if (!this.thumbImgCont)
                return;
            var cont = this.thumbImgCont;
            var div = cont.children().first();
            var pos = div.position();
            var x = pos.left;
            x -= delta;
            var minx = -(div.width() - cont.width());
            if (x < minx)
                x = minx;
            if (x > 0)
                x = 0;
            div.animate({ left: x + "px" });
        };
        GalleryLib.prototype.handleContinuousResize = function () {
            if (!this.listImgCont)
                return;
            if (this.type === "masonry") {
                this.listImgCont.masonry();
            }
        };
        GalleryLib.prototype.handleResize = function () {
            if (!this.listImgCont)
                return;
            if (this.type === "list") {
                var h = this.elem.height();
                var th = this.fullThumbHeight;
                this.listImgCont.css({ height: (h - th - 10) + "px" });
            }
            else if (this.type === "masonry")
                this.listImgCont.masonry();
            if (this.displayedImage)
                this.updateImageSize(this.displayedImage);
            if (this.loadingImage)
                this.updateImageSize(this.loadingImage);
        };
        GalleryLib.prototype.updateImageSize = function (imageCont) {
            if (!this.listImgCont)
                return;
            var size = imageCont.data("_wb_size_");
            var stl = this.calcImageStyles(this.listImgCont, size);
            imageCont.css({
                left: stl.x + "px",
                top: stl.y + "px"
            });
            var img = imageCont.children('img').first();
            if (img && img.length) {
                img.css({
                    width: stl.width + "px",
                    height: stl.height + "px"
                });
                var imgRaw = img.get(0);
                imgRaw.width = stl.width;
                imgRaw.height = stl.height;
            }
        };
        GalleryLib.prototype.calcImageStyles = function (displayCont, image) {
            if (!image)
                return { x: 0, y: 0, width: 0, height: 0 };
            var cover = this.imageCover;
            var pad = cover ? 0 : this.padding;
            var maxWidth = displayCont.innerWidth() - pad * 2;
            var maxHeight = displayCont.innerHeight() - pad * 2;
            var w = image.width;
            var h = image.height;
            if (cover || w > maxWidth || h > maxHeight) {
                var ratio1 = w / maxWidth;
                var ratio2 = h / maxHeight;
                var ratio = cover ? Math.min(ratio1, ratio2) : Math.max(ratio1, ratio2);
                w = Math.floor(w / ratio);
                h = Math.floor(h / ratio);
            }
            return {
                x: Math.floor((maxWidth - w) / 2 + pad),
                y: Math.floor((maxHeight - h) / 2 + pad),
                width: w,
                height: h
            };
        };
        GalleryLib.prototype.displayImage = function (displayCont, callback) {
            var _this = this;
            if (typeof callback === 'function')
                callback();
            var image = this.images[this.imageIndex];
            if (!image)
                return;
            var cont = (image.link ? $('<a>') : $('<div>')).addClass("gallery-image");
            if (image.link) {
                cont.attr('href', image.link.url);
                if (image.link.target)
                    cont.attr('target', image.link.target);
            }
            if (image.title)
                cont.attr('title', image.title);
            cont.css({ display: "none", position: "absolute" });
            var img = new Image(), imgJq = $(img);
            img.alt = "";
            img.onload = function () {
                if (_this.displayedImage) {
                    var caption_1 = _this.displayedImage.data("caption");
                    _this.displayedImage.fadeOut(_this.slideshowSpeed, function () {
                        if (_this.displayedImage)
                            _this.displayedImage.remove();
                    });
                    if (caption_1) {
                        caption_1.fadeOut(_this.slideshowSpeed, function () { return caption_1.remove(); });
                    }
                }
                var size = { width: img.width, height: img.height };
                cont.data("_wb_size_", size);
                cont.append(img);
                var stl = _this.calcImageStyles(displayCont, size);
                cont.css({ left: stl.x + "px", top: stl.y + "px" });
                imgJq.css({ width: stl.width + "px", height: stl.height + "px" });
                img.width = stl.width;
                img.height = stl.height;
                cont.fadeIn(_this.slideshowSpeed, function () {
                    var parent = cont.parent();
                    _this.displayedImage = (parent && parent.length) ? cont : null;
                    _this.loadingImage = null;
                });
            };
            imgJq.css((this.imageCover || !this.border) ? { "border": "none" } : this.border);
            displayCont.append(cont);
            this.loadingImage = cont;
            var caption = $('<div class="wb-picture-caption" style="display: none;"/>')
                .css("background-color", this.captionBackground);
            if (this.fillCaptionContainer(caption, image, true)) {
                caption.fadeIn(this.slideshowSpeed);
                displayCont.append(caption);
                cont.data("caption", caption);
            }
            img.src = image.src;
            if (!image.link)
                this.initImageLightBox(imgJq, this.imageIndex);
        };
        GalleryLib.prototype.slideshowNext = function (callback) {
            if (this.images.length === 0 || !this.listImgCont)
                return;
            this.imageIndex++;
            if (this.imageIndex >= this.images.length)
                this.imageIndex = 0;
            this.displayImage(this.listImgCont, callback);
        };
        GalleryLib.prototype.slideshowPrev = function () {
            if (this.images.length === 0 || !this.listImgCont)
                return;
            this.imageIndex--;
            if (this.imageIndex < 0)
                this.imageIndex = this.images.length - 1;
            this.displayImage(this.listImgCont);
        };
        GalleryLib.prototype.addImage = function (cont, image, noLightbox) {
            var _this = this;
            if (noLightbox === void 0) { noLightbox = false; }
            var isThumbsOnlyMode = (this.type === "thumbs" || this.type === "masonry");
            var div = (image.link ? $('<a>') : $('<div>')).addClass("wb_thumb");
            if (image.link) {
                div.attr('href', image.link.url);
                if (image.link.target)
                    div.attr('target', image.link.target);
            }
            if (image.title)
                div.attr('title', image.title);
            var tw = this.getThumbWidth();
            var th = this.getThumbHeight();
            var wrp = $("<div/>");
            wrp.css({
                zIndex: "1",
                width: tw + "px",
                overflow: "hidden",
                boxSizing: "content-box",
                position: 'relative'
            });
            if (this.type !== 'masonry')
                wrp.css('height', th + "px");
            var brd = this.getBorder();
            if (isThumbsOnlyMode && brd)
                wrp.css(brd);
            div.append(wrp);
            var img = $('<img src="" alt="" />');
            var imgRaw = img.get(0);
            imgRaw.onload = function () {
                var w = imgRaw.width;
                var h = imgRaw.height;
                var k;
                if (_this.type === 'masonry') {
                    k = w / tw;
                }
                else {
                    var k1 = w / tw;
                    var k2 = h / th;
                    k = Math.min(k1, k2);
                }
                w = w / k;
                h = h / k;
                var x = Math.round((tw - w) / 2);
                var y = (_this.type === 'masonry') ? 0 : Math.round((th - h) / 2);
                img.css({ left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
                if (_this.type === 'masonry')
                    _this.elem.children().first().children().first().masonry();
            };
            imgRaw.src = image.src;
            img.css({
                display: "block",
                zIndex: "1",
                maxWidth: "auto",
                position: "relative"
            });
            wrp.append(img);
            if (isThumbsOnlyMode && this.getThumbWidth() >= 100) {
                var descDiv = $('<div class="wb-picture-caption"/>').css("background-color", this.captionBackground);
                if (this.fillCaptionContainer(descDiv, image, false)) {
                    wrp.append(descDiv);
                }
            }
            cont.append(div);
            if (!noLightbox && !image.link)
                this.initImageLightBox(img, this.imageIndex);
            return img;
        };
        GalleryLib.prototype.fillCaptionContainer = function (cont, meta, createDescription, createLink) {
            if (createLink === void 0) { createLink = false; }
            var hasAny = false;
            if (meta.title !== "") {
                hasAny = true;
                var title = $('<h3 class="wb-lightbox-title">').append((createLink && meta.link)
                    ? $('<a>').attr({ href: meta.link.url, target: meta.link.target }).text(meta.title)
                    : document.createTextNode(meta.title));
                if (this.captionTitleStyle)
                    title.css(this.captionTitleStyle);
                cont.append(title);
            }
            if (createDescription && meta.description !== "") {
                hasAny = true;
                cont.append($('<div class="wb-lightbox-description">').text(meta.description));
                if (this.captionDescriptionStyle)
                    cont.css(this.captionDescriptionStyle);
            }
            return hasAny;
        };
        GalleryLib.prototype.initImageLightBox = function (img, imageIndex) {
            var _this = this;
            if ((this.type === 'slideshow' || this.type === 'list') && this.disablePopup)
                return;
            var lightBoxElem = $('body > .pswp');
            img.css({ cursor: "pointer" })
                .on("click touchstart touchend touchmove", function (e) {
                var img = $(e.currentTarget);
                if (e.type === 'touchstart') {
                    img.data('pswpDisabled', false);
                }
                else if (e.type === 'touchmove') {
                    img.data('pswpDisabled', true);
                }
                if ((e.type === 'click' || e.type === 'touchend') && !img.data('pswpDisabled')) {
                    var images = [];
                    for (var _i = 0, _a = _this.images; _i < _a.length; _i++) {
                        var image = _a[_i];
                        images.push({
                            src: image.src,
                            w: image.width,
                            h: image.height,
                            msrc: null,
                            title: (typeof image.title === 'string' && image.title.length > 0) ? image.title : "- wb-untitled -",
                            link: image.link ? image.link : undefined,
                            description: image.description ? image.description : ''
                        });
                    }
                    (new PhotoSwipe(lightBoxElem.get(0), PhotoSwipeUI_Default, images, {
                        index: imageIndex,
                        addCaptionHTMLFn: function (item, captionElement) {
                            var cont = $(captionElement.children[0]);
                            cont.empty();
                            return _this.fillCaptionContainer(cont, item, true, true);
                        }
                    })).init();
                    lightBoxElem.attr('id', _this.id + '_pswp');
                }
            });
        };
        GalleryLib.prototype.getImages = function () {
            return __spreadArrays(this.images);
        };
        GalleryLib.prototype.setImages = function (images) {
            this.images = __spreadArrays(images);
            for (var _i = 0, _a = this.images; _i < _a.length; _i++) {
                var image = _a[_i];
                if ((this.type === "thumbs" || this.type === "masonry") && image.link) {
                    image.link = undefined;
                }
            }
            this.render();
        };
        GalleryLib.prototype.getType = function () {
            return this.type;
        };
        GalleryLib.prototype.setType = function (type, noRender) {
            if (noRender === void 0) { noRender = false; }
            this.type = type;
            if (!noRender)
                this.render();
        };
        GalleryLib.prototype.getSlideshowInterval = function () {
            return this.slideshowInterval;
        };
        GalleryLib.prototype.getSlideshowSpeed = function () {
            return this.slideshowSpeed;
        };
        GalleryLib.prototype.getBgColor = function () {
            return this.bgColor;
        };
        GalleryLib.prototype.setBgColor = function (color) {
            this.bgColor = color;
            this.elem.css("background-color", this.bgColor);
        };
        GalleryLib.prototype.getCaptionBackground = function () {
            return this.captionBackground;
        };
        GalleryLib.prototype.setCaptionBackground = function (color) {
            this.captionBackground = color;
            this.elem.find(".wb-picture-caption").css("background-color", color);
        };
        GalleryLib.prototype.getCaptionTitleStyle = function () {
            return this.captionTitleStyle;
        };
        GalleryLib.prototype.setCaptionTitleStyle = function (css) {
            this.captionTitleStyle = css;
            this.elem.find(".wb-lightbox-title").css(css);
        };
        GalleryLib.prototype.getCaptionDescriptionStyle = function () {
            return this.captionDescriptionStyle;
        };
        GalleryLib.prototype.setCaptionDescriptionStyle = function (css) {
            this.captionDescriptionStyle = css;
            this.elem.find(".wb-lightbox-description").css(css);
        };
        GalleryLib.prototype.setFrequency = function (frequency) {
            if (frequency >= 0 && frequency <= 10) {
                this.slideshowInterval = frequency;
                this.reset();
            }
        };
        GalleryLib.prototype.getFrequency = function () {
            return this.slideshowInterval;
        };
        GalleryLib.prototype.getBorder = function () {
            return this.border;
        };
        GalleryLib.prototype.setBorder = function (border) {
            this.border = border;
            this.elem.find('.gallery-image').css((this.imageCover || !this.border) ? { "border": "none" } : this.border);
        };
        GalleryLib.prototype.getPadding = function () {
            return this.padding;
        };
        GalleryLib.prototype.getThumbWidth = function () {
            return this.thumbWidth ? this.thumbWidth : config.thumbWidth;
        };
        GalleryLib.prototype.getThumbHeight = function () {
            return this.thumbHeight ? this.thumbHeight : config.thumbHeight;
        };
        GalleryLib.prototype.getThumbAlign = function () {
            return this.thumbAlign;
        };
        GalleryLib.prototype.getThumbPadding = function () {
            return this.thumbPadding;
        };
        GalleryLib.prototype.setPadding = function (padding) {
            this.padding = padding;
        };
        GalleryLib.prototype.setThumbWidth = function (width) {
            this.thumbWidth = width;
        };
        GalleryLib.prototype.setThumbHeight = function (height) {
            this.thumbHeight = height;
        };
        GalleryLib.prototype.setThumbAlign = function (align) {
            this.thumbAlign = align;
        };
        GalleryLib.prototype.setThumbPadding = function (padding) {
            this.thumbPadding = padding;
        };
        GalleryLib.prototype.setImageCover = function (value) {
            this.imageCover = value;
        };
        GalleryLib.prototype.setDisablePopup = function (value) {
            this.disablePopup = value;
        };
        GalleryLib.prototype.setThumbOpacity = function (value) {
            this.thumbOpacity = value;
        };
        GalleryLib.prototype.getImageCover = function () {
            return this.imageCover;
        };
        GalleryLib.prototype.getDisablePopup = function () {
            return this.disablePopup;
        };
        GalleryLib.prototype.getThumbOpacity = function () {
            return this.thumbOpacity;
        };
        GalleryLib.prototype.setShowPictureCaption = function (value) {
            this.showPictureCaption = value;
        };
        GalleryLib.prototype.getShowPictureCaption = function () {
            return this.showPictureCaption;
        };
        return GalleryLib;
    }());
    exports.GalleryLib = GalleryLib;
});
