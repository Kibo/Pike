/**
* @fileoverview Render manager
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.core.RenderManager');

goog.require('pike.graphics.Rectangle');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');
goog.require('goog.array');

/**
* Render manager 
* manages layers and render system
* @constructor
* @extends {goog.events.EventTarget}
*/
pike.core.RenderManager = function(){
	goog.events.EventTarget.call(this);
	
	/**
	* @type {!goog.events.EventHandler}
	* @protected
	*/
	this.handler = new goog.events.EventHandler(this);
	this.layers_ = [];		
	
	this.viewport_ = new pike.graphics.Rectangle(0, 0, 0, 0);
	this.gameWorld_ = new pike.graphics.Rectangle(0, 0, 0, 0);
};

goog.inherits(pike.core.RenderManager, goog.events.EventTarget);

/**
 * Get a layer
 * @param {string} name - layer name
 * @return {?pike.layers.Layer}
 */
pike.core.RenderManager.prototype.getLayer = function( name ){
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
pike.core.RenderManager.prototype.addLayer = function( layer ){
	this.layers_.push(layer);		
	if(goog.DEBUG) console.log("[pike.core.RenderManager] newlayer " + layer.name);
	this.dispatchEvent( new pike.events.NewLayer(layer, this) );	
};

/**
 * onViewportChangePosition event handler
 * @param {pike.events.ViewportChangePosition} e
 */
pike.core.RenderManager.prototype.onViewportChangePosition = function(e){
	this.viewport_.x = e.x;
	this.viewport_.y = e.y;
	for(var idx = 0; idx < this.layers_.length; idx++){
		var screen = this.layers_[idx].getScreen();		
		screen.isDirty = true;		
	}
};

/**
 * onViewportChangeSize event handler
 * @param {pike.events.ViewportChangeSize} e
 */
pike.core.RenderManager.prototype.onViewportChangeSize = function(e){
	this.viewport_.w = e.w;
	this.viewport_.h = e.h;
	for(var idx = 0; idx < this.layers_.length; idx++){
		var screen = this.layers_[idx].getScreen();
		screen.canvas.width = e.w;
		screen.canvas.height = e.h;
		screen.isDirty = true;		
	}		
};

/**
 * onGameWorldChangeSize event handler
 * @param {pike.events.GameWorldChangeSize} e
 */
pike.core.RenderManager.prototype.onGameWorldChangeSize = function(e){
	this.gameWorld_.w = e.w;
	this.gameWorld_.h = e.h;
	for(var idx = 0; idx < this.layers_.length; idx++){
		var offScreen = this.layers_[idx].getOffScreen();
		offScreen.canvas.width = e.w;
		offScreen.canvas.height = e.h;
		offScreen.isDirty = true;		
	}
};

/**
 * Render layer to canvas
 * @param {pike.layers.Layer} layer
 * @private
 */
pike.core.RenderManager.prototype.render_ = function( layer ){	
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
		if(goog.DEBUG) console.log("[pike.core.RenderManager] " + layer.name + " redraw offScreen");		
	}
	
	if(layer.getScreen().isDirty){		 	
		screen.context.clearRect( 0, 0, this.viewport_.w, this.viewport_.h );
		screen.context.drawImage(
				layer.getOffScreen().canvas,
				this.viewport_.x, this.viewport_.y, this.viewport_.w, this.viewport_.h,
				0, 0, this.viewport_.w, this.viewport_.h
		);					
		screen.isDirty = false;
		if(goog.DEBUG) console.log("[pike.core.RenderManager] " + layer.name + " redraw screen");
	}	
};

/**
 * onRender event handler
 * @param {pike.events.Render} e
 */
pike.core.RenderManager.prototype.onRender = function( e ){
	for(var idx = 0; idx < this.layers_.length; idx++){
		this.render_( this.layers_[idx] );			
	}
};
