/**
* @fileoverview Stage
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.core.Stage');

goog.require('pike.graphics.Rectangle');
goog.require('pike.events.ViewportChangePosition');
goog.require('pike.events.ViewportChangeSize');
goog.require('pike.events.GameWorldChangeSize');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');
goog.require('goog.array');

/**
* Stage 
* @param {number} width
* @param {number} height
* @constructor
* @extends {goog.events.EventTarget}
*/
pike.core.Stage = function( width, height ){
	goog.events.EventTarget.call(this);
	
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);
	
	this.layers_ = [];		
	
	this.viewport_ = new pike.graphics.Rectangle(0, 0, 0, 0);
	this.gameWorld_ = new pike.graphics.Rectangle(0, 0, 0, 0);
		
	this.createRootElement_();
	
	this.setViewportSize(width, height);	
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
};

/**
 * Register a layer
 * @param {pike.layers.Layer} layer
 */
pike.core.Stage.prototype.addLayer = function( layer ){
	this.setLayerSize_( layer );
	
	if(layer.hasDirtyManager()){
		layer.dirtyManager.setPosition( this.viewport_.x, this.viewport_.y);
		layer.dirtyManager.setSize( this.viewport_.w, this.viewport_.h );
		layer.dirtyManager.handler.listen(this, pike.events.ViewportChangeSize.EVENT_TYPE, goog.bind( layer.dirtyManager.onViewportChangeSize, layer.dirtyManager));
		layer.dirtyManager.handler.listen(this, pike.events.ViewportChangePosition.EVENT_TYPE, goog.bind( layer.dirtyManager.onViewportChangePosition, layer.dirtyManager));						
	}
		
	this.layers_.push(layer);		
	this.getRootElement().appendChild( layer.getScreen().canvas );	
};

/**
* Set position of the Viewport
* @param {number} x
* @param {number} y
* @fires {pike.events.ViewportChangePosition} event
*/
pike.core.Stage.prototype.setViewportPosition = function(x, y){	
	this.viewport_.x = x;
	this.viewport_.y = y;
	
	for(var idx = 0; idx < this.layers_.length; idx++){
		var screen = this.layers_[idx].getScreen();		
		screen.isDirty = true;		
	}
	
	if(goog.DEBUG) console.log("[pike.core.Stage] changeposition");
	this.dispatchEvent(new pike.events.ViewportChangePosition( this.viewport_.x, this.viewport_.y, this));
};

/**
* Set size of the Viewport
* @param {number} width
* @param {number} height
* @fires {pike.events.ChangeSize} event
*/
pike.core.Stage.prototype.setViewportSize = function(width, height){
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
		this.setGameWorldSize(width, height);
	}
	
	for(var idx = 0; idx < this.layers_.length; idx++){
		this.setLayerSize_(this.layers_[idx]);
	}
		
	if(goog.DEBUG) console.log("[pike.core.Stage] viewportchangesize");
	this.dispatchEvent( new pike.events.ViewportChangeSize( this.viewport_.w, this.viewport_.h, this) );		
};

/**
* Set size of the GameWorld
* @param {number} width
* @param {number} height
* @fires {pike.events.GameWorldChangeSize} event
*/
pike.core.Stage.prototype.setGameWorldSize = function(width, height){
		
	this.gameWorld_.w = Math.max(width, this.viewport_.w);
	this.gameWorld_.h = Math.max(height, this.viewport_.h);
	
	for(var idx = 0; idx < this.layers_.length; idx++){
		this.setLayerSize_(this.layers_[idx]);
	}
	
	if(goog.DEBUG) console.log("[pike.core.Stage] gameworldchangesize");
	this.dispatchEvent( new pike.events.GameWorldChangeSize( this.gameWorld_.w, this.gameWorld_.h, this) );
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
		this.render_( this.layers_[idx] );			
	}
};

/**
 * Render layer to canvas
 * @param {pike.layers.Layer} layer
 * @private
 */
pike.core.Stage.prototype.render_ = function( layer ){		
	var screen = layer.getScreen();
	var offScreen = layer.getOffScreen();
		
	if(layer.hasDirtyManager()){
		
		if(!layer.dirtyManager.isClean()){	
			
			offScreen.context.clearRect(
					layer.dirtyManager.getDirtyRectangle().x,
					layer.dirtyManager.getDirtyRectangle().y,
					layer.dirtyManager.getDirtyRectangle().w,
					layer.dirtyManager.getDirtyRectangle().h
			);
			
			layer.dispatchEvent( new pike.events.Render( new Date().getTime(), this));
						
			if(!screen.isDirty){
				screen.context.clearRect(
					layer.dirtyManager.getDirtyRectangle().x,
					layer.dirtyManager.getDirtyRectangle().y,
					layer.dirtyManager.getDirtyRectangle().w,
					layer.dirtyManager.getDirtyRectangle().h						
				);
				
				screen.context.drawImage(
						offScreen.canvas,
						layer.dirtyManager.getDirtyRectangle().x,
						layer.dirtyManager.getDirtyRectangle().y,
						layer.dirtyManager.getDirtyRectangle().w,
						layer.dirtyManager.getDirtyRectangle().h,
						
						~~(layer.dirtyManager.getDirtyRectangle().x - this.viewport_.x),
						~~(layer.dirtyManager.getDirtyRectangle().y - this.viewport_.y),
						layer.dirtyManager.getDirtyRectangle().w,
						layer.dirtyManager.getDirtyRectangle().h						
				);										
			}
								
			layer.dirtyManager.clear();			
		}
		
	}else if( offScreen.isDirty ){
		
		offScreen.context.clearRect( 0, 0, this.gameWorld_.w, this.gameWorld_.h );
		layer.dispatchEvent( new pike.events.Render( new Date().getTime(), this) );
				
		offScreen.isDirty = false;
		screen.isDirty = true;
		if(goog.DEBUG) console.log("[pike.core.Stage] " + layer.name + " redraw offScreen");		
	}
	
	if(layer.getScreen().isDirty){		 	
		screen.context.clearRect( 0, 0, this.viewport_.w, this.viewport_.h );
		screen.context.drawImage(
				layer.getOffScreen().canvas,
				this.viewport_.x, this.viewport_.y, this.viewport_.w, this.viewport_.h,
				0, 0, this.viewport_.w, this.viewport_.h
		);					
		screen.isDirty = false;
		if(goog.DEBUG) console.log("[pike.core.Stage] " + layer.name + " redraw screen");
	}	
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
	var screen = layer.getScreen();	
	screen.canvas.width = this.viewport_.w;
	screen.canvas.height = this.viewport_.h;
	screen.isDirty = true;
	
	var offScreen = layer.getOffScreen();
	offScreen.canvas.width = this.gameWorld_.w;
	offScreen.canvas.height = this.gameWorld_.h;
	offScreen.isDirty = true;	
};

