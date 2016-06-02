define(function(module){
    /*
    数据模块
    #exports
        Data.init(resolve)              初始化
        Data.loadApp(id, ver, ready)    加载App数据
        Data.getApp(id, key)            获取App数据指定的属性
    */
    
    module.exports = Data = {};  
    
    var Data;
    var apps = {};
    
    Z.mix(Data, {
        
        init: function(resolve){ //Data.init
        
            Z.get('data/config.json', function(resp){
                if(resp){
                    
                    Data.CONFIG = Z.parseJson(resp);
                    
                    Z.forEach(Data.CONFIG.sidebar.apps, function(app, i){
                        apps[app.id] = app;
                        app.iconsrc = iconsrc(app.id);
                    });
                    
                    Z.forEach(Data.CONFIG.desktop.desks, function(desk, i){
                        Z.forEach(desk.apps, function(app, i){
                            apps[app.id] = app;
                            app.iconsrc = iconsrc(app.id);
                        });
                    });
                    
                    resolve();
                }
            });
            
        },
        
        loadApp: function(id, ver, ready){
            Z.get(
                'data/detail/'+ Math.ceil(id/1000) +'/'+ id +'.json' + (ver ? '?' + ver : ''),
                function(resp){
                    var data = Z.parseJson(resp);
                    if(data){
                        data.isReady = true;
                        data.iconsrc = iconsrc(id);
                        apps[id] = data;
                        ready(data);
                    }else{
                        ready(false);
                    }
                    
                }
            );
        },
        
        getApp: function(id, key){
            return apps[id][key];
        }
        
    });
    
    function iconsrc(id){
        return Z.rstr(
            'http://{%0}.web.qstatic.com/webqqpic/pubapps/{%1}/{%2}/images/big.png',
            Math.random() * 10 | 0, id / 1000 | 0, id
        );
    }

})