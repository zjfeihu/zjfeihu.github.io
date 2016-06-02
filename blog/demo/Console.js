function Console(text){
    if(Console.box){
        if(text){
            Console.box.innerHTML += '=> '+text.replace(/&/g, '&amp;').replace(/</g, '&lt;')+'<br>';
        }
    }else if(document.body){ //初始化console容器，并输出已经存在的数据
        clearInterval(Console.timer);
        Console.box = document.createElement('div');
        Console.box.style.cssText='position: fixed; top:8px; width: 600px; border: 1px solid #ccc; background: #eee; padding: 8px';
        document.body.appendChild(Console.box);
        if(Console.data){
            for(var i = 0; i < Console.data.length; i++){
                Console(Console.data[i]);
            }
        }
        Console(text);
    }else{
        if(!Console.data){
            Console.data = [];
        }
        Console.data.push(text);
        Console.timer = setInterval(function(){ //假如在body就绪后没调用Console，那么就让定时器主动触发
            if(document.body){
                clearInterval(Console.timer);
                Console();
            }
        }, 15);
    }
}