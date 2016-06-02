define('m1', ['m2', 'm3'], function(){
    return {
        sayHello: function(){
            document.body.innerHTML += 'I`m m1<br>';
            require('m2').sayHello();
            require('m3').sayHello();
        }
    }
});