define(function(){
    var tr = setInterval(function(){
        if(document.body){
            clearInterval(tr);
            require('m1').sayHello() //����m1ģ��
        }
    }, 16);
});