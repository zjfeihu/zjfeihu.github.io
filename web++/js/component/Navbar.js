define(function(module){
    /*
    桌面导航模块
    #exports
        Navbar.init(resolve)    初始化模块
    */
    
    var calls = require('widget/calls');
    var Common = require('base/Common');
    var Command = require('base/Command');
    var Observer = require('base/Observer');
    var Contextmenu = require('base/Contextmenu');
    var Data = require('component/Data');
    
    var Desktop = require('component/Desktop');
    var Viewport = require('component/Viewport');
    var App = require('component/App');
    
    module.exports = Navbar = {};
    
    var Navbar;
    var root;
    
    Navbar.init = function(resolve){ //Navbar.init
        
        calls('Navbar.init')
        .then(function(){ //初始化节点
        
            Viewport.add(root = Z.E(
                '<div id="Navbar" class="navbar">\
                    <div class="indicatorContainer">\
                    '+ indicators() +'\
                    </div>\
                </div>'
            ), true);
            
            function indicators(){
                
                var indicators = ['<div class="header" cmd="user" title="请登录"><img src="css/imgs/avatar.png" alt="请登录"></div>'];
                
                Z.forEach(Desktop.desks, function(desk, i){
                    indicators.push(Z.rstr(
                        '<a class="indicator{cls}" index="{index}"><span class="icon_bg"></span><span class="icon_{iconIndex}"></span></a>',
                        {cls: desk.isFocus() ? ' current' : '', index: i, iconIndex: i + 1}
                    ));
                });
                
                indicators.push('<a href="#" class="indicator indicator_manage" hidefocus="true" cmd="openManager" title="全局视图"></a>');
                
                return indicators.join('');
                
            }
            
        })
        .then(function(){ //设置事件监听
            
            Desktop.on('focused', function(){
                root.find('.current').cls('-current');
                root.find('.indicator').eq(this.index).cls('+current');
            });
            
            root.drag({rang: 1});
            
            root
            .on('mousedown', function(){
                Contextmenu.hide();
            }).find('.indicator').click(function(evt){
                evt.preventDefault();
                if(this.attr('cmd') == 'openManager'){
                    Command.call('openManager');
                }else if(!this.cls('current')){
                    Command.call('toggleDesk', +this.attr('index'));
                }
            });
            
            var 
            button = root.find('.indicator'),
            toggleButtonX,
            toggleButtonY;
            
            App.on('beforeDrag', function(){
                if(Desktop.active){
                    toggleButtonX = button.offsetLeft();
                    toggleButtonY = button.offsetTop();
                }
            });
            
            App.on('draging', function(point){
                
                if(!Desktop.active){
                    return;
                }
                
                var x = point[0];
                var y = point[1];
                
                //拖动图标时候的桌面切换检测，20为按钮高度，22为按钮宽度
                if(y > toggleButtonY //y在前面考虑高度小于宽度，减少运算量
                && y < toggleButtonY + 20
                && x > toggleButtonX
                && x < toggleButtonX + 110
                ){
                    Command.call('toggleDesk', 0 | (x - toggleButtonX) / 22);
                }
                
            });
            
        })
        .then(resolve);
        
    };

})