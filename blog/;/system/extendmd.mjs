/**
** 扩展markdown语法
**
**
**
**/
/*
code.js //代码

.

code.css

.
code.html 

.
code.text

.
例如
code.html[edit=off]
    <div>
        <span>test</span>
    </div>
.
    转成
<textarea class="lang-html" edit=off>
    <div>
        <span>test</span>
    </div>
</textarea>
    
glink[keyword] //Google搜索
rlink[keyword]href //转载地址
mlink[keyword]href //推荐阅读
xlink[keyword]href //站内
olink[keyword]href //外链

例如：
    mlink[一个ie6的bug]href
    
    转成
    <a class="mlink" href="href" target="_blank">一个ie6的bug</a>

rimg[title]href //class名为rimg
zimg[title]href //class名为zimg
ximg[title]href //class名为ximg
img[title]href alt

例如：
    zimg[一张靓图]11234.jpg
    
    转成
    <p class="zimg">
        <img src="11234.jpg"/>
        <em>一张靓图</em>
    </p>

xinfo //常规提醒，中间空一格只能写一行
rinfo //重要提醒

例如：
    xinfo 字符串解说的好啊
    
    转成
    <p class="xinfo">
    字符串解说的好啊
    </p>
*/

module.exports = function(){
    var reg = function(reg){
        var retStr = [];
        for(var i = 0; i < reg.length; i++){
            retStr.push(reg[i].source);
        }
        return new RegExp(retStr.join('|'), 'gm');
    }([
        //code:
        /(?:^code\.(html(?:2)?|js(?:2)?|text|css)(?:\[(.+)\])?$([\w\W]+?)(?:^\.$))/, //code_lang, code_attr, code_content
        //link:
        /(?:^([grmxo]link)(?:\[([^\]]+)\])(.+)$)/, //link_type, link_keyword, link_href
        //img:
        /(?:^([rxz]?img)(?:\[([^\]]*)\])(.+)$)/, //img_type, img_keyword, img_href
        //info:
        /(?:^([xr]?info)\s(.+)$)/, //info_type, info_content
        //dot:
        /(?:^(\.+)$)/ //dots
    ]);
    
    //var codeRegexp = /(?:^code\.(html|js|text|css)$([\w\W]+?)(?:^\.$))/;
    //var linkRegexp = //
    //console.info(reg.source);
    var linkText = {
        
        glink: '谷歌搜索',
        glink: '百度搜索',
        rlink: '文章来源',
        mlink: '扩展阅读',
        xlink: '',
		olink: ''
    }; 
    return function(text){
        return text.replace(reg, function(match, code_lang, code_attr, code_content, link_type, link_keyword, link_href, img_type, img_keyword, img_src, info_type, info_content, dots){
            switch(!1){
                case !code_lang:
                    if(code_lang == 'text'){
                        return '<pre class="xcode">'+ code_content.replace(/</g, '&lt;').replace(/>/g, '&gt;') +'</pre>';
                    }else{
						if(code_attr == 'off'){ //缩写模式
							code_attr = 'edit=off';
						}
						if(code_lang == 'html2' || code_lang == 'js2'){ //这种模式下为非编辑模式
							code_lang = code_lang.slice(0, -1);
							code_attr = 'edit=off';
						}
                        code_attr = code_attr ? (' '+ code_attr +' ') : '';
                        return '<textarea class="code-'+ code_lang +'"'+ code_attr +'>'+ code_content.replace(/&/g, '&amp;') +'</textarea>';
                    }
                case !link_type:
                    if(link_type == 'glink'){
                        link_href = 'https://www.google.com/search?q='+ link_keyword +'';
                        link_href = 'http://www.baidu.com/s?wd='+ link_keyword;
                        
                    }
                    return linkText[link_type] +'<a class="'+ link_type +'" href="'+ link_href +'"'+ (link_type == 'xlink' ? '' : ' target="_blank"') +'>'+ link_keyword +'</a>'+(link_type == 'olink' ? '' : '<br/>');
                case !img_type:
                    return '<p class="'+ img_type +'"><img src="'+(/http:\/\//.test(img_src)?img_src:'../imgs/'+img_src)  +'"/>'+ (img_keyword ? '<em>'+ img_keyword +'</em>' : '') +'\n</p>';
                case !info_type:
                    return '<p class="'+ info_type +'">'+ info_content +'\n</p>';
                case !dots:
                    return dots.replace(/./g, '<br/>');
            }
        });
    };
    
}();