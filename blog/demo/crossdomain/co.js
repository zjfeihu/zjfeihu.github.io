
crossX = function(){
	var $WIN = window;
    function $toJson(obj){
        switch(typeof obj){
            case 'object':
			if(obj == null){
				return obj;
			}
			var E, _json = [];
			if(Object.prototype.toString.apply(obj) == '[object Array]'){
				for(var e = 0, L = obj.length; e < L; e++){
					_json[e] = arguments.callee(obj[e]);
				}
				return '[' + _json.join(',') + ']';
			}
			for(e in obj){
				_json.push('"' + e + '":' + arguments.callee(obj[e]));
			}
			return '{' + _json.join(',') + '}';
            case 'function':
			obj = '' + obj;
            case 'string':
			return '"' + obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '\\r').replace(/\n/g, '\\n') + '"';
            case 'number':
            case 'boolean':
            case 'undefined':
			return obj;
        }    
        return obj;
    }
    function $parseJson(str){
        try{
            return Function('return ' + str)();
			}catch(e){
            return null;
        }
    }
    function $1k(){}
    $1k.toJson = function (obj){
        if($WIN.JSON && JSON.stringify){
            return JSON.stringify(obj);
        }
        return $toJson(obj);
    };
    $1k.parseJson = function (str){
        if($WIN.JSON && JSON.parse){
            return JSON.parse(str);
        }
        return $parseJson(str);
    };
	$1k.info = function(x){
		$WIN.console?console.info(x):alert(x);
		
	};
	var proxyIframe;
	var proxyUrl;
	var otherWin = {};
	var name;
	var callReady;
	$1k.client = client;
	$1k.sendTo = sendTo;
	$1k.ready = ready;
	return $1k;
	function client(option){ //客户端代理配置
		proxyIframe = document.createElement(/msie/.test(navigator.userAgent) ? '<iframe name="proxy"></iframe>' : 'iframe');
		proxyIframe.id
			= proxyIframe.name
			= 'proxy';
			
		proxyIframe.src = 'about:blank';
		proxyIframe.style.display = 'none';
		proxyUrl = option.proxyUrl;
		name = option.name || 'top';
		otherWin = option.otherWin;
		if(proxyIframe.attachEvent){
			proxyIframe.attachEvent('onload', function(){
				clearDomain();
			});
		}else{
			proxyIframe.onload = function(){
				clearDomain();
			};
		}
		function clearDomain(){//操作完成了就清空域
			if(proxyIframe.src != 'about:blank'){
				proxyIframe.src = 'about:blank';
			}
		}
		document.body.appendChild(proxyIframe);
	}
	function proxy(){
		data = $WIN.name;
		//crossX.info(data);
		if(data){
			data = crossX.parseJson(data);
			if(data._isReady_){
				callReady.call(parent[data._target_], data);	//整个流程完毕，执行数据读取和页面操作		
			}else{
				data._isReady_ = true;
				$WIN.name = crossX.toJson(data);
				(parent['proxy'].contentWindow || parent['proxy']).location = data._targetProxyUrl_; //切换到第三域代理
			}
		}else{
			//crossX.info('noName');
		}
		function getWindow(name, parent){ //获取目标window
			try{//无权限，则继续往上查			
				var win = parent[name];	
			}catch(e){
				return getWindow(name, parent.parent);
			}
			while(!win){
				return getWindow(name, parent.parent);
			}
			return win;
		}
	}
	function sendTo(winName, data){ //发送数据
		if(proxyIframe.src!='about:blank'){
			return;
		}
		data._from_ = name;
		data._target_ = winName;
		data._targetProxyUrl_ = otherWin[winName].proxyUrl; //切换到本地代理
		proxyIframe.src = proxyUrl;
		proxyIframe.contentWindow.name = $1k.toJson(data); //通过本地代理储存数据到window.name
		
	}
	function ready(callback){
		callReady = callback;
		proxy();
	}
}();


