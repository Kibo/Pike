goog.require('pike.core.Viewport');
goog.require('pike.events.ViewportChangePosition');
goog.require('pike.events.ViewportChangeSize');
goog.require('goog.events.EventTarget');

var testCase = new goog.testing.ContinuationTestCase();
testCase.autoDiscoverTests();
G_testRunner.initialize(testCase);

function setUpPage(){}
function setUp(){}

function testViewportEventViewportChangePosition() {
	var viewport = new pike.core.Viewport(300, 10);
	var event = null;
    goog.events.listen(viewport, pike.events.ViewportChangePosition.EVENT_TYPE, function(e) {
    	event = e;
    });
    
    waitForEvent(viewport, pike.events.ViewportChangePosition.EVENT_TYPE, function() {
    	assertTrue( event instanceof pike.events.ViewportChangePosition);
    	assertTrue( event.target === viewport);
    	assertEquals(0, event.oldX);
    	assertEquals(0, event.oldY);
    	assertEquals(100, event.x);
    	assertEquals(200, event.y);
    })
         
    viewport.setPosition(100, 200);
};

function testViewportEventViewportChangeSize() {
	var viewport = new pike.core.Viewport(300, 10);
	var event = null;
    goog.events.listen(viewport, pike.events.ViewportChangeSize.EVENT_TYPE, function(e) {
    	event = e;
    });
    
    waitForEvent(viewport, pike.events.ViewportChangeSize.EVENT_TYPE, function() {
    	assertTrue( event instanceof pike.events.ViewportChangeSize);
    	assertTrue( event.target === viewport);
    	assertEquals(300, event.oldW);
    	assertEquals(10, event.oldH);
    	assertEquals(100, event.w);
    	assertEquals(20, event.h);
    })
         
    viewport.setSize(100, 20);
};

function tearDown(){}
