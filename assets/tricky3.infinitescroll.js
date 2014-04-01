(function($){
	$.fn.TrickyInfiniteScroll = function(options){
		var opts = {
			Selectors:{ParentProductsWrapper:'.collection-matrix', Product:'li', NextPageLink:'#NextPage', PageQueryStringKey:'page'},
			PageQueryStringKey:'page',
			EnableImageLazyLoad:false,
			CallBack:function(){},
			CallBackOnPageLoad:function(){},
			CallBackBeforePageLoad:function(){}
		};
		
		opts = $.extend(opts, options);
		
		var _parentProductWrapper = this;
		var _nextPageLink = $(opts.Selectors.NextPageLink);
		var _isRequestOn = false;
		
		var trickyInfiniteScroll = function(){
			if(_nextPageLink == null){
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
			  $.get(_nextPageLink.attr('href'), successCallBack);
			  _isRequestOn = true;
			}

		};
		
		var successCallBack = function(data){
			var products = $(data).find(opts.Selectors.ParentProductsWrapper);
			var nextPageLink = $(data).find(opts.Selectors.NextPageLink);
			var pageNumber = getParameterByName(_nextPageLink.attr('href'), opts.PageQueryStringKey);
			
			$(opts.Selectors.Product, products).attr('data-pagenumber', pageNumber);
			_parentProductWrapper.append(products.html());
			
			if(nextPageLink.length == 1){
			   _nextPageLink.attr('href', nextPageLink.attr('href'));
			}else{
			   _nextPageLink = null;
			}
			
			_isRequestOn = false;
			opts.CallBackOnPageLoad();
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
