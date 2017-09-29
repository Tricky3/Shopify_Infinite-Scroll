Tricky3 Infinite Scroll V2
=========
File: tricky3.infinite-scroll.v2.js
Minified file: tricky3.infinite-scroll.v2.min.js
Revised version of the version 1 plugin. It has option to load next or previous pages manually.

Options
---------
``` javascript
selectors: {
    /*Mandatory: the wrapper selector that hold all the items*/
    itemsWrapper: '.main-wrapper',
    
    /*Mandatory: the item selector*/
    item: '.item',
    
    /*Mandatory: the next page selector, ref: snippets/pagination.v2.liquid*/
    nextPageLink: '#paginatie-next', 
    
    /*Mandatory: the next page selector, ref: snippets/pagination.v2.liquid*/
    previousPageLink: '#paginatie-previous', 
    
    /*Not mandatory, by default scroll will be hooked up to window element but if you page have different, you will need to provide a selector on which to listen scroll events, not needed if "manualLoading" is true*/
    scrollableElem: null,
    
    /*Mandatory, the pagination wrapper element, ref: snippets/pagination.v2.liquid*/
    paginationWrapper: '.pagination-wrapper'
  },
  
  /*Not mandatory, default is page and ignored when "manualLoading" option is false*/
  pageQueryStringKey: 'page',
  
  /*Not mandatory, default is false, this option will wait for all images to be loaded before items are added to the page.*/
  waitForImagesToBeLoaded: false,
  
  /*Not mandatory, default is false and will be ignored when "manualLoading" option is false*/
  enablePageState: false,
  
  /*Not mandatory, default is false, this option activates manual loading that is user will have to click next/previous links for items to be loaded dynamically on the page.*/
  manualLoading: false,
  
  //Not mandatory, default is 100 and ignored when "manualLoading" option is true
  throttleDelay: 100,
  
  callBacks: {
    /*this function will be triggered when all pages have been loaded*/
    onAllPagesLoaded: function(){
    },
    
    /*this function will be triggered when a page has loaded*/
    onPageLoad: function(items){
    },
    
    /*this function will be triggered before a page starts to load*/
    beforePageLoad: function(){
    }
  }
```

Example of how to use
---------
``` HTML
{% if template contains 'collection' %}
  {{ 'tricky3.infinite-scroll.v2.min.js' | asset_url | script_tag }}
    <script>
    //Ref: templates/collections.v2.liquid
    $(function(){
        var itemsWrapper = '.products-wrapper';
        //Manual loading example
        var manualLoadingOptions = {
            selectors: {
                    itemsWrapper: itemsWrapper,
                    item: '.product-item',
                    nextPageLink: '#paginatie-next',
                    previousPageLink: '#paginatie-previous',
                    paginationWrapper: '.component-pagination'
                  },
                  pageQueryStringKey: 'page',
                  waitForImagesToBeLoaded: false,
                  enablePageState: true,
                  manualLoading: true,
                  callBacks: {
                    onAllPagesLoaded: function(){
                      $('.component-pagination').css("display", "none");
                      //console.log('All pages loaded callback called...');
                    },
                    onPageLoad: function(items){
                      //console.log("Page loaded callback called..");
                    },
                    beforePageLoad: function(){
                      //console.log("Before page load callback called..");
                    }
                  }
        };
        $(itemsWrapper).t3PageLoad(manualLoadingOptions);
        //End manual loading example
        
        //Scrolling loading example
        var scrollingLoadingOptions = {
            selectors: {
                    itemsWrapper: itemsWrapper,
                    item: '.product-item',
                    nextPageLink: '#paginatie-next',
                    previousPageLink: '#paginatie-previous',
                    paginationWrapper: '.component-pagination',
                    //scrollableElem: itemsWrapper, YOU CAN SPECIFY THIS
                  },
                  waitForImagesToBeLoaded: false,
                  //throttleDelay: 100, YOU CAN SPECIFY THIS
                  callBacks: {
                    onAllPagesLoaded: function(){
                      $('.component-pagination').css("display", "none");
                      //console.log('All pages loaded callback called...');
                    },
                    onPageLoad: function(items){
                      //console.log("Page loaded callback called..");
                    },
                    beforePageLoad: function(){
                      //console.log("Before page load callback called..");
                    }
                  }
        };
        $(itemsWrapper).t3PageLoad(scrollingLoadingOptions);
        //End scrolling loading example
    });
    </script>
{% endif %}
```

=========
=========
=========
=========

Tricky3 Infinite Scroll V1
=========

Scroll plugin that loads next pages and appends elements to the current page. This plugin has been developed mainly to use in Shopify themes, especially on Collection templates, but it can be used for Shopify Blogs and also in any other websites.

Options
---------

``` javascript
Selector:{
  ParentProductWrapper: 'PARENTSELECTOR', // The main wrapper, example '.main-wrapper'
  Product: 'ChildSelector', // product items, example '.item'
  NextPageLink: 'NextPageLinkSelector', //example '#NextPaginationLink'
  PreviousPageLink: 'PreviousPageLinkSelector', // example '#PreviousPaginationLink'
},
CallBackBeforePageLoad:function(){}, // executed before the next page is loaded
CallBackOnPageLoad:function(){}, // executed after a next page has been loaded
CallBack:function(){}, // executed after all next pages have been loaded
```

Example of how to use
---------
``` HTML
{% if template contains 'collection' %}
  {{ 'tricky3.infinite-scroll.min.js' | asset_url | script_tag }}
  <script type="text/javascript">
    $(function() {
      var parentWrapper = '.main-wrapper';
      var options = {
        Selectors:{
          ParentProductsWrapper: parentWrapper,
          Product:'ChildSelector',
          NextPageLink:'#NextPaginationLink',
          PreviousPageLink:'#PreviousPaginationLink'
        },
        WaitForImagesToBeLoaded:false, // if true products will be appended after all images have loaded
        EnableHasherModule:true, // adds hash tags on the window location href for URL bookmarks
        CallBackBeforePageLoad:function(){
          // example showing a loading image
          // $(parentWrapper).append('<div class="LOADING-IMAGE-CLASS"/>');
        },
        CallBackOnPageLoad:function(){
          // removing the loading image
          // $(parentWrapper+' .LOADING-IMAGE-CLASS').remove();
        },
        CallBack:function(){}
      };
      $(parentWrapper).TrickyInfiniteScroll(options);
    });
  </script>
{% endif %}
```