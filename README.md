Tricky3 Infinite Scroll
=========


Tricky3 infinite scroll plugin is a plugin that will automatically load next pages in ajax and append other elements on the current page. This plugin has been developed mainly to use in shopify stores especially on collection pages but it can be used in any other websites. [1]:


Version
----

1.0


Basic setups in shopify stores
--------------

In theme.liquid, add the codes below
```
{% if template contains 'collection' %}
    {{ "tricky3.infinitescroll.js" | shopify_asset_url | script_tag }}
    <script type="text/javascript">
	$(function(){
		$('.collection-matrix').TrickyInfiniteScroll();
	});
    </script>
{% endif %}
```


Collection.liquid
```
{% paginate collection.products by 20 %}
<ul class="collection-matrix">
 {% for product in collection.products %}
 <li id="product-{{ forloop.index | plus:paginate.current_offset }}">
  {% include 'product' with product %}
 </li> 
 {% endfor %}
 <li class="top"><a href="#collectionpage">Back to Top</a> &uarr;</li>        
 {% if paginate.next %}
  <li class="more">&darr; <a id="NextPage" href="{{ paginate.next.url }}">More</a></li>        
 {% endif %}
</ul>
<div id="product-list-foot"></div>
{% endpaginate %}
```

Advanced set ups in shopify stores
--------------

In theme.liquid, add the codes below, there are options that can be passed to the infinite scroll plugin.
Options are as follows:</br>
Selector:{
</br>
ParentProductWrapper: 'PARENTSELECTOR',//This is the main wrapper</br>
Product:'ChildSelector',//This are the child elements</br>
NextPageLink:'NextPageLinkSelector',//The next page link, should be unique on the page</br>
},</br>
CallBack:function(){},//this function will be executed after all next pages have been loaded</br>
CallBackOnPageLoad:function(){},//this function will be executed after a next page has been loaded</br>
CallBackBeforePageLOad:function(){},//this function will be executed before the next page is loaded</br>
}
```
{% if template contains 'collection' %}
    {{ "tricky3.infinitescroll.js" | shopify_asset_url | script_tag }}
    <script type="text/javascript">
    $(function(){
        var options = {
            Selectors:{ParentProductWrapper:'PARENTSELECTOR',Product:'ChildSelector',NextPageLink:'NextPageLinkSelector'},
            CallBack:function(){},
            CallBackOnPageLoad:function(){},
            CallBackBeforePageLoad:function(){}
        };
        
		$(PARENTSELECTOR).TrickyInfiniteScroll(options);
	});
    </script>
{% endif %}
```


Collection.liquid
```
{% paginate collection.products by 20 %}
<ul class="PARENTSELECTOR">
 {% for product in collection.products %}
 <li id="product-{{ forloop.index | plus:paginate.current_offset }}">
  {% include 'product' with product %}
 </li> 
 {% endfor %}
 <li class="top"><a href="#collectionpage">Back to Top</a> &uarr;</li>        
 {% if paginate.next %}
  <li class="more">&darr; <a id="NextPageLinkSelector" href="{{ paginate.next.url }}">More</a></li>        
 {% endif %}
</ul>
<div id="product-list-foot"></div>
{% endpaginate %}
```
