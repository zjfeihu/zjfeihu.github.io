// hl.js v2.01 js语法高亮组件
// zjfeihu@126.com
// http://zjs.gitcafe.io/doc/
 
Zwhl = function(){
    
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

    
}();
