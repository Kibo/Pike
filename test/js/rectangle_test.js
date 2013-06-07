goog.require('pike.graphics.Rectangle');

function setUpPage(){}
function setUp(){}

var testCreate = function() {
	var rectangle = new pike.graphics.Rectangle(10, 20, 30, 40);
	assertEquals( 10, rectangle.x  );
	assertEquals( 20, rectangle.y  );
	assertEquals( 30, rectangle.w  );
	assertEquals( 40, rectangle.h  );
	
	var rectangle2 = new pike.graphics.Rectangle();
	assertEquals( 0, rectangle2.x  );
	assertEquals( 0, rectangle2.y  );
	assertEquals( 0, rectangle2.w  );
	assertEquals( 0, rectangle2.h  );
	
};

var testEquals = function(){
	var rectangle1 = new pike.graphics.Rectangle(10, 20, 30, 40);
	
	assertTrue( rectangle1.equals(new pike.graphics.Rectangle(10, 20, 30, 40)) );
	assertFalse( rectangle1.equals(new pike.graphics.Rectangle(100, 200, 300, 400)) );	
};

var testIntersect = function() {
	var rectangle1 = new pike.graphics.Rectangle(0, 0, 500, 100);
	
	assertTrue( rectangle1.intersect(new pike.graphics.Rectangle(499, 100, 10, 10)) );
	assertFalse( rectangle1.intersect(new pike.graphics.Rectangle(600, 100, 30, 40)) );	
};

var testIntersection = function() {
	var rectangle1 = new pike.graphics.Rectangle(0, 0, 100, 100);
	
	assertObjectEquals( new pike.graphics.Rectangle(50, 50, 50, 50), rectangle1.intersection(new pike.graphics.Rectangle(50, 50, 100, 100))); 
	assertNull(rectangle1.intersection(new pike.graphics.Rectangle(100, 100, 100, 100))); 
};

var testCovers = function(){
	var rectangle1 = new pike.graphics.Rectangle(10, 20, 30, 40);
	
	assertTrue( rectangle1.covers(new pike.graphics.Rectangle(10, 20, 30, 40)) );
	assertTrue( rectangle1.covers(new pike.graphics.Rectangle(20, 20, 10, 10)) );
	assertFalse( rectangle1.covers(new pike.graphics.Rectangle(10, 20, 30, 50)) );	
};

var testConvexHull = function(){	
	var rectangle1 = new pike.graphics.Rectangle(0, 0, 10, 10);
	
	assertObjectEquals( new pike.graphics.Rectangle(0, 0, 20, 20), rectangle1.convexHull(new pike.graphics.Rectangle(10, 10, 10, 10)));	
};

var testGetOverlappingGridCells = function(){
	var rectangle1 = new pike.graphics.Rectangle(0, 0, 9, 9);
	var rectangle2 = new pike.graphics.Rectangle(10, 10, 9, 9);
	var rectangle3 = new pike.graphics.Rectangle(10, 10, 19, 19);
	
	assertObjectEquals( new pike.graphics.Rectangle(0, 0, 1, 1), rectangle1.getOverlappingGridCells(10,10,10,10));
	assertObjectEquals( new pike.graphics.Rectangle(1, 1, 1, 1), rectangle2.getOverlappingGridCells(10,10,10,10));
	assertObjectEquals( new pike.graphics.Rectangle(1, 1, 2, 2), rectangle3.getOverlappingGridCells(10,10,10,10));
};

function tearDown(){}
