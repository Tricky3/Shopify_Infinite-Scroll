(function ($) {
    var T3InfiniteScroll = (function () {
        function T3InfiniteScroll(elem, userSettings) {
            this.isRequestOn = false;
            this.nextPageLink = null;
            this.previousPageLink = null;
            this.initialNextPagelink = null;
            this.needToLoadOnlyNextPages = false;
            this.needToLoadOnlyPreviousPages = false;
            this.needToLoadBothPreviousAndNextPages = false;
            this.urlToLoad = null;
            this.scrollTimer = 0;
            this.resizeTimer = 0;
            this.isAnimationFrameRequestOn = false;
            this.element = elem;
            this.settings = $.extend(T3InfiniteScroll.defaultSettings, userSettings);
            this.nextPageLink = $(this.settings.selectors.nextPageLink);
            this.previousPageLink = $(this.settings.selectors.previousPageLink);
            this.initialNextPagelink = this.nextPageLink;
            this.scrollableElement = this.settings.selectors.scrollableElem ? $(this.settings.selectors.scrollableElem) : $(window);
            //start this part can be enhanced...
            this.needToLoadOnlyNextPages = this.previousPageLink.length == 0 && this.nextPageLink.length == 1;
            //this.needToLoadOnlyPreviousPages = this.previousPageLink.length == 1 && this.nextPageLink.length == 0;
            this.needToLoadOnlyPreviousPages = !this.needToLoadOnlyNextPages;
            this.needToLoadBothPreviousAndNextPages = this.previousPageLink.length == 1 && this.nextPageLink.length == 1;
            //end enhancement part...
        }
        T3InfiniteScroll.prototype._init = function () {
            this._bindEvents();
        };
        T3InfiniteScroll.prototype._trickyInfiniteScroll = function () {
            if (this.nextPageLink != null &&
                (this.nextPageLink.length == 1 || this.previousPageLink.length != null) &&
                this.previousPageLink.length == 1) {
                var docViewTop = $(this.scrollableElement).scrollTop();
                var docViewBottom = docViewTop + $(this.scrollableElement).height();
                var lastVisibleElement = $(this.settings.selectors.product + ":visible:last", this.element);
                var elemTop = lastVisibleElement.length ? lastVisibleElement.offset().top : $(this.settings.selectors.product + ":last", this.element).offset().top;
                var elemBottom = elemTop + $(this.settings.selectors.product + ":visible:last", this.element).height();
                if (!this.isRequestOn && (elemBottom <= docViewBottom)) {
                    typeof (this.settings.callBacks.beforePageLoad) == "function" && this.settings.callBacks.beforePageLoad();
                    this.isRequestOn = true;
                    var urlToLoad = this._getUrlToLoad();
                    $.get(urlToLoad, this._pageLoaded);
                }
                else {
                    typeof (this.settings.callBacks.onAllPageLoaded) == "function" && this.settings.callBacks.onAllPageLoaded();
                    if (!this.settings.useThrottle) {
                        this._unbindScrollingEvent();
                    }
                }
            }
        };
        T3InfiniteScroll.prototype._getUrlToLoad = function () {
            var url = null;
            if (this.needToLoadOnlyPreviousPages) {
                url = this.previousPageLink.attr('href');
            }
            if (this.needToLoadOnlyNextPages) {
                url = this.nextPageLink.attr('href');
            }
            if (this.needToLoadBothPreviousAndNextPages) {
                if (this.previousPageLink.length) {
                    url = this.previousPageLink.attr('href');
                }
                else if (this.initialNextPagelink != null) {
                    url = this.initialNextPagelink.attr('href');
                    this.needToLoadOnlyNextPages = true;
                    this.needToLoadBothPreviousAndNextPages = false;
                }
            }
            return url;
        };
        T3InfiniteScroll.prototype._pageLoaded = function (htmlResponse) {
            var _this = this;
            var products = $(htmlResponse).find(this.settings.selectors.parentProductsWrapper);
            this.nextPageLink = $(htmlResponse).find(this.settings.selectors.nextPageLink);
            this.previousPageLink = $(htmlResponse).find(this.settings.selectors.previousPageLink);
            if (this.settings.waitForImagesToBeLoaded) {
                var totalImages_1 = $('img', products).length;
                var index_1 = 1;
                var callBackFired_1 = false;
                $('img', products).load(function () {
                    index_1++;
                    if (index_1 >= totalImages_1 && _this.isRequestOn && !callBackFired_1) {
                        _this._fireCallBacks(products);
                        callBackFired_1 = true;
                    }
                }).each(function () {
                    this.complete && $(this).load();
                });
            }
            else {
                this._fireCallBacks(products);
            }
            if (this.settings.enablePageState) {
                console.log("UPDATE URL HERE MAN...");
            }
        };
        T3InfiniteScroll.prototype._fireCallBacks = function (products) {
            /*if (GLOBALS.Opts.EnableHasherModule) {
              TrickyHasher.HashUrlAndAddPageAttributesToProducts(products);
            }*/
            this.element.parentProductsWrapper.append(products.html());
            //Helpers.ReloadPageLinksObjectsAndVariables();
            typeof (this.settings.callBacks.onPageLoad) == "function" && this.settings.callBacks.onPageLoad();
            this.isRequestOn = false;
            this.isAnimationFrameRequestOn = false;
        };
        T3InfiniteScroll.prototype._bindEvents = function () {
            var _this = this;
            //this.scrollableElement.bind(`scroll.${T3InfiniteScroll.scrollFuncName}`, this[T3InfiniteScroll.scrollFuncName]);
            if (this.settings.useThrottle) {
                this.scrollableElement.on("scroll", function (e) {
                    T3InfiniteScroll.throttle(function (e) {
                        _this._scrollEventHandler();
                    }, 10)();
                });
            }
            else {
                var timeout_1 = this.settings.scrollTimeout;
                this.scrollableElement.on("scroll", function (e) {
                    _this.scrollTimer && clearTimeout(_this.scrollTimer);
                    _this.scrollTimer = setTimeout(_this._scrollEventHandler, timeout_1);
                });
            }
        };
        T3InfiniteScroll.prototype._scrollEventHandler = function () {
            if (this.isAnimationFrameRequestOn) {
                return;
            }
            this.isAnimationFrameRequestOn = true;
            requestAnimationFrame(this._trickyInfiniteScroll);
        };
        T3InfiniteScroll.prototype._unbindScrollingEvent = function () {
            this.scrollableElement.unbind("scroll." + T3InfiniteScroll.scrollFuncName, this[T3InfiniteScroll.scrollFuncName]);
        };
        T3InfiniteScroll.throttle = function (fn, delay) {
            if (delay === void 0) { delay = 10; }
            var _this, args;
            var scheduled = false;
            var call = function () {
                scheduled = false;
                fn.apply(_this, args);
            };
            return function () {
                _this = this;
                args = arguments;
                if (scheduled) {
                    return;
                }
                scheduled = true;
                setTimeout(call, delay || T3InfiniteScroll.SCROLL_THROTTLE_DEFAULT_DELAY);
            };
        };
        return T3InfiniteScroll;
    }());
    T3InfiniteScroll.scrollFuncName = '_scrollEventHandler';
    T3InfiniteScroll.SCROLL_THROTTLE_DEFAULT_DELAY = 10;
    T3InfiniteScroll.defaultSettings = {
        selectors: {
            parentProductsWrapper: '.collection-matrix',
            product: 'li',
            nextPageLink: '#NextPaginationLink a',
            previousPageLink: '#PreviousPaginationLink a',
            scrollableElem: null
        },
        manualLoading: false,
        pageQueryStringKey: 'page',
        waitForImagesToBeLoaded: false,
        enablePageState: false,
        useThrottle: true,
        scrollTimeout: 500,
        callBacks: {
            onAllPageLoaded: function () { },
            onPageLoad: function () { },
            beforePageLoad: function () { }
        }
    };
    $.fn.t3InfiniteScroll = function (options) {
        return this.each(function () {
            return new T3InfiniteScroll($(this), options)._init();
        });
    };
})(jQuery);
