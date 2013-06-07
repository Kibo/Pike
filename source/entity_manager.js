/**
* @fileoverview Entity manager
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.core.EntityManager');
goog.provide('pike.core.Entity');

goog.require('pike.graphics.Rectangle');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');
goog.require('goog.array');

/**
* Entity manager 
* manages entities and components
* @constructor
* @extends {goog.events.EventTarget}
*/
pike.core.EntityManager = function(){
	goog.events.EventTarget.call(this);
	
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);
	
	this.components_ = {};
	this.entities_ = [];
};

goog.inherits(pike.core.EntityManager, goog.events.EventTarget);

/**
 * Creates a entity
 * @param {string} components - comma separated string
 * @return {pike.core.Entity}
 * @example
 * ~~~
 * var myEntity = pike.core.EntityManager.create( "Mouse", Collision" );
 * ~~~
 */
pike.core.EntityManager.prototype.create = function( components ){
	var entity = new pike.core.Entity();
	
	if ( components ) {                 	            	            	     
    	var componentsArray = components.split(",");	        	
    	for(var i = 0; i < componentsArray.length; i++ ){      		    	
    		var componentName = componentsArray[i].trim();
    		if(!this.components_[ componentName ]){
    			throw new Error("Component with name: " + componentName + " is not registered.");
    		}
    		
    		this.augment_(entity, this.components_[ componentName ]);
    		if( typeof this.components_[ componentName ].init === 'function'){
    			this.components_[ componentName ].init.call(entity);
    		}    		    		    		    			      
    	}            	            
    }
			
	this.entities_.push( entity );
	this.dispatchEvent( new pike.events.NewEntity( entity.id, this) ); //TODO
	return entity;
};

/**
 * Get a entity
 * @param {number} id - entity id
 * @return {?pike.core.Entity}
 */
pike.core.EntityManager.prototype.get = function( id ){
	for(var idx = 0; idx < this.entities_.length; i++ ){
		if(this.entities_[idx].id === id){
			return this.entities_[idx];
		}
	}	
};

/**
 * Get all registered entities
 * @return {Array.<pike.core.Entity>}
 */
pike.core.EntityManager.prototype.all = function(){
	return this.entities_;
};

/**
 * Unregister entity from Entity manager
 * @param {pike.core.Entity} entity
 */
pike.core.EntityManager.prototype.destroy = function( entity ){
	entity.dispose();
	goog.array.remove(this.entities_, entity);	
};

/**
 * Registers a component
 * Component is a JavaScript module with init method.
 * @param {string} compName
 * @param {Object} component - JavaScript module with init method
 * @example
 * ~~~
 * pike.core.EntityManager.c( "MyComponent",{
 * 	someProp:132,	
 * 	init:function(){},
 * 	someFunc:function(){}, 	
 * });
 * ~~~
 */
pike.core.EntityManager.prototype.addComponent = function( compName, component ){
	this.components_[compName] = component;
};

/**
 * Augment existing 'class' from another
 * @param {Object} receivingClass
 * @param {Object} givingClass
 * @return {Object} 
 * @private
 */
pike.core.EntityManager.prototype.augment_ = function( receivingClass, givingClass ){
	if(!receivingClass ){
		throw new Error("ReceivingClass is null.");
	}
	
	//don't bother with nulls
    if (!givingClass) return receivingClass;
    
    var key;
    for (key in givingClass) {
        if (receivingClass === givingClass[key]) continue; //handle circular reference
       	delete receivingClass[key];
       	receivingClass[key] = givingClass[key];
    }
    
	return receivingClass;
};

//## Entity ########################################################
/**
* The base class for all game entities
* @constructor
* @extends {goog.events.EventTarget}
*/
pike.core.Entity = function(){
	goog.events.EventTarget.call(this);
	this.id = goog.getUid(this);
	
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);
};

goog.inherits(pike.core.Entity, goog.events.EventTarget);

/**
* Get boundaries of Entity
* @return {pike.graphics.Rectangle}
*/
pike.core.Entity.prototype.getBounds = function(){
	return new pike.graphics.Rectangle(this.x, this.y, this.w, this.h);
};

/** @inheritDoc */
pike.core.Entity.prototype.disposeInternal = function() {
	pike.core.Entity.superClass_.disposeInternal.call(this);
	this.handler.dispose();
};
