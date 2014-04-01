(function($){
	$.fn.TrickyInfiniteScroll = function(options){
		var opts = {
			Selectors:{ParentProductsWrapper:'.collection-matrix', Product:'li', NextPageLink:'#NextPaginationLink a', PreviousPageLink:'#PreviousPaginationLink a'},
			PageQueryStringKey:'page',
			EnableImageLazyLoad:false,
			CallBack:function(){},
			CallBackOnPageLoad:function(){},
			CallBackBeforePageLoad:function(){}
		};
		
		opts = $.extend(opts, options);
		
		var _parentProductWrapper = this;
		var _isRequestOn = false;
		var _nextPageLink = $(opts.Selectors.NextPageLink);
		var _previousPageLink = $(opts.Selectors.PreviousPageLink);
		var _initialNextPageLink = _nextPageLink;
		var _needToLoadOnlyNextPages = (_previousPageLink.length == 0 && _nextPageLink.length == 1 );
	    var _needToLoadOnlyPreviousPages = (_previousPageLink.length == 1 && _nextPageLink.length == 0 );
	    var _needToLoadBothPreviousAndNextPages = (_previousPageLink.length == 1 && _nextPageLink.length == 1 );

        var _urlToLoad = null;
		
		var trickyInfiniteScroll = function(){
			if(_nextPageLink == null && _previousPageLink == null){
			  opts.CallBack();
			  $(window).unbind('scroll.trickyInfiniteScroll');
			  return;
			}
			
			var docViewTop = $(window).scrollTop();
			var docViewBottom = docViewTop + $(window).height();
			var elemTop = $(opts.Selectors.Product+':last', _parentProductWrapper).offset().top;
			var elemBottom = elemTop + $(opts.Selectors.Product+':last', _parentProductWrapper).height();
			if(!_isRequestOn && (elemBottom <= docViewBottom) && (elemTop >= docViewTop)) {
			  loadUrl();
			  opts.CallBackBeforePageLoad();
			  $.get(_urlToLoad, successCallBack);
			  _isRequestOn = true;
			}

		};

		var loadUrl = function(){
			if(_needToLoadOnlyPreviousPages){
				_urlToLoad = _previousPageLink.attr('href');
			}

			if(_needToLoadOnlyNextPages){
				_urlToLoad = _nextPageLink.attr('href');
			}

			if(_needToLoadBothPreviousAndNextPages){
				if(_previousPageLink.length){
					_urlToLoad = _previousPageLink.attr('href');
				}else if(_initialNextPageLink != null){
					_urlToLoad = _initialNextPageLink.attr('href');
					_needToLoadOnlyNextPages = true;
					_needToLoadBothPreviousAndNextPages = false;
				}
			}
		};

		var successCallBack = function(data){
			var products = $(data).find(opts.Selectors.ParentProductsWrapper);
			_nextPageLink = $(data).find(opts.Selectors.NextPageLink);
			_previousPageLink = $(data).find(opts.Selectors.PreviousPageLink);
			//hashUrlAndAddPageAttributes(products);
			
			_parentProductWrapper.append(products.html());
			_isRequestOn = false;
			opts.CallBackOnPageLoad();

			if(_needToLoadOnlyNextPages && _nextPageLink.length == 0){
				_needToLoadOnlyNextPages = false;
				_previousPageLink =  _nextPageLink = null;
			}

			if(_needToLoadOnlyPreviousPages && _previousPageLink.length == 0){
				_needToLoadOnlyPreviousPages = false;
				_nextPageLink =	_previousPageLink = null;
			}
		};

		var hashUrlAndAddPageAttributes = function(){
			var pageNumber = getParameterByName(_urlToLoad, opts.PageQueryStringKey);
			$(opts.Selectors.Product, products).attr('data-pagenumber', pageNumber);

		};
		
		var getParameterByName = function(url, parameterName){
			parameterName = parameterName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			var regex = new RegExp("[\\?&]" + parameterName + "=([^&#]*)"),
				results = regex.exec(url);
			return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
		};
		
		//hooking scroll event to window.
		$(window).bind('scroll.trickyInfiniteScroll', trickyInfiniteScroll);
	};
})(jQuery);
