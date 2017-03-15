const should = require("should");
const TreeDataSet = require("./dataset/treeDataSet");
const data = require("./dataset/testData").out;

describe("new TreeDataSet",function(){
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

	it("TreeDataSet should have method loadData",function(){
		dataset.should.have.properties("loadData");
	});
})