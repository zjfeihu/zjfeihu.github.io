define(function(){
    return function(fn){
        var
        tr = setInterval(function(){
            if(document.body){
                fn();
                clearInterval(tr);
            }
        }, 15);
    };
})