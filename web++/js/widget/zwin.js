define(function(module){
    //zwin.js v0.11 窗口类

    module.exports = function(){
        
        var
        MIN_WIDTH = 160,
        MIN_HEIGHT = 26,
        DEFAULT = {
            title: 'title',
            src: '',
            content: '',
            left: 10,
            top: 10,
            width: 800,
            height: 400,
            resizable: true, //是否可改变大小
            minimizeable: true, //是否可最小化
            dragable: true, //是否可改拖动
            container: null, //窗口的父容器
            onClose: null, //关闭回调
            onMaximize: null, //最大化回调
            onMinimize: null, //最小化回调
            onFocus: null, //窗口获得焦点回调
            onOpen: null, //窗口打开回调
            end: null
        },
        zIndex = 9999,
        activeWin, //活动的窗口
        end;
        
        var hasstyle;
        
        var zwin = Z.Class({
            
            init: function(option){
                
                if(!hasstyle){
                    hasstyle = 1;
                    this._loadstyle();
                }
                
                var 
                that = this, 
                attrs = {},
                rootElem,
                titlebarElem,
                btnElem,
                end;
                
                option = option || {};
                
                Z.forEach(DEFAULT, function(val, key){
                    attrs[key] = key in option ? option[key] : val;
                });
                
                that.attr = function(key, val){
                    if(val === undefined){
                        return attrs[key];
                    }
                    attrs[key] = val;
                };
                
                setHtml();
                setEvent();
                setResize();
                setDrag();
                
                that.title(that.attr('title'));
                that.size(that.attr('width'), that.attr('height'));
                that.position(that.attr('left'), that.attr('top'));
                
                if(that.attr('src')){
                    that.content('');
                }
                
                that.content(that.attr('src') ? '<iframe src="'+that.attr('src')+'" frameborder=0></iframe>' : that.attr('content'));
                
                that.attr('onOpen') && that.attr('onOpen').call(that);
                that.show();
                
                function setHtml(){
                    
                    that.rootElem = rootElem = Z.E(Z.rstr(
                        '<div class=zwin>\
                            <div class=titlebar>\
                                <h4>{title}</h4>\
                                <ul>\
                                    <li class=closeBox></li>\
                                    {minimizebox}\
                                </ul>\
                            </div>\
                            <div class=contentbox>\
                                <div class=content></div>\
                                <div class=masklayer></div>\
                            </div>\
                        </div>',
                        {
                            title: that.attr('title'),
                            minimizebox: that.attr('minimizeable') ? '<li class=minimizeBox></li>':''
                        }
                    ));
                    
                    titlebarElem = rootElem.find('.titlebar');
                    btnElem = rootElem.find('ul');
                    that.titlebarElem = titlebarElem;
                    that.titleElem = titlebarElem.find('h4');
                    that.contentElem = rootElem.find('.content');
                    
                    Z(that.attr('container') || document.body).append(rootElem);
                    
                }
                
                function setEvent(){
                    
                    var isMaximize = false;
                    
                    rootElem.on('mousedown', function(){
                        that.focus();
                    });
                    
                    titlebarElem.on('mousedown', function(){
                        that.focus();
                    }).on('dblclick', function(){
                        
                        if(!that.attr('resizable')){
                            return;
                        }
                        
                        if(isMaximize){
                            isMaximize = false;
                            that.normal();
                        }else{
                            isMaximize = true;
                            that.maximize();
                        }
                        
                    });
                    
                    btnElem.on('mousedown', function(e){
                        that.focus(); 
                        e.stopPropagation();
                    }).click(function(e){
                        
                        var fn = ({
                            closeBox: that.close,
                            maximizeBox: that.maximize,
                            minimizeBox: that.hide,
                            normalBox: that.normal
                        })[e.target.className];
                        
                        fn && fn.call(that);
                        
                    });
                    
                }
                
                function setResize(){
                    
                    if(!that.attr('resizable')){
                        return;
                    }
                    
                    var 
                    rElem,
                    minWidth = MIN_WIDTH,
                    minHeight = MIN_HEIGHT,
                    clientX,
                    clientY,
                    direction,
                    resize,
                    
                    top0,
                    left0,
                    width0,
                    height0,
            
                    e;
                    
                    rootElem.append(rElem = Z.E(
                        '<ul class="resizebox">\
                            <li class="n"></li>\
                            <li class="w"></li>\
                            <li class="e"></li>\
                            <li class="s"></li>\
                            <li class="nw"></li>\
                            <li class="ne"></li>\
                            <li class="sw"></li>\
                            <li class="se"></li>\
                        </ul>'
                    ));
                    
                    btnElem.append([
                        '<li class="maximizeBox"></li>',
                        '<li class="normalBox"></li>'
                    ], 1);
                    
                    rElem.on('mousedown', function(evt){
                        
                        evt.preventDefault(); //chrome下禁止文本选择
                        that.focus();
                        
                        clientX = evt.clientX;
                        clientY = evt.clientY;
                        direction = evt.target.className;
                        
                        top0 = rootElem.top();
                        left0 = rootElem.left();
                        width0 = rootElem.width();
                        height0 = rootElem.height();
                        
                        rootElem.cls('+draging');
                        Z(document).on('mousemove', resizing);
                        Z(document).on('mouseup', unresize);
                        
                    });
                    
                    resize = {
                        n: function(e){
                            var 
                            top = top0 + e.clientY - clientY,
                            height = height0 - (e.clientY - clientY);
                            if(top < 0){
                                height += top;
                                top = 0;
                            }else if(height < minHeight){
                                top += height - minHeight;
                                height = minHeight;
                            }
                            rootElem.top(top);
                            rootElem.height(height);
                        },
                        w: function(e){
                            var 
                            left = left0 + e.clientX - clientX,
                            width = width0 - (e.clientX - clientX);
                            if(width < minWidth){
                                left += width - minWidth;
                                width = minWidth;
                            }
                            rootElem.left(left);
                            rootElem.width(width);
                        },
                        e: function(e){
                            var width = width0 + (e.clientX - clientX);
                            if(width < minWidth){
                                width = minWidth;
                            }
                            rootElem.width(width);
                        },
                        s: function(e){
                            var height = height0 + (e.clientY - clientY);
                            if(height < minHeight){
                                height = minHeight;
                            }
                            rootElem.height(height);
                        },
                        nw: function(e){this.n(e); this.w(e);},
                        ne: function(e){this.n(e); this.e(e);},
                        sw: function(e){this.s(e); this.w(e);},
                        se: function(e){this.s(e); this.e(e);}
                    };
                    
                    function resizing(evt){
                        
                        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                        resize[direction](evt);
                    }
                    
                    function unresize(){
                        rootElem.cls('-draging');
                        Z(document).un('mousemove', resizing);
                        Z(document).un('mouseup', unresize);
                    }
                    
                }
                
                function setDrag(){
                    
                    if(!that.attr('dragable')){
                        return;
                    }
                    
                    var
                    docHeight;
                    that.drag = rootElem.drag({
                        hand: titlebarElem.e,
                        //range: 0,
                        before: function(){
                            docHeight = window.innerHeight || document.documentElement.clientHeight;
                            rootElem.cls('+draging');
                        },
                        runing: function(){
                            var
                            offsetTop = rootElem.offsetTop(),
                            top;
                            
                            if(offsetTop < 0 || offsetTop > docHeight - 26){
                                top = rootElem.top() - offsetTop;
                                if(offsetTop > 0){ //超出界面底部
                                    top += docHeight - 26;
                                }
                                rootElem.top(top);
                            }
                        },
                        after: function(){
                           rootElem.cls('-draging');
                        }
                    });
                    
                }
            },
            
            isFocus: function(){
                return this == activeWin;
            },
            
            unFoucs: function(){
                if(this.isFocus()){
                    activeWin.rootElem.cls('-active');
                    activeWin = null;
                }
            },
            
            focus: function(){
                
                var that = this;
                if(!that.isFocus()){
                    
                    if(activeWin){
                        activeWin.unFoucs();
                    }
                    
                    activeWin = that;
                    
                    that.rootElem.css('zIndex', ++zIndex).cls('+active');
                    that.attr('onFocus') && that.attr('onFocus').call(that);
                    
                }
                
                if(!that.visible){
                    that.visible = true;
                    that.rootElem.show();
                }
                
            },
            
            show: function(){
                var that = this;
                if(!that.visible){
                    that.visible = true;
                    that.rootElem.show();
                }
                that.focus();
            },
            
            hide: function(){
                var that = this;
                if(that.visible){
                    that.visible = false;
                    that.rootElem.hide();
                    that.attr('onMinimize') && that.attr('onMinimize').call(that);
                }
            },
            
            close: function(){
                var that = this;
                that.unFoucs();
                that.attr('onClose') && that.attr('onClose').call(that);
                that.rootElem.remove();
            },
            
            toggle: function(){
                var that = this;
                that.visible ? that.hide() : that.show();
            },
            
            normal: function(){
                var that = this;
                that.rootElem.cls('-maximized');
                that.drag && that.drag.unlock();
            },
            
            maximize: function(){
                
                var that = this;
                
                if(!that.attr('resizable')){
                    return;
                }
                
                that.rootElem.cls('+maximized');
                that.drag && that.drag.lock();
                that.attr('onMaximize') && that.attr('onMaximize').call(that);
                that.show();
            },
            
            size: function(width, height){
                var rootElem = this.rootElem;
                rootElem.width( width > 0 ? Math.max(width, MIN_WIDTH) : width );
                rootElem.height( height > 0 ? Math.max(height, MIN_HEIGHT) : height );
            },
            
            title: function(text){
                var that = this;
                if(text){
                    that.attr('title', text);
                    that.titleElem.html(text);
                }else{
                    return that.attr('title');
                }
            },
            
            content: function(html){
                var that = this;
                if(typeof html != 'undefined'){
                    that.attr('content', html);
                    if(typeof html == 'object' && html.nodeType == 1){
                        that.contentElem.html('').append(html);
                    }else{
                        that.contentElem.html(html);
                    }
                }else{
                    return that.attr('content');
                }
            },
            
            position: function(x, y){
                var that = this;
                if(x || x === 0){
                    that.left(x);
                }
                if(y || y === 0){
                    that.top(y);
                }
            },
            
            left: function(x){
                this.rootElem.left(x);
            },
            
            top: function(y){
                this.rootElem.top(y);
            },
            
            _loadstyle: function(){
                Z.style(Z.rstr("\
                    .zwin{display:none; overflow:hidden; position:absolute; left:20%; top:10%; background:#fff; border:1px solid #ccc; border-radius:5px 5px 0 0; min-width:160px}\
    \
    .zwin .titlebar{height:25px; padding-right:80px; background:url({%0}/sprite_repeat_x_png.png) repeat-x 0 -30px; border-bottom:1px solid #ccc; border-radius:5px 5px 0 0}\
    .zwin .titlebar h4{float:left; margin:0; padding-left:.5em; line-height:25px; color:#333; font-weight:bold}\
    .zwin .titlebar ul{position:absolute; top:0; right:0; margin:0; padding:4px 5px 0 0}\
    .zwin .titlebar li{float:right; margin-left:4px; width:21px; height:19px; background:url({%0}/sprite_main_png.png) no-repeat; cursor:pointer; list-style: none}\
    .zwin .titlebar .minimizeBox{background-position:-5px -58px}\
    .zwin .titlebar .minimizeBox:hover{background-position:-5px -30px}\
    .zwin .titlebar .maximizeBox{background-position:-34px -59px}\
    .zwin .titlebar .maximizeBox:hover{background-position:-34px -30px}\
    .zwin .titlebar .closeBox{background-position:-64px -59px}\
    .zwin .titlebar .closeBox:hover{background-position:-64px -30px}\
    .zwin .titlebar .normalBox{background-position:-94px -59px}\
    .zwin .titlebar .normalBox:hover{background-position:-94px -30px}\
    \
    .zwin .contentbox{position:absolute; top:26px; bottom:0; width:100%}\
    .zwin .content{position:absolute; width:100%; top:0; bottom:0}\
    .zwin iframe{position:absolute; width:100%; height:100%; left:0; top:0; border:0;}\
    .zwin .masklayer{width:100%; height:100%; position:absolute; left:0; top:0; opacity:0; z-index:2;background:#ccc}\
    \
    \
    .zwin.active .masklayer{display:none}\
    .zwin.draging .masklayer{display:block}\
    .zwin.maximized{left:0!important; top:0!important; bottom:0; right:0; width:auto!important; height:auto!important; z-index:99999!important}\
    .zwin .normalBox{display:none}\
    .zwin.maximized .normalBox{display:block}\
    .zwin.maximized .maximizeBox{display:none}\
    .zwin.maximized .resizebox{display:none}\
    \
    \
    .zwin .resizebox{margin:0; padding:0}\
    .zwin .resizebox.disable{display:none}\
    .zwin .resizebox li{position:absolute;z-index:3;width:3px;height:3px;overflow:hidden;}\
    .zwin .resizebox .n{cursor:n-resize;width:100%;left:0;top:0}\
    .zwin .resizebox .w{cursor:w-resize;height:100%;left:0;top:0}\
    .zwin .resizebox .e{cursor:e-resize;height:100%;right:0;top:0}\
    .zwin .resizebox .s{cursor:s-resize;width:100%;left:0;bottom:0}\
    .zwin .resizebox .nw,\
    .zwin .resizebox .ne,\
    .zwin .resizebox .sw,\
    .zwin .resizebox .se{width:4px;height:4px}\
    .zwin .resizebox .nw{cursor:nw-resize;top:0;left:0}\
    .zwin .resizebox .ne{cursor:ne-resize;top:0;right:0}\
    .zwin .resizebox .sw{cursor:sw-resize;left:0;bottom:0}\
    .zwin .resizebox .se{cursor:se-resize;right:0;bottom:0}\
    \
    \
    .zwin .titlebar{*zoom:1}\
    .zwin .titlebar ul{*width:76px; _width:82px}\
    .zwin .resizebox li{background:#eee; opacity:0; filter:alpha(opacity=0);}\
    .zwin .contentbox{*height:100%}\
    .zwin .content{*height:100%}\
    .zwin .masklayer{filter:alpha(opacity=0); *zoom:1}\
    .zwin.maximized{_height:100%!important}\
                ", zwin.imgpath));
            },
            
            end: 0
        }, {
            imgpath: '/dist/zwin.imgs/'
        });
        
        return zwin;
        
    }();

})