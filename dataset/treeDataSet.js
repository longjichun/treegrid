/**
 * [TreeDataSet description]
 * @param  {object} options 形成树形数据结构的配置，以及数据源
 * @return {[type]}         [description]
 *
 * #初始数据可以没有expand 
 */
(function(){
	var root = this;
	var TreeDataSet;
	var $ = TreeDataSet = function(options) {
		//原始数据
		//注意：数据的唯一标识应是_id,而不是id
		this.data = options.data;

		//用于渲染界面的数据
		this.renderData = [];

		//分页前的数据
		this.beforeLimitData = []

		//包括叶子借点在内的所有hash型数据 以id为名
		this.trunkNodeId = {};

		//包括叶子借点在内的所有hash型数据 以pids+pid为名
		this.trunkNodePid = {};

		//顶层节点
		this.topTrunkNodeId = [];

		this.renderRootData = [];

		/*this.loadConfig = {
			sort:[],
			filter:,
			page:{
				start:0,
				len:10
			}
		}*/
		this.loadConfig = options.loadConfig;

		//缓存各类筛选的数据
		this.cacheData ={
			//存储排序、过滤后的topTrunkNodeId
			topTrunkNodeId :null
		};
		//this.sortCache = []
		this.isAllExpand = false;
		this.isAllClosed = false;
		this.firstLoadData = true;
		initData.call(this,this.data);

	};

	function addPath(arr) {

	}

	function initData(data){
		var initData = data.slice(0);
		var initLen = initData.length;
		var trunkNodeId    = {},
			trunkNodePid   = {},
			topTrunkNodeId = [];
		for( let i=0; i < initLen; i++) {

			var ele = initData[i];
			var _id = ele._id || ele.id;

			if( _id === undefined) throw "原始数据缺少唯一标识_id或者id";
			if( typeof _id !== "string" && typeof _id !== "number" ) throw "原始数据_id格式不正确";
			trunkNodeId[_id] = ele;
			//trunkNodeId[_id].ids = ele._id;


			var parent = ele.parent;
			if( parent === undefined ) parent = '';
			ele.level = 0;
			ele.leaf = false;
			var _name = 'pids'+parent;
			if( !trunkNodePid[_name]) trunkNodePid[_name] = [];
			trunkNodePid[_name].push(ele);

		}
		var _temp = [];
		for(var i in trunkNodePid) {
			if( trunkNodePid.hasOwnProperty(i) ) {
				var _name2 = i.replace("pids","");
				if( !trunkNodeId[_name2] ) {
					//_name2 从parent 而来 如果trunkNodeId 没有id为name的对象，说明为顶层节点
					/*for( var j =0,len = trunkNodePid[i].length;j<len;j++) {
						// 路径
						trunkNodePid[i].ids = trunkNodePid[i]._id;
					}*/
					_temp = _temp.concat(trunkNodePid[i]);
				}
			}
		}
		topTrunkNodeId 		 = _temp;
		this.trunkNodeId 	 = trunkNodeId;
		this.trunkNodePid 	 = trunkNodePid;
		this.topTrunkNodeId  = topTrunkNodeId;
		this.beforeLimitData = topTrunkNodeId;
	}
	/**
	 * [exChangeNode 展开与收缩节点的方法]
	 * @param  {[type]} id  要展开或收缩节点的id
	 * @param  {[type]} ind 节点在已存在的数据中的位置
	 * @return {[type]}     [description]
	 */

	function doSort(arg){
		var self = this;
		var notSort = !Array.isArray(arg) || !arg.length;
		var _temp = self.topTrunkNodeId.slice(0) ;
		if(notSort) {
			self.sortCache = _temp;	
		} else {
			self.sortCache = toSort(_temp,arg);
		}

	}
	function doFilter(arg) {
		var self = this;
		var notFilter = JSON.stringify(arg) == "{}" || !arg ;
		var _temp;

		_temp = self.sortCache.slice(0);

		if(notFilter) {
			self.filterCache = _temp;
		} else {
			self.filterCache = toFilter(_temp,arg);
		}
	}
	function doLimit(arg) {
		var self = this;
		var _temp = [];
		if(arg == undefined) {
			_temp = self.filterCache.slice(0);
		} else {
			if(arg.start < 0 || arg.len < 0)  throw '分页参数错误';
	
			_temp = self.filterCache.slice(arg.start , arg.start+arg.len);
		}
		self.renderRootData = _temp;
	}
	function toFilter(data,arg){
		return data;
	}

	function toSort(data,sorts) {
		data = data.slice(0);
		var self = this;
		if(Array.isArray(sorts)) {
			var sortStrand = sorts.reverse();
		} else {
			return data;
		}
		data.sort(function(x,y){
			return sortFn.call(null,x,y,sortStrand)
		});
		return data;
	}


	 /**
	 * 排序函数
	 * @param {array} sortStrand 排序字段
	 */
	function sortFn(x,y,sortStrand) {
		var poi = 0;
		for( var i=0,len = sortStrand.length;i<len;i++) {
			var cure = sortStrand[i];
			if(!cure) return 0;
			if(cure.slice(0,1 == '-')) {
				poi = y[cure.slice(1)]-x[cure.slice(1)];
			} else if(cure.slice(0,1)=="+") {
				poi = x[cure.slice(1)] -y[cure.slice(1)]
			} else {
				poi = x[cure] -y[cure];
			};
		}
		return poi;
	}

	function getChild(_arr){
		//获取子、孙节点,并且完成排序和过滤
		var arr  = _arr.slice(0);
		var self = this;
		for(var i = 0,len = arr.length ;i<len;i++) {
			var loopItem = arr[i];
			if(loopItem.ids==undefined) {
				//如果还没有ids
				var par = self.trunkNodeId[loopItem.parent];
				var ids = ''
				if(par) {
					ids = (par.ids||par.id)+'-'+loopItem._id
					loopItem.ids = ids;
				} else {
					loopItem.ids = loopItem._id;
				}
				loopItem.level = ids.split("-").length-1;
			}
			if( loopItem.expand || self.isAllExpand ) {
				loopItem.expand = true;
				var _id = "pids"+loopItem._id;
				//将子节点加进arr中，并且重新赋值length
				if(self.trunkNodePid[_id]) {
					var childs = toFilter(toSort(self.trunkNodePid[_id],self.loadConfig.sort).slice(0));
					Array.prototype.splice.apply(arr,[i+1,0].concat( childs ));
					len = arr.length;
				}
			}
		}
		return arr;
	}
	/**
	 * 通过 分页、排序、过滤操作，触发loadData函数
	 * @param  {[type]}   config [三个操作的配置]
	 * @param  {Function} cb     [回调函数，参数为处理结果]
	 * @return {[type]}          [description]
	 * 每筛选或排序依次，都保存一份数据，是最后一次筛选或排序的数据
	*  example config = {
					sort:[],
					filter:,
					page:{
						start:0,
						len:10
					}
	 */
	function toloadData(name,val) {
		var self = this;
		if(name == 'sort') {
			//排序操作需要重新过滤
			doSort.call(self , val);
			doFilter.call(self , self.loadConfig.page);
		}
		if(name == "filter") {
			doFilter.call(self , val);
		}

		if(name == "page") {
			doLimit.call(self , val);
		} else {
			doLimit.call(self , self.loadConfig.page);
		}
	}
	$.prototype.loadData = function(config,cb){
		if( typeof cb != 'function') throw 'loadData need 2 arguments(config,callback)';
		
		var self = this;

		/*if( self.firstLoadData ) {

			self.firstLoadData = false;
		}*/
		var selfConfig = self.loadConfig;
		if(self.firstLoadData) {
			doSort.call(self ,config.sort);

			doFilter.call(self ,config.filter);

			doLimit.call(self ,config.page)
		} else {
			// 根据改变了的参数，进行加载数据
			for(var i in config) {
				if(config.hasOwnProperty(i)) {
					if( JSON.stringify(config[i]) != JSON.stringify(selfConfig[i]) ) {
						toloadData.call(self,i,config[i]);
					}
				}
			}
		}

		self.loadConfig = config;
		self.renderData = getChild.call(self,self.renderRootData);

		if(typeof cb != "function") {
			return self.renderData;
		} else {
			cb(self.renderData);
		}
	};
	/**
	 * 展开/收缩节点的方法
	 * @param  {string}   id  被点击节点的_id
	 * @param  {number}   ind 被点击节点的位置
	 * @param  {function} cb  回调函数，参数为处理结果
	 * @return {[type]}     [description]
	 */
	$.prototype.exChangeNode = function(id,ind,cb){
		var self 	= this;
		var current = self.trunkNodeId[id];
		var _temp 	= self.trunkNodePid["pids"+id];
		if(current.expand) {
			//折叠操作
			//将isAllExpand 转为false
			self.isAllExpand = false;
			var expandedIds  = [];
			var curIds 		 = current.ids;

			//以下方法也是可行的
			var _id = '';
			self.renderData = self.renderData.filter(function(item){
				if(item.level == current.level) {
					_id = item._id;
				}
				if(item.level >current.level && _id==id) {
					return false;
				} else {
					return true;
				}
			});
			/*var _data = self.renderData.slice(0);
			self.renderData = [];
			_data.forEach(function(item){
				// 									bug   item.ids:32  curIds 2
				var bol = (curIds == item.ids) || !~item.ids.indexOf(curIds);
				if(bol){
					self.renderData.push(item);
				}
			});*/
		} else {
			//展开操作
			self.isAllClosed = false;
			_temp = getChild.call(self , _temp);
			for(var j = 0,len = _temp.length;j < len;j++){
				self.renderData.splice(ind+1+j,0,_temp[j]);
			}
		}
		current.expand = !current.expand;
		if(cb) cb(_temp);
	};
	$.prototype.allExpand = function(cb){
		var self = this;
		self.isAllExpand = true;
		self.renderData = getChild.call(self,self.renderRootData);
		if(cb) cb(self.renderData);
	};
	$.prototype.allClosed = function(cb){
		var self 		 = this;
		self.isAllExpand = false;
		self.renderData  = self.topTrunkNodeId;
		if(cb) cb(self.renderData);
	};
	$.prototype.getCount = function(){
	}
	if( typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports){
		exports.$ = module.exports = $;
	} else {
		root.TreeDataSet = $;
	}
}).call(this);
