
var cache;
var newcache;
var datapath = $mappath('../user/md/');
var cachepath = $mappath('../cache/list.json');
var data_ischange = false;
var fu = $require('fu.mjs');
var data = {list:{}, detail:{}, page:[], style:[]};
if($GET.rebuild){
    fu.nocache();
}
module.exports = {
    
    foreach: foreach,
    
    checkout: checkout,
    
    query: function query(type, sel){
        return data[type][sel];
    },
    
    commit: function(){
        if(data_ischange){
            $output(cachepath, JSON.stringify(newcache));
        }
        fu.commit();
    }
    
};

function foreach(type, callback){
    
    var arr = [];
    if(type == 'detail'){
        
        $each(data.detail, function(el){
            if(el != -1){ //清除被删除的
                arr.push(el);
            }
        });
        
    }else if(type == 'list'){
        
        $each(data.list, function(el, id){
            if(id != '*'){
                arr.push({
                    id: id,
                    content: el
                });
            }
        });
        
    }else{
        
        arr = data[type];
    
    }
    
    arr.forEach(callback);
    
}

function checkout(){
    
    var rebuild = {};
    
    loadcache();
    checkout_file();
    checkout_detail();
    checkout_list();
    checkout_page();
    checkout_style();
    
    function loadcache(){
        if(fs.exists(cachepath)){
            cache = JSON.parse($input(cachepath));
        }else{
            cache = {};
        }
    }
    
    function checkout_file(){
        $each($config.checkout, function(type, path){
            path += '../';
            if(fu.ischange(path)){
                if(type == '*'){
                    rebuild = {list:1, detail:1, page:1};
                    return 1;
                }else{
                    type.split(' ').forEach(function(type){
                        rebuild[type] = 1;
                    });
                }
            }
        });
    }
    
    function checkout_detail(){
        
        var mds = {};
        var data_detail = data.detail = {};
        
        fs.foreach(datapath, function(fi){
            var id = fi.name.match(/(\d+\.\d+)\.md$/);
            if(id){
                id = id[1];
                mds[id] = 1;
                if(!cache[id] || rebuild.detail || cache[id].lm != +fi.DateLastModified){
                    data_detail[id] = parse_md(id); //新增或者已修改
                }
            }
        });
        
        $each(cache, function(el, id){
            if(!mds[id]){
                data_detail[id] = -1; //被删除
            }
        });

        function parse_md(id){
            var path = datapath + id + '.md';
            var data = {id:id, category:id.match(/(\w+)$/)[1]};
            if(!$navhash[data.category]){
                return system.error('data.mjs.parse_md', '日志类型不存在，文件：'+id+'.md');
            }
            
            //title ,tag1,tag2,...
            /////createtime
            //content.begin
            //...
            //content.end
            data.content = $input(path).replace(/([^\n\r]+)\s+(?:,(\S+))?/, function(all, title, tags){ //获取标题
                data.title = (title.indexOf('@') == 0 ? title.substr(1)+'（转）' : title).replace(/</g, '&lt;'); //标题
                data.tags = tags ? tags.split(',') : []; //标签数据
                return '';
            });
            
            data.createtime = +fs.info(path).DateCreated;
            data.lm = +fs.info(path).DateLastModified;
            
            return data;
            
        }
    }
    
    function checkout_list(){
        
        var category = {};
        var data_list = data.list = {};
        
        newcache = {};
        $each(cache, function(el, id){
            if(!data.detail[id]){ //未修改的，直接拷贝
                newcache[id] = cache[id];
            }
        });
        
        $each(data.detail, function(el, id){
            category[id.match(/(\w+)$/)[1]] = 1;
            if(el != -1){ //已经修改的，更新
                newcache[id] = {
                    id: id,
                    tt: el.title,
                    lm: el.lm,
                    ct: el.createtime
                };
                data_ischange = true;
            }
        });
        
        if(rebuild.list){
            $config.list.forEach(function(el){
                data_list[el.id] = 1;
            });
        }else{
            $each(category, function(m, id){
                data_list[id] = 1;
            });
        }
        
        data.list = parse_list(data_list);
        
        function parse_list(list){
            
            var rst = {'*':[]};
            
            $each(list, function(el, id){
               rst[id] = [];
            });
            
            $each(newcache, function(el, id){
                id = id.match(/(\d+)$/)[1]
                if(list[id]){
                    rst[id].push(el);
                }
                rst['*'].push(el);
            });
            
            $each(rst, function(el, id){
                rst[id] = el.sort(function(a, b){
                    return a.ct < b.ct ? 1 : -1;
                }).sort(function(a, b){
                    return +a.id.split('.')[0] < +b.id.split('.')[0] ? 1 : -1;
                });
            });
            
            return rst;
        }
    }
    
    function checkout_page(){
        var arr = [];
        $config.page.forEach(function(el){
            if(rebuild.page || fu.ischange('../user/tpl/page.'+el.id+'.html')){
                arr.push(el.id);
            }
        });
        data.page = arr;
    }
    
    function checkout_style(){
        var arr = [];
        fs.foreach($mappath('../user/style'), function(fi){
            var path = $mappath(fi.path);
            if(fu.ischange(path)){
                arr.push({name:fi.name, path:path});
            }else if(/\.tjs$/.test(fi.name)){ //需要分析导入的模块
                fu(zero.deps(path), function(){
                   arr.push({name:fi.name, path:path});
                });
            }
        }, true);
        data.style = arr;
    }

}