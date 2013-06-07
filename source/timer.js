/**
* @fileoverview Timer
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.core.Timer');

goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');
goog.require('pike.events.Update');
goog.require('pike.events.Render');

/**
* Creates a new Timer.
* @constructor
* @extends {goog.events.EventTarget}
*/
pike.core.Timer = function(){
	goog.events.EventTarget.call(this);	
	
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);
	
	this.boundTick_ = goog.bind(this.tick, this);
};

goog.inherits(pike.core.Timer, goog.events.EventTarget);

/**
 * Starts Timer
 */
pike.core.Timer.prototype.start = function(){
	this.stop();	
	this.tick();
};

/**
 * Stops Timer
 */
pike.core.Timer.prototype.stop = function(){	
	if(this.requestID_){    		
		window.cancelAnimationFrame( this.requestID_ );		
	}	
};

/**
 * Tick
 * @fires {pike.events.Update} event
 * @fires {pike.events.Render} event
 */
pike.core.Timer.prototype.tick = function(){	
	this.dispatchEvent( new pike.events.Update( new Date().getTime(), this));		
	this.dispatchEvent( new pike.events.Render( new Date().getTime(), this));	
	this.requestID_ = window.requestAnimationFrame( this.boundTick_ );
};
