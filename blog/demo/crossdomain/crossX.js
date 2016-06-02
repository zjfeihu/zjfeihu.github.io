var crossX = function(){
	var $WIN = window;
	var target;
	var sendTo;
	var self = {};
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
	function client(options){
		target = options.target;
		if($WIN.postMessage){
			self.sendTo = function (_target, data){
				target.postMessage($1k.toJson(data), '*');
			};
			if($WIN.addEventListener){
				$WIN.addEventListener('message', function(e){
					readyCallback.call($WIN, $1k.parseJson(e.data));
				});
			}else{//ie8支持onmessage却不支持标准事件绑定
				$WIN.attachEvent('onmessage', function(e){
					readyCallback.call($WIN, $1k.parseJson(e.data));
				});
			}
		}else{
			var _name = $WIN.name = '';
			setInterval(function(){
				if($WIN.name != _name){
					readyCallback.call($WIN, $1k.parseJson(_name = $WIN.name));
				}
			}, 100);
			self.sendTo = function (_target, data){
				data.__t__ = +new Date;//添加时间戳，用以区别是新的数据
				target.name = $1k.toJson(data);
			};
		}
	}
	function ready(callback){
		readyCallback = callback;
	}
	self.client = client;
	self.ready = ready;
	return self;
}();