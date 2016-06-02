//ZwPage.js v1.01 ��ҳ���

ZwPage = function(){
    
    return Z.Class({
        
        init: function(option){
            
            this._SIZE = Math.max(7, +option.size || 10);
            this._TOTAL = +option.count;
            this._current = +option.focus || 1;
            this._onchange = option.change;
            this._inner = Z.E('<div class="ZwPage"><div class="inner"></div></div>').find('.inner');
            this._setEvent();
            
            this.render();
            
            option.box.appendChild(this._inner.parent().e);
            
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
            header = '', //ͷ����
            tailer = '', //β����
            body = '',
            numSize = SIZE, //�м䲿�����ֳ���
            num,//�м俪ʼҳ��
            i = 0;
            
            prev = current == 1 
                ? '<span class="prev dis">��һҳ</span>'
                : '<span class="prev" _idx_="-1">��һҳ</span>';
            next = current == TOTAL
                ? '<span class="next dis">��һҳ</span>'
                : '<span class="next" _idx_="+1">��һҳ</span>';
            
            if(TOTAL > SIZE){ //�����ҵ�
                
                if(current > offset){ //����dot
                    header = '<span class="num" _idx_="1">1</span><span class="dot">...</span>';
                    numSize -= 2;
                }
                
                if(TOTAL - current > offset-1){ //����dot
                    tailer = '<span class="dot">...</span><span class="num" _idx_="'+TOTAL+'">'+TOTAL+'</span>';
                    numSize -= 2;
                }     
                
            }else{ //numSizeֻ��С������
            
                numSize = Math.min(numSize, TOTAL); 
                
            }
            
            num = //�м䲿������
            header && tailer
                ? current - ~~(numSize/2)  //�����е�
                : tailer
                    ? 1  //ֻ��β���е�
                    : TOTAL + 1 - numSize; //ֻ��ͷ���е�
            
            while(numSize--){
                body += num == current //��ǰҳ��
                    ? '<span class="num cur">'+ num +'</span>'
                    : '<span class="num" _idx_="'+num+'">'+ (num) +'</span>';
                num++;
            }
            
            this._inner.html([prev, header, body, tailer, next]);
            
        }
        
    }, {ver: 1.01});
    
}();