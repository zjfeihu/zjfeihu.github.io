function Console(text){
    if(Console.box){
        if(text){
            Console.box.innerHTML += '=> '+text.replace(/&/g, '&amp;').replace(/</g, '&lt;')+'<br>';
        }
    }else if(document.body){ //��ʼ��console������������Ѿ����ڵ�����
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
        Console.timer = setInterval(function(){ //������body������û����Console����ô���ö�ʱ����������
            if(document.body){
                clearInterval(Console.timer);
                Console();
            }
        }, 15);
    }
}