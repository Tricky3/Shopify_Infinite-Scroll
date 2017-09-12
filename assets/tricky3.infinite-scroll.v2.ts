/*
Version v2.0
Author: @Tricky3
*/
declare let jQuery: any;

interface ITrickyInfiniteScrollSettings {
  selectors: {
    parentProductsWrapper: string,
    product: string,
    nextPageLink: string,
    previousPageLink: string,
    scrollableElem: any
  },
  pageQueryStringKey: string,
  waitForImagesToBeLoaded: boolean,
  enablePageState: boolean,
  manualLoading: boolean,
  useThrottle: boolean,
  scrollTimeout: number,
  callBacks: {
    onAllPageLoaded: () => void,
    onPageLoad?: () => void,
    beforePageLoad?: () => void
  }
}

(($) => {
  class T3InfiniteScroll {
    element: any;
    isRequestOn: boolean = false;
    nextPageLink: any = null;
    previousPageLink: any = null;
    initialNextPagelink: any = null;
    needToLoadOnlyNextPages: boolean = false;
    needToLoadOnlyPreviousPages: boolean = false;
    needToLoadBothPreviousAndNextPages: boolean = false;
    urlToLoad: string = null;
    scrollTimer: number = 0;
    resizeTimer: number = 0;
    settings: ITrickyInfiniteScrollSettings;
    scrollableElement: any;
    isAnimationFrameRequestOn: boolean = false;

    static scrollFuncName: string = '_scrollEventHandler';
    static SCROLL_THROTTLE_DEFAULT_DELAY: number = 10;
    static defaultSettings: ITrickyInfiniteScrollSettings = {
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
        onAllPageLoaded: () => { },
        onPageLoad: () => { },
        beforePageLoad: () => { }
      }
    }

    constructor(elem: any, userSettings: ITrickyInfiniteScrollSettings) {
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

    _init() {
      this._bindEvents();
    }

    _trickyInfiniteScroll() {
      if (this.nextPageLink != null &&
        (this.nextPageLink.length == 1 || this.previousPageLink.length != null) &&
        this.previousPageLink.length == 1) {
        let docViewTop = $(this.scrollableElement).scrollTop();
        let docViewBottom = docViewTop + $(this.scrollableElement).height();
        let lastVisibleElement = $(`${this.settings.selectors.product}:visible:last`, this.element);
        let elemTop = lastVisibleElement.length ? lastVisibleElement.offset().top : $(`${this.settings.selectors.product}:last`, this.element).offset().top;
        let elemBottom = elemTop + $(`${this.settings.selectors.product}:visible:last`, this.element).height();

        if (!this.isRequestOn && (elemBottom <= docViewBottom)) {
          typeof (this.settings.callBacks.beforePageLoad) == "function" && this.settings.callBacks.beforePageLoad();
          this.isRequestOn = true;
          let urlToLoad = this._getUrlToLoad();
          $.get(urlToLoad, this._pageLoaded);
        } else {
          typeof (this.settings.callBacks.onAllPageLoaded) == "function" && this.settings.callBacks.onAllPageLoaded();
          if (!this.settings.useThrottle) {
            this._unbindScrollingEvent();
          }
        }
      }
    }

    _getUrlToLoad() {
      let url = null;
      if (this.needToLoadOnlyPreviousPages) {
        url = this.previousPageLink.attr('href');
      }

      if (this.needToLoadOnlyNextPages) {
        url = this.nextPageLink.attr('href');
      }

      if (this.needToLoadBothPreviousAndNextPages) {

        if (this.previousPageLink.length) {
          url = this.previousPageLink.attr('href');
        } else if (this.initialNextPagelink != null) {
          url = this.initialNextPagelink.attr('href');
          this.needToLoadOnlyNextPages = true;
          this.needToLoadBothPreviousAndNextPages = false;
        }
      }
      return url;
    }

    _pageLoaded(htmlResponse) {
      let products = $(htmlResponse).find(this.settings.selectors.parentProductsWrapper);
      this.nextPageLink = $(htmlResponse).find(this.settings.selectors.nextPageLink);
      this.previousPageLink = $(htmlResponse).find(this.settings.selectors.previousPageLink);

      if (this.settings.waitForImagesToBeLoaded) {
        let totalImages = $('img', products).length;
        let index = 1;
        let callBackFired = false;
        $('img', products).load(() => {
          index++;
          if (index >= totalImages && this.isRequestOn && !callBackFired) {
            this._fireCallBacks(products);
            callBackFired = true;
          }
        }).each(function() {
          this.complete && $(this).load();
        });
      } else {
        this._fireCallBacks(products);
      }

      if (this.settings.enablePageState) {
        console.log("UPDATE URL HERE MAN...");
      }

    }

    _fireCallBacks(products: any) {
      /*if (GLOBALS.Opts.EnableHasherModule) {
        TrickyHasher.HashUrlAndAddPageAttributesToProducts(products);
      }*/

      this.element.parentProductsWrapper.append(products.html());
      //Helpers.ReloadPageLinksObjectsAndVariables();
      typeof (this.settings.callBacks.onPageLoad) == "function" && this.settings.callBacks.onPageLoad();
      this.isRequestOn = false;
      this.isAnimationFrameRequestOn = false;
    }

    _bindEvents() {
      //this.scrollableElement.bind(`scroll.${T3InfiniteScroll.scrollFuncName}`, this[T3InfiniteScroll.scrollFuncName]);
      if (this.settings.useThrottle) {
        this.scrollableElement.on("scroll", (e) => {
          T3InfiniteScroll.throttle((e) => {
            this._scrollEventHandler();
          }, 10)();
        });
      } else {
        let timeout = this.settings.scrollTimeout;
        this.scrollableElement.on("scroll", (e) => {
          this.scrollTimer && clearTimeout(this.scrollTimer);
          this.scrollTimer = setTimeout(this._scrollEventHandler, timeout);
        });
      }
    }

    _scrollEventHandler() {
      if (this.isAnimationFrameRequestOn) {
        return;
      }

      this.isAnimationFrameRequestOn = true;
      requestAnimationFrame(this._trickyInfiniteScroll);
    }

    _unbindScrollingEvent() {
      this.scrollableElement.unbind(`scroll.${T3InfiniteScroll.scrollFuncName}`, this[T3InfiniteScroll.scrollFuncName]);
    }

    static throttle(fn, delay = 10) {
      let _this, args;
      let scheduled = false;
      let call = function() {
        scheduled = false;
        fn.apply(_this, args);
      };

      return function() {
        _this = this;
        args = arguments;
        if (scheduled) {
          return;
        }
        scheduled = true;
        setTimeout(call, delay || T3InfiniteScroll.SCROLL_THROTTLE_DEFAULT_DELAY);

      }
    }
  }

  $.fn.t3InfiniteScroll = function(options) {
    return this.each(function() {
      return new T3InfiniteScroll($(this), options)._init();
    });
  }

})(jQuery);