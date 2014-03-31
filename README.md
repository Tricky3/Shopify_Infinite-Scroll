Tricky3 Infinite Scroll
=========

Tricky3 infinite scroll plugin is a plugin that will automatically load next pages in ajax and append other elements on the current page. This plugin has been developed mainly to use in shopify stores especially on collection pages but it can be used in any other websites. [1]:

Version 1.0

Setup Options
--------

``` HTML
{% if template contains 'collection' %}
  {{ 'tricky3.infinitescroll.js' | asset_url | script_tag }}
  <script type="text/javascript">
    $(document).ready(function() {
      var options = {
        Selectors:{
          ParentProductWrapper:'PARENTSELECTOR', // The main wrapper e.g. <ul>
          Product:'ChildSelector',               // Child elements e.g. <li>
          NextPageLink:'NextPageLinkSelector'    // Pagination next page link (should be unique)
        },
        CallBackBeforePageLoad:function(){} // executed before next page is loaded
        CallBackOnPageLoad:function(){},    // executed after next page has loaded
        CallBack:function(){},              // executed after all pages loaded
      };
      $(PARENTSELECTOR).TrickyInfiniteScroll(options);
    });
  </script>
{% endif %}
```