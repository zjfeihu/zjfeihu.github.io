define(function(){
    var tr = setInterval(function(){
        if(document.body){
            clearInterval(tr);
            require('m1').sayHello() //µ÷ÓÃm1Ä£¿é
        }
    }, 16);
});