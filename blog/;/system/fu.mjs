//文件更新管理
var cachepath = $mappath('fu.cache');
var cachedata = loadcache();
var checklist = {};

system.utils.mix(fu, {
	ischange: ischange,
	nocache: function(){
		cachedata = {};
	},
	commit: savecache
});

return fu;

function fu(checklist, callback){
	
    if(typeof checklist == 'string'){
        checklist = checklist.replace(/\s+/g, '').replace(/^,+|,+(?=,|$)/g, '').split(',');
    }
	
    var haschange = 0; 
    checklist.forEach(function(path){
        if(ischange(path)){
            haschange = 1;
        }
    });
	
    if(haschange){
        callback();
    }
	
}

function loadcache(){
	
    if(!fs.isfile(cachepath)){
        return {};
    }else{
        return format($input(cachepath));
    }
	
    function format(text){ //将key转化成路径模式
        var data = {};
        text.split('\n').forEach(function(line){
            line = line.split(' => ');
            if(line.length > 1){
                data[line[0].replace('#', $ROOTPATH)] = line[1];
            }
        });
        return data;
    }
	
}

function savecache(){
	
    var cacheforsave = copycache();
    for(var key in checklist){
        if(checklist[key]){
            cacheforsave[key] = checklist[key];
        }
    }
    
    $output(cachepath, format(cacheforsave));
    
    function copycache(){
        var obj = {};
        for(var key in cachedata){
            obj[key] = cachedata[key];
        }
        return obj;
    }
    
    function format(obj){ //将key的路径模式翻转化为#
        var arr = [];
        for(var key in obj){
            arr.push(key.replace($ROOTPATH, '#')+' => '+obj[key]);
        }
        return arr.join('\n');
    }
	
}

function ischange(path){
	
    if(!/:/.test(path)){
        path = $mappath(path);
    }else{
        path = fs.path(path);
    }
    
    if(!fs.isfile(path)){ //文件被删除
        if(cachedata[path] == -1){
            return 0;
        }else{
            return checklist[path] = -1;
        }
    }
	
    if(path in checklist){
        return checklist[path];
    }
	
    var lm = fs.info(path).DateLastModified / 1000;
    if(cachedata[path] != lm){
        return checklist[path] = lm;
    }else{
        return checklist[path] = 0;
    }
    
}
