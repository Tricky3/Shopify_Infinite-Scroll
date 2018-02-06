# Tricky3 Infinite Scroll V2


## Options

``` javascript
selectors: {
    // Required
    itemsWrapper: '.main-wrapper', // the wrapper selector that holds all the items
    item: '.item', // the item selector
    paginationWrapper: '.pagination-wrapper', // the pagination wrapper element, ref: snippets/pagination.v2.liquid*/
    nextPageLink: '#paginate-next', // the next page selector, ref: snippets/pagination.v2.liquid    
    previousPageLink: '#paginate-previous', // the previous page selector, ref: snippets/pagination.v2.liquid

    // optional
    scrollableElem: null, // scroll will be attached to window element but you can specify a different viewport (not needed if "manualLoading" is true)
  },
  
  // Optional Config
  manualLoading: false, // activates manual loading vs "infinite scrooooooll"
  waitForImagesToBeLoaded: false,
  enablePageState: false,
  pageQueryStringKey: 'page',
  throttleDelay: 100,
  
  callBacks: {
    
    beforePageLoad: function(){
        // triggered before a page starts to load
    },
    onPageLoad: function(items){
        // triggered when a page has loaded
    },
    onAllPagesLoaded: function(){
        // triggered when all pages have been loaded
    }
    
  }
```

## Usage

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


# Tricky3 Infinite Scroll V1

Scroll plugin that loads next pages and appends elements to the current page. This plugin has been developed mainly to use in Shopify themes, especially on Collection templates, but it can be used for Shopify Blogs and also in any other websites.

## Options

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

## Usage

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
