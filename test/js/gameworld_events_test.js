goog.require('pike.core.Gameworld');
goog.require('pike.events.GameworldChangeSize');
goog.require('goog.events.EventTarget');

var testCase = new goog.testing.ContinuationTestCase();
testCase.autoDiscoverTests();
G_testRunner.initialize(testCase);

function setUpPage(){}
function setUp(){}

function testChangeSize() {
	var gw = new pike.core.Gameworld(100, 200);
		
	var event = null;
    goog.events.listen(gw, pike.events.GameworldChangeSize.EVENT_TYPE, function(e) {
    	event = e;
    });
		  
    waitForEvent(gw, pike.events.GameworldChangeSize.EVENT_TYPE, function() {
    	assertTrue( event instanceof pike.events.GameworldChangeSize);
    	assertTrue( event.target === gw);
    	assertEquals(100, event.oldW);
    	assertEquals(200, event.oldH);
    	assertEquals(2500, event.w);
    	assertEquals(1280, event.h);    
    });
         
    gw.setSize(2500, 1280);
};

function tearDown(){}
