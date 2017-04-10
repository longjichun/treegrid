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
			res.length.should.equal(dataLen);
		});

		//load 部分数据
		dataset.loadData({page:{start:0,len:20}},function(res){
			res.length.should.equal(20);
		});

		//模拟排序
		dataset.loadData({sort:['+lat'],page:{start:25,len:10}},function(res){
			res[0].lat.should.belowOrEqual(res[1].lat);
		})
	})
});

describe("little data",function(){
	const miniData =  require("./testdata/region").out;
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

	it('fold beijing should be ok',function(){

	});

	it('addPath should be ok',function(){
		var pathed = addPath(miniData);
		pathed.length.should.be(len);

	});
})
describe('变量声明与函数体声明',function(){
/*	var a;
	console.log(a)*/
	
	/*console.log(a)*/
})

function addPath(arr) {
	var _arr = [];

	run(arr);
	function run(){
		var returnFn = arguments.callee;

	}

	return _arr;
}
