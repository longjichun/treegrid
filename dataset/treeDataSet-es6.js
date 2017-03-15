class TreeDataSet {
	constructor(options) {
		// 请求到的数据
		this.data = options.data;

		//用于渲染界面的数据
		this.renderData = [];

		//包括叶子借点在内的所有hash型数据 以id为名
		this.trunkNodeId ={};

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
	}
	/**
	 * 实例treeDataSet调用的方法
	 * @public
	 * #method loadData 
	 */
	loadData(options) {
		var self = this;
		let promise = new Promise(function(resolve,reject){
			if(options) {
				self.run(options);
				resolve(self.renderData);
			} else {
				var data = self.data;
				self.initData(data);
				resolve(self.renderData);
			}
		});
		return promise;
	}

	/**
	 * 初始化数据的方法
	 */
	initData(data) {
		var self = this;

		//调整为合适的数据格式
		var data= self.regulate(data);

		//形成三种数据
		self.threeFormat(data);

		//依据排序、过滤、分页数据，得到第一次渲染的根节点
		var selfConf = self.loadConfig;
		var condi = {
			sort:selfConf.sort,
			filter:selfConf.filter,
			page:selfConf.page
		}
		self.run(condi,true);
	}

	/**
	 * 获取筛选过后的根节点的个数的方法
	 */
	count(){
		var self = this;
		var promise = new Promise(function(resolve,reject){
			if( self.cacheData.topTrunkNodeId ) {
				resolve({value:self.cacheData.topTrunkNodeId.length})
			} else {
				resolve({value:self.topTrunkNodeId.length})
			}
		});
		return promise;
	}

	/**
	 * 展开收缩树节点的方法
	 *
	 */
	exChangeNode(id,ind){
		var self = this;
		var current = self.trunkNodeId[id];
		if( current.expand ) {
			//折叠
			//将 全部展开的状态变为 false
			self.isAllExpand = false;
			current.expand = !current.expand;
			var expandedIds = [];
			var _id = '';
			var outArr = self.renderData.filter(function(item){
				// 该节点的父id不是点击的id,并且不是其子孙节点
				if(item.level == current.level) {
					_id = item._id;
				}
				//层级比id的大 并且父id==id
				if(item.level >current.level && _id==id) {
					return false;
				} else {
					return true;
				}
			});
			self.renderData = outArr;
		} else {
			current.expand = !current.expand;
			let ads = self.getExpandList(self.trunkNodePid['pids'+id]);
			Array.prototype.splice.apply(self.renderData,[ind+1,0].concat(adds));
		}
		var promise = new Promise(function(resolve,reject){
			resolve(self.renderData);
		})
		return promise;

	}

	/**
	 * 分发筛选数据的方法--依据是那个筛选条件处理--最后都是拿根节点处理
	 * isInit 是否初次加载 	
	 */
	run(conditions,isInit) {
		var self = this;
		if(isInit) {
			self.runFilter(conditions.filter);
			self.runSort(conditions.sort);
			self.runPage(conditions.page);
			return true;
		} else {
			if( !conditions ){
				//根据已有条件，对展开的节点进行筛选
				var loadedCondis = self.loadConfig
				if(loadedCondis.sort.length) {

				}
			} else {
				//接收了新的查询条件
				self.loadConfig[conditions.name] =conditions.condis;
				if(conditions.name == "filter") {
					self.runFilter(conditions.condis,conditions.level)
				}
				if(conditions.name == "sort") {
					self.runSort(conditions.condis)
				}
				if(conditions.name == "page") {
					self.runPage(conditions.condis);
				}

			}
		}
	}
	/**
	 * 过滤数据的方法
	 */
	runFilter(filters,level) {
		var self = this;
		var _renders = [];
		if(!filters || !filters.length) {
			var topids = self.sortCache.topTrunkNodeId?self.sortCache.topTrunkNodeId:self.topTrunkNodeId.slice(0);
			let topFilters = topids;
			//保存到筛选
			self.cacheData.topTrunkNodeId = topFilters.slice(0);

			//过滤之后直接跳到第一页
			let newAdds = self.getExpandList( (topFilters.slice(0)).splice(0,self.loadConfig.page.len) )
			_renders = newAdds;
		} else {
			if( level!= undefined) {
				//如果不是过滤根节点
				if(level==0) {
					var topids =  self.sortCache.topTrunkNodeId?self.sortCache.topTrunkNodeId:self.topTrunkNodeId.slice(0);
					var topids = self.topTrunkNodeId.slice(0);
					let topFilters = doFilter(topids.slice(0),filters);
					self.cacheData.topTrunkNodeId = topFilters.slice(0);

					let newAdds = self.getExpandList( (topFilters.slice(0)).splice(0,self.loadConfig.page.len) )
					_renders = newAdds;
				} else {
					let _temps = self.renderData.slice(0);
					let _filters = doFilter(_temps,filters);

					let _renders = [];
					let filterIds = [];
					_filters.forEach(function(item,ind){
						filterIds.push(item._id);
					});
					_filters.forEach(function(item,ind){
						if(~filterIds.indexOf(item.parent) || item.level==0) {
							_renders.push(item)
						}
					})
				}
			}
		}
		self.renderData = _renders.slice(0);
	}
	/**
	 * 数据排序
	 */
	runSort(sorts) {
		var self = this;
		if(sorts.length == 0) {
			return;
		}
		self.toSort(sorts);
	}
	toSort(sorts) {
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
	/**
	 * 分页的方法
	 */
	runPage(pages) {
		var self = this;
		var start = pages.start || 0,
			len = pages.len || 10;
		var tops = self.cacheData.topTrunkNodeId?self.cacheData.topTrunkNodeId:self.topTrunkNodeId;
		var _tops =tops.slice(0);
		var curTops = _tops.splice(start,len);

		var allRender = self.getExpandList(curTops);
		self.renderData = allRender;

	}
	//全部展开
	allExpand(){
		var self = this;
		self.isAllExpand = true;

		for( let item of self.topTrunkNodeId) {
			self.trunkNodeId[item._id].expand = true;
		}
		var selfConfPage = self.loadConfig.page;
		var tops = self.cacheData.topTrunkNodeId?self.cacheData.topTrunkNodeId:self.topTrunkNodeId; 
		var _tops = tops.slice(0);
		var curTops = _tops.splice(selfConfPage.start,selfConfPage.len);
		var p = new Promise(function(resolve,reject){
			var allRender = self.getExpandList(curTops);

			self.renderData = allRender;
			resolve(self.renderData);
		});
		return p;
	}

	allClosed() {
		var self = this;
		self.isAllClosed = true;
		for(let item of self.topTrunkNodeId) {
			self.trunkNodeId[item._id].expand = false;
		}
		var tops = self.cacheData.topTrunkNodeId?self.cacheData.topTrunkNodeId:self.topTrunkNodeId; 
		var _tops = tops.slice(0);
		var curTops = _tops.splice(selfConfPage.start,selfConfPage.len);
		var p = new Promise(function(resolve,reject){
			self.renderData = allRender;
			resolve(self.renderData);
		});
	}

	regulate(data) {
		return data;
	}

	threeFormat(data) {
		var self = this;
		var trunkNodeId = self.trunkNodeId;
		var trunkNodePid = self.trunkNodePid;
		var topTrunkNodeId = self.topTrunkNodeId;

		var initData = data;

		for( let i=0,len = initData.length;i<len;i++) {
			var ele = initData[i];
			trunkNodeId[ele._id] = ele;
		}

		for(let i=0,len=initData.length;i<len;i++) {
			var ele = initData[i];
			ele.level = 0;
			if(trunkNodePid['pids'+ele.parent]) {
				ele.leaf = false;
				trunkNodePid['pids'+ele.parent].push(ele);
			} else {
				trunkNodePid['pids'+ele.parent] = [];
				ele.leaf = false;
				trunkNodePid['pids'+ele.parent].push(ele);
			}
		}
		// 通过trunkNodePid 对比trunkNodeId 找到顶层节点，并给顶层节点赋值level:0
		var _temp = [];
		for(let i in trunkNodePid) {
			if( trunkNodePid.hasOwnProperty(i) ){
				let name = i.replace('pids',"");
				if( !trunkNodeId[name]) {
					//name 从parent 而来 如果trunkNodeId 没有id为name的对象，说明为顶层节点
					for( var  item of trunkNodePid[i] ) {
						item.ids = item._id;
					}
					_temp = _temp.concat(trunkNodePid[i]);
				}
			}
		}
		self.topTrunkNodeId = _temp;
	}

	/**
	 * 依据一个或者多个树，（有的是expand:true）处理i渲染情况
	 */
	getExpandList(trees,first) {
		//遍历渲染节点
		var self = this;
		var renderArr = trees.slice(0);
		var trunkNodeId = self.trunkNodeId;
		var trunkNodePid = self.trunkNodePid;
		var expanded = [];
		var expand = function(renderArr) {
			for( let i = 0,len = renderArr.length;i<len;i++) {
				var current = renderArr[i];
				var childArr = trunkNodePid['pids'+current._id];
				let secLen = childArr && childArr.length;
				current.childLen = secLen;
				//如果节点是产开状态&& 其子节点长度大于0
				 if( trunkNodeId[current._id].expand && secLen && !~expanded.indexOf(current._id) ) {
				 	expanded.push(current._id)

				 	//展开项需要考虑当前的排序与过滤
				 	var a = childArr.slice(0);
				 	if(self.loadConfig.sort && self.loadConfig.sort.length) {
				 		a.sort(function(x,y){
				 			return self.sortFn(x,y,self.loadConfig.sort.length);
				 		});
				 	}
				 	Array.prototype.splice.apply(renderArr,[i+1,0].concat(a));
				 	expand(renderArr);
				 }
				 for( let j =0 ; j<secLen;j++) {
				 	childArr[j].ids = current.ids + '-'+childArr[j]._id;
				 	childArr[j].level = current.level+1;
				 }
			}
		}
		expand(renderArr);
		return renderArr;
	}

	/**
	 * 排序函数
	 * @param {array} sortStrand 排序字段
	 */
	sortFn(x,y,sortStrand) {
		var poi = 0;
		for( let i=0,len = sortStrand.length;i<len;i++) {
			var cure = sortStrand[i];
			if(!cure) return 0;
			if(cure.slice(0,1 == '-')) {
				poi = y[cure.slice(1)]-x[cure.slice(1)];
			} else if(cure.slice(0,1)=="+") {
				poi = x[cure.slice(1)] -y[cure.slice(1)]
			} else {
				poi = x[cure] -y[cure];
			};
			if(poi) return poi;
		}
	}
}