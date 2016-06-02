define(function(module){
    /*
    滚动条模块
    #exports
        
        Scroll(option)      创建滚动条
        
        scroll.visible      显示状态
        scroll.rerender()   重新渲染滚动条
        
    */
    
    module.exports = function(inner){
        
        var 
        outer = inner.parent(),
        scrollbar = Z.E('<div class=scrollbar></div>'), 
        scrollTop, //滚动条顶部
        clientHeight, //视窗高度
        scrollHeight, //滚动区域高度
        scrollbarHeight,
        paddingHeight,
        visible = false,
        offsetY;
        
        outer.append(scrollbar);
        
        scrollbar.on('mousedown', function(e){
            offsetY = e.clientY - scrollTop;
            Z(document).on('mouseup', stopDrag);
            Z(document).on('mousemove', startDrag);
        });
        
        outer.on('mousewheel', function(e){
            if(visible){
                doScroll(scrollTop -= e.delta/12);
            }
        });
        
        this.rerender = function(){
            
            clientHeight = outer.height();
            scrollHeight = inner.offsetHeight();
            
            if(scrollHeight > clientHeight){ //显示滚动条
                
                scrollbar.height(scrollbarHeight = clientHeight * clientHeight / scrollHeight);
                scrollTop = scrollbar.top();
                
                if(visible){
                    doScroll(scrollTop);
                }else{
                    visible = this.visible = true;
                    scrollbar.show();
                }
            
            }else{
                visible = this.visible = false;
                scrollbar.hide().top(scrollTop = 0);
                inner.top(0);
            }
            
        };
        
        function stopDrag(){
            Z(document).un('mouseup', stopDrag);
            Z(document).un('mousemove', startDrag);
        }
        
        function startDrag(e){
            window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
            doScroll(e.clientY - offsetY);
        }
        
        function doScroll(top){
            scrollbar.top(scrollTop = Math.max(0, Math.min(top, clientHeight - scrollbarHeight)));
            inner.top(-scrollTop * scrollHeight / clientHeight);
        }
        
    }

})