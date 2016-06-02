define(['Str'], function(){

    return{
        theRegExp: function(){
            return /^\s+|\s+$/g;
        },
        theSharp: function(){
            return require('Str').sharp()
        }
    }
    
})