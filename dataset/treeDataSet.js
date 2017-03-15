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
	}
	$.prototype.loadData = function(config){

	}
	if( typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports){
		exports.$ = module.exports = $;
	} else {
		root.TreeDataSet = $;
	}
}).call(this)
