(function($){
	$.fn.TrickyInfiniteScroll = function(options){
		var opts = {
			Selectors:{ParentProductsWrapper:'.collection-matrix', Product:'li', NextPageLink:'#NextPaginationLink a', PreviousPageLink:'#PreviousPaginationLink a'},
			PageQueryStringKey:'page',
			WaitForImagesToBeLoaded:false,
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
			if(_nextPageLink == null && _previousPageLink == null && _nextPageLink.length == 0 && _previousPageLink.length == 0){
			  opts.CallBack();
			  $(window).unbind('scroll.trickyInfiniteScroll');
			  return;
			}
			
			var docViewTop = $(window).scrollTop();
			var docViewBottom = docViewTop + $(window).height();
			var elemTop = $(opts.Selectors.Product+':last', _parentProductWrapper).offset().top;
			var elemBottom = elemTop + $(opts.Selectors.Product+':last', _parentProductWrapper).height();
			if(!_isRequestOn && (elemBottom <= docViewBottom) && (elemTop >= docViewTop)) {
			  opts.CallBackBeforePageLoad();
			  Helpers.SetUpUrlToLoad();
			  $.get(_urlToLoad, successCallBack);
			  _isRequestOn = true;
			}
		};

		var successCallBack = function(data){
			var products = $(data).find(opts.Selectors.ParentProductsWrapper);
			_nextPageLink = $(data).find(opts.Selectors.NextPageLink);
			_previousPageLink = $(data).find(opts.Selectors.PreviousPageLink);

			if(opts.WaitForImagesToBeLoaded){
				var totalImages = $('img', products).length;
				var index = 1;
				$('img', products).load(function() {
				  index++;
				  if(index >= totalImages && _isRequestOn){
				  	_parentProductWrapper.append(products.html());
					Helpers.HashUrlAndAddPageAttributesToProducts();
					Helpers.ReloadPageLinksObjectsAndVariables();
					opts.CallBackOnPageLoad();
					_isRequestOn = false;
				  }
				}).each(function() {
				  if(this.complete) 
				  	$(this).load();
				});
			}else{
				_parentProductWrapper.append(products.html());
				Helpers.HashUrlAndAddPageAttributesToProducts();
				Helpers.ReloadPageLinksObjectsAndVariables();
				opts.CallBackOnPageLoad();
				_isRequestOn = false;
			}
		};

		
		var Helpers = {
			GetParameterByName:function(url, parameterName){
				parameterName = parameterName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
			    var regex = new RegExp("[\\?&]" + parameterName + "=([^&#]*)"),
				results = regex.exec(url);
			    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
			},
			HashUrlAndAddPageAttributesToProducts:function(){
				var pageNumber = Helpers.GetParameterByName(_urlToLoad, opts.PageQueryStringKey);
				if(pageNumber){
					window.location.hash = opts.PageQueryStringKey+'='+pageNumber;
				}
			},
			ReloadPageLinksObjectsAndVariables:function(){
				if(_needToLoadOnlyNextPages && _nextPageLink.length == 0){
					_needToLoadOnlyNextPages = false;
					_previousPageLink =  _nextPageLink = null;
				}

				if(_needToLoadOnlyPreviousPages && _previousPageLink.length == 0){
					_needToLoadOnlyPreviousPages = false;
					_nextPageLink =	_previousPageLink = null;
				}
			},
			SetUpUrlToLoad:function(){
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
			},
			CheckHashAndReloadPageIfNeeded:function(){
				var hash = window.location.hash;
				if(hash && hash.indexOf(opts.PageQueryStringKey) != -1){
					var pageNumber = hash.split("=")[1];
					var url = window.location.href.replace(hash, '');
					var queryStringKeys = window.location.search;
					if(queryStringKeys == ''){
						window.location.href = url+'?'+opts.PageQueryStringKey +'='+pageNumber;
					}else{
						var queryStringKeysArray = queryStringKeys.replace("?","").split("&");
						var formattedQueryStringKeys = '';
						for(var i = 0; i < queryStringKeysArray.length; i++) {
							if(queryStringKeysArray[i].indexOf(opts.PageQueryStringKey+'=') == -1){
								formattedQueryStringKeys += queryStringKeysArray[i] +'&';
							}
						}

						var url =  window.location.href.replace(window.location.hash,"").replace(window.location.search,"");
						if(formattedQueryStringKeys != ''){
							url = url+'?'+formattedQueryStringKeys+opts.PageQueryStringKey+'='+pageNumber;
						}else{
							url = url+'?'+opts.PageQueryStringKey+'='+pageNumber;
						}
						
						window.location.href = url;
					}
				}
			},


		};
		
		//checking hash codes..
		Helpers.CheckHashAndReloadPageIfNeeded();

		//hooking scroll event to window.
		$(window).bind('scroll.trickyInfiniteScroll', trickyInfiniteScroll);
	};
})(jQuery);