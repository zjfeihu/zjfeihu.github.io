define(function(){
    return{
        sayHello: function(){
            require('log')('I`m m1');
            require('m2').sayHello();
            require('m3').sayHello();
        }
    };
});
