/*
Version v1.0
Author: @Tricky3
*/
;
(function($) {
  $.fn.TrickyInfiniteScroll = function(options) {
    var GLOBALS = {
      ParentProductsWrapper: null,
      IsRequestOn: false,
      NextPageLink: null,
      PreviousPageLink: null,
      InitialNextPageLink: null,
      NeedToLoadOnlyNextPages: false,
      NeedToLoadOnlyPreviousPages: false,
      NeedToLoadBothPreviousAndNextPages: false,
      UrlToLoad: null,
      UpdateHashOnWindowScrollLoaded: false,
      Opts: {
        Selectors: {
          ParentProductsWrapper: '.collection-matrix',
          Product: 'li',
          NextPageLink: '#NextPaginationLink a',
          PreviousPageLink: '#PreviousPaginationLink a'
        },
        PageQueryStringKey: 'page',
        WaitForImagesToBeLoaded: false,
        EnableHasherModule: false,
        CallBack: function() {},
        CallBackOnPageLoad: function() {},
        CallBackBeforePageLoad: function() {}
      }
    };

    GLOBALS.Opts = $.extend(GLOBALS.Opts, options);
    GLOBALS.ParentProductsWrapper = this;
    GLOBALS.NextPageLink = $(GLOBALS.Opts.Selectors.NextPageLink);
    GLOBALS.InitialNextPageLink = GLOBALS.NextPageLink;
    GLOBALS.PreviousPageLink = $(GLOBALS.Opts.Selectors.PreviousPageLink);
    GLOBALS.NeedToLoadOnlyNextPages = GLOBALS.PreviousPageLink.length == 0 && GLOBALS.NextPageLink.length == 1;
    GLOBALS.NeedToLoadOnlyPreviousPages = GLOBALS.PreviousPageLink.length == 1 && GLOBALS.NextPageLink.length == 0;
    GLOBALS.NeedToLoadBothPreviousAndNextPages = GLOBALS.PreviousPageLink.length == 1 && GLOBALS.NextPageLink.length == 1;
    GLOBALS.UpdateHashOnWindowScrollLoaded = false;
    var windowResizeTimer;

    var trickyInfiniteScroll = function() {
      if (GLOBALS.NextPageLink != null && GLOBALS.NextPageLink.length == 1 || GLOBALS.PreviousPageLink != null && GLOBALS.PreviousPageLink.length == 1) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var lastVisibleElement = $(GLOBALS.Opts.Selectors.Product + ':visible:last', GLOBALS.ParentProductsWrapper);
        var elemTop = lastVisibleElement.length ? $(GLOBALS.Opts.Selectors.Product + ':visible:last', GLOBALS.ParentProductsWrapper).offset().top : $(GLOBALS.Opts.Selectors.Product + ':last', GLOBALS.ParentProductsWrapper).offset().top;
        var elemBottom = elemTop + $(GLOBALS.Opts.Selectors.Product + ':visible:last', GLOBALS.ParentProductsWrapper).height();

        if (!GLOBALS.IsRequestOn && (elemBottom <= docViewBottom)) {
          GLOBALS.Opts.CallBackBeforePageLoad();
          Helpers.SetUpUrlToLoad();
          $.get(GLOBALS.UrlToLoad, successCallBack);
          GLOBALS.IsRequestOn = true;
        }
      } else {
        GLOBALS.Opts.CallBack();
        $(window).unbind('scroll.trickyInfiniteScroll');
      }
    };

    var successCallBack = function(data) {
      var products = $(data).find(GLOBALS.Opts.Selectors.ParentProductsWrapper);
      GLOBALS.NextPageLink = $(data).find(GLOBALS.Opts.Selectors.NextPageLink);
      GLOBALS.PreviousPageLink = $(data).find(GLOBALS.Opts.Selectors.PreviousPageLink);

      if (GLOBALS.Opts.WaitForImagesToBeLoaded) {
        var totalImages = $('img', products).length;
        var index = 1;
        var callBackFired = false;
        $('img', products).load(function() {
          index++;
          if (index >= totalImages && GLOBALS.IsRequestOn && !callBackFired) {
            Helpers.FireAllCallBacks(products);
            callBackFired = true;
          }
        }).each(function() {
          if (this.complete)
            $(this).load();
        });
      } else {
        Helpers.FireAllCallBacks(products);
      }

      if (GLOBALS.Opts.EnableHasherModule && !GLOBALS.UpdateHashOnWindowScrollLoaded) {
        GLOBALS.UpdateHashOnWindowScrollLoaded = true;
        TrickyHasher.UpdateHashOnWindowScrollStopped();
      }
    };


    var Helpers = {
      FireAllCallBacks: function(products) {
        if (GLOBALS.Opts.EnableHasherModule) {
          TrickyHasher.HashUrlAndAddPageAttributesToProducts(products);
        }
        GLOBALS.ParentProductsWrapper.append(products.html());
        Helpers.ReloadPageLinksObjectsAndVariables();
        GLOBALS.Opts.CallBackOnPageLoad();
        GLOBALS.IsRequestOn = false;
      },
      AddPageNumberAttributesToExistingProducts: function() {
        var pageNumber = Helpers.GetParameterByName(window.location.href, GLOBALS.Opts.PageQueryStringKey);
        $(GLOBALS.Opts.Selectors.Product, GLOBALS.ParentProductsWrapper).attr('data-pagenumber', pageNumber == '' ? 1 : pageNumber);
      },
      GetParameterByName: function(url, parameterName) {
        parameterName = parameterName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + parameterName + "=([^&#]*)"),
          results = regex.exec(url);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
      },
      ReloadPageLinksObjectsAndVariables: function() {
        if (GLOBALS.NeedToLoadOnlyNextPages && GLOBALS.NextPageLink.length == 0) {
          GLOBALS.NeedToLoadOnlyNextPages = false;
          GLOBALS.PreviousPageLink = GLOBALS.NextPageLink = null;
        }

        if (GLOBALS.NeedToLoadOnlyPreviousPages && GLOBALS.PreviousPageLink.length == 0) {
          GLOBALS.NeedToLoadOnlyPreviousPages = false;
          GLOBALS.NextPageLink = GLOBALS.PreviousPageLink = null;
        }
      },
      SetUpUrlToLoad: function() {
        if (GLOBALS.NeedToLoadOnlyPreviousPages) {
          GLOBALS.UrlToLoad = GLOBALS.PreviousPageLink.attr('href');
        }

        if (GLOBALS.NeedToLoadOnlyNextPages) {
          GLOBALS.UrlToLoad = GLOBALS.NextPageLink.attr('href');
        }

        if (GLOBALS.NeedToLoadBothPreviousAndNextPages) {
          if (GLOBALS.PreviousPageLink.length) {
            GLOBALS.UrlToLoad = GLOBALS.PreviousPageLink.attr('href');
          } else if (GLOBALS.InitialNextPageLink != null) {
            GLOBALS.UrlToLoad = GLOBALS.InitialNextPageLink.attr('href');
            GLOBALS.NeedToLoadOnlyNextPages = true;
            GLOBALS.NeedToLoadBothPreviousAndNextPages = false;
          }
        }
      }
    };

    var TrickyHasher = {
      CheckHashAndReloadPageIfNeeded: function() {
        var hash = window.location.hash;
        if (hash && hash.indexOf(GLOBALS.Opts.PageQueryStringKey) != -1) {
          var pageNumber = hash.split("=")[1];
          var url = window.location.href.replace(hash, '');
          var queryStringKeys = window.location.search;
          if (queryStringKeys == '') {
            window.location.href = url + '?' + GLOBALS.Opts.PageQueryStringKey + '=' + pageNumber;
          } else {
            var queryStringKeysArray = queryStringKeys.replace("?", "").split("&");
            var formattedQueryStringKeys = '';
            for (var i = 0; i < queryStringKeysArray.length; i++) {
              if (queryStringKeysArray[i].indexOf(GLOBALS.Opts.PageQueryStringKey + '=') == -1) {
                formattedQueryStringKeys += queryStringKeysArray[i] + '&';
              }
            }

            var url = window.location.href.replace(window.location.hash, "").replace(window.location.search, "");
            if (formattedQueryStringKeys != '') {
              url = url + '?' + formattedQueryStringKeys + GLOBALS.Opts.PageQueryStringKey + '=' + pageNumber;
            } else {
              url = url + '?' + GLOBALS.Opts.PageQueryStringKey + '=' + pageNumber;
            }

            window.location.href = url;
          }
        }
      },
      HashUrlAndAddPageAttributesToProducts: function(products) {
        var pageNumber = Helpers.GetParameterByName(GLOBALS.UrlToLoad, GLOBALS.Opts.PageQueryStringKey);
        if (pageNumber) {
          $(GLOBALS.Opts.Selectors.Product, products).attr('data-pagenumber', pageNumber);
          window.location.hash = GLOBALS.Opts.PageQueryStringKey + '=' + pageNumber;
        }
      },
      UpdateHashOnWindowScrollStopped: function() {
        $(window).scrollStopped(function() {
          $(GLOBALS.Opts.Selectors.Product, GLOBALS.ParentProductsWrapper).each(function() {
            if ($(this).visible(true)) {
              $(this).addClass('in-viewport');
              $(this).removeClass('not-in-viewport');
            } else {
              $(this).removeClass('in-viewport');
              $(this).addClass('not-in-viewport');
            }
          });
          var firstElementInViewPort = $(GLOBALS.Opts.Selectors.Product + '.in-viewport', GLOBALS.ParentProductsWrapper).first();
          if (firstElementInViewPort.length == 1) {
            window.location.hash = GLOBALS.Opts.PageQueryStringKey + '=' + firstElementInViewPort.attr('data-pagenumber');
          }
        });
      }
    };

    if (GLOBALS.Opts.EnableHasherModule) {
      TrickyHasher.CheckHashAndReloadPageIfNeeded();
    }

    //Add page attributes to existing products..
    Helpers.AddPageNumberAttributesToExistingProducts();

    //hooking scroll event to window.
    $(window).bind('scroll.trickyInfiniteScroll', trickyInfiniteScroll);
    $(window).resize(function() {
      if (windowResizeTimer) {
        clearTimeout(windowResizeTimer);
      }

      windowResizeTimer = setTimeout(function() {
        $(window).unbind('scroll.trickyInfiniteScroll');
        $(window).bind('scroll.trickyInfiniteScroll', trickyInfiniteScroll);
      }, 1000);
    });
  };
})(jQuery);

(function($) {
  $.fn.scrollStopped = function(callback) {
    $(this).scroll(function() {
      var self = this,
        $this = $(self);
      if ($this.data('scrollTimeout')) {
        clearTimeout($this.data('scrollTimeout'));
      }
      $this.data('scrollTimeout', setTimeout(callback, 250, self));
    });
  };
})(jQuery);

/*
 * Copyright 2012, Digital Fusion
 * Licensed under the MIT license.
 * http://teamdf.com/jquery-plugins/license/
 * https://github.com/customd/jquery-visible
 * @author Sam Sehnert
 * @desc A small plugin that checks whether elements are within
 *       the user visible viewport of a web browser.
 *       only accounts for vertical position, not horizontal.
 */
! function(t) {
  var i = t(window);
  t.fn.visible = function(t, e, o) {
    if (!(this.length < 1)) {
      var r = this.length > 1 ? this.eq(0) : this,
        n = r.get(0),
        f = i.width(),
        h = i.height(),
        o = o ? o : "both",
        l = e === !0 ? n.offsetWidth * n.offsetHeight : !0;
      if ("function" == typeof n.getBoundingClientRect) {
        var g = n.getBoundingClientRect(),
          u = g.top >= 0 && g.top < h,
          s = g.bottom > 0 && g.bottom <= h,
          c = g.left >= 0 && g.left < f,
          a = g.right > 0 && g.right <= f,
          v = t ? u || s : u && s,
          b = t ? c || a : c && a;
        if ("both" === o) return l && v && b;
        if ("vertical" === o) return l && v;
        if ("horizontal" === o) return l && b
      } else {
        var d = i.scrollTop(),
          p = d + h,
          w = i.scrollLeft(),
          m = w + f,
          y = r.offset(),
          z = y.top,
          B = z + r.height(),
          C = y.left,
          R = C + r.width(),
          j = t === !0 ? B : z,
          q = t === !0 ? z : B,
          H = t === !0 ? R : C,
          L = t === !0 ? C : R;
        if ("both" === o) return !!l && p >= q && j >= d && m >= L && H >= w;
        if ("vertical" === o) return !!l && p >= q && j >= d;
        if ("horizontal" === o) return !!l && m >= L && H >= w
      }
    }
  }
}(jQuery);