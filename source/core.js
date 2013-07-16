/**
* @fileoverview Core wrappers and objects such as viewport, gameworld, timer, stage, entity.
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.core.Entity');
goog.provide('pike.core.Viewport');
goog.provide('pike.core.GameWorld');
goog.provide('pike.core.Timer');
goog.provide('pike.core.Stage');

goog.require('pike.graphics.Rectangle');
goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.events.EventTarget');

//## Entity #####################################
/**
* Create a new Entity
* @param {...function()} components - comma separated functions
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
	
	this.components_ = {};
		
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
		
		//add component name to list
		if( arguments[idx].NAME ){
			this.components_[ arguments[idx].NAME ] = true;
		}
	}			
};

goog.inherits(pike.core.Entity, goog.events.EventTarget);

/**
 * Determine that entity has a component
 * @param {string} name
 * @return {boolean}
 */
pike.core.Entity.prototype.hasComponent = function(name){
	return this.components_[name] ? true : false;
};

/**
* Get boundaries of Entity
* @return {pike.graphics.Rectangle}
*/
pike.core.Entity.prototype.getBounds = function(){
	return new pike.graphics.Rectangle(this.x, this.y, this.w, this.h);
};

/**
* Get collision boundaries of Entity
* @return {pike.graphics.Rectangle}
*/
pike.core.Entity.prototype.getCBounds = function(){
	return this.getBounds();
};

/** @inheritDoc */
pike.core.Entity.prototype.disposeInternal = function() {
	pike.core.Entity.superClass_.disposeInternal.call(this);
	this.handler.dispose();
};

//## Viewport #####################################
/**
* Creates a new Viewport.
* @constructor
* @extends {goog.events.EventTarget}
*/
pike.core.Viewport = function(){
	goog.events.EventTarget.call(this);

	this.viewport_ = new pike.graphics.Rectangle(0,0,0,0); 

	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);	
};

goog.inherits(pike.core.Viewport, goog.events.EventTarget);

/**
* Set size of Viewport
* @param {number} width
* @param {number} height
* @fires {pike.events.ChangeSize} event
*/
pike.core.Viewport.prototype.setSize = function( width, height ){
	var oldW = this.viewport_.w;
	var oldH = this.viewport_.h;
	this.viewport_.w = width;
	this.viewport_.h = height;
		
	if(goog.DEBUG) window.console.log("[pike.core.Viewport] changesize");
	this.dispatchEvent( new pike.events.ChangeSize( this.viewport_.w, this.viewport_.h, oldW, oldH, this) );
};

/**
* Set position of Viewport
* @param {number} x
* @param {number} y
* @fires {pike.events.ChangePosition} event
*/
pike.core.Viewport.prototype.setPosition = function( x, y ){
	var oldX = this.viewport_.x;
	var oldY = this.viewport_.y;
	this.viewport_.x = x;
	this.viewport_.y = y;
	
	if(goog.DEBUG) window.console.log("[pike.core.Viewport] changeposition");
	this.dispatchEvent(new pike.events.ChangePosition( this.viewport_.x, this.viewport_.y, oldX, oldY, this));
};

/**
* Get boundaries of Viewport
* @return {pike.graphics.Rectangle}
*/
pike.core.Viewport.prototype.getBounds = function(){
	return this.viewport_.copy();
};

//## GameWorld #####################################
/**
* Creates a new Gameworld.
* @constructor
* @extends {goog.events.EventTarget}
*/
pike.core.GameWorld = function(){
	goog.events.EventTarget.call(this);

	this.bounds_ = new pike.graphics.Rectangle(0,0,0,0); 	

	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);			
};

goog.inherits(pike.core.GameWorld, goog.events.EventTarget);

/**
* Set size of GameWorld
* @param {number} width
* @param {number} height
* @fires {pike.events.ChangeSize} event
*/
pike.core.GameWorld.prototype.setSize = function( width, height ){	
	var oldW = this.bounds_.w;
	var oldH = this.bounds_.h;
	this.bounds_.w = width;
	this.bounds_.h = height;

	if(goog.DEBUG) window.console.log("[pike.core.GameWorld] changesize");
	this.dispatchEvent( new pike.events.ChangeSize(this.bounds_.w, this.bounds_.h, oldW, oldH, this) );
};

/**
* Get boundaries of GameWorld
* @return {pike.graphics.Rectangle}
*/
pike.core.GameWorld.prototype.getBounds = function(){
	return this.bounds_.copy();
};

//## Timer #####################################
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
	if (!this.requestID_){	
		this.tick();	
		if(goog.DEBUG) window.console.log("[pike.core.Timer] start");
	}
};

/**
 * Stops Timer
 */
pike.core.Timer.prototype.stop = function(){	
	if(this.requestID_){    		
		window.cancelAnimationFrame( this.requestID_ );	
		this.requestID_ = undefined;
		if(goog.DEBUG) window.console.log("[pike.core.Timer] stop");
	}	
};

/**
 * @returns {boolean}
 */
pike.core.Timer.prototype.isRunning = function(){
	return this.requestID_ ? true : false;
};

/**
 * Tick
 * @fires {pike.events.Update} event
 * @fires {pike.events.Render} event
 */
pike.core.Timer.prototype.tick = function(){	
	this.requestID_ = window.requestAnimationFrame( this.boundTick_ );
	this.dispatchEvent( new pike.events.Update( new Date().getTime(), this));
	this.dispatchEvent( new pike.events.Render( new Date().getTime(), this));		
};

//## Stage #####################################
/**
* Create a new Stage 
* @constructor
* @extends {goog.events.EventTarget}
*/
pike.core.Stage = function(){
	goog.events.EventTarget.call(this);
	
	this.viewport_ = new pike.graphics.Rectangle(0, 0, 0, 0);
	this.gameWorld_ = new pike.graphics.Rectangle(0, 0, 0, 0);
	
	this.layers_ = [];
	
	this.createRootElement_();	
	
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);	
};

goog.inherits(pike.core.Stage, goog.events.EventTarget);

/**
 * DOM Element id for Viewport
 * @const
 * @type {string}
 */
pike.core.Stage.ELEMENT_ID = "pike-stage";

/**
 * Get a layer
 * @param {string} name - layer name
 * @return {?pike.layers.Layer}
 */
pike.core.Stage.prototype.getLayer = function( name ){
	for(var idx = 0; idx < this.layers_.length; idx++){
		if(this.layers_[idx].name == name){
			return this.layers_[idx]; 
		}		
	}
	
	throw new Error("Layer with name " + name + " does not exist.");
};

/**
 * Register a layer
 * @param {pike.layers.Layer} layer
 */
pike.core.Stage.prototype.addLayer = function( layer ){
	this.setLayerSize_( layer );	
	this.layers_.push(layer); //TODO		
	this.getRootElement().appendChild( layer.getScreen().canvas );	
};

/**
 * The root DOM element of the stage
 * @return {Object} rootElement
 */
pike.core.Stage.prototype.getRootElement = function(){
	return this.rootElement_;
};

/**
 * onRender event handler
 * @param {pike.events.Render} e
 */
pike.core.Stage.prototype.onRender = function( e ){
	for(var idx = 0; idx < this.layers_.length; idx++){
		this.layers_[idx].onRender();			
	}
};

/**
 * on Viewport change size handler
 * @param {pike.events.ChangeSize} e
 */
pike.core.Stage.prototype.onViewportChangeSize = function(e){
	this.setViewportSize_(e.w, e.h);
};

/**
 * on Viewport change position handler
 * @param {pike.events.ChangePosition} e
 */
pike.core.Stage.prototype.onViewportChangePosition = function(e){
	this.setViewportPosition_(e.x, e.y);
};

/**
 * on GameWorld change size handler
 * @param {pike.events.ChangeSize} e
 */
pike.core.Stage.prototype.onGameWorldChangeSize = function(e){
	this.setGameWorldSize_(e.w, e.h);
};

/**
 * Create root element
 * @private
 */
pike.core.Stage.prototype.createRootElement_ = function(){
	this.rootElement_ = document.getElementById( pike.core.Stage.ELEMENT_ID );	
	if(!this.rootElement_){
		this.rootElement_ = document.createElement("div");
		this.rootElement_.setAttribute("id", pike.core.Stage.ELEMENT_ID);
		document.getElementsByTagName("body")[0].appendChild( this.rootElement_ );		
	}else{
		this.rootElement_.innerHTML = '';
	}
	
	this.rootElement_.style.position  = "relative";
};

/**
 * Sets the layer size
 * @param {pike.layers.Layer} layer
 * @private
 */
pike.core.Stage.prototype.setLayerSize_ = function(layer){	
	layer.setViewportSize( this.viewport_.w, this.viewport_.h );
	layer.setViewportPosition( this.viewport_.x, this.viewport_.y );
	layer.setGameWorldSize( this.gameWorld_.w, this.gameWorld_.h );
};

/**
 * Set internal viewport size
 * @param {number} width
 * @param {number} height
 * @private
 */
pike.core.Stage.prototype.setViewportSize_ = function(width, height){
	if(this.viewport_.w == width
	&& this.viewport_.h == height){
		return
	}
	
	this.viewport_.w = width;
	this.viewport_.h = height;
	
	this.rootElement_.style.width = this.viewport_.w + "px";
	this.rootElement_.style.height = this.viewport_.h + "px";
	
	if(this.gameWorld_.w < width 
	|| this.gameWorld_.h < height ){
		this.setGameWorldSize_( width, height);
	}
	
	for(var idx = 0; idx < this.layers_.length; idx++){
		this.setLayerSize_(this.layers_[idx]);
	}
};

/**
 * Set internal gameWorld size
 * @param {number} width
 * @param {number} height
 * @private
 */
pike.core.Stage.prototype.setGameWorldSize_ = function(width, height){
	this.gameWorld_.w = Math.max(width, this.viewport_.w);
	this.gameWorld_.h = Math.max(height, this.viewport_.h);
	
	for(var idx = 0; idx < this.layers_.length; idx++){
		this.setLayerSize_(this.layers_[idx]);
	}
};

/**
 * Set internal viewport position
 * @param {number} x
 * @param {number} y
 * @private
 */
pike.core.Stage.prototype.setViewportPosition_ = function(x,y){
	this.viewport_.x = x;
	this.viewport_.y = y;
	
	for(var idx = 0; idx < this.layers_.length; idx++){		
		this.layers_[idx].setViewportPosition(this.viewport_.x, this.viewport_.y);							
	}
};


