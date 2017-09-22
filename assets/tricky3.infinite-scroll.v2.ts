/*
Version v2.0
Author: @Tricky3
*/
declare let jQuery: any;
declare let $: any;

interface ITrickyInfiniteScrollSettings {
  selectors: {
    itemsWrapper: string,
    item: string,
    nextPageLink: string,
    previousPageLink: string,
    scrollableElem: any,
    paginationWrapper: any,
  },
  pageQueryStringKey: string,
  waitForImagesToBeLoaded: boolean,
  enablePageState: boolean,
  manualLoading: boolean,
  throttleDelay: number,
  callBacks: {
    onAllPagesLoaded: () => void,
    onPageLoad?: (items) => void,
    beforePageLoad?: () => void
  }
}

module t3PageLoadHelpers {
  export function loadImages(items: any, callBack: Function) {
    let totalImages = $('img', items).length;
    let index = 1;
    let callBackFired = false;
    if (totalImages.length) {
      $('img', items).load(() => {
        index++;
        if (index >= totalImages && this.isRequestOn && !callBackFired) {
          callBack(items);
          callBackFired = true;
        }
      }).each(function() {
        if (this.complete)
          $(this).load();
      });
    } else {
      callBack(items);
    }
  }

  export function savePageState(opts = { key: '', value: '' }) {
    if (history.pushState) {
      let newUrl = '', queryStringKey = opts.key, queryStringKeyValue = opts.value;
      if (t3PageLoadHelpers.isQueryStringKeyInUrl(queryStringKey)) {
        newUrl = t3PageLoadHelpers.updateQueryStringParameter(window.location.href, queryStringKey, encodeURIComponent(queryStringKeyValue));
      } else {
        let queryString = queryStringKey + '=' + encodeURIComponent(queryStringKeyValue);
        queryString = window.location.search != "" ? window.location.search + '&' + queryString : '?' + queryString;
        newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + queryString;
      }
      newUrl = newUrl + window.location.hash;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } else {
      console.log('History pushstate not supported');
    }
  }

  export function getQueryStringByKey(queryStringKey, url = "") {
    queryStringKey = queryStringKey.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    let regex = new RegExp("[\\?&]" + queryStringKey + "=([^&#]*)");
    let results = url ? regex.exec(url) : regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  export function isQueryStringKeyInUrl(queryStringKey) {
    return location.search.indexOf(queryStringKey) != -1;
  }

  export function updateQueryStringParameter(uri, key, value) {
    let re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    let separator = uri.indexOf('?') !== -1 ? "&" : "?";
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + "=" + value + '$2');
    } else {
      return uri + separator + key + "=" + value;
    }
  }

  export function removeQueryStringParameter(url, parameter) {
    //prefer to use l.search if you have a location/link object
    let urlparts = url.split('?');
    if (urlparts.length >= 2) {
      let prefix = encodeURIComponent(parameter) + '=';
      let pars = urlparts[1].split(/[&;]/g);
      //reverse iteration as may be destructive
      for (let i = pars.length; i-- > 0;) {
        //idiom for string.startsWith
        if (pars[i].lastIndexOf(prefix, 0) !== -1) {
          pars.splice(i, 1);
        }
      }
      url = urlparts[0] + '?' + pars.join('&');
      return url;
    } else {
      return url;
    }
  }
}


(($) => {
  class T3PageLoad {
    element: any;
    settings: ITrickyInfiniteScrollSettings;
    isRequestOn: boolean = false;
    itemsWrapper: any;
    paginationWrapper: any;
    currentLink: string = null;
    bothNextAndPreviousAvailableOnLoad: boolean = false;
    links = {
      next: 'next',
      previous: 'previous'
    }
    hasAllPagesLoaded: boolean = false;

    static defaultSettings: ITrickyInfiniteScrollSettings = {
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
        onAllPagesLoaded: () => { },
        onPageLoad: (inst) => { },
        beforePageLoad: () => { }
      }
    }

    constructor(elem: any, userSettings: ITrickyInfiniteScrollSettings) {
      this.element = elem;
      this.settings = $.extend(T3PageLoad.defaultSettings, userSettings);
      this.itemsWrapper = $(this.settings.selectors.itemsWrapper);
      this.paginationWrapper = $(this.settings.selectors.paginationWrapper);
      this.bothNextAndPreviousAvailableOnLoad = $(this.settings.selectors.nextPageLink, this.paginationWrapper).length && $(this.settings.selectors.previousPageLink, this.paginationWrapper).length;
    }

    getPage(link: string, callBack: Function) {
      if (!this.isRequestOn) {
        $.ajax({
          url: link,
          type: 'get',
          beforeSend: () => {
            this.isRequestOn = true;
            typeof (this.settings.callBacks.beforePageLoad) === 'function' && this.settings.callBacks.beforePageLoad();
          },
          success: (data) => {
            callBack(data);
          }
        });
      }
    }
  }

  class T3ManualPageLoad extends T3PageLoad {
    linkedClicked: string;
    constructor(elem: any, userSettings: ITrickyInfiniteScrollSettings) {
      super(elem, userSettings);
    }

    init() {
      this._bindEvents();
    }

    _bindEvents() {
      let self = this;
      this.paginationWrapper.on("click", this.settings.selectors.nextPageLink, function(e) {
        e.preventDefault();
        self.linkedClicked = self.links.next;
        self.currentLink = $(this).attr('href');
        self.getPage(self.currentLink, (data) => {
          self._pageLoadedSuccess(data)
        });
      });

      this.paginationWrapper.on("click", this.settings.selectors.previousPageLink, function(e) {
        e.preventDefault();
        self.linkedClicked = self.links.previous;
        self.currentLink = $(this).attr('href');
        self.getPage(self.currentLink, (data) => {
          self._pageLoadedSuccess(data)
        });
      });
    }

    _updateNextAndPreviousLinks(htmlResponse) {
      let newNextPageLink = htmlResponse.find(this.settings.selectors.nextPageLink);
      let newPreviousPageLink = htmlResponse.find(this.settings.selectors.previousPageLink);


      let existingNextPageLink = $(this.settings.selectors.nextPageLink, this.paginationWrapper);
      let existingPreviousPageLink = $(this.settings.selectors.previousPageLink, this.paginationWrapper);

      let needToUpdateNextLink = true;
      let needToUpdatePreviousLink = true;
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
        } else {
          existingNextPageLink.remove();
        }
      } else {
        //not present, means that we were on the final page and thus next links should not be shown...
      }

      if (needToUpdatePreviousLink) {
        if (newPreviousPageLink.length) {
          existingPreviousPageLink.replaceWith(newPreviousPageLink);
        } else {
          existingPreviousPageLink.remove();
        }
      } else {
        //not present, means that we were on the first page and thus previous links should not be shown...
      }

      this.hasAllPagesLoaded = !$(this.settings.selectors.nextPageLink, this.paginationWrapper).length && !$(this.settings.selectors.previousPageLink, this.paginationWrapper).length;
    }

    _pageLoadedSuccess(data) {
      let htmlResponse = $(data);
      let items = htmlResponse.find(this.settings.selectors.item);
      this._updateNextAndPreviousLinks(htmlResponse);
      this.settings.waitForImagesToBeLoaded ? t3PageLoadHelpers.loadImages(items, (items) => { this._processingComplete(items); }) : this._processingComplete(items);
    }

    _processingComplete(items) {
      this.itemsWrapper.append($('<div/>').append(items).html());
      if (this.settings.enablePageState) {
        let url = this.currentLink;
        let pageNumber = t3PageLoadHelpers.getQueryStringByKey(this.settings.pageQueryStringKey, url);
        t3PageLoadHelpers.savePageState({ key: this.settings.pageQueryStringKey, value: pageNumber });
      }

      typeof (this.settings.callBacks.onPageLoad) === "function" && this.settings.callBacks.onPageLoad(items);

      if (this.hasAllPagesLoaded) {
        typeof (this.settings.callBacks.onAllPagesLoaded) === "function" && this.settings.callBacks.onAllPagesLoaded();
      }
      this.isRequestOn = false;
    }
  }

  class T3InfiniteScrollPageLoad extends T3PageLoad {
    static scrollEventHandlerFuncName: string = '_scrollEventHandler';
    static SCROLL_THROTTLE_DEFAULT_DELAY: number = 500;

    scrollTimer: number = 0;
    resizeTimer: number = 0;
    scrollableElement: any;
    linkedLoaded: string = null;
    nextPageLink: any = null;
    previousPageLink: any = null;

    constructor(elem: any, userSettings: ITrickyInfiniteScrollSettings) {
      super(elem, userSettings);
      this.scrollableElement = this.settings.selectors.scrollableElem ? $(this.settings.selectors.scrollableElem) : $(window);
    }

    init() {
      this._loadLinks();
      this.scrollableElement.on("scroll", (e) => {
        T3InfiniteScrollPageLoad.throttle((e) => {
          if (!this.isRequestOn) {
            this._scrollEventHandler();
          }
        }, this.settings.throttleDelay)();
      });
    }

    _loadLinks() {
      this.nextPageLink = $(this.settings.selectors.nextPageLink, this.paginationWrapper);
      this.previousPageLink = $(this.settings.selectors.previousPageLink, this.paginationWrapper);
    }

    _scrollEventHandler() {
      requestAnimationFrame(() => {
        this._trickyInfiniteScroll();
      });
    }

    _trickyInfiniteScroll() {
      let docViewTop = $(this.scrollableElement).scrollTop();
      let docViewBottom = docViewTop + $(this.scrollableElement).height();
      let lastVisibleElement = $(`${this.settings.selectors.item}:visible:last`, this.element);
      let elemTop = lastVisibleElement.length ? lastVisibleElement.offset().top : $(`${this.settings.selectors.item}:last`, this.element).offset().top;
      let elemBottom = elemTop + $(`${this.settings.selectors.item}:visible:last`, this.element).height();

      //we load next or previous pages when the last visible item is in viewport...
      if ((elemBottom <= docViewBottom) && this.nextPageLink) {
        let link = this.nextPageLink.attr('href');
        this.getPage(link, (data) => {
          this._pageLoadedSuccess(data);
        });
      } else {
        this.isRequestOn = false;
        if (!this.nextPageLink) {
          $(this.settings.selectors.nextPageLink, this.paginationWrapper).remove();
          if (!this.hasAllPagesLoaded) {
            this.hasAllPagesLoaded = true;
            typeof (this.settings.callBacks.onAllPagesLoaded) === "function" && this.settings.callBacks.onAllPagesLoaded();
          }
        }
      }
    }

    _updateNextAndPreviousLinks(htmlResponse) {
      let newNextPageLink = htmlResponse.find(this.settings.selectors.nextPageLink);
      let newPreviousPageLink = htmlResponse.find(this.settings.selectors.previousPageLink);

      if (newNextPageLink.length) {
        this.nextPageLink = newNextPageLink;
      } else {
        this.nextPageLink = null;
      }
    }

    _pageLoadedSuccess(data) {
      let htmlResponse = $(data);
      let items = htmlResponse.find(this.settings.selectors.item);
      this._updateNextAndPreviousLinks(htmlResponse);
      this.settings.waitForImagesToBeLoaded ? t3PageLoadHelpers.loadImages(items, (items) => { this._processingComplete(items); }) : this._processingComplete(items);
    }

    _processingComplete(items) {
      this.itemsWrapper.append($('<div/>').append(items).html());
      typeof (this.settings.callBacks.onPageLoad) === "function" && this.settings.callBacks.onPageLoad(items);
      this.isRequestOn = false;
    }


    _unbindScrollingEvent() {
      //this.scrollableElement.unbind(`scroll.${T3InfiniteScrollPageLoad.scrollFuncName}`, this[T3InfiniteScrollPageLoad.scrollFuncName]);
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
        setTimeout(call, delay || T3InfiniteScrollPageLoad.SCROLL_THROTTLE_DEFAULT_DELAY);
      }
    }
  }

  $.fn.t3PageLoad = function(options) {
    let inst = null;
    inst = options.manualLoading ? new T3ManualPageLoad($(this), options) : new T3InfiniteScrollPageLoad($(this), options);
    inst.init();
    return inst;
  }

})(jQuery);
