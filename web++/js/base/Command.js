define(function(module){
    /*
    指令模块
    #exports
        Command(items)                      添加指令
        Command.apply(context, name, args)  执行指令
        Command.apply(name, args)           执行指令
        Command.call(context, name)         执行指令
        Command.call(name)                  执行指令
    */
    
    module.exports = Command;
    
    var cmds = {};
    
    function Command(items){
        for(var name in items){
            cmds[name] = items[name];
        }
    }
    
    Command.apply = function(context, name, args){
        
        if(typeof context == 'string'){
            args = name;
            name = context;
            context = null;
        }
        
        if(typeof cmds[name] != 'function'){
            return window.console && console.info && console.info('not found the Cammand("'+ name +'")');
        }
        
        cmds[name].apply(context, args || []);
    };
    
    Command.call = function(context, name){
        if(typeof context == 'string'){
            this.apply(null, context, [].slice.call(arguments, 1));
        }else{
            this.apply(context, name, [].slice.call(arguments, 2));
        } 
    };

})