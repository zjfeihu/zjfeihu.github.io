
Zwhl = function(Z){
    
    var
    reg_js,
    reg_html,
    reg_css,
    config_skin, //皮肤名称
    config_edit, //是否可编辑
    isready, //是否初始化
    contextmenu, 
    execute; //运行代码
    
    Z.ready(init);
    
    return{
        
        config: function(option){
            option.skin && (config_skin = option.skin);
            option.skin && (config_edit = option.edit);
        },
        
        output: output
        
    };
    
    function init(){
        
        var codes = getCodebox();
        if(codes){
            doInit();
            doHighlight(codes);
        }
        
        function getCodebox(){
            var textarea = Z('textarea');
            if(textarea){
                return textarea.filter(function(){
                   return /^code-(js|html|css)$/.test(this.cls()); 
                });
            }
        }

    }
        
    function doInit(){
        
        if(isready){
           return;
        }
        isready = 1;
        
        reg_js = /(?:\$[\w$]+)|(?:\+\+|--)|(?:([-+*^{[(~:=?,!|]|\/\s+)|([<>&])|(typeof|void|return|in|throw|case))(?:(\s+)|(\s*(?:\/\*(?:[\w\W](?!\*\/))*?\*\/|\/\/.+\n+)\s*))?(\/(?![\*\/])(?:\\\\|\\\/|\\\[|\[.+?\]|[^\/\r\n])+\/[gim]*)|(boolean|break|byte|case|catch|char|class|const|continue|default|double|do|else|extends|false|finally|final|float|for|function|goto|if|implements|import|instanceof|interface|int|in|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|typeof|this|throw|throws|transient|true|try|var|void|while|with)(?![\w$])|(?:[a-zA-Z_][\w]*)|(0x[0-9a-fA-F]+|(?:\d+\.\d*|\d*\.\d+|\d+)(?:[eE][+\-]?\d+)?)|('(?:\\\\|\\\'|[^']|\\\n)*'|"(?:\\\\|\\\"|[^"]|\\\n)*")|(\/\*[\w\W]*?\*\/|\/\/.*)|([<>&\s]+?)/g;
        reg_html = /<(script|style|textarea)((?:"[^"]*"|'[^']*'|[^>]+)*)>([\s\S]*?)<\/\1>|<\/(\w+)>|(?:<(\w+)((?:(?:"[^"]*"|'[^']*'|[^>])+)*)>)|(<!--[\s\S]*?-->)|(<!doctype[^>]*?>)|(\n+)|(<|[>& ]+)/gi;
        config_skin = config_skin || 'default';
        config_edit = config_edit || 'on';
        
        initStyle();
        initContextmenu();
        initExecute();
        
        function initStyle(){
            Z.style('.hl-view{margin:12px 0;}.hl-view .code{display:none;}.hl-view ol{    font:14px/2 monaco,"Courier New",verdana,Helvetica,Tahoma,Arial,sans-serif;    word-wrap:break-word;    word-break:break-all;    dis_display:inline-block\\9;    margin:0;    padding-left:4em;}.hl-view li{line-height:1.8;padding-left: 6px;}.hl-edit .view-default {display:none}.view-default ol{background:#eee;color:#333;border-radius:8px;border:1px solid #3C78B5;}.view-default li{line-height:1.8;border-left:1px dotted #3C78B5;padding-left: 6px;}.view-default .tag{color:#0000C6}.view-default .attrval{color:#666666}.view-default .attrkey{color:#FF0000}.view-default .doctype{color:#008074}.view-default .keyword{color:#0000C6}.view-default .comment{color:#B0812C}.view-default .quote{color:#666666}.view-default .number{color:#FF0000}.view-default .regexp{color:#008074}.view-default .csssel{color:#008074}.view-default .csskey{color:#FF0000}.view-default .cssval{color:#666666}.hl-edit .view-black {display:none}.view-black ol{background:#060606;color:#eee;border:1px solid #060606;}.view-black li{background:#222;border-left:1px solid #333;}.view-black .tag{color:#119BEE}.view-black .attrval{color:#888}.view-black .attrkey{color:#89D726}.view-black .doctype{color:#89D726}.view-black .keyword{color:#FE81F8}.view-black .comment{color:#119BEE}.view-black .quote{color:#89D726}.view-black .number{color:#86CC99}.view-black .regexp{color:#B7B700}.view-black .csssel{color:#FE81F8}.view-black .csskey{color:#119BEE}.view-black .cssval{color:#89D726}.hl-edit .view-bop {display:none}.view-bop ol{background:#060606;color:#eee;border:1px solid #060606;}.view-bop li{background:#222;border-left:1px solid #333;}.view-bop .tag{color:#efac32}.view-bop .attrval{color:#d9d762}.view-bop .attrkey{color:#6c99bb}.view-bop .doctype{color:#efac32}.view-bop .keyword{color:#ef5d32}.view-bop .comment{color:#777777}.view-bop .quote{color:#d9d762}.view-bop .number{color:#6c99bb}.view-bop .regexp{color:#8856d2}.view-bop .csssel{color:#efac32}.view-bop .csskey{color:#c0c0c0}.view-bop .cssval{color:#d9d762}.hl-edit{border:1px solid #999;background:#eee;margin:12px 0;}.hl-edit .view-html,.hl-edit .view-css,.hl-edit .view-js{display:none;}.hl-edit .code{overflow:hidden;margin:3px;padding:3px;border:1px solid #999;background:#fff;font-size:12px;}.hl-edit .code textarea{    font:12px/1.6 monaco,"Courier New",verdana,Helvetica,Tahoma,Arial,sans-serif;    border:0;    min-height:240px;    _height:240px;    display:block;    width:100%;    resize:none;    outline:none;}.hl-edit .code div{border-top:1px solid #999;padding-top:3px;}.hl-edit .code div span{color:green;}.hl-menu{position:absolute;background:#FFFFFF;border:1px solid #999;font-size:12px;top:0;left:-999px;padding:1px;width:100px;}.hl-menu a{display:block;padding:3px 12px;color:#333;text-decoration:none!important;}.hl-menu a:hover{background:#316AC5;color:#fff;}.hl-exec{z-index:9999;display:none;position:fixed;left:0;top:0;width:100%;height:400px;background:#fff;}.hl-exec .close{margin:3px auto;width:400px;padding:8px;font-size:12px;font-weight:bold;cursor:pointer;text-align:center;background:#fefefe;border:1px solid #999;color:#FF0000;}.hl-exec .close:hover{background:#feefff;}.hl-exec iframe{border-top:1px solid #000}');
        }
        
        function initContextmenu(){
            var
            menubox, //菜单节点引用 
            whichbox, //哪个代码触发的菜单
            end;
            
            Z(document).on('contextmenu', function(e){
                
                var hlbox = Z(e.target).parent('.hl-view');
                if(hlbox && hlbox.attr('edit') != 'off'){
                    e.preventDefault();
                    whichbox = hlbox;
                    menubox.css({top: e.clientY + Z.scrollTop() + 4, left: e.clientX + 4});
                }
                
            });
            
            Z('body').append(menubox = Z.E(
                '<div class="hl-menu">\
                    <a href="#" jbtn="edit">编辑代码</a>\
                    <a href="#" jbtn="run">运行代码</a>\
                    <a href="javascript:alert(\'《highlight2.0》\\r\\nEmail：zjfeihu#126.com\');void 0">关于插件</a>\
                </div>'
            ));
            
            menubox.click(function(e){
                
                menubox.left(-200);
                
                switch(Z(e.target).attr('jbtn')){
                    
                    case 'edit':
                    
                        e.preventDefault();
                        whichbox.cls('=hl-edit');
                        Z.scrollTop(whichbox.offsetTop() - 120, 1000);
                        break;
                        
                    case 'run':
                        e.preventDefault();
                        execute(whichbox.attr('lang'), whichbox.find('textarea').val());
                        break;
                        
                    default:
                        return;
                }
                
            }).on('contextmenu', function(e){
                e.preventDefault();
            });
            
            Z(document).click(function(e){
                if(!menubox.contains(e.target)){//点击的不是菜单
                    menubox.left(-200);
                }
            });
            
        }
        
        function initExecute(){
            
            var 
            winbox,
            iframe,
            scrollTop,
            isshow = 0,
            de = document.documentElement;
        
            Z('body').append(winbox = Z.E('<div class="hl-exec"><div class="close">点击关闭</div></div>'));
        
            Z.isie6 && winbox.css('position:absolute');
            
            execute = function(lang, code){
                
                iframe && iframe.remove();
                winbox.append(iframe = Z.E('<iframe name="hl_exec" frameborder="0" width="100%"></iframe>'));
                
                if(lang == 'js'){
                    code = '<script>!function(){'+ code +'\n}()</script>';
                }else{
                    
                    isshow = 1;
                    Z('html').css('overflow','hidden');
                    resizebox();
                    scrollTop = Math.max(de.scrollTop, document.body.scrollTop);
                    Z.isie6 && winbox.css('top', scrollTop);
                    winbox.show();
                    
                }
                
                var doc = window.open('', 'hl_exec');
                
                if(lang == 'html' && Z.browser.ie < 9 && importjs()){ //修正document.write执行顺序问题
                    var scripts = [];
                    code = code.replace(/<textarea[^>]*>[\w\W]*?<\/textarea>|(<script([^>]*)>([\w\W]*?)<\/script>)/g, function(match, jstag, attr, text){
                        
                        if(jstag){
                            var script = {};
                            if(attr){
                                
                                attr.replace(/src\s*=\s*"([^"]+)"|charset\s*=\s*"([^"]+)"/g, function(match, src, charset){
                                    if(src){
                                        script.src = src;
                                    }else{
                                        script.charset = charset;
                                    }
                                });
                                
                                if(script.src){
                                    scripts.push(script);
                                }else{
                                    scripts.push({
                                        text: text
                                    });
                                }
                                
                            }else{
                                
                                scripts.push({
                                    text: text
                                });
                                
                            }
                            
                            return '';
                            
                        }else{
                            return match;
                        }
                    });
                    
                    doc.document.write(code);
                    doc.document.write(Z.rstr(
                        '<script>!function(scripts){  {%0}  }({%1})</script>',
                        'var tr = setInterval(function(){        if(document.body){        clearInterval(tr);        execScript(scripts);    }    }, 16);function execScript(scripts){        var script = scripts.shift();        if(!script){        return;    }    if(script.src){        loadScript(script.src, function(){            execScript(scripts);          }, script.charset);    }else{        writeScript(script.text);        execScript(scripts);    }}function loadScript(src, callback, charset){    var script = document.createElement(\'script\');        charset && (script.charset = charset);    script.src = src;    script.onreadystatechange = function(){        /loaded|complete/.test(script.readyState) && done();    };        document.body.appendChild(script);        function done(){        callback && callback();        document.body.removeChild(script);    }    }function writeScript(text){    var script = document.createElement(\'script\');    script.type = \'text/javascript\';    script.text = text;    document.body.appendChild(script);}',
                        Z.toJson(scripts)
                    ));
                    
                }else{
                    doc.document.write(code);
                }
                
                doc.document.close();
                
                function importjs(){ //判断代码中是否包含外链的js
                    var has = 0;
                    code.replace(/<textarea[^>]*>[\w\W]*?<\/textarea>|(<script([^>]*)>([\w\W]*?)<\/script>)/g, function(match, jstag, attr){
                        if(attr && /src\s*=\s*/.test(attr)){
                            has = 1;
                        }
                    });
                    return has;
                }
                
            };
        
            Z(window).on('resize', resizebox);
            
            winbox.child(0).click(function(){
                
                Z('html').css('overflow', '');
                de.scrollTop = document.body.scrollTop = scrollTop;
                winbox.hide();
                iframe.remove();
                iframe = null;
                isshow = 0;
                
            });
        
            function resizebox(){
                if(isshow){
                    winbox.css({
                        width: de.clientWidth,
                        height: de.clientHeight
                    });
                    iframe.height(de.clientHeight - 40);
                }
            }
            
        }
        
    }
    
    function doHighlight(codes){
        codes.each(function(){
            var 
            lang = this.cls().match(/code-(js|html|css)/)[1],
            skin = this.attr('skin') || config_skin,
            edit = this.attr('edit') || config_edit,
            option = {edit: edit, skin: skin},
            value = function(code){ //清除代码前置空白
            
                var sChar = Array(8).join('    ');
                
                code = code
                    .replace(/\t/g,'    ')
                    .replace(/\s+$/, '');
                    
                if(!/^\S/m.test(code)){
                    
                    code.replace(/^\s+/gm, function(bChar){
                        sChar = bChar.length < sChar.length ? bChar : sChar;
                        return bChar;
                    });
                    
                    code = code.replace(RegExp('^'+ sChar, 'gm'), '');
                    
                }
                
                return code;
                
            }(this.e.value);
           
            if(lang == 'css'){
                option.edit = edit = 'off';
            }
            
            if(edit == 'off'){
                this.replace(output(lang, value, option));
            }else{
                
                var 
                rootElem = Z.E(output(lang, value, option))
                    .attr('title', '点击右键运行代码')
                    .attr('lang', lang)
                    .append(
                        Z.rstr(
                            '<div class="code">\
                                <textarea>{%0}</textarea>\
                                <div>\
                                    <button>加亮代码</button>\
                                    <button>执行代码</button>\
                                    <span> 提示：你可以先修改代码再执行操作！</span>\
                                </div>\
                            </div>',
                            value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
                        )
                    ); //添加源代码编辑域和操作按钮

                this.replace(rootElem);
                
                rootElem.find('button').click(function(){
                    
                    if(this.html() == '执行代码'){
                        execute(lang, rootElem.find('textarea').val());
                    }else if(this.html() == '加亮代码'){
                        rootElem.cls('=hl-view').find('ol').replace(
                            (lang == 'js' ? parseJs : parseHtml)(
                                rootElem.find('textarea').val()
                            )
                        );   
                    }
                    
                });
                
            }
        });
    }
        
    function output(lang, code, option){
        
        doInit();
        option = option || {};
        
        return Z.rstr(
            '<div class="hl-view" edit="{%0}">\
                <div class="view-{%1}">{%2}</div>\
            </div>',
            option.edit || config_edit,
            option.skin || config_skin,
            (lang == 'js' ? parseJs : lang == 'html' ? parseHtml : parseCss)(code)
                .replace(/<li><\/li>/g, '<li>&nbsp;</li>') //修正无行标的情况下不显示空白行
        );
        
    }
    
    //{parse
    function parseJs(code){
        return '<ol><li>'
        + code
            .replace(/\r/g, '')
            .replace(/\t/g, '    ')
            .replace(reg_js, function($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11){
                switch(!1){
                    case !$6:
                        return ($1||'') + encodeHtml($2) 
                            + '<span class="keyword">'+ ($3||'') +'</span>' 
                            + ($4||'').replace(/\n/g, '</li><li>').replace(/\s/g, '&nbsp;')
                            + '<span class="comment">'+ encodeHtml($5).replace(/\n/g, '</span></li>'
                            + '<li><span class="comment">') +'</span>'
                            + '<span class="regexp">'+ encodeHtml($6) +'</span>';
                    case !$7:
                        return '<span class="keyword">'+ $7 +'</span>';
                    case !$8:
                        return '<span class="number">'+ $8 +'</span>';
                    case !$9:
                        return '<span class="quote">'
                        + encodeHtml($9).replace(/\n/g,'</span></li><li><span class="quote">') 
                        + '</span>';
                    case !$10:
                        return '<span class="comment">'+ encodeHtml($10).replace(/\n/g,'</span></li><li><span class="comment">') +'</span>';
                    case !$11:
                        return encodeHtml($11).replace(/\n/g,'</li><li>');
                }
                return $0;
            })
        + '</li></ol>';
    }
    
    function parseHtml(code){
        return '<ol><li>'
            + code
                .replace(/\r/g, '')
                .replace(/\t/g,'    ')
                .replace(reg_html, function($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11){
           
                    switch(!1){
                        case !$1:
                            if($1 == 'script'){
                                $3 = parseJs($3).replace(/<ol><li>|<\/li><\/ol>/g, '');
                            }else if($1 == 'style'){
                                $3 = parseCss($3).replace(/<ol><li>|<\/li><\/ol>/g, '');
                            }else{
                                $3 = encodeHtml($3).replace(/\n/g,'</li><li>');;
                            }
                            return '<span class="tag">&lt;' + $1 + encodeAttr($2) + '&gt;</span>' + $3 + '<span class="tag">&lt;/' + $1 + '&gt;</span>';
                        case !$4:
                            return '<span class="tag">&lt;/'+ $4 +'&gt;</span>';
                        case !$5: 
                            return  '<span class="tag">&lt;' + $5 + encodeAttr($6) + '&gt;</span>';
                        case !$7:
                            return  '<span class="comment">'+ encodeHtml($7).replace(/\n/g, '</span></li><li><span class="comment">') +'</span>';
                        case !$8:
                            return  '<span class="doctype">'+ encodeHtml($8) +'</span>';
                        case !$9:
                            return $9.replace(/\n/g,'</li><li>');
                        case !$10:
                            return encodeHtml($10);
                            
                    }
            return $0;
        }) +'</li></ol>';
    }
    
    function parseCss(code){
        return '<ol><li>'
            + code
                .replace(/\r/g, '')
                .replace(/\t/g,'    ')
                .replace(/(\{[^\}]*\})|(\/\*[\w\W]*?\*\/)|(\n)|([^\n\{\}]+)/g, function(_, cssText, comment, newline, selector, tab){
                    switch(!1){
                        case !cssText:
                        return _.replace(/([^{\n;]+?:[^}\n;]+)|(\n)|(\/\*[\w\W]*?\*\/)|( )/g, function(_, keyval, newline, comment, space){
                            switch(!1){
                                case !keyval:
                                var key = keyval.split(':')[0],
                                val = keyval.replace(/[^:]+:/,'');
                                return '<span class="csskey">'+ encodeHtml(key) +'</span>:<span class="cssval">'+ val +'</span>';
                                case !newline: return '</li><li>';
                                case !comment: return '<span class="comment">'+ encodeHtml(comment) +'</span>';
                                case !space: return '&nbsp;';
                            }
                            
                        });
                        case !comment: return '<span class="comment">'+ encodeHtml(comment) +'</span>';
                        case !newline: return '</li><li>';
                        case !selector: return selector.replace(/(\/\*[\w\W]*?\*\/)|( )|(\t)|([^{]+)/g, function(_, comment, space, tab, sel){
                            if(comment){
                                return '<span class="comment">'+ encodeHtml(comment) +'</span>';
                            }else if(space){
                                return '&nbsp;';
                            }else if(tab){
                                return '&nbsp;&nbsp;&nbsp;&nbsp;';
                            }else if(sel){
                                return '<span class="csssel">'+ sel +'</span>';
                            }
                            
                        });
                    }
                }) +'</li></ol>';
    }
    
    function encodeHtml(htmlstr){
        return htmlstr ? htmlstr
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/ /g, '&nbsp;') : '';
    }
    
    function encodeAttr(attrstr){
        return attrstr ? attrstr
            .replace(/([-\w]+\s*=\s*)('[^']*'|"[^"]*"|[^\s'"]*)/g, function(_, key, val){
                return '<span class="attrkey">'+ key +'</span><span class="attrval">'+ encodeHtml(val) +'</span>';
            }) : '';
        
    }
    
    //}

    
}(function(){

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
    }();

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

    function $tirm(str){
        return str.replace(/^\s+|\s+$/g, '');
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

    $z.ready = function(fn){
        $ready(fn);
    };

    $z.style = $style;

    $z.E = function(html){
        return $z($element(html));
    };

    $z.scrollTop = $scrollTop;

    $z.isie6 = $isie6;

    $z.rstr = $rstr;

    $z.browser = $browser;

    $z.toJson = function(obj){
        if($win.JSON && JSON.stringify){
            return JSON.stringify(obj);
        }
        return $tojson(obj);
    };

    $p.append = function(element, index){
        return $call(this, $append, element, index);
    };

    $p.left = function(value){
        return $call(this, $left, value);
    };

    $p.css = function(name, value){
        return $call(this, $css, name, value);
    };

    $p.height = function(value){
        return $call(this, $height, value);
    };

    $p.top = function(value){
        return $call(this, $top, value);
    };

    $p.offsetTop = function(){
        return $offset(this.e).top;
    };

    $p.click = function(fn, context){
        return $eachcall(this, $bind, 'click', fn, context);
    };

    $p.on = function(type, fn, context){
        return $eachcall(this, $bind, type, fn, context);
    };

    $p.attr = function(name, value){
        return $call(this, $attr, name, value);
    };

    $p.cls = function(cls1, cls2){
        return $call(this, $cls, cls1, cls2);
    };

    $p.find = function(expression){
        return $z(expression, this.e);
    };

    $p.child = function(n){
        return $z($child(this.e, n));
    };

    $p.each = function(fn){
        $each(this.es, function(e, i){
            fn.call($z(e), i);
        });
        return this;
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

    $p.val = function(value){
        return $call(this, $val, value);
    };

    $p.contains = function(element){
        return $contains(this.e, element);
    };

    $p.replace = function(element){
        return $z($replace(this.e, element));
    };

    $p.parent = function(expression){
        return $z($parent(this.e, expression));
    };

    $p.html = function(html){
        return $call(this, $html, html);	
    };

    $p.remove = function(){
        return $z($remove(this.e));
    };

    $p.show = function(){
        return $call(this, $show);
    };

    $p.hide = function(){
        return $call(this, $hide);
    };

    return $z;
}());
