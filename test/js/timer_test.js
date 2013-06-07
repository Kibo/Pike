goog.require('pike.core.Timer');
goog.require('pike.events.Update');
goog.require('pike.events.Render');
goog.require('goog.events.EventTarget');

var testCase = new goog.testing.ContinuationTestCase();
testCase.autoDiscoverTests();
G_testRunner.initialize(testCase);

function setUpPage(){}
function setUp(){}

function testTimerEventUpdate() {
	var timer = new pike.core.Timer();
	var event = null;
		
    goog.events.listen(timer, pike.events.Update.EVENT_TYPE, function(e) {
    	event = e;
    });
    
    waitForEvent(timer, pike.events.Update.EVENT_TYPE, function() {
    	assertTrue( event instanceof pike.events.Update);
    	assertTrue( event.target === timer);
    	assertNotNull(event.now);  
    });
         
    timer.start();
    timer.stop();
};

function testTimerEventRender() {
	var timer = new pike.core.Timer();
	var event = null;
		
    goog.events.listen(timer, pike.events.Render.EVENT_TYPE, function(e) {
    	event = e;
    });
    
    waitForEvent(timer, pike.events.Render.EVENT_TYPE, function() {
    	assertTrue( event instanceof pike.events.Render);
    	assertTrue( event.target === timer);
    	assertNotNull(event.now);  
    });
         
    timer.start();
    timer.stop();
};

function tearDown(){}
