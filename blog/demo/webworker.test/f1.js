i = 0;
onmessage = function(e){
    postMessage({
        input: e.data.index,
        output: ++i
    });
};