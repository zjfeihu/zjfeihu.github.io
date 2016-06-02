define(function(module){
    /*
    右键菜单类
    #imports
        Command
    #exports
        Contextmenu(items)      创建菜单    
        Contextmenu.hide()      隐藏全部菜单
        
        contextmenu.root                    菜单根节点
        contextmenu.context                   调用菜单的对象
        contextmenu.items                   菜单数据
        contextmenu.showBy(which, x, y)     显示菜单
        contextmenu.hide()                  隐藏菜单
        contextmenu.render(items)           重新渲染菜单
        
    */
    
    var Command = require('base/Command');
    
    module.exports = Contextmenu;
    
    var
    curmenu, //当前显示的菜单
    container = Z.E('<div id=Contextmenu></div>'); //菜单容器
    
    function Contextmenu(items){
        
        init && init();
        
        var 
        root,
        that = this;
        
        container.append(
            root 
            = that.root 
            = Z.E('<div class=Contextmenu>'+ createItem(that.items = items) +'</div>')
        );
        
        root.on('mousedown', function(e){
            
            e.stopPropagation();
            
            if(e.mouseKey != 'L'){
                return;
            }
            
            var 
            target = Z(e.target),
            menuitem = target.tag('LI') ? target : target.parent(),
            cmd = menuitem.attr('cmd'),
            args = menuitem.attr('args'),
            status = menuitem.attr('status');
            
            if(cmd && !/^(selected|disabled)$/.test(status)){
                root.hide();
                Command.apply(
                    that.context,
                    cmd,
                    args ? args.split(',') : []
                );
            }
            
        }).on('Contextmenu', function(e){
            e.preventDefault();
            e.stopPropagation();
        }); 
    
    }
        
    Z.mix(Contextmenu, {
        
        hide: function(){
            if(curmenu){
                curmenu.root.hide();
                curmenu = null;
            }
        }
        
    });
    
    Z.mix(Contextmenu.prototype, {
        
        showBy: function(context, x, y){
            
            var that = this;
            var root = that.root;
            
            if(curmenu != that){
                that.hide();
                that.context = context;
                curmenu = that;
            }
            
            root.show().css(revise(x, y));
            
            function revise(x, y){ //修正菜单位置
            
                var
                width = root.offsetWidth(),
                height = root.offsetHeight();
                
                if(x + width > Z('body').width()){
                    x -= width;
                }
                
                if(y + height > Z('body').height()){
                    y -= height;
                }
                
                return{left: x, top: y};
                
            }
            
        },
        
        hide: Contextmenu.hide,
        
        render: function(items){
            this.root.html(createItem(this.items = items));
            return this;
        }
        
    });
    
    function init(){
        
        init = null;
        
        Z('body').append(container);
        
        Z(document).on('contextmenu', function(e){
            e.preventDefault();
        }).on('mousedown', function(){
            Contextmenu.hide();
        });
        
    }
       
    function createItem(items){ //生成子菜单
        var html = '<ul>';
        Z.forEach(items, function(item){
            if(item == '-'){
                html += '<li class="line"></li>';
            }else if(item.status == 'disabled'){
                html += '<li class="disabled"><span class="text">'+ item.text +'</span></li>';
            }else{
                var l_icon, r_icon, submenu;
                if(item.status == 'selected'){
                    l_icon = '<span class="l_icon selected"></span>';
                }else if(item.icon){
                    l_icon = '<span class="l_icon '+ item.icon +'"></span>';
                }
                if(item.submenu){
                    r_icon = '<span class="r_icon showsubmenu"></span>';
                    submenu = createItem(item.submenu); 
                }
                html += Z.rstr(
                    '<li{cmd}{args}{status}>{l_icon}{text}{r_icon}{submenu}</li>',
                    {
                        cmd: item.cmd ? ' cmd='+ item.cmd : '',
                        args: item.args != null ? ' args='+ item.args : '',
                        status: item.status ? ' status='+ item.status : '',
                        text: '<span class="text">'+ item.text +'</span>',
                        l_icon: l_icon || '',
                        r_icon: r_icon || '',
                        submenu: submenu || ''
                    }
                );
            }
        });
        return html +'</ul>';
    }

})