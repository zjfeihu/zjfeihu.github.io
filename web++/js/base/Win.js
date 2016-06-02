define(function(module){
    /*
    窗口类
    #imports
        zwin,Viewport,Contextmenu
    #exports
        win(option)     创建窗口
    */
    
    var zwin = require('widget/zwin');
    var Contextmenu = require('base/Contextmenu');
    
    module.exports = function(option){
        return win(option);
    };
    
    zwin.imgpath = location.href.replace(/[^/]*$/, '') + 'css/imgs/'
    
    var win = zwin.extend({
        
        init: function(option){
            
            var 
            offsetLeft =  Z('body').width() - 26 - option.width,
            offsetTop =  Z('body').height() -26 - option.height;
            
            if(option.center){
                option.left = Math.max(26, offsetLeft / 2 + 13);
                option.top = Math.max(26, offsetTop / 2 + 13);
            }else{
                option.left = Math.max(26, Math.min( offsetLeft, 0 | offsetLeft * Math.random() ));
                option.top = Math.max(26, Math.min( offsetTop, 0 | offsetTop * Math.random() ));
            }
            
            option.onClose = option.onClose || option.onclose;
            option.onFocus = option.onFocus || option.onfocus;
            option.onOpen = option.onOpen || option.onopen;
            
            this._super(option);
            
            this.rootElem
            .on('contextmenu', function(e){
                e.stopPropagation();
                e.preventDefault();
            })
            .on('mousedown', function(){
                Contextmenu.hide();
            });
            
            this.titlebarElem.on('mousedown', function(){
                Contextmenu.hide();
            });
            
        }
        
    });

})