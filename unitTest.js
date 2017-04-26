var fs = require("fs");
const should = require("should");
const TreeDataSet = require("./dataset/treeDataSet");
describe("new TreeDataSet all data",function(){
	const data = require("./testdata/allregion").out;
	var options = {
		data:data
	}
	var dataset = new TreeDataSet(options);

	it("new Class",function(){
		dataset.should.be.ok;
	});

	it("options should have some properties",function(){
		options.data[0].should.have.properties("_id");
		options.data[0].should.have.properties("parent");
	});

	it("class should have some properties",function(){
		dataset.should.have.properties("data");
		dataset.should.have.properties("renderData");
		dataset.should.have.properties("trunkNodeId");
		dataset.should.have.properties("trunkNodePid");
		dataset.should.have.properties("topTrunkNodeId");
	});

	var  dataLen = dataset.topTrunkNodeId.length;
	it("TreeDataSet should have method loadData",function(){
		dataset.should.have.properties("loadData");
	});

	it("to load all data every is right",function(){
		/*load 全部数据*/
		dataset.loadData({},function(res){
			res.length.should.aboveOrEqual(dataLen);
		});

		//load 部分数据
		dataset.loadData({page:{start:0,len:20}},function(res){
			res.length.should.aboveOrEqual(20);
		});

		//模拟排序
		dataset.loadData({sort:['+lat'],page:{start:25,len:10}},function(res){
			res[0].lat.should.belowOrEqual(res.pop().lat);
		})
	})
});

describe("little data",function(){
	let miniData =  require("./testdata/region").out.slice(0);
	var len =  miniData.length;

	var options = {
		data:miniData
	};
	var dataset = new TreeDataSet(options);

	it('miniData`s length should be 2',function(){
		dataset.loadData({},function(res){
			res.length.should.equal(2);	
		});
	});

});
describe("将北京和东城区的expand设为true",function(){
	let _miniData =  require("./testdata/region").out.slice(0);
	let miniData2 = JSON.parse(JSON.stringify(_miniData));
	var len =  miniData2.length;
	let options = {
		data:miniData2
	};

	miniData2[0].expand = true;
	miniData2[2].expand = true;
	var dataset = new TreeDataSet(options);
	it("将纬度排序之后，第八项为东城区ids:2-378，第九项为其虚拟辖区level:2",function(){
		dataset.loadData({sort:['+lat'],page:{start:0,len:2}},function(res){
			res[9].ids.should.equal('2-378');
			res[10].ids.should.equal('2-378-3789');
			res[10].level.should.equal(2);
		})
	});
	it("将北京收缩后，总长度为2",function(){
		dataset.exChangeNode(2,1,function(res){
			dataset.renderData.length.should.equal(2)
		});
	})
	it("将天津展开后，其子节点为16，总共节点为18",function(){
		dataset.exChangeNode(3,0,function(res){
			res.length.should.equal(16);
			dataset.renderData.length.should.equal(18);
		});
	})
})
describe("全部展开、全部收缩操作",function(){
	let _miniData =  require("./testdata/region").out.slice(0);
	let miniData2 = JSON.parse(JSON.stringify(_miniData));
	var len =  miniData2.length;
	let options = {
		data:miniData2
	};

	miniData2[0].expand = true;
	miniData2[2].expand = true;
	var dataset = new TreeDataSet(options);
	it("全部收缩之后renderData长度为len,长度为2",function(){
		dataset.loadData({},function(res){
			dataset.allExpand(function(res){
				res.length.should.equal(len);
			});
			dataset.allClosed(function(res){
				res.length.should.equal(2);
			});
		})
	});

	it("进行一系列折叠展开后，对lat字段升序又降序再升序之后能返回原来的数据",function(){
		var initStr = initStr2 = '';
		var upDataPoi2 = downDataPoi2 = null;
		dataset.loadData({sort:['+lat']},function(res){
			initStr = JSON.stringify(res);
			upDataPoi2 = JSON.stringify(res[0]);
		});
		dataset.loadData({sort:['-lat']},function(res){
			downDataPoi2 = JSON.stringify(res[res.length-1]);
		});
		dataset.loadData({sort:['+lat']},function(res){
			initStr2 = JSON.stringify(res);
		});
		initStr.should.equal(initStr2);
		upDataPoi2.should.not.equal(downDataPoi2);
	});
});
