/**
* @fileoverview Viewport
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.core.Viewport');

goog.require('pike.graphics.Rectangle');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');

/**
* Creates a new Viewport.
* @param {number} width
* @param {number} height
* @constructor
* @extends {goog.events.EventTarget}
*/
pike.core.Viewport = function( width, height ){
	goog.events.EventTarget.call(this);
	
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;	
	
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);
	
	this._createElement();
	this.setSize(width, height);		
};

goog.inherits(pike.core.Viewport, goog.events.EventTarget);

/**
 * DOM Element id for Viewport
 * @const
 * @type {string}
 */
pike.core.Viewport.ELEMENT_ID = "pike-stage";

/**
* Set size of Viewport
* @param {number} width
* @param {number} height
* @fires {pike.events.ViewportChangeSize} event
*/
pike.core.Viewport.prototype.setSize = function( width, height ){
	var oldW = this.w;
	var oldH = this.h;
	this.w = width;
	this.h = height;
	
	this._DOMElement.style.width = this.w + "px";
	this._DOMElement.style.height = this.h + "px";
		
	this.dispatchEvent( new pike.events.ViewportChangeSize(oldW, oldH, this.w, this.h, this) );
	if(goog.DEBUG) console.log("[pike.core.Viewport] changesize");
};

/**
* Set position of Viewport
* @param {number} x
* @param {number} y
* @fires {pike.events.ViewportChangePosition} event
*/
pike.core.Viewport.prototype.setPosition = function( x, y ){
	var oldX = this.x;
	var oldY = this.y;
	this.x = x;
	this.y = y;
	
	this.dispatchEvent(new pike.events.ViewportChangePosition(oldX, oldY, this.x, this.y, this));
	if(goog.DEBUG) console.log("[pike.core.Viewport] changeposition");
};

/**
* Get boundaries of Viewport
* @return {pike.graphics.Rectangle}
*/
pike.core.Viewport.prototype.getBounds = function(){
	return new pike.graphics.Rectangle(this.x, this.y, this.w, this.h);
};

/**
 * Get Viewport as DOM element
 * @returns {DOM element}
 */
pike.core.Viewport.prototype.getDOMElement = function(){
	return this._DOMElement;
};

/**
 * Get Handler
 * @returns {goog.events.EventHandler}
 */
pike.core.Viewport.prototype.getHandler = function(){
	return this.handler;
};

/**
 * Center the Viewport on a entity
 * @param {pike.graphics.Rectangle} rectangle
 * @param {number} offsetX
 * @param {number} offsetY
 */
pike.core.Viewport.prototype.centerOn = function( rectangle, boundary ){
	//TODO
};

/**
 * Create DOM element for Viewport
 * @private
 */
pike.core.Viewport.prototype._createElement = function(){
	this._DOMElement = document.getElementById( pike.core.Viewport.ELEMENT_ID );	
	if(!this._DOMElement){
		this._DOMElement = document.createElement("div");
		this._DOMElement.setAttribute("id", pike.core.Viewport.ELEMENT_ID);
		document.getElementsByTagName("body")[0].appendChild( this._DOMElement );		
	}else{
		this._DOMElement.innerHTML = '';
	}
	
	this._DOMElement.style.position  = "relative";		
};
									   