/**
* @fileoverview Entity manager
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.core.Entity');

goog.require('pike.graphics.Rectangle');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');

/**
* Create a new Entity
* @param {...function} components - comma separated functions
* @constructor
* @extends {goog.events.EventTarget}
* @example
* ~~~
* var myEntity = new pike.core.Entity( pike.components.Sprite, pike.components.Mouse );
* ~~~
*/
pike.core.Entity = function( components ){
	goog.events.EventTarget.call(this);
	this.id = goog.getUid(this);
		
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);
	
	//augment instance
	for(var idx = 0; idx < arguments.length; idx++){
		if (typeof arguments[idx] !== "function"){
	        	throw "Argument is not a function " + arguments[idx];
	    }
		
		arguments[idx].call(this);
	}		
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