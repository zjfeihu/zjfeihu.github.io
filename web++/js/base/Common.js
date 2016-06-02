define(function(module){
    /*
    常用工具
    #imports
        calls
    #exports
        Common.loadImgs(imgs, success)      加载图片
        Common.hitTest(box, point)          碰撞检测，检测点point[x,y]是否落在panel里面
        Common.getGridindex(box, gridsize, point)    获取网格位置
        Common.debounce(callback, ms)       去除重复动作
    */
    
    var calls = require('widget/calls');
    
    module.exports = {
        
        loadImgs: function (imgs, success){
            
            calls('Common.loadImgs')
            .wait(function(){
                var fns = [];
                Z.forEach(imgs, function(src){
                    fns.push(function(resolve){
                        Z.img('css/imgs/'+ src, resolve);
                    });
                });
                return fns;
            }())
            .then(function(){ //done
                success();
            });
            
        },
        
        hitTest: function(box, point){
            var left, top, x = point[0], y = point[1];
            return !(
                x < (left = box.offsetLeft())
                || y < (top = box.offsetTop())
                || x > left + box.offsetWidth()
                || y > top + box.offsetHeight()
            );
        },
        
        getGridindex: function(box, gridsize, point){ //box为容器，gridsize为网格大小，point为坐标位置
        
            var gridwidth = gridsize[0];
            var gridheight = gridsize[1];
            var x = point[0];
            var y = point[1];
            var left, top, width, height;
            var rows, cols; //网格行列
    
            if(
                x < (left = box.offsetLeft()) || 
                x > left + (width = box.offsetWidth()) ||
                y < (top = box.offsetTop()) ||
                y > top + (height = box.offsetHeight())
            ){
                return -1;
            }
            
            var rx, ry; //二维坐标
            
            if(gridwidth){ //列坐标
                cols = Math.max(1, (width/gridwidth)|0);
                rx = Math.floor( (x - left) / gridwidth );
                rx = Math.min(cols, rx);
            }
            
            if(gridheight){ //行坐标
                rows = Math.max(1, (height/gridheight)|0)
                ry = Math.floor( (y - top) / gridheight );
                ry = Math.min(rows, ry);
            }
            
            if( (+!!gridwidth) ^ (+!!gridheight) ){ //只存在一个值
                return (rx || ry)|0;
            }
            
            return rows * rx  + ry; //2个值都存在，则纵向读取生成位置
            
        },
        
        debounce: function(fn, ms){
            var timer;
            return function(){
                var that = this;
                var args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function(){
                    fn.apply(that, args);
                }, ms);
            };
        }
        
    };

})