//for 63.html
function fi(n) {
    return n < 2 ? n : fi(n - 1) + fi(n - 2);
}
onmessage = function(e){
    postMessage(fi(+e.data));
};