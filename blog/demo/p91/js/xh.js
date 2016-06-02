define(['Str', 'DOMReady'], function(){
    require('DOMReady')(function(){
        document.getElementById('consolebox').innerHTML = require('Str').trim(' aaa ');
    });
})