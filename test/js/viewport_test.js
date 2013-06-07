goog.require('pike.core.Viewport');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('pike.events.ViewportChangePosition');
goog.require('pike.events.ViewportChangeSize');

function setUpPage(){}
function setUp(){}

var testCreate = function() {
	var viewport = new pike.core.Viewport(300, 10);
	assertEquals( 300, viewport.w  );
	assertEquals( 10, viewport.h  );
};

var testElement = function() {
	var viewport = new pike.core.Viewport(400, 15);
	var element = document.getElementById( pike.core.Viewport.ELEMENT_ID );
	assertNotNull( element );
	assertEquals( element, viewport.getDOMElement());
	assertTrue( element.getAttribute("id") === pike.core.Viewport.ELEMENT_ID );	
};

var testGetBounds = function(){
	var viewport = new pike.core.Viewport(200, 10);	
	assertTrue( viewport.getBounds().x == 0 
			 && viewport.getBounds().y == 0 
			 && viewport.getBounds().w == 200 
			 && viewport.getBounds().h == 10);
};

var testSetSize = function(){
	var viewport = new pike.core.Viewport(200, 10);
	viewport.setSize(800, 20);
	
	assertEquals( 800, viewport.w  );
	assertEquals( 20, viewport.h  );
	
	assertEquals( "800px", viewport.getDOMElement().style.width  );
	assertEquals( "20px", viewport.getDOMElement().style.height  );	
};

var testSetPosition = function(){
	var viewport = new pike.core.Viewport(200, 10);	
	viewport.setPosition(50, 5);
	assertTrue( viewport.getBounds().x == 50 
			 && viewport.getBounds().y == 5 
			 && viewport.getBounds().w == 200 
			 && viewport.getBounds().h == 10);
	
};

var testGetHandler = function(){
	var viewport = new pike.core.Viewport(200, 10);	
	assertTrue( viewport.handler instanceof goog.events.EventHandler);
};

function tearDown(){}
