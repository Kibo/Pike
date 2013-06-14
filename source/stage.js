/**
* @fileoverview Stage
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.core.Stage');

goog.require('pike.graphics.Rectangle');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');
goog.require('goog.array');

/**
* Stage 
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
		this.render_( this.layers_[idx] );			
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
					~~(layer.dirtyManager.getDirtyRectangle().x - this.viewport_.x),
					~~(layer.dirtyManager.getDirtyRectangle().y - this.viewport_.y),
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
		
		var screen = this.layers_[idx].getScreen();		
		screen.isDirty = true;	
		
		if(this.layers_[idx].hasDirtyManager()){
			this.layers_[idx].dirtyManager.setPosition( this.viewport_.x, this.viewport_.y);			
		}		
	}
};

