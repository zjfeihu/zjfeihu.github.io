//zpage.js v1.01 分页组件

zpage = function(){
    
    var hasstyle;
    
    return Z.Class({
        
        init: function(option){
            
            if(!hasstyle){
                hasstyle = 1;
                this._loadstyle();
            }
            
            this._SIZE = Math.max(7, +option.size || 10);
            this._TOTAL = +option.count;
            this._current = +option.focus || 1;
            this._onchange = option.change;
            this._inner = Z.E('<div class="zpage"><div class="inner"></div></div>').find('.inner');
            this._setEvent();
            
            this.render();
            
            Z(option.box).append(this._inner.parent());
            
            //option.box.appendChild(this._inner.parent().e);
            
        },
        
        prev: function(){
            if(this._current > 1){
                this._current--;
                this.render();
                this._onchange && this._onchange(this._current);
            }
        },
        
        next: function(){
            if(this._current < this._TOTAL){
                this._current++;
                this.render();
                this._onchange && this._onchange(this._current);
            }
        },
        
        focus: function(current){
            if(current > 0 && current <= this._TOTAL){
                this._current = current;
                this.render();
                this._onchange && this._onchange(this._current);
            }
        },
        
        size: function(size){
            if(size > 6 && size != this._SIZE){
                this._SIZE = size;
                this._current = 1;
            }
            return this;
        },
        
        count: function(total){
            if(total > 0 && total != this._TOTAL){
                this._TOTAL = total;
                this._current = 1;
            }
            return this;
        },
        
        change: function(onchange){
            this._onchange = onchange;
            return this;
        },
        
        _setEvent: function(){
            var that = this;
            this._inner.click(function(evt){
                var idx = Z(evt.target).attr('_idx_');
                if(idx == '+1'){
                    that.next();  
                }else if(+idx > 0){
                    that.focus(+idx);
                }else if(idx == '-1'){
                    that.prev();
                }
            });
        },
        
        render: function(){
            
            var 
            SIZE = this._SIZE,
            TOTAL = this._TOTAL,
            current = this._current,
            offset = SIZE / 2,
            prev = '',
            next = '',
            header = '', //头部点
            tailer = '', //尾部点
            body = '',
            numSize = SIZE, //中间部分数字长度
            num,//中间开始页码
            i = 0;
            
            prev = current == 1 
                ? '<span class="prev dis">上一页</span>'
                : '<span class="prev" _idx_="-1">上一页</span>';
            next = current == TOTAL
                ? '<span class="next dis">下一页</span>'
                : '<span class="next" _idx_="+1">下一页</span>';
            
            if(TOTAL > SIZE){ //有左右点
                
                if(current > offset){ //有左dot
                    header = '<span class="num" _idx_="1">1</span><span class="dot">...</span>';
                    numSize -= 2;
                }
                
                if(TOTAL - current > offset-1){ //有右dot
                    tailer = '<span class="dot">...</span><span class="num" _idx_="'+TOTAL+'">'+TOTAL+'</span>';
                    numSize -= 2;
                }     
                
            }else{ //numSize只能小于总数
            
                numSize = Math.min(numSize, TOTAL); 
                
            }
            
            num = //中间部分数字
            header && tailer
                ? current - ~~(numSize/2)  //左右有点
                : tailer
                    ? 1  //只有尾部有点
                    : TOTAL + 1 - numSize; //只有头部有点
            
            while(numSize--){
                body += num == current //当前页面
                    ? '<span class="num cur">'+ num +'</span>'
                    : '<span class="num" _idx_="'+num+'">'+ (num) +'</span>';
                num++;
            }
            
            this._inner.html([prev, header, body, tailer, next]);
            
        },
        
        _loadstyle: function(){
            Z.style(Z.rstr("\
                .zpage{margin-top:12px; color:#333; text-align:center}\
.zpage .inner{display:inline-block; overflow:hidden}\
.zpage span{float:left; margin:1px; padding:1px 6px; border:1px solid #333; cursor:pointer}\
.zpage .num{}\
.zpage .dot{border:none; padding:1px 7px}\
\
.zpage .cur,\
.zpage .prev:hover,\
.zpage .next:hover,\
.zpage .num:hover{color:#d50619; border-color:#d50619}\
.zpage .dis{color:#ccc!important; border-color:#ccc!important}\
\
.zpage .dot,\
.zpage .dis,\
.zpage .cur{cursor:default}\
            "));
        }
        
    }, {ver: 1.01});
    
}();