var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var t3PageLoadHelpers;
(function (t3PageLoadHelpers) {
    function loadImages(items, callBack) {
        var _this = this;
        var totalImages = $('img', items).length;
        var index = 1;
        var callBackFired = false;
        if (totalImages.length) {
            $('img', items).load(function () {
                index++;
                if (index >= totalImages && _this.isRequestOn && !callBackFired) {
                    callBack(items);
                    callBackFired = true;
                }
            }).each(function () {
                if (this.complete)
                    $(this).load();
            });
        }
        else {
            callBack(items);
        }
    }
    t3PageLoadHelpers.loadImages = loadImages;
    function savePageState(opts) {
        if (opts === void 0) { opts = { key: '', value: '' }; }
        if (history.pushState) {
            var newUrl = '', queryStringKey = opts.key, queryStringKeyValue = opts.value;
            if (t3PageLoadHelpers.isQueryStringKeyInUrl(queryStringKey)) {
                newUrl = t3PageLoadHelpers.updateQueryStringParameter(window.location.href, queryStringKey, encodeURIComponent(queryStringKeyValue));
            }
            else {
                var queryString = queryStringKey + '=' + encodeURIComponent(queryStringKeyValue);
                queryString = window.location.search != "" ? window.location.search + '&' + queryString : '?' + queryString;
                newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryString;
            }
            newUrl = newUrl + window.location.hash;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }
        else {
            console.log('History pushstate not supported');
        }
    }
    t3PageLoadHelpers.savePageState = savePageState;
    function getQueryStringByKey(queryStringKey, url) {
        if (url === void 0) { url = ""; }
        queryStringKey = queryStringKey.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + queryStringKey + "=([^&#]*)");
        var results = url ? regex.exec(url) : regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    t3PageLoadHelpers.getQueryStringByKey = getQueryStringByKey;
    function isQueryStringKeyInUrl(queryStringKey) {
        return location.search.indexOf(queryStringKey) != -1;
    }
    t3PageLoadHelpers.isQueryStringKeyInUrl = isQueryStringKeyInUrl;
    function updateQueryStringParameter(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        }
        else {
            return uri + separator + key + "=" + value;
        }
    }
    t3PageLoadHelpers.updateQueryStringParameter = updateQueryStringParameter;
    function removeQueryStringParameter(url, parameter) {
        //prefer to use l.search if you have a location/link object
        var urlparts = url.split('?');
        if (urlparts.length >= 2) {
            var prefix = encodeURIComponent(parameter) + '=';
            var pars = urlparts[1].split(/[&;]/g);
            //reverse iteration as may be destructive
            for (var i = pars.length; i-- > 0;) {
                //idiom for string.startsWith
                if (pars[i].lastIndexOf(prefix, 0) !== -1) {
                    pars.splice(i, 1);
                }
            }
            url = urlparts[0] + '?' + pars.join('&');
            return url;
        }
        else {
            return url;
        }
    }
    t3PageLoadHelpers.removeQueryStringParameter = removeQueryStringParameter;
})(t3PageLoadHelpers || (t3PageLoadHelpers = {}));
(function ($) {
    var T3PageLoad = (function () {
        function T3PageLoad(elem, userSettings) {
            this.isRequestOn = false;
            this.currentLink = null;
            this.bothNextAndPreviousAvailableOnLoad = false;
            this.links = {
                next: 'next',
                previous: 'previous'
            };
            this.hasAllPagesLoaded = false;
            this.element = elem;
            this.settings = $.extend(T3PageLoad.defaultSettings, userSettings);
            this.itemsWrapper = $(this.settings.selectors.itemsWrapper);
            this.paginationWrapper = $(this.settings.selectors.paginationWrapper);
            this.bothNextAndPreviousAvailableOnLoad = $(this.settings.selectors.nextPageLink, this.paginationWrapper).length && $(this.settings.selectors.previousPageLink, this.paginationWrapper).length;
        }
        T3PageLoad.prototype.getPage = function (link, callBack) {
            var _this = this;
            if (!this.isRequestOn) {
                $.ajax({
                    url: link,
                    type: 'get',
                    beforeSend: function () {
                        _this.isRequestOn = true;
                        typeof (_this.settings.callBacks.beforePageLoad) === 'function' && _this.settings.callBacks.beforePageLoad();
                    },
                    success: function (data) {
                        callBack(data);
                    }
                });
            }
        };
        T3PageLoad.defaultSettings = {
            selectors: {
                itemsWrapper: '.collection-matrix',
                item: 'li',
                nextPageLink: '#NextPaginationLink a',
                previousPageLink: '#PreviousPaginationLink a',
                paginationWrapper: '.pagination',
                scrollableElem: null
            },
            manualLoading: false,
            pageQueryStringKey: 'page',
            waitForImagesToBeLoaded: false,
            enablePageState: false,
            throttleDelay: 100,
            callBacks: {
                onAllPagesLoaded: function () { },
                onPageLoad: function (inst) { },
                beforePageLoad: function () { }
            }
        };
        return T3PageLoad;
    }());
    var T3ManualPageLoad = (function (_super) {
        __extends(T3ManualPageLoad, _super);
        function T3ManualPageLoad(elem, userSettings) {
            _super.call(this, elem, userSettings);
        }
        T3ManualPageLoad.prototype.init = function () {
            this._bindEvents();
        };
        T3ManualPageLoad.prototype._bindEvents = function () {
            var self = this;
            this.paginationWrapper.on("click", this.settings.selectors.nextPageLink, function (e) {
                e.preventDefault();
                self.linkedClicked = self.links.next;
                self.currentLink = $(this).attr('href');
                self.getPage(self.currentLink, function (data) {
                    self._pageLoadedSuccess(data);
                });
            });
            this.paginationWrapper.on("click", this.settings.selectors.previousPageLink, function (e) {
                e.preventDefault();
                self.linkedClicked = self.links.previous;
                self.currentLink = $(this).attr('href');
                self.getPage(self.currentLink, function (data) {
                    self._pageLoadedSuccess(data);
                });
            });
        };
        T3ManualPageLoad.prototype._updateNextAndPreviousLinks = function (htmlResponse) {
            var newNextPageLink = htmlResponse.find(this.settings.selectors.nextPageLink);
            var newPreviousPageLink = htmlResponse.find(this.settings.selectors.previousPageLink);
            var existingNextPageLink = $(this.settings.selectors.nextPageLink, this.paginationWrapper);
            var existingPreviousPageLink = $(this.settings.selectors.previousPageLink, this.paginationWrapper);
            var needToUpdateNextLink = true;
            var needToUpdatePreviousLink = true;
            if (this.bothNextAndPreviousAvailableOnLoad) {
                if (this.linkedClicked == this.links.previous) {
                    needToUpdateNextLink = false;
                }
                if (this.linkedClicked == this.links.next) {
                    needToUpdatePreviousLink = false;
                }
            }
            needToUpdateNextLink = existingNextPageLink.length && needToUpdateNextLink;
            needToUpdatePreviousLink = existingPreviousPageLink.length && needToUpdatePreviousLink;
            if (needToUpdateNextLink) {
                //next page was present...
                if (newNextPageLink.length) {
                    existingNextPageLink.replaceWith(newNextPageLink);
                }
                else {
                    existingNextPageLink.remove();
                }
            }
            else {
            }
            if (needToUpdatePreviousLink) {
                if (newPreviousPageLink.length) {
                    existingPreviousPageLink.replaceWith(newPreviousPageLink);
                }
                else {
                    existingPreviousPageLink.remove();
                }
            }
            else {
            }
            this.hasAllPagesLoaded = !$(this.settings.selectors.nextPageLink, this.paginationWrapper).length && !$(this.settings.selectors.previousPageLink, this.paginationWrapper).length;
        };
        T3ManualPageLoad.prototype._pageLoadedSuccess = function (data) {
            var _this = this;
            var htmlResponse = $(data);
            var items = htmlResponse.find(this.settings.selectors.item);
            this._updateNextAndPreviousLinks(htmlResponse);
            this.settings.waitForImagesToBeLoaded ? t3PageLoadHelpers.loadImages(items, function (items) { _this._processingComplete(items); }) : this._processingComplete(items);
        };
        T3ManualPageLoad.prototype._processingComplete = function (items) {
            this.itemsWrapper.append($('<div/>').append(items).html());
            if (this.settings.enablePageState) {
                var url = this.currentLink;
                var pageNumber = t3PageLoadHelpers.getQueryStringByKey(this.settings.pageQueryStringKey, url);
                t3PageLoadHelpers.savePageState({ key: this.settings.pageQueryStringKey, value: pageNumber });
            }
            typeof (this.settings.callBacks.onPageLoad) === "function" && this.settings.callBacks.onPageLoad(items);
            if (this.hasAllPagesLoaded) {
                typeof (this.settings.callBacks.onAllPagesLoaded) === "function" && this.settings.callBacks.onAllPagesLoaded();
            }
            this.isRequestOn = false;
        };
        return T3ManualPageLoad;
    }(T3PageLoad));
    var T3InfiniteScrollPageLoad = (function (_super) {
        __extends(T3InfiniteScrollPageLoad, _super);
        function T3InfiniteScrollPageLoad(elem, userSettings) {
            _super.call(this, elem, userSettings);
            this.scrollTimer = 0;
            this.resizeTimer = 0;
            this.linkedLoaded = null;
            this.nextPageLink = null;
            this.previousPageLink = null;
            this.scrollableElement = this.settings.selectors.scrollableElem ? $(this.settings.selectors.scrollableElem) : $(window);
        }
        T3InfiniteScrollPageLoad.prototype.init = function () {
            var _this = this;
            this._loadLinks();
            this.scrollableElement.on("scroll", function (e) {
                T3InfiniteScrollPageLoad.throttle(function (e) {
                    if (!_this.isRequestOn) {
                        _this._scrollEventHandler();
                    }
                }, _this.settings.throttleDelay)();
            });
        };
        T3InfiniteScrollPageLoad.prototype._loadLinks = function () {
            this.nextPageLink = $(this.settings.selectors.nextPageLink, this.paginationWrapper);
            this.previousPageLink = $(this.settings.selectors.previousPageLink, this.paginationWrapper);
        };
        T3InfiniteScrollPageLoad.prototype._scrollEventHandler = function () {
            var _this = this;
            requestAnimationFrame(function () {
                _this._trickyInfiniteScroll();
            });
        };
        T3InfiniteScrollPageLoad.prototype._trickyInfiniteScroll = function () {
            var _this = this;
            var docViewTop = $(this.scrollableElement).scrollTop();
            var docViewBottom = docViewTop + $(this.scrollableElement).height();
            var lastVisibleElement = $(this.settings.selectors.item + ":visible:last", this.element);
            var elemTop = lastVisibleElement.length ? lastVisibleElement.offset().top : $(this.settings.selectors.item + ":last", this.element).offset().top;
            var elemBottom = elemTop + $(this.settings.selectors.item + ":visible:last", this.element).height();
            //we load next or previous pages when the last visible item is in viewport...
            if ((elemBottom <= docViewBottom) && this.nextPageLink) {
                var link = this.nextPageLink.attr('href');
                this.getPage(link, function (data) {
                    _this._pageLoadedSuccess(data);
                });
            }
            else {
                this.isRequestOn = false;
                if (!this.nextPageLink) {
                    $(this.settings.selectors.nextPageLink, this.paginationWrapper).remove();
                    if (!this.hasAllPagesLoaded) {
                        this.hasAllPagesLoaded = true;
                        typeof (this.settings.callBacks.onAllPagesLoaded) === "function" && this.settings.callBacks.onAllPagesLoaded();
                    }
                }
            }
        };
        T3InfiniteScrollPageLoad.prototype._updateNextAndPreviousLinks = function (htmlResponse) {
            var newNextPageLink = htmlResponse.find(this.settings.selectors.nextPageLink);
            var newPreviousPageLink = htmlResponse.find(this.settings.selectors.previousPageLink);
            if (newNextPageLink.length) {
                this.nextPageLink = newNextPageLink;
            }
            else {
                this.nextPageLink = null;
            }
        };
        T3InfiniteScrollPageLoad.prototype._pageLoadedSuccess = function (data) {
            var _this = this;
            var htmlResponse = $(data);
            var items = htmlResponse.find(this.settings.selectors.item);
            this._updateNextAndPreviousLinks(htmlResponse);
            this.settings.waitForImagesToBeLoaded ? t3PageLoadHelpers.loadImages(items, function (items) { _this._processingComplete(items); }) : this._processingComplete(items);
        };
        T3InfiniteScrollPageLoad.prototype._processingComplete = function (items) {
            this.itemsWrapper.append($('<div/>').append(items).html());
            typeof (this.settings.callBacks.onPageLoad) === "function" && this.settings.callBacks.onPageLoad(items);
            this.isRequestOn = false;
        };
        T3InfiniteScrollPageLoad.prototype._unbindScrollingEvent = function () {
            //this.scrollableElement.unbind(`scroll.${T3InfiniteScrollPageLoad.scrollFuncName}`, this[T3InfiniteScrollPageLoad.scrollFuncName]);
        };
        T3InfiniteScrollPageLoad.throttle = function (fn, delay) {
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
                setTimeout(call, delay || T3InfiniteScrollPageLoad.SCROLL_THROTTLE_DEFAULT_DELAY);
            };
        };
        T3InfiniteScrollPageLoad.scrollEventHandlerFuncName = '_scrollEventHandler';
        T3InfiniteScrollPageLoad.SCROLL_THROTTLE_DEFAULT_DELAY = 500;
        return T3InfiniteScrollPageLoad;
    }(T3PageLoad));
    $.fn.t3PageLoad = function (options) {
        var inst = null;
        inst = options.manualLoading ? new T3ManualPageLoad($(this), options) : new T3InfiniteScrollPageLoad($(this), options);
        inst.init();
        return inst;
    };
})(jQuery);
