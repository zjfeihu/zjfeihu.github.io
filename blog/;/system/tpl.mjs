var 
config = $config,
navhash = $navhash,
WEB_TITLE = config.title;

var navhtml = $rstr('<li><a href="#path{id}.html">{text}</a></li>', $navlist);
var navhtml4list = navhtml.replace(/#path/g, '');
var navhtml4detail = navhtml.replace(/#path/g, '../');
var navhtml4page = navhtml4list;

return{
    list: renderlist,
    detail: renderdetail,
    page: renderpage
}

function renderlist(input){
    
    return render({
        tpl: {
            id: input.id,
            title: WEB_TITLE,
            ptitle: navhash[input.id].text,
            navhtml: navhtml4list,
            breadcrumbs: [{text:navhash[input.id].text}],
            main: 'list.html',
            css: 'style/main.css',
            js: 'style/main.js',
            content: format(input.content)
        }
    });
    
    function format(data){
        /*
            data 是包含item的数组
            item = { //日志信息
                id: id标志
                tt: 标题
                ct: 创建时间
            };
        */
        
        var copydata = [];
        data.forEach(function(el){
            copydata.push({
                id: el.id.match(/\d+/)[0],
                tt: el.tt,
                ct: formatTime(el.ct) //格式化时间显示
            });
        });
        return copydata;
        
        function formatTime(input){
            var date = new Date(input);
            return[
                date.getFullYear(), 
                date.getMonth() + 1, 
                date.getDate()
            ].join('-').replace(/-(\d)(?=-)/g, '-0$1');
        }
        
    }
    
}

function renderdetail(input){
    
    return render({
        tpl: {
            title: input.title,
            ptitle: input.title,
            navhtml: navhtml4detail,
            breadcrumbs: [{href:'../'+input.category, text:navhash[input.category].text}, {text:input.title}],
            css: '../style/main.css',
            js: '../style/main.js',
            main: 'detail.html',
            content: zipHtml(
                $require('showdown.mjs')(
                    $require('extendmd.mjs')(input.content)
                )
            )
        }
    });
    
    function zipHtml(text){ //压缩html，去除多余空格
        if(typeof text !='string'){
            system.console.alert(text);
        }
        
        return text.replace(/(<(textarea|pre)[^>]*>[\w\W]+?<\/\2>)|(\n+)|(\s{2,})|<script>([\w\W]+?)<\/script>/g, function(match, textcode, codetag, newline, space, jscode){
            if(newline)return '';
            if(space)return ' ';
            if(jscode){
                return match;
                //return '<script>' + Packer.pack(jscode) + '</script>';
            }
            return match;
        });
    }
    
}

function renderpage(input){
    return render({
        tpl: {
            title: navhash[input.id].text,
            navhtml: navhtml4page,
            breadcrumbs: [{text:navhash[input.id].text}],
            main: 'page.'+input.id+'.html',
            css: 'style/main.css',
            js: 'style/main.js'
        }
    });    
    
}

function render(input){
    $tpl = input.tpl;
    return $zero('../user/tpl/layout.html');
}