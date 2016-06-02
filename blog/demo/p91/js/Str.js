define(['Res'], function(){
    var reg = require('Res').theRegExp();
    return{
        sharp: function(){
            return '#';
        },
        trim: function(str){
            var sharp = require('Res').theSharp();
            return  sharp + str.replace(reg, '') + sharp;
        }
    }
    
});
