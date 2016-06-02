define(function(){
    return function(msg){
        document.getElementById('consolebox').innerHTML += msg+'<br>';
    }
})