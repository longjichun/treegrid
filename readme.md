
##  
	* 初始 通过sort、filter保存一份初始数据，以后每次操作都只允许一次操作
	* 每次排序之后需要过滤，但是因为过滤的数据来自排序后的，所以过滤之后无需排序
	* 排序、过滤、分页之后，对需要加载的子孙节点进行排序过滤，再插入，如果该节点是第一次加载子孙节点，还会把
	ids和level添加上

### 分页
	* 以根节点为准，进行分页，当前页数量以及分页不将叶子节点考虑在内

### 展开/折叠
	* 初始数据可以没有expand属性
	* 如果初始数据存在expand属性，在第一次loadData的时候,doSort之前，对根节点做一次expand的检查，存在expand=true的进行递归

	* 将新增的子节点进行排序 
	* 分页的时候需要把子节点添加上

trunkNodeId 两个数据的成员是绑定在一起的 renderData
