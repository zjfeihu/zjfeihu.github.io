/**
** ��չmarkdown�﷨
**
**
**
**/
/*
code.js //����

.

code.css

.
code.html 

.
code.text

.
����
code.html[edit=off]
    <div>
        <span>test</span>
    </div>
.
    ת��
<textarea class="lang-html" edit=off>
    <div>
        <span>test</span>
    </div>
</textarea>
    
glink[keyword] //Google����
rlink[keyword]href //ת�ص�ַ
mlink[keyword]href //�Ƽ��Ķ�
xlink[keyword]href //վ��
olink[keyword]href //����

���磺
    mlink[һ��ie6��bug]href
    
    ת��
    <a class="mlink" href="href" target="_blank">һ��ie6��bug</a>

rimg[title]href //class��Ϊrimg
zimg[title]href //class��Ϊzimg
ximg[title]href //class��Ϊximg
img[title]href alt

���磺
    zimg[һ����ͼ]11234.jpg
    
    ת��
    <p class="zimg">
        <img src="11234.jpg"/>
        <em>һ����ͼ</em>
    </p>

xinfo //�������ѣ��м��һ��ֻ��дһ��
rinfo //��Ҫ����

���磺
    xinfo �ַ�����˵�ĺð�
    
    ת��
    <p class="xinfo">
    �ַ�����˵�ĺð�
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
        
        glink: '�ȸ�����',
        glink: '�ٶ�����',
        rlink: '������Դ',
        mlink: '��չ�Ķ�',
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
						if(code_attr == 'off'){ //��дģʽ
							code_attr = 'edit=off';
						}
						if(code_lang == 'html2' || code_lang == 'js2'){ //����ģʽ��Ϊ�Ǳ༭ģʽ
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