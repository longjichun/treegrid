/**
 * [TreeDataSet description]
 * @param  {object} options 形成树形数据结构的配置，以及数据源
 * @return {[type]}         [description]
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
		this.sortCache = {

		}
		this.isAllExpand = false;
		this.isAllClosed = false;
		initData.call(this,this.data);

	};

	function initData(data){
		var initData = data.concat([]);
		var initLen = initData.length;
		var trunkNodeId = {},
			trunkNodePid = {},
			topTrunkNodeId =[];
		for( let i=0; i < initLen; i++) {

			var ele = initData[i];
			var _id = ele._id || ele.id;

			if( _id === undefined) throw "原始数据缺少唯一标识_id或者id";
			if( typeof _id !== "string" && typeof _id !== "number" ) throw "原始数据_id格式不正确";
			
			trunkNodeId[_id] = ele;


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
					for( var j =0,len = trunkNodePid[i].length;j<len;j++) {
						// 路径
						trunkNodePid[i].ids = trunkNodePid[i]._id;
					}
					_temp = _temp.concat(trunkNodePid[i]);
				}
			}
		}
		topTrunkNodeId = _temp;
		this.trunkNodeId = trunkNodeId;
		this.trunkNodePid = trunkNodePid;
		this.topTrunkNodeId = topTrunkNodeId;
		self.beforeLimitData = topTrunkNodeId;
	}
	/**
	 * [exChangeNode 展开与收缩节点的方法]
	 * @param  {[type]} id  要展开或收缩节点的id
	 * @param  {[type]} ind 节点在已存在的数据中的位置
	 * @return {[type]}     [description]
	 */

	function doSort(){
		var self = this;
		self.sortCache = toSort(self.topTrunkNodeId,sorts);
		self.filterCache = self.sortCache.slice(0);
	}
	function doFilter() {
		var self = this;
		self.filterCache = toFilter(self.sortCache,conditions);
	}
	function doLimit() {
		var self = this;
		self.limitData = toLimit(self.filterCache,limitConf);
	}
	function getChild(data){
		var self = this;
		return self.renderData;
	}
	function toSort(sorts) {
		var self = this;
		if(Array.isArray(sorts)) {
			var sortStrand = sorts.reverse();
		} else {
			console.error("排序指标为数组");
		}
		var tops = self.cacheData.topTrunkNodeId?self.cacheData.topTrunkNodeId:self.topTrunkNodeId; 
		tops.sort(function(x,y){
			return self.sortFn(x,y,sortStrand);
		});
		//保存每次排序、过滤后的数据
		self.cacheData.topTrunkNodeId = tops.slice(0);
		self.sortCache.topTrunkNodeId = tops.slice(0);
		var _tops = tops.slice(0);

		var selfConfPage = self.loadConfig.page;
		//有缓存就从缓存拿
		var curTops = _tops.splice(selfConfPage.start,selfConfPage.len);
		self.renderData = self.getExpandList(curTops,false);
	}
	$.prototype.loadData = function(config,cb){
		var self = this;
		doSort().doFilter().doLimit();
		if(typeof cb != "function") {
			return self.renderData;
		} else {
			cb(self.renderData);
		}
	}

	if( typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports){
		exports.$ = module.exports = $;
	} else {
		root.TreeDataSet = $;
	}
}).call(this)
