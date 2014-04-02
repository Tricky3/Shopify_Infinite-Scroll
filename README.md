Tricky3 Infinite Scroll
=========

Tricky3 infinite scroll plugin is a plugin that will automatically load next pages in ajax and append other elements on the current page. This plugin has been developed mainly to use in shopify stores especially on collection pages but it can be used in any other websites. [1]:

Version 1.0

Options
---------

``` javascript
Selector:{
  ParentProductWrapper: 'PARENTSELECTOR', //This is the main wrapper
  Product:'ChildSelector',//This are the child elements</br>
  NextPageLink:'NextPageLinkSelector',//The next page link, should be unique on the page</br>
  PreviousPageLink:'PreviousPageLinkSelector',//The next page link, should be unique on the page</br>
},
CallBack:function(){}, //this function will be executed after all next pages have been loaded</br>
CallBackOnPageLoad:function(){}, //this function will be executed after a next page has been loaded</br>
CallBackBeforePageLOad:function(){}, //this function will be executed before the next page is loaded</br>

```
``` HTML
{% if template contains 'collection' %}
  {{ 'tricky3.infinitescroll.js' | asset_url | script_tag }}
  <script type="text/javascript">
    $(document).ready(function() {
      var options = {
        Selectors:{ParentProductsWrapper:'PARENTSELECTOR',Product:'ChildSelector',NextPageLink:'NextPageLinkSelector',PreviousPageLink:'PreviousPageLinkSelector'},
		WaitForImagesToBeLoaded:false//by default this is false, if set to true, other products will be appended after all images have been loaded..
        CallBack:function(){},
        CallBackOnPageLoad:function(){
			//example showing a loading image when the other page is being loaded...
			$('PARENTSELECTOR').append('<div class="LOADING-IMAGE-CLASS"/>');
		},
        CallBackBeforePageLoad:function(){
			//removing the loading image...
			$('PARENTSELECTOR LOADING-IMAGE-CLASS').remove();
		}
      };
      $(PARENTSELECTOR).TrickyInfiniteScroll(options);
    });
  </script>
{% endif %}
```