
$config = thash.parse($input('../user/config.thash'));

$navlist = $config.page.concat($config.list).sort(function(a, b){
    return +a.i > +b.i ? 1 : -1;
});

$navhash = function(){
    var hash = {};
    $navlist.forEach(function(el){
        hash[el.id] = el;
    });
    return hash;
}();

var index_ischange = 0;
var data = $require('data.mjs');
var tpl = $require('tpl.mjs');

data.checkout();

data.foreach('list', function(el){
    outputHtml('/' + el.id, tpl.list({
        id: el.id,
        content: el.content
    }));
    index_ischange = 1;
});

fs.makedir($mappath('/p/'));
data.foreach('detail', function(el){
    outputHtml('/p/' + el.id.match(/\w+/)[0], tpl.detail({
        title: el.title,
        category: el.category,
        content: el.content
    }));
});

data.foreach('page', function(id){
    if(id == 'index'){
        index_ischange = 1;
        return;
    }
    outputHtml('/' + id, tpl.page({
        id: id
    }));
});

if(index_ischange){
    outputHtml('/index', tpl.list({
        id: 'index',
        content: data.query('list', '*')
    }));
}

data.foreach('style', function(el){
    fs.makedir($mappath('/style/'));
    var target_path = el.path.replace(';/user/', '');
    if(/\.tjs$/.test(el.name)){
        fs.writetext(target_path.replace(/\.tjs$/, '.js'), packer.pack($zero(el.path)));
    }else if(/\.js$/.test(el.name)){
        fs.copy(el.path, target_path);
    }else{
        fs.copy(el.path, target_path);
    }
});

function outputHtml(path, text){
    $output($mappath(path + '.html'), text);
}

data.commit();

viewHtml($GET.viewid);

function viewHtml(viewid){
    
    if(!fs.isfile($mappath('../../'+viewid+'.html'))){
        viewid = 'index';
    }
    
    var level = viewid.split('/').length;
    response.write(
        fs.readtext($mappath('../../'+viewid+'.html'))
        .replace('href=style/main.css', 'href=/style/main.css')
        .replace('src=style/main.js', 'src=/style/main.js')
        .replace(/href="[^"]+"/g, function(match){
            for(var i = 0; i < level; i++){
                match = match.replace('../', '');
            }
            return match;
        })
        .replace(/href="(?!https?:\/\/)([^"]+)\.html"/g, 'href="?viewid=$1"')
    );
    
}
