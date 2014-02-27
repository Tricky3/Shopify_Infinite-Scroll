(function($){
	$.fn.TrickyInfiniteScroll = function(options){
		var opts = {
			Selectors:{ParentProductsWrapper:'.collection-matrix', Product:'li', NextPageLink:'#NextPage'},
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
			_parentProductWrapper.append(products.html());
			if(nextPageLink.length == 1){
			   _nextPageLink.attr('href', nextPageLink.attr('href'));
			}else{
			   _nextPageLink = null;
			}
			
			_isRequestOn = false;
			opts.CallBackOnPageLoad();
		};
		
		//hooking scroll event to window.
		$(window).bind('scroll.trickyInfiniteScroll', trickyInfiniteScroll);
	};
})(jQuery);

//Test codes
jQuery(function($){
	var outOfStockProduct = new OutOfStockProducts();
    outOfStockProduct.Detach($('li[data-available="false"]', $('ul#collection-all')));
	var options = {
		Selectors:{ParentProductsWrapper:'ul#collection-all', Product:'li', NextPageLink:'a#NextPage'},
		CallBackBeforePageLoad:function(){
			$('#scroll-message').addClass('orangeBG').children('span').text('Loading more product');
		},
		CallBackOnPageLoad:function(){
			$("img.lazy", $('ul#collection-all')).each(function(){
			    $(this).removeClass('lazy');
				$(this).attr('src', $(this).attr('data-original'));
			});
			$('#scroll-message').removeClass('orangeBG').children('span').text('Scroll to load more product');
		},
		CallBack:function(){
			$('#scroll-message').addClass('hide');
			outOfStockProduct.AttachAndShow(_CollectionWrapper);
		}
	};
	
	$('ul#collection-all').TrickyInfiniteScroll(options);
});

var callBack = function(){
	//the final callback when all pages have been loaded.
	//further dom modification can be done here...
};

var callBackBeforePageLoad = function(){
	//function which will be executed before the next page is loaded.
	//for examples, you can display Loading Message/Images here..
};

var callBackOnPageLoad = function(){
	//function which will be executed when the next page has loaded...
	//for example, you can hide Loading Messages/Images here...
};

