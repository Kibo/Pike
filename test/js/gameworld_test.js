goog.require('pike.core.Gameworld');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('pike.events.ViewportChangePosition');
goog.require('pike.events.ViewportChangeSize');

function setUpPage(){}
function setUp(){}

var testCreate = function() {
	var gw = new pike.core.Gameworld(300, 10);
	assertEquals( 300, gw.w  );
	assertEquals( 10, gw.h  );
};

var testGetBounds = function(){
	var gw = new pike.core.Gameworld(400, 20);	
	assertTrue( gw.getBounds().x == 0 
			 && gw.getBounds().y == 0 
			 && gw.getBounds().w == 400 
			 && gw.getBounds().h == 20);
};

var testSetSize = function(){
	var gw = new pike.core.Gameworld(400, 20);
	gw.setSize(800, 20);
	
	assertEquals( 800, gw.w  );
	assertEquals( 20, gw.h  );	
};


var testGetHandler = function(){
	var gw = new pike.core.Gameworld(400, 20);	
	assertTrue( gw.handler instanceof goog.events.EventHandler);
};

function tearDown(){}
