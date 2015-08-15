Tricky3 Infinite Scroll
=========

Scroll plugin that automatically loads next pages using ajax and appends elements on the current page. This plugin has been developed mainly to use in Shopify stores especially on Collection templates, but it can be used for Shopify Blogs and also in any other websites. [1]:

Version 1.0

Options
---------

``` javascript
Selector:{
  ParentProductWrapper: 'PARENTSELECTOR', // The main wrapper
  Product:'ChildSelector', // product items
  NextPageLink:'NextPageLinkSelector', // Next page link, should be unique on the page
  PreviousPageLink:'PreviousPageLinkSelector', // Previous page link, should be unique on the page
},
CallBackBeforePageLoad:function(){}, // executed before the next page is loaded
CallBackOnPageLoad:function(){}, // executed after a next page has been loaded
CallBack:function(){}, // executed after all next pages have been loaded
```

``` HTML
{% if template contains 'collection' %}
  {{ 'tricky3.infinitescroll.v1.js' | asset_url | script_tag }}
  <script type="text/javascript">
    $(document).ready(function() {
      var options = {
        Selectors:{
          ParentProductsWrapper:'PARENTSELECTOR',
          Product:'ChildSelector',
          NextPageLink:'NextPageLinkSelector',
          PreviousPageLink:'PreviousPageLinkSelector'
        },
        WaitForImagesToBeLoaded:false, // if true products will be appended after all images have loaded
        EnableHasherModule:true, // adds hash tags on the window location href for URL bookmarks
        CallBack:function(){},
        CallBackOnPageLoad:function(){
          // removing the loading image
          // $('LOADING-IMAGE-CLASS').remove();
        },
        CallBackBeforePageLoad:function(){
          // example showing a loading image
          // $('PARENTSELECTOR').append('<div class="LOADING-IMAGE-CLASS"/>');
        }
      };
      $(PARENTSELECTOR).TrickyInfiniteScroll(options);
    });
  </script>
{% endif %}
```
