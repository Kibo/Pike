goog.require('pike.core.EntityManager');
goog.require('pike.events.NewEntity');

function setUpPage(){}
function setUp(){}

var testCreate = function() {
	var em = new pike.core.EntityManager();
	assertTrue(em.all().length == 0 );	
};

var testAddComponent = function() {
	var em = new pike.core.EntityManager();
	em.addComponent("Testa", {});	
	assertNotNull( em.components_["Testa"] );	
};


var testCreateEntity = function() {
	var em = new pike.core.EntityManager();
	
	em.addComponent("C1", {		
		c1:"c1",
		init:function(){
			this.c1Init = "c1Init";			
		},
		toC1:function(){
			return this.c1 + " " + this.c1Init;
		},			
	});	
	
	em.addComponent("C2", {		
		c2:"c2",
		init:function(){
			this.c2Init = "c2Init";
		},
		toC2:function(){
			return this.c2 + " " + this.c2Init;
		},			
	});
	
	em.addComponent("C3", {		
		c3:"c3",		
		toC3:function(){
			return this.c3;
		},			
	});
		
	var entity = em.create( "C1, C2, C3");	
	assertEquals( "c1", entity.c1);
	assertEquals( "c2", entity.c2);
	assertEquals( "c3", entity.c3);
	
	assertEquals( "c1 c1Init", entity.toC1());
	assertEquals( "c2 c2Init", entity.toC2());
	assertEquals( "c3", entity.toC3());
};

var testGetEntity = function() {
	var em = new pike.core.EntityManager();
	var entity = em.create();
	assertNotNull( entity.id )	
};

var testDestroy = function() {
	var em = new pike.core.EntityManager();
	var entity = em.create();
	var id = entity.id;
	em.destroy( entity );
	
	assertUndefined( em.get(id));	
};




function tearDown(){}
