Z = function(){

    var
    $browser = function(){
    	
    	var version, ret = {}, ua = navigator.userAgent.toLowerCase();
    	
        (version = ua.match(/msie ([\d.]+)/)) ? ret.ie = version[1] :
        (version = ua.match(/firefox\/([\d.]+)/)) ? ret.firefox = version[1] :
        (version = ua.match(/(?:opera.|opr\/)([\d.]+)/)) ? ret.opera = version[1] :
        (version = ua.match(/chrome\/([\d.]+)/)) ? ret.chrome = version[1] :
        (version = ua.match(/version\/([\d.]+).*safari/)) ? ret.safari = version[1] : 0;
    	
        return ret;
    	
    }(),

    $isie6 = /MSIE\s*6.0/i.test(navigator.appVersion),

    $Class = function(){
        return{
            extend: extend
        };
        function extend(){
            function Class(args){
                if(this instanceof Class){ //已经实例化，调用init
                    if(this.init){ //自动new的情况，所有参数都会存在args.____中，否则取全部参数，注意args中不能传递args.____
                        this.init.apply(this, args && args.____ ? args.____ : arguments);
                    }
                }else{
                    return new Class({
                        ____: arguments
                    });
                }
            }
    
            Class.prototype = function(prop, source){
                empty.prototype = this.prototype;
                var 
                method,
                superMethod,
                superProp = new empty, //通过空函数实现只继承原型
                i;
                for(i in prop){
                    method = prop[i];
                    superMethod = superProp[i];
                    superProp[i] = //需要调用父类的方法，则使用闭包进行包装
                    typeof method == 'function' 
                    && typeof superMethod == 'function'
                    && /\._super\(/.test(method) //函数体包含._super(      
                    ? pack(method, superMethod) : method;
                }
                if(source){
                    for(i in source){
                        Class[i] = source[i];
                    }
                }
                superProp.constructor = Class;
                superProp.superclass = this;
                return superProp;
                
                function empty(){}
                function pack(method, superMethod){
                    return function(){
                        this._super = superMethod;
                        var ret = method.apply(this, arguments);
                        this._super = null;
                        return ret;
                    };
                }
            }.apply(this, arguments);
            
            Class.extend = extend; //实现链式，执行Class.extend()时，this自动指向Class
            return Class;
        }
    }(),

    $eventhook = {},

    $addevent = function(){
    	
        ($addevent = $doc.addEventListener ? function(element, type, fn){
    		
            element.addEventListener(type == 'mousewheel' && $doc.mozHidden !== undefined ? 'DOMMouseScroll' : type, fn, false);
    		
        } : function(element, type, fn){
    		
            element.attachEvent('on' + type, fn); 
    		
        }).apply(null, arguments);
    	
    },

    $guid = 1,

    $win = window,

    $doc = document,

    $de = $doc.documentElement,

    $head = $doc.head || $query('head')[0],

    $p = $zelement.prototype,

    $log = function(){
        var 
        PDSTR = '    ',
        data,
        box;
        log.clear = function(){
            if(box){
                box.innerHTML = '';
            }
        };
        return log;
        function log(title, text){
            if(text === undefined){
                text = title;
                title = '';
            }
            if(box){
                if(text != undefined){
                    text = serialize(text, 0);
                    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
                    text = (title ? ''+ title +' => \n':'')+ text;
                    if($browser.ie < 8){
                        text = text.replace(/ /g, '&nbsp;').replace(/\n/g, '<br>');
                    }
                    $append(box, '<li>'+text+'</li>');
                }
            }else if(document.body){ //初始化console容器，并输出已经存在的数据
                clearInterval(timer);
                var wrap = $element('<div id="Zlog">\
                    <h3>点击隐藏控制台<span>清除</span></h3>\
                    <ol></ol>\
                </div>');
                box = $query('ol', wrap)[0];
                $style(
                    '#Zlog{position:absolute; z-index:9999; left:2px; top:2px; width:260px; font:12px/20px  monaco, "microsoft yahei"; color:#333}\
                    #Zlog ol{margin:0; padding:0}\
                    #Zlog h3,\
                    #Zlog li{margin:1px; padding:4px; overflow:hidden; *height:20px; list-style:none; border:1px solid #999; border-radius:4px; background:#eee; text-overflow:ellipsis; white-space:nowrap; cursor:pointer}\
                    #Zlog h3{position:relative; font-size: 12px}\
                    #Zlog h3 span{position:absolute; right:8px;}\
                    #Zlog .view{*height:auto; width:auto; white-space:pre; overflow:auto; background: #666; color:#eee}\
                    #Zlog.hide{display:block!important; left:0; top:0; overflow: hidden; width:16px; height:16px; background:#000; opacity:0.1; filter:alpha(opacity=10); cursor:pointer;}\
                    #Zlog.hide h3,\
                    #Zlog.hide ol{display: none}'
                );
                document.body.appendChild(wrap);
            
                !function(){
                    var curView = null;
                    $query('span', wrap)[0].onclick = log.clear;
                    wrap.onclick = function(e){
                        var target = e ? e.target : event.srcElement;
                        if($cls(target, 'hide')){
                            $cls(target, '-hide');
                        }else if($tag(target) == 'H3'){
                            $cls(wrap, '+hide');
                        }else if($tag(target) == 'LI'){
                            if(curView){
                                if(target != curView){
                                    hideItem(curView);
                                    showItem(curView = target);
                                }else{
                                    hideItem(curView);
                                    curView = null;
                                }
                            }else{
                                showItem(curView = target);
                            }
                        }
                    };
    
                    function showItem(target){
                        $cls(target, '~view');
                        $width(target, target.scrollWidth+30);
                        
                    }
    
                    function hideItem(target){
                        $css(target, 'width:auto');
                        $cls(target, '~view');
                    }
    
                }();
                if(data){
                    for(var i = 0; i < data.length; i++){
                        log(data[i].title, data[i].text);
                    }
                }
                log(title, text);
            }else{
                if(!data){
                    data = [];
                }
                data.push({
                    title: title,
                    text: text
                });
                var timer = setInterval(function(){ //假如在body就绪后没调用log，那么就让定时器主动触发
                    if(document.body){
                        clearInterval(timer);
                        log();
                    }
                }, 15);
            }
        }
        function serialize(obj, level){
            var type = typeof obj;
            if(type == 'object'){
                level++;
                var paddingBlank = Array(level+1).join(PDSTR);
                if(obj === null){
                    return 'null';
                }else if({}.toString.call(obj) == '[object Array]'){
                    var arr = [];
                    for(var i = 0; i < obj.length; i++){
                        arr.push(paddingBlank+i+' => '+serialize(obj[i], level));
                    }
                    if(arr.length){
                        return  '[\n'+arr.join(',\n')+'\n'+paddingBlank.substr(PDSTR.length)+']';
                    }else{
                        return'[ ]';
                    }
                }else{
                    
                    var arr = [];
                    for(var key in obj){
                        arr.push(paddingBlank+key+' => '+serialize(obj[key], level));
                    }
                    if(arr.length){
                        return  '{\n'+arr.join(',\n')+'\n'+paddingBlank.substr(PDSTR.length)+'}';
                    }else{
                        return'{ }';
                    }
                    
                }
            
            }else if(type == 'string'){
                return '"'+obj.toString().replace(/\\/g, '\\\\').replace(/"/g, '\\"')+'"';
            }else if(type == 'function'){
                var len = 40;
                
                 return (Array(len).join(' ') + obj)
                    .replace(/\r/g, '')
                    //.replace(/\n/g, '@')
                    .replace(/^\s+$/gm, '')
                    .replace(/^\s*/gm, function(match){ //找到在函数每行前面的最小空白
                        len = Math.min(match.length, len);
                        return match
                    })
                    .replace(/^\s+/mg, function(match){  //将前方的空白移除一部分
                        return match.substr(len);
                    })
                    .replace(/^/mg, Array(level+1).join(PDSTR))
                    .replace(RegExp('^(\\s|'+PDSTR+')+'), '');
            }else{
                return ''+obj;
            }
        }
    }(),

    $XHR = $win.XMLHttpRequest || function(){ //ie6下使用遍历来获得最高版本的xmlhttp
        var xhrProgid = [0, 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP', 'Msxml2.XMLHTTP.6.0'],
            i = 4,
            xhr;
        while(--i){
            try{
                new ActiveXObject(xhr = xhrProgid[i]);
                return function(){return new ActiveXObject(xhr)};
            }catch(e){}
        }
    }(),

    $scrollTop = function(){
        var tr,
            cr = $browser.chrome || $browser.opera;
        return function(y, t, tp){
            var ds = cr ? $doc.body : $de;
            switch(arguments.length){
                case 0: return ds['scrollTop'];
                case 1: return ds['scrollTop'] = y;
                default: {
                    var s0 = 0,
                        s1 = Math.ceil(t/15),
                        z0 = ds['scrollTop'],
                        tp = function(t,b,c,d){
                            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
                        },
                        zc = y - z0;
                    clearTimeout(tr);
                    run();
                    
                }
            }
            function run(){
                tr = setTimeout(function(){
                    if(s0 < s1){ 
                        ds['scrollTop'] = tp(s0, z0, zc, s1);
                        run();
                    }else{
                        ds['scrollTop'] = y;
                        clearTimeout(tr);
                    }
                    s0++;
                }, 15);
            }
        };
    }(),

    $Easing = {
        Linear: function(p) {
            return p;
        },
        slowIn: function(p) {
            return p * p;
        },
        slowOut: function(p) {
            return p * (2 - p);
        },
        slowBoth: function(p) {
            if ((p /= 0.5) < 1) return 1 / 2 * p * p;
            return -1 / 2 * ((--p) * (p - 2) - 1);
        },
        In: function(p) {
            return p * p * p * p;
        },
        Out: function(p) {
            return -((p -= 1) * p * p * p - 1);
        },
        Both: function(p) {
            if ((p /= 0.5) < 1) return 1 / 2 * p * p * p * p;
            return -1 / 2 * ((p -= 2) * p * p * p - 2);
        },
        fastIn: function(p) {
            return p * p * p * p * p * p;
        },
        fastOut: function(p) {
            return -((p -= 1) * p * p * p * p * p - 1);
        },
        fastBoth: function(p) {
            if ((p /= 0.5) < 1) return 1 / 2 * p * p * p * p * p * p;
            return -1 / 2 * ((p -= 2) * p * p * p * p * p - 2);
        },
        elasticIn: function(p) {
            if (p == 0) return 0;
            if (p == 1) return 1;
            var x = 0.3,
            //y = 1,
            z = x / 4;
            return -(Math.pow(2, 10 * (p -= 1)) * Math.sin((p - z) * (2 * Math.PI) / x));
        },
        elasticOut: function(p) {
            if (p == 0) return 0;
            if (p == 1) return 1;
            var x = 0.3,
            //y = 1,
            z = x / 4;
            return Math.pow(2, -10 * p) * Math.sin((p - z) * (2 * Math.PI) / x) + 1;
        },
        elasticBoth: function(p) {
            if (p == 0) return 0;
            if ((p /= 0.5) == 2) return 1;
            var x = 0.3 * 1.5,
            //y = 1,
            z = x / 4;
            if (p < 1) return -0.5 * (Math.pow(2, 10 * (p -= 1)) * Math.sin((p - z) * (2 * Math.PI) / x));
            return Math.pow(2, -10 * (p -= 1)) * Math.sin((p - z) * (2 * Math.PI) / x) * 0.5 + 1;
        },
        backIn: function(p) {
            var s = 1.70158;
            return p * p * ((s + 1) * p - s);
        },
        backOut: function(p) {
            var s = 1.70158;
            return ((p = p - 1) * p * ((s + 1) * p + s) + 1);
        },
        backBoth: function(p) {
            var s = 1.70158;
            if ((p /= 0.5) < 1) return 1 / 2 * (p * p * (((s *= (1.525)) + 1) * p - s));
            return 1 / 2 * ((p -= 2) * p * (((s *= (1.525)) + 1) * p + s) + 2);
        },
        bounceIn: function(p) {
            return 1 - $Easing.bounceOut(1 - p);
        },
        bounceOut: function(p) {
            if (p < (1 / 2.75)) {
                return (7.5625 * p * p);
            } else if (p < (2 / 2.75)) {
                return (7.5625 * (p -= (1.5 / 2.75)) * p + 0.75);
            } else if (p < (2.5 / 2.75)) {
                return (7.5625 * (p -= (2.25 / 2.75)) * p + 0.9375);
            }
            return (7.5625 * (p -= (2.625 / 2.75)) * p + 0.984375);
        },
        bounceBoth: function(p) {
            if (p < 0.5) return $Easing.bounceIn(p * 2) * 0.5;
            return $Easing.bounceOut(p * 2 - 1) * 0.5 + 0.5;
        }
    },

    $AnimHook = {},

    $DragHook = {},

    $Drag = $Class.extend({
        init: function(elem, options){
            this.elem = elem;
            this.time = 0;
            var config = {
                before: 0,//拖动前
                after: 0,//拖动完成
                runing: 0,//拖动中
                clone: 0,//是否clone节点
                lockx: 0,//锁定x方向
                locky: 0,//锁定y方向
                range: -1//拖动范围控制
            };
            
            for(var ex in config){
                this['_'+ ex] = (ex in options ? options : config)[ex];
            }
    
            this.addHand(options.hand || elem);
            
        },
        
        addHand: function(hand){
            $bind(hand, 'mousedown', this._beforeDrag, this);
        },
        
        rmvHand: function(hand){
            $bind(hand, 'mousedown', this._beforeDrag, this);
        },
        _init: function(evt){
            this._hasInit = 1;
            var elem = this.elem, box = elem,
                offset = $offset(elem),
                marginLeft = $cssnum(elem, 'marginLeft'),
                marginTop = $cssnum(elem, 'marginTop');
            
            if(this._clone){
                var clone = $clone(elem, true);
                $css(clone, {
                    position: 'absolute',
                    zIndex: 9999,
                    left: offset.left - marginLeft,
                    top: offset.top - marginTop,
                    width: $cssnum(elem, 'width'),
                    height: $cssnum(elem, 'height')
                });
                $append($doc.body, clone);
                box = this._clone = clone;
            }
            this._style = box.style;
            
            this._offsetX = evt.clientX - box.offsetLeft + marginLeft;
            this._offsetY = evt.clientY - box.offsetTop + marginTop;
            this._before && this._before.call(this, evt);
            if(this._range == -1){//限制在窗口内
                this._minX = 0;
                this._minY = 0;
                this._maxX = $de.clientWidth - box.offsetWidth - marginLeft - $cssnum(box, 'marginRight');
                this._maxY = $de.clientHeight - box.offsetHeight - marginTop - $cssnum(box, 'marginBottom');
            }else if(this._range){
                var range = $query(this._range),
                    ro = $offset(range),
                    rw = range.offsetWidth,
                    rh = range.offsetHeight,
                    bl = $cssnum(range, 'borderLeftWidth'),
                    br = $cssnum(range, 'borderRightWidth'),
                    bt = $cssnum(range, 'borderTopWidth'),
                    bb = $cssnum(range, 'borderBottomWidth');
                this._minX = ro.left + bl;
                this._minY = ro.top + bt;
                this._maxX = ro.left + rw - br - box.offsetWidth - marginLeft - $cssnum(box, 'marginRight');
                this._maxY = ro.top + rh - bb - box.offsetHeight - marginTop- $cssnum(box, 'marginBottom');
                
                
            }
            
        },
        
        _beforeDrag: function(evt){
            if(evt.mouseKey != 'L' || (this._lockx && this._locky)){
                return;
            }
            
            evt.stopPropagation();
            evt.preventDefault();
            this._hasInit = 0;
            
            if($browser.ie){
                this._focusHand = evt.target;
                $bind(this._focusHand, 'losecapture', this._drop, this);
                this._focusHand.setCapture(false);
            }else{
                $bind($win, 'blur', this._drop, this);
            }
            
            $bind($doc, 'mousemove', this._draging, this);
            $bind($doc, 'mouseup', this._drop, this);
        },
        
        _draging: function(evt){
            
            ///*进行过滤
            var now = +new Date;
            if(now - this.time > 15){
                this.time = now;
            }else{
                return;
            }
            //*/
    
            $win.getSelection ? $win.getSelection().removeAllRanges() : $doc.selection.empty();
            !this._hasInit && this._init(evt);
            
            var left = evt.clientX - this._offsetX,
                top = evt.clientY - this._offsetY;
            if(this._range){
    
                left = Math.max(this._minX, Math.min(left, this._maxX));
                top = Math.max(this._minY, Math.min(top, this._maxY));
            }
            
            !this._lockx && (this._style.left = left +'px');
            !this._locky && (this._style.top = top +'px');
            this._runing && this._runing.call(this, evt);
        },
        _drop:function(evt){
            $unbind($doc, 'mousemove', this._draging, this);
            $unbind($doc, 'mouseup', this._drop, this);
            
            if($browser.ie){
                $unbind(this._focusHand, 'losecapture', this._drop, this);
                this._focusHand.releaseCapture();
            }else{
                $unbind($win, 'blur', this._drop, this);
            }
            if(this._hasInit){
                this._after && this._after.call(this, evt);
                if(this._clone && this._clone.parentNode){
                    $remove(this._clone);
                }
            }
        },
        set: function(options){
            for(var e in options){
                this[e] = options[e];
            }  
        },
        lock: function(){
            this._lockx = true;
            this._locky = true;
        },
        unlock: function(){
            this._lockx = false;
            this._locky = false;
        }
        
    
    });

    function $cookie(name, value, option){
    	
        if(typeof name == 'object'){ //批量设置cookie
    		
    		for(var e in name){
                $cookie(e, name[e], value);
            }
    		
        }else if(value !== undefined){
    		
            option = option || {};
    		if(value === null){ //value为null,则设置cookie为过期
    			option.expires = -1;
    		}else if(typeof option == 'number'){
    			option = {expires: option};
    		}
    		
    		var newvalue = name + "=" + encodeURIComponent(value);
    		
    		if(option.expires){
    			var exp = new Date;
    			exp.setTime(+exp + option.expires * 60 * 1000); //以分钟为单位
    			newvalue += "; expires=" + exp.toUTCString();
    		}
    		
    		if(option.path){
    			newvalue += "; path=" + option.path;
    		}
    		
    		if(option.domain){
    			newvalue += "; domain=" + option.domain;
    		}
    		
    		$doc.cookie = newvalue;
    		
    	}else{
    		return (value = $doc.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)'))
    			? decodeURIComponent(value[1]) : null;
    	}
    	
    }

    function $tag(element, nodeName){
        return nodeName
            ? nodeName == element.nodeName
            : element.nodeName;
    }

    function $val(element, val){
        return val == undefined
            ? element.value
            : (element.value = val, this);
    }

    function $attr(element, name, value){
    	
        if(value === null){
            element.removeAttribute(name);
        }else if(value != undefined){
    		
            if(typeof name == 'object'){ //批量设置属性
                for(var attr in name){
                    $attr(element, attr, name[attr]);
                }
            }else{
                if(name == 'style'){
                    element.style.cssText = value;
                }else{
                    if(element[name] != undefined){//优先设置js属性
                        element[name] = value;
                    }else{
                        element.setAttribute(name, value, 2);
                    }
                }
            }
    		
        }else{
    		
            if(name == 'style'){
                return element.style.cssText;
            }else{
                if(name == 'href' && element.nodeName == 'A'){
                    return element.getAttribute(name, 2);
                }else{
                    if(element[name] != undefined){//优先获取js属性
                        return element[name];
                    }else{
                        var val = element.getAttribute(name);
                        return val == null ? undefined : val;
                    }
                }
            }
    		
        }
    	
        return this;
    }

    function $ready(callback){
    	
        var callbacks = [];
        callbacks.push(callback);
     
        //下面这个判断是为了解决DOMContentLoaded之后再调用DOMReady无法触发done函数的问题
        if($doc.addEventListener && $doc.readyState == 'interactive' || $doc.readyState == 'complete'){
            return done();
        }
       
        /*if(/complete|interactive/.test(document.readyState)){ //见blog/p/84.html
            return done();
        }*/
     
        if($doc.addEventListener){
    		
            $doc.addEventListener('DOMContentLoaded', done, false);
    		
        }else{
    		
            var tr = setInterval(function(){
                if($doc.body){
                    clearInterval(tr);
                    done();
                }
            }, 15);
    		
        }
     
        function done(){
    		
            for(var i = 0; i < callbacks.length; i++){
                callbacks[i]();
            }
            callbacks = null;
    		
            $ready = function(callback){
                callback();
            };
    		
        }
    	
    }

    function $event(event){
        return{
            original: event,
            type: event.type,
            keyCode: event.keyCode,
            clientX: event.clientX,
            clientY: event.clientY,
            target: event.target || event.srcElement,
            //fromTarget: event.fromElement || evt.relatedTarget,
            //toTarget: event.toElement || evt.relatedTarget,
            stopPropagation: function(){
                event.stopPropagation 
                    ? event.stopPropagation() 
                    : (event.cancelBubble = true);
            },
            preventDefault: function(){
                event.preventDefault 
                    ? event.preventDefault()
                    : (event.returnValue = false);
            },
            mouseKey: ($browser.ie ? {1: 'L', 4: 'M', 2: 'R'} : {0: 'L', 1: 'M', 2: 'R'})[event.button],
            delta: event.type == 'mousewheel' 
                ? event.wheelDelta
                : event.type == 'DOMMouseScroll'
                    ? event.detail * -40
                    : null
        };
    }

    function $bind(element, type, fn, context){
    	
        if(!element.__EVENTID__){ //不存在当前元素的事件队列
            $eventhook[element.__EVENTID__ = ++$guid] = [];
        }
    	
    	var eventqueue = $eventhook[element.__EVENTID__];
    	if(!eventqueue[type]){
    		
    		eventqueue[type] = [];
    		
    		$addevent(element, type, function(event){
    			
    			var current;
                var queue = eventqueue[type].slice(0); //copy eventqueue for fire
    			while(current = queue.shift()){
                    current.fn.call(current.context, $event(event));
                }
    			
            });
    		
    	}
    	
        eventqueue[type].push({
            fn: fn,
            context: context || this
        });
    	
        return this;
    	
    }

    function $unbind(element, type, fn, context){
    	
        var queue = $eventhook[element.__EVENTID__][type], i = 0;
    	
        context = context || this;
    	
        while(queue[i]){
    		
            if(
                queue[i].fn == fn && 
                (
                    queue[i].context == context || 
                    $iszelement(context) && context.e == queue[i].context.e
                )
            ){
    			
                queue.splice(i, 1);
                break;
    			
            }
    		
            i++;
    		
        }
    	
        return this;
    }

    function $clone(element, flag){
        return element = element.cloneNode(flag);
    }

    function $replace(element, newNode){
        element.parentNode.replaceChild($element(newNode), element);
        return this;
    }

    function $append(element, newNode, index){
    	
        if($isarray(newNode)){
    		
            var root = $doc.createDocumentFragment();
            $each(newNode, function(element){
                root.appendChild($element(element));
            });
            newNode = root;
    		
        }else{
            newNode = $element(newNode);
        }
        
        if(index == undefined){
            element.appendChild(newNode);
            return this;
        }
    	
        var child = element.children;
        if(index > -1){
            child = child[index];
        }else if(index < 0){
            child = child[Math.max(child.length + index + 1, 0)];
        }
    	
        if(child){
            child.parentNode.insertBefore(newNode, child);
        }else{
            element.appendChild(newNode);
        }
    	
        return this;
    	
    }

    function $html(element, html){
    	
        var type = typeof html, innerHTML = '';
    		
        if(type == 'undefined'){
    		
            return element.innerHTML;
    		
        }else if(type == 'function'){
    		
            innerHTML = html();
    		
        }else if(type == 'object'){
    		
            $each(html, function(html){
                innerHTML += html;
            });
    		
        }else{
    		
            innerHTML = html;
    		
        }
    	
        if(element.nodeName == 'SELECT' && type != 'undefined' && $browser.ie){
    		
            var container = document.createElement('div');
            container.innerHTML = '<select>' + innerHTML + '</select>';
            element.innerHTML = '';
            $each($query('option', container), function(option){
                element.appendChild(option);
            });
    		
        }else{
    		
            element.innerHTML = innerHTML;
    		
        }
    	
        return this;
    	
    }

    function $remove(element){
        element.parentNode.removeChild(element);
        return this;
    }

    function $insert(element, newNode, flag){
    	
        newNode = $element(newNode);
    	
        if(flag){
    		
            while(element.nextSibling){
                element = element.nextSibling;
                if(element.elementType == 1){
                    element.parentNode.insertBefore(newNode, element);
                    return this;
                }
            }
            element.parentNode.appendChild(newNode);
    		
        }else{
    		
            element.parentNode.insertBefore(newNode, element);
    		
        }
    	
        return this;
    	
    }

    function $parent(element, expression){
    	
        if(expression == undefined){
    		
            return element.parentNode;
    		
        }else if(expression > 0){
    		
            expression++;
            while(expression--){
                element = element.parentNode;
            }
    		
            return element;
    		
        }else{
    		
            expression = expression.match(/^(?:#([\w\-]+))?\s*(?:(\w+))?(?:.([\w\-]+))?(?:\[(.+)\])?$/);
            if(expression){
    			
                var id = expression[1],
                    tag = expression[2],
                    cls = expression[3],
                    attr = expression[4];
    				
                tag = tag && tag.toUpperCase();
                attr = attr && attr.split('=');
    			
            }else{
                return null;
            }
            
            while(element = element.parentNode){
                if(
                    (!id || element.id == id)
                    && (!cls || cls && $hasclass(element, cls))
                    && (!tag || element.nodeName == tag)
                    && (!attr || $attr(element, attr[0]) == attr[1])
                ){
                    return element;
                }
            }
            
        }
    	
        return null;
    	
    }

    function $prev(element){
        while(element = element.previousSibling){
            if(element.nodeType == 1){
                return element;
            }
        }
    }

    function $next(element){
        while(element = element.nextSibling){
            if(element.nodeType == 1){
                return element;
            }
        }
    }

    function $child(element, index){
    	
        var child = element.children;
    	
        if(index > -1){
    		
            child = child[index];
    		
        }else if(index < 0){
    		
            child = child[child.length + index];
    		
        }else if(typeof index == 'string'){
    		
            var returns = [];
            $each($query(index, element) || returns, function(element){
                (element.parentNode == element) && returns.push(element);
            });
    		
            return returns.length ? returns : null;
    		
        }else{
    		
            var returns = [];
            for(var i = 0; i < child.length; i++){
                returns.push(child[i]);
            }
            return returns;
    		
        }
    	
        return child;
    	
    }

    function $query(){
        var
        suportSel = $doc.querySelectorAll,
        rQuickExpr = /^([#.])?([\w\-]+|\*)$/,
        rChildExpr = /^([\w-]+)?(?:\.([\w\-]+))?(?:\[(.+)\])?$/, //tag.cls[attr=val]
        rChildStr = /(?:[\w\-]+)?(?:\.[\w\-]+)?(?:\[.+\])?/.source,
        rAllExpr = RegExp('^(#[\\w\\-]+|'+rChildStr+')(?:\\s+('+rChildStr+'))$');
    	
        return ($query = query).apply(null, arguments);
        
        function query(selector, context){
    		
            var 
            sItems,
            sType,
            sWord,
            elems;
    		
            if(sItems = rQuickExpr.exec(selector)){ //单级选择器，快速模式
    		
                sType = sItems[1];
                sWord = sItems[2];
    			
                if(sType == '#'){
                    return (context || $doc).getElementById(sWord);
                }
    			
                if(sType == '.'){
                    if($doc.getElementsByClassName){
                        return makeArray(
                            (context || $doc).getElementsByClassName(sWord)
                        );
                    }else{
                       return filterByClassName(query('*', context), sWord);
                    }
                }
                
                return makeArray(
                    (context || $doc).getElementsByTagName(sWord)
                );
            }
    		
            if(suportSel){
    			
                if(!context || context == $doc){
                    elems = $doc.querySelectorAll(selector);
                }else{
                    var 
                    oldId = context.id,
                    fixId = 'theIdForHelpQuery';
                    selector = '#' + (context.id = fixId) + ' '+ selector;
                    if(selector.indexOf(',')>0){
                        selector = selector.replace(/,/g, ','+fixId+' ');
                    }
                    elems = context.querySelectorAll(selector);  
                    oldId ? context.id = oldId : context.removeAttribute('id');
                }
    			
            }else{
                if(/,/.test(selector)){
                    elems = [];
                    forEach(selector.split(','), function(selector){
                        var es = query(selector, context);
                        es.length ? elems = elems.concat(es) : elems.push(es);
                    });
                }else{
                    sItems = rAllExpr.exec(selector); //二级选择器
                    if(sItems){
                        var 
                        contexts = query(sItems[1], context), //先取前面的表达式作为限定
                        sChild = sItems[2];
                        if(contexts){
                            elems = [];
                            forEach($isarray(contexts) ? contexts : [contexts], function(context){
                                var es = query(sChild, context);
                                es.length ? elems = elems.concat(es) : elems.push(es); 
                            });
                        }else{
                            return null;
                        }
                    }else{
                        sItems = rChildExpr.exec(selector); //单级选择器，附带属性等多字段
                        if(sItems){
                            var 
                            tag = sItems[1] || '*',
                            cls = sItems[2],
                            attr = sItems[3];
                            elems = query(tag, context);
                            cls && (elems = filterByClassName(elems, cls));
                            attr && (elems = filterByAttr(elems, attr));
                        }else{
                            return null;
                        }
                            
                    }
                }
            }
            return elems && elems.length
                ? (/,/.test(selector) ? unique : makeArray)(elems)
                : null;
        }
        
        function filterByClassName(elems, clsName){
            var
            ret = [],
            rClsName = RegExp('(^|\\s+)'+ clsName +'($|\\s+)');
    
            forEach(elems, function(elem){
                rClsName.test(elem.className) && ret.push(elem); 
            });
            return ret.length ? ret : null;
        }
        
        function filterByAttr(elems, attr){
            var
            ret = [],
            match = /([\w-]+)(!=|=)?(\S+)?/.exec(attr),
            name = match[1],
            type = match[2],
            value = match[3];
    
            forEach(elems, function(elem){
                if(value){
                    var val = elem.getAttribute(key);
                    if(
                        type == '=' && val == value ||
                        type == '!=' && val != value
                    ){
                        ret.push(elem);
                    }
                     
                }else{
                    elem.hasAttribute(name) && ret.push(elem);
                }
            });
            return ret.length ? ret : null;
        }
        
        function forEach(arr, fn){
            if(arr && arr.length){
                for(var i = 0, len = arr.length; i < len; i++){
                    fn(arr[i], i);
                }
            }
        }
        
        function makeArray(nodelist){
            
            var ret;
            try{
                ret = [].slice.call(nodelist, 0);
            }catch(e){
                ret = [];
                forEach(nodelist, function(elem){
                   ret.push(elem); 
                });
            }
            return ret.length ? ret : null;
        }
        
        function unique(elems){
            var ret = [];
            forEach(elems, function(elem){
                if(!elem.getAttribute('__forUnique__')){
                    elem.setAttribute('__forUnique__', 1);
                    ret.push(elem);
                }
            });
            forEach(ret, function(elem){
                elem.removeAttribute('__forUnique__');
            });
            return ret;
        }
    }

    function $hasclass(element, className){
        return RegExp('(^|\\s)' + className + '($|\\s)').test(element.className);
    }

    function $cls(element, cls, cls2){
        if(cls2){
            if(element.className){
                element.className = (' ' + element.className + ' ')
                    .replace(RegExp('\\s+(' + cls2 + ')(?=\\s+)'), cls)
                    .replace(/^\s+|\s+$/g, '');//清除头尾空格;
            }
        }else if(cls){
            var _exp = cls.charAt(0),
                _cls = cls.substr(1);
            if(/[+~-]/.test(_exp)){
                var 
                ncls = element.className;
                _cls = _cls.split(',');
                switch(_exp){
                    case '+':
                        if(ncls){//假如不为空，需要判断是否已经存在
                        
                            $each(_cls, function(val, i){
                                if(!$hasclass(element, val)){
                                    element.className += ' ' + val;
                                }
                            });
                        }else{
                            element.className = _cls.join(' ');
                        }
                        break;
                    case '-':
                        if(ncls){
                            element.className = (' ' + ncls + ' ')
                                .replace(RegExp('\\s+(' + _cls.join('|') + ')(?=\\s+)', 'g'), '')//替换存在的className
                                .replace(/^\s+|\s+$/g, '');//清除头尾空格
                        }
                        break;
                    case '~':
                        if(ncls){
                            $each(_cls, function(val, i){
                                if(!$hasclass(element, val)){
                                    element.className += ' ' + val;
                                }else{
                                    $cls(element, '-'+ val);
                                }
                            });
                        }else{
                            element.className = _cls.join(' ');
                        }
                        break;
                }
            }else if(_exp == '='){
                element.className = _cls;
                return this;
            }else{
                _cls = cls.split(',');
                var ret = true;
                $each(_cls, function(val, i){
                    return !(ret = ret && $hasclass(element, val));
                });
                return ret;
            }
        }else{
            return element.className;
        }
        return this;
    }

    function $offset(element){
        var top = 0, left = 0;
        if ('getBoundingClientRect' in $de){
            var 
            box = element.getBoundingClientRect(), 
            body = $doc.body, 
            clientTop = $de.clientTop || body.clientTop || 0, 
            clientLeft = $de.clientLeft || body.clientLeft || 0,
            top  = box.top  + ($win.pageYOffset || $de && $de.scrollTop  || body.scrollTop ) - clientTop,
            left = box.left + ($win.pageXOffset || $de && $de.scrollLeft || body.scrollLeft) - clientLeft;
        }else{
            do{
                top += element.offsetTop || 0;
                left += element.offsetLeft || 0;
                element = element.offsetParent;
            } while (element);
        }
        return {left: left, top: top, width: element.offsetWidth, height: element.offsetHeight};
    }

    function $cssnum(element, attr){
        var val = +$rmvpx($css(element, attr)) || 0;
        if(/^width|height|left|top$/.test(attr)){
            switch(attr){
                case 'left': return val || element.offsetLeft - $cssnum(element, 'marginLeft');
                case 'top': return val || element.offsetTop - $cssnum(element, 'marginTop');
                case 'width': return val
                    || (element.offsetWidth
                        - $cssnum(element, 'paddingLeft')
                        - $cssnum(element, 'paddingRight')
                        - $cssnum(element, 'borderLeftWidth')
                        - $cssnum(element, 'borderRightWidth')
                    );
                case 'height': return val
                    || (element.offsetHeight
                        - $cssnum(element, 'paddingTop')
                        - $cssnum(element, 'paddingBottom')
                        - $cssnum(element, 'borderTopWidth')
                        - $cssnum(element, 'borderBottomWidth')
                    );
            }
        }
        return val;
    }

    function $left(element, value){
        if(value != undefined){
            $css(element, 'left', value);
            return this;
        }
        return $cssnum(element, 'left');
    }

    function $top(element, value){
        if(value != undefined){
            $css(element, 'top', value);
            return this;
        }
        return $cssnum(element, 'top');
    }

    function $width(element, value){
        if(value != undefined){
            $css(element, 'width', value);
            return this;
        }
        return $cssnum(element, 'width');
    }

    function $height(element, value){
        if(value != undefined){
            $css(element, 'height', value);
            return this;
        }
        return $cssnum(element, 'height');
    }

    function $show(element){
        element.style.display = 'block';
        return this;
    }

    function $hide(element){
        element.style.display = 'none';
        return this;
    }

    function $opacity(element, opacity){
        if($browser.ie && $browser.ie < 9){
            var 
            filter = element.currentStyle && element.currentStyle.filter,
            hasAlpha = filter && /alpha/i.test(filter),
            filterStr;
            if(opacity === undefined){
                if(hasAlpha){
                    return +filter.match(/opacity[\s:=]+(\d+)/i)[1]/100;
                }
                return 1;
            }
            
            if(opacity >= 1 || opacity == null){
                // IE6-8设置alpha(opacity=100)会造成文字模糊
                filterStr = filter.replace(/alpha[^\)]+\)/i, '');
            }else{
                opacity = Math.round(opacity * 100);//必须转成整数
                if(hasAlpha){
                    filterStr = filter.replace(/(opacity\D+)\d+/i, 'opacity='+ opacity);
                }else{
                    filterStr = filter +' '+ 'alpha(opacity=' + opacity + ')';
                }
            } 
            element.style.filter = filterStr;
        }else{
            if(opacity === undefined){
                return (opacity = +$css(element, 'opacity')) > -1 ? opacity : 1;
            }
            element.style.opacity = opacity;
        }
        return this;
    }

    function $rmvpx(val){
        return /px$/.test(val) ? parseFloat(val) : val;
    }

    function $fixStyleName(name){
        if(name == 'float'){
            return $win.getComputedStyle ? 'cssFloat' : 'styleFloat';
        }
        return name.replace(/-(\w)/g, function(_, aftername){
            return aftername.toUpperCase();
        });
    }

    function $css(element, name, value){
        if(value !== undefined){
            
            name == 'opacity' && $browser.ie < 9
                ? $opacity(element, value)
                : (element.style[name = $fixStyleName(name)] = 
                    value < 0 && /width|height|padding|border/.test(name) 
                        ? 0 //修正负值
                        : value + (/width|height|left|top|right|bottom|margin|padding/.test(name) && /^[\-\d.]+$/.test(value) 
                            ? 'px'  //增加省略的px
                            : '')
                );        
        }else if(typeof name == 'object'){
            for(var key in name){
                $css(element, key, name[key]);
            }
        }else{
            if(~name.indexOf(':')){ //存在:,比如'background:red'
                $each(name.replace(/;$/, '').split(';'), function(cssText){      
                    cssText = cssText.split(':');
                    $css(element, cssText.shift(), cssText.join(':'));
                    //?$css(element,cssText[0],cssText[1]);//background:url(http://www....)bug
                });
            }else{
                return name == 'opacity' && $browser.ie < 9
                    ? $opacity(element)
                    : element.style && element.style[name = $fixStyleName(name)]
                        || (element.currentStyle || getComputedStyle(element, null))[name];
            }
        }
        return this;
    }

    function $contains(pnode, cnode){
        return cnode == pnode
            ? 1 : pnode.contains 
                ? pnode.contains(cnode) 
                    ? 2 : 0
                : pnode.compareDocumentPosition(cnode)
                    ? 2 : 0;
    }

    function $noop(){}

    function $isarray(obj){
        return {}.toString.call(obj) == '[object Array]';
    }

    function $each(obj, fn){
    	
        if($isarray(obj)){
    		
            for(var i = 0, len = obj.length; i < len; i++){
                if(fn.call(null, obj[i], i)){
                    break;
                }
            }
    		
        }else{
    		
            for(var i in obj){
                if(obj.hasOwnProperty(i) && fn.call(null, obj[i], i)){
                    break;
                }
            }
    		
        }
    	
    }

    function $param(data, timestamp){
    	
        var query = [];
        $each(data, function(val, key){
            query.push(key + '=' + encodeURIComponent(val));
        });
    	
        timestamp && query.push('t=' + +new Date);
    	
        return query.join('&');
    	
    }

    function $mix(target, source){
        $each(source, function(val, key){
            target[key] = val;
        });
    }

    function $tojson(obj){
        switch(typeof obj){
            case 'object':
                if(obj == null){
                    return obj;
                }
                var json = [];
                if({}.toString.apply(obj) == '[object Array]'){
                    for(var i = 0, len = obj.length; i < len; i++){
                        json[i] = $tojson(obj[i]);
                    }
                    return '[' + json.join(',') + ']';
                }
                for(var key in obj){
                    json.push('"' + key + '":' + $tojson(obj[key]));
                }
                return '{' + json.join(',') + '}';
            case 'function':
                obj = '' + obj;
            case 'string':
                return '"' + obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n') + '"';
            case 'number':
            case 'boolean':
            case 'undefined':
                return obj;
        }    
        return obj;
    }

    function $ajax(options){
        var 
        t1 = +new Date,
        xhr = new $XHR,
        callback = options.callback,
        headers = options.headers,
        key;
        xhr.open(options.type || 'get', options.url, options.async || true);
        for(key in headers) { //设置发送的头
            xhr.setRequestHeader(key, headers[key]);
        }
        xhr.onreadystatechange = function(){
            xhr.readyState == 4 && callback && callback(
                xhr.status == 200 
                ? options.responseType 
                    ? xhr[options.responseType] 
                    : xhr
                : null
            );
        };
        xhr.send(options.data || null);
    }

    function $post(url, callback, data){ //post经典版封装
        $ajax({
            url: url,
            type: 'post',
            data: typeof data == 'object' ? $param(data) : data,
            callback: function(responseText){
                callback(responseText);
            },
            responseType: 'responseText',
            headers: { //post必须给http头设置Content-Type
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }

    function $get(url, callback, data){ //get经典版封装
        $ajax({
            url: url + (data ? '?'+ (typeof data == 'object' ? $param(data) : data) : ''),
            callback: function(responseText){
                 callback(responseText);
            },
            responseType: 'responseText'
        });
    }

    function $img(url, callback){
        var img = new Image;
        img.src = url;
        
        if(img.complete){
            return done(img);
        }
        img.onload = function () {
            done(img);
        };
        img.onerror = function(){
            done(null);
        };
        function done(result){
            img.onload = img.onerror = null;
            callback && callback(result, result);
        }
        return this;
    }

    function $js(src, callback, charset){
        var 
        script = $doc.createElement('script'),
        done = function(){
            callback && callback();
            $de.removeChild(script);
        };
        charset && (script.charset = charset);
        script.src = src;
        'onload' in script ? script.onload = done : script.onreadystatechange = function(){
            /loaded|complete/.test(script.readyState) && done();
        };
        $de.appendChild(script);
    }

    function $style(cssText){
        $isarray(cssText) && (cssText = cssText.join(''));
        if(/\{[\w\W]+?\}/.test(cssText)){ //cssText
            var style = $doc.createElement('style');
            style.type = 'text/css';
            style.styleSheet && (style.styleSheet.cssText = cssText.replace(/opacity:\s*(0?\.\d+)/g, function(mc, opacity){
                return 'filter:alpha(opacity='+parseInt(opacity*100)+')';
            })) || style.appendChild($doc.createTextNode(cssText));	
        }else{
            style = $doc.createElement('link');
            style.rel = 'stylesheet';
            style.href = cssText;
        }
        $head.appendChild(style);
        return this;
    }

    function $encodehtml(str){
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function $decodehtml(str){
        return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    }

    function $encodeurl(str){
        return str
            .replace(/%/g, '%25')
            .replace(/ /g, '%20')
            .replace(/#/g, '%23')
            .replace(/&/g, '%26')
            .replace(/=/g, '%3D')
            .replace(/\//g, '%2F')
            .replace(/\?/g, '%3F')
            .replace(/\+/g, '%2B');
    }

    function $tirm(str){
        return str.replace(/^\s+|\s+$/g, '');
    }

    function $parsejson(str){
        try{
            str = $tirm(str);
            if(!str.replace(/"(?:\\\\|\\\"|[^"])*"|[\s{}\[\]:\d.,-]+|true|false|null|undefined/g, '')){ //说明JSON数据符合要求
                return Function('return ' + str)();
            }
        }catch(e){
    		throw new SyntaxError('JSON.parse');
    	}
        
    }

    function $rstr(str, data){
    	
    	if(typeof str == 'function'){
    		str += '';
    		str = str.match(/function\s*\(\)\{\/\*([\w\W]+?)\*\//)[1];
    		str = str.replace(/^\s+|\s+$/g, '');
    	}else{
    		str += '';
    	}
    	
    	if(arguments.length == 1){
    		return str;
    	}
    	
    	if(typeof data == 'object'){
    		
    		if({}.toString.call(data) == '[object Array]'){
    			
    			var rst = '';
    			for(var i = 0; i < data.length; i++){
    				rst += $rstr(str, data[i]);
    			}
    			return rst;
    			
    		}else{
    			
    			return str.replace(/\{([$\w]+)\}/g, function(match, key){
    				
    				if(key in data){
    					return data[key];
    				}
    				
    				return match;
    				
    			});
    			
    		}
    		
    	}else{
    		
    		var args = arguments, argslen = args.length;
    		return str.replace(/\{%(\d+)\}/g, function(match, index){
    			
    			index++;
    			if(index < argslen){
    				return args[index];
    			}
    			
    			return match;
    			
    		});
    
    	}
    	
    }

    function $Anim(elem, attrs, options){
        
        var drawId;
        var onstop;
        play(attrs, options || {});
        
        return {
            play: play,
            stop: function(){
                stop();
                onstop && onstop();
            }
        };
        
        function play(attrs, options){
            if(typeof options == 'number'){
                options = {
                    dur: options
                };
            }
            options.onbefore && options.onbefore();
            onstop = options.onstop;
            
            var style = elem.style;
            var easing = $Easing[options.easing] || $Easing.Both;
            var onplay = options.onplay;
            var ondone = options.ondone;
            var dur = options.dur || 800;
            var time0 = +new Date;
            var per;
            var cache_per = 0;
            var attrsObj = fromatAttrs(attrs);
            var attrs = attrsObj.attrs;
            var from = attrsObj.from;
            var by = attrsObj.by;
            var fixAttrs = attrsObj.fixAttrs;
            var ceil = Math.ceil;
            drawId = $draw(function(){
                
                per = (+new Date - time0) / dur;
                if(per >= 1){ //完成进度，则清除draw
                    per = 1;
                    stop();
                }else{
                    per = ~~(easing(per) *10000)/10000; //精确保留4位小数
                }
                
                if(cache_per != per){ //由于定时器存在精度问题，所以在下一帧中per未必发生改变
                    cache_per = per;
                    
                    var attr, i = 0;
                    while(attr = attrs[i]){
                        style[attr] = ceil(from[i] + per * by[i++]) + 'px';
                    }
                    if(attr = fixAttrs.opacity){
                        $opacity(elem, attr.from + per * attr.by);
                    }
                    onplay && onplay();
                    if(per == 1){
                        ondone && ondone();
                    }
                }
                
            });
        }
        
        function fromatAttrs(attrsIn){
            var attrs = [];
            var from = [];
            var by = [];
            var fixAttrs = {};
            var value; //传入参数
            var fromValue; //起始位置
            var byValue; //改变量
            var isRelative; //是否是相对改变
            
            for(var attr in attrsIn){
                value = attrsIn[attr];
                if(typeof value != 'number'){
                    value = parseInt(value);
                }
    
                if(isRelative = attr.indexOf('x') == 0){
                    attr = attr.substr(1);
                    fromValue = $cssnum(elem, attr);
                    byValue = value;
                }else{
                    fromValue = $cssnum(elem, attr);
                    byValue = value - fromValue;
    
                }
                
                if(/opacity/.test(attr)){
                    var fromValue = $opacity(elem);
                    fixAttrs['opacity'] = {
                        from: fromValue,
                        by: isRelative ? byValue : value - fromValue
                    };
                }else{
                    attrs.push(attr);
                    from.push(fromValue);
                    by.push(byValue);
                }
                
            }
            return{
                attrs: attrs,
                from: from,
                by: by,
                fixAttrs: fixAttrs
            };
        }
    
        function stop(){
            $draw.clear(drawId);
        }
    
    }

    function $draw(fn, hook){
        var list = [], //函数列表
            ids = {}, //hooks
            tr, //定时器句柄
            fpsClick = [], //帧打点
            info = { //监控数据
                execTime: 0,
                list: [],
                fps: 0
            };
            
        $draw = draw;
        draw.clear = clear;
        draw.info = getInfo;
        
        return draw(fn, hook);
        
        function draw(fn, hook){
            clear(hook);
            
            var id = ++$guid;
            ids[id] = 1;
            list.push({
                id: id,
                fn: fn
            });
            if(list.length == 1){
                start();
            }
            return id;
        }
        
        function clear(hook){
            if(ids[hook]){
                delete ids[hook];
                var item, i = 0;
                while(item = list[i++]){
                    if(item.id == hook){
                        list.splice(i-1, 1);
                        break;
                    }
                }
    
                if(list.length == 0){
                    stop();
                }
            }
        }
        
        function start(){
    
            function fns(){
    
                for(var i = 0, lg = list.length; i < lg; i++){
                    var item = list[i]; //由于在item.fn中可能会执行clear操作，所以list[i]可能已经不存在了
                    item && item.fn();
                }
                
            }
            function run(){
                var t0 = +new Date;
                fns();
                var t1 = +new Date;
                
                //取15ms是因为ie浏览器16ms精度问题,基本上达到60fps，差不多需要40fps+动画才能流畅
                //t1 - t0 为程序执行时间，进行相应的修正
                tr = setTimeout(run, Math.max(0, 15 - (t1 - t0)));                       
                return;
                var fpsItem, i = 0;
                while(fpsItem = fpsClick[i++]){ //更新帧数
                    if(t1 - fpsItem < 1000){ //清除已经过期的打点
                        break;
                    }
                    fpsClick.shift();
                }
                
                fpsClick.push(t1);
                info.execTime = t1 - t0;
                info.fps = fpsClick.length;
                info.list = list;
            }
            
            run();
        }
        
        function stop(){
            clearTimeout(tr);
        }
        
        function getInfo(){
            return info;
        }
    }
    $draw.clear = $noop;

    function $anim(elem, cssAttr, callback){
        
        var 
        property,
        cssAttrCache = {};
        
        for(property in cssAttr){
            cssAttrCache[property] = $cssnum(elem, property);
        }
        if(cssAttr.opacity > -1){
            cssAttr.opacity = Math.round(cssAttr.opacity * 100);
            cssAttrCache.opacity = Math.round(cssAttrCache.opacity * 100);
        }
        clearInterval(elem._animTimer_);
        elem._animTimer_ = setInterval(function(){
            var
            complete = 1,
            property,
            speed;
            for(property in cssAttr){
                if(cssAttr[property] != cssAttrCache[property]){
                    complete = 0;
                    speed = (cssAttr[property] - cssAttrCache[property]) / 8;
                    cssAttrCache[property] += speed > 0 ? Math.ceil(speed) : Math.floor(speed);
                    $css(elem, property, property == 'opacity' ? cssAttrCache[property] / 100 : cssAttrCache[property]);
                }
            }
            if(complete){
                clearInterval(elem._animTimer_);
                callback && callback();
            }
        }, 15);
        
    }

    function $z(expression, context){
    	
        switch(typeof expression){
    		
            case 'function':
                return $ready(expression);
    			
            case 'string':
    		
                if(expression.indexOf('<') == 0){ //创建DOM节点
                    return $z($element(expression));
                }
    			
                return $z($query(expression, context));
    			
            case 'object':   
    		
                if(!expression){
                    return null;
                }
    			
                if($iszelement(expression)){
                    return expression;
                }
    			
                return new $zelement(expression);
    			
        }
    	
        return null;
    }

    function $zelement(input){
        //imports $p
        if($isarray(input)){
            this.es = input;
            this.e = input[0];
        }else{
            this.e = input;
        }
    }

    function $iszelement(input){
        return input && input.constructor == $zelement;
    }

    function $iselement(input){
        return input && (input.nodeType === 1 || input == $doc);
    }

    function $element(input){
    	
        if($iselement(input))return input;
    	
        if($iszelement(input))return input.e;
        
        if(~input.indexOf('<')){ //根据<标识符判断
    	
            var div = $doc.createElement('div');
            div.innerHTML = $tirm(input);
            return div.firstChild;
    		
        }else{
            return $doc.createElement(input);
        }
    	
    }

    function $eachcall(which, method){ //批量调用
    
        var args = [].slice.call(arguments, 2);
    	
        if(which.es){
    		
            $each(which.es, function(e){
                method.apply($z(e), [e].concat(args));
            });
    		
        }else{
    		
            method.apply(which, [which.e].concat(args));
    		
        }
    	
        return which;
    	
    }

    function $call(which, method){
        var args = [].slice.call(arguments, 2);
        return method.apply(which, [which.e].concat(args));
    }

    $z.browser = $browser;

    $z.isie6 = $isie6;

    $z.cookie = $cookie;

    $p.attr = function(name, value){
        return $call(this, $attr, name, value);
    };

    $p.tag = function(nodename){
        return $call(this, $tag, nodename);
    };

    $p.val = function(value){
        return $call(this, $val, value);
    };

    $p.html = function(html){
        return $call(this, $html, html);	
    };

    $z.ready = function(fn){
        $ready(fn);
    };

    $p.on = function(type, fn, context){
        return $eachcall(this, $bind, type, fn, context);
    };

    $p.un = function(type, fn, context){
        return $eachcall(this, $unbind, type, fn, context);
    };

    $p.click = function(fn, context){
        return $eachcall(this, $bind, 'click', fn, context);
    };

    $z.E = function(html){
        return $z($element(html));
    };

    $p.append = function(element, index){
        return $call(this, $append, element, index);
    };

    $p.insertBefore = function(element){
        return $call(this, $insert, element, false);
    };

    $p.insertAfter = function(element){
        return $call(this, $insert, element, true);
    };

    $p.remove = function(){
        return $z($remove(this.e));
    };

    $p.clone = function(deepCopy){
        return $z($clone(this.e, deepCopy));
    };

    $p.replace = function(element){
        return $z($replace(this.e, element));
    };

    $z.q = function(){
        return $query.apply(null, arguments);
    };

    $p.eq = function(i){
        return $z(this.es[i < 0 ? this.es.length + i : i]);
    };

    $p.find = function(expression){
        return $z(expression, this.e);
    };

    $p.parent = function(expression){
        return $z($parent(this.e, expression));
    };

    $p.child = function(n){
        return $z($child(this.e, n));
    };

    $p.prev = function(){
        return $z($prev(this.e));
    };

    $p.next = function(){
        return $z($next(this.e));
    };

    $p.filter = function(fn){
        if(this.es){
            var es = [];
            $each(this.es, function(e, i){
                var Ze = $z(e);
                if(fn.call(Ze, Ze, i)){
                    es.push(e);
                }
            });
            if(es.length){
                return $z(es);
            }
            return null;
        }else{
            if(!fn.call(this, this, 0)){
                return null;
            }
            return $z(this.e);
        }
    };

    $p.cls = function(cls1, cls2){
        return $call(this, $cls, cls1, cls2);
    };

    $p.css = function(name, value){
        return $call(this, $css, name, value);
    };

    $p.px = function(name){
        return $cssnum(this.e, name);
    };

    $p.left = function(value){
        return $call(this, $left, value);
    };

    $p.top = function(value){
        return $call(this, $top, value);
    };

    $p.width = function(value){
        return $call(this, $width, value);
    };

    $p.height = function(value){
        return $call(this, $height, value);
    };

    $p.offsetLeft = function(){
        return $offset(this.e).left;
    };

    $p.offsetTop = function(){
        return $offset(this.e).top;
    };

    $p.offsetWidth = function(){
        return this.e.offsetWidth;
    };

    $p.offsetHeight = function(){
        return this.e.offsetHeight;
    };

    $p.opacity = function(opacity){
        return $call(this, $opacity, opacity);
    };

    $p.show = function(){
        return $call(this, $show);
    };

    $p.hide = function(){
        return $call(this, $hide);
    };

    $p.each = function(fn){
        $each(this.es, function(e, i){
            fn.call($z(e), i);
        });
        return this;
    };

    $p.contains = function(element){
        return $contains(this.e, element);
    };

    $z.forEach = $each;

    $z.param = $param;

    $z.mix = $mix;

    $z.toJson = function(obj){
        if($win.JSON && JSON.stringify){
            return JSON.stringify(obj);
        }
        return $tojson(obj);
    };

    $z.version = '0.12';

    $z.isArray = $isarray;

    $z.Class = function(prop, source){
        return $Class.extend(prop, source);
    };

    $z.extend = function(name, method){
        var type = typeof name;
        if(type == 'string'){
            $p[name] = method;
        }else if(type == 'object'){
            $each(name, function(method, name){
                $p[name] = method;
            });
        }
    };

    $z.ajax = $ajax;

    $z.post = $post;

    $z.get = $get;

    $z.img = $img;

    $z.js = $js;

    $z.style = $style;

    $z.tirm = $tirm;

    $z.parseJson = function(str){
        if($win.JSON && JSON.parse){
            return JSON.parse(str);
        }
        return $parsejson(str);
    };

    $z.encodeURL = $encodeurl;

    $z.encodeHTML = $encodehtml;

    $z.decodeHTML = $decodehtml;

    $z.rstr = $rstr;

    $z.scrollTop = $scrollTop;

    $p.anim = function(attrs, option){
        $each(this.es || [this.e], function(elem, i){
            var animId = elem.__ANIMID__;
            if(!animId){
                animId = elem.__ANIMID__ = ++$guid
            }else{
                $AnimHook[animId].stop();
            }
            $AnimHook[animId] = $Anim(elem, attrs, option);
        });
        return this;
    };

    $p.drag = function(option){
        if(!this.e.__DRAGID__){
            $DragHook[this.e.__DRAGID__ = ++$guid] = $Drag(this.e, option || {});
        }
        return $DragHook[this.e.__DRAGID__];
    };

    $z.easyAnim = function(cssAttr, callback){
        $anim(this.e, cssAttr, callback);
    };

    $z.log = $log;

    return $z;
}();