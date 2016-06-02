/*
目录树组件
#imports
    Z
#exports
    ztree(option)  创建目录树
*/

!function(){
    
this.ztree = ztree;

function ztree(option){
    return new zTree(option);
}

ztree.imgpath = '/dist/ztree.imgs/';

var firstrun = 1;

var zTree = Z.Class({
    
    init: function(option){
        
        if(firstrun){
            firstrun = 0;
            loadstyle();
        }
        
        Z.mix(this, {
            _box: Z(option.box),
            _data: option.data,
            _click: option.click
        });
        
        this._render();
        this._setevent();
        
    },
    
    _render: function(){
        
        this._box.html('<ul class="ztree last">'+ renderItems(this._data) +'</ul>');
        
        function renderItems(items){
            
            var html = [];
            
            Z.forEach(items, function(item, i){
                if(item.items){
					
                    if(i == items.length - 1){//最后一个节点
						var cls1 = 'plus2';
						var cls2 = 'last';
					}else{
						var cls1 = 'plus3';
						var cls2 = '';
					}
                    
                    html.push(Z.rstr(function(){/*
                        <li>
                            <h4 open=0><i class={cls1}></i><i class=folder></i><span class=t_text>{text}</span></h4>
                            <ul class={cls2}>{subitems}</ul>
                        </li>
                    */}, {
                        cls1: cls1,
                        cls2: cls2,
                        text: item.text,
                        subitems: renderItems(item.items)
                    }));
                    
				}else{//顶层叶子	
                
					if(i == items.length - 1){//最后一个节点
						var cls1 = 'elbow2';
					}else{
						var cls1 = 'elbow3';
					}
                    
					if(item.href){
						var button = '<a class=p_text href='+ item.href +'>'+ item.text +'</a>';
					}else{
						var button = '<span class=p_text>'+ item.text +'</span>';
					}
                    
					html.push('<li><i class='+cls1+'></i><i class=page></i>'+ button +'</li>');
                    
				}
                
            });
            
			return html.join('');
        }
        
    },
    
    _setevent: function(){
        var that = this;
        this._box.click(function(e){
            
            var target = Z(e.target);
            if(target.parent('h4')){
                var button = target.parent('h4');
                if(+button.attr('open')){
                    button.attr('open', 0).next().hide();
                    button.find('i').cls('plus2','minus2').cls('plus3','minus3').cls('folder','folder2');	
                }else{
                    button.attr('open',1).next().show();
                    button.find('i').cls('minus2','plus2').cls('minus3','plus3').cls('folder2','folder');
                }	
            }else if(target.cls('p_text')){
                that._click && that._click(e);
            }
            
        });
    }
    
});

function loadstyle(){
    Z.style(Z.rstr(function(){/*
    .ztree{line-height:18px;display:block}
    .ztree ul{padding:0;margin:0;font-size:14px;list-style:none;padding-left:18px;display:none;background:url({%0}line.gif) repeat-y 0 0;}
    .ztree li{list-style:none;}
    .ztree ul.last{background:none;}
    .ztree i{vertical-align:top;_vertical-align:0px;display:inline-block;font-style:normal;width:18px;height:18px;}
    .ztree h4{margin:0;padding:0;font-size:14px;}
    .ztree .p_text{font-weight:normal;cursor:pointer;}
    .ztree .t_text{font-weight:normal;padding-left:3px;cursor:pointer;}
    .ztree .plus1{background:url({%0}plus1.gif) no-repeat 0 0;margin-left:2px;}
    .ztree .minus1{background:url({%0}minus1.gif) no-repeat 0 0;margin-left:2px;}
    .ztree .minus2{background:url({%0}minus2.gif) no-repeat 0 0;}
    .ztree .minus3{background:url({%0}minus3.gif) no-repeat 0 0;}
    .ztree .page{background:url({%0}page.gif) no-repeat 0 0;margin-left:2px;}
    .ztree .elbow2{background:url({%0}elbow2.gif) no-repeat 0 0;}
    .ztree .elbow3{background:url({%0}elbow3.gif) no-repeat 0 0;}
    .ztree .folder{background:url({%0}folder.gif) no-repeat 0 -1px;}
    .ztree .folder2{background:url({%0}folder2.gif) no-repeat 0 -1px;}
    .ztree .plus2{background:url({%0}plus2.gif) no-repeat 0 0;}
    .ztree .plus3{background:url({%0}plus3.gif) no-repeat 0 0;}
    */}, ztree.imgpath));
}

}();