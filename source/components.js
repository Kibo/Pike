/**
* @fileoverview Components
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.components.Sprite');

goog.require('goog.events.EventHandler');
goog.require('pike.graphics.Rectangle');
goog.require('pike.events.ViewportChangePosition');

//## Sprite #################################
/**
 * Sprite
 * @constructor
 */
pike.components.Sprite = function(){
	
	this.x = 100;
	this.y = 100;
	this.w = 32;
	this.h = 32;
	
	/**
	 * Set sprite
	 * 
	 * @param {Object} image
	 * @param {number} sx - x position on source image
	 * @param {number} sy - y position on source image
	 * @param {number} sw - width on source image
	 * @param {number} sh - height on source image
	 * @param {number} numberOfFrames
	 * @param {numner} time - ms
	 * @return this
	 */
	this.setSprite = function( image, sx, sy, sw, sh, numberOfFrames, time ){
		this.spriteSource={x:sx, y:sy, w:sw, h:sh};
		this.spriteSource.image = image;		
		this.spriteSource.numberOfFrames = numberOfFrames ? numberOfFrames : 1;
		this.spriteSource.currentFrame = 0;
		//TODO
						
		return this;
	};
	
	/**
	 * On update handler
	 * @param {pike.events.Update} e
	 */
	this.onSpriteUpdate = function(e){		
		//TODO
		this.setDirty(this.getBounds());		
	};
	
	/**
	 * On render handler
	 * @param {pike.events.Render} e
	 */
	this.onSpriteRender = function(e){		
		this.layer.getOffScreen().context.drawImage(
				this.spriteSource.image, 
				this.spriteSource.x, this.spriteSource.y, this.spriteSource.w, this.spriteSource.h,
				~~this.x, ~~this.y, this.w, this.h				
		);			
	};
	
	/**
	 * Set dirty ares
	 * @param {{pike.graphics.Rectangle} rect
	 */
	this.setDirty = function(rect){
		if(this.layer.hasDirtyManager()){
			this.layer.dirtyManager.markDirty( rect );			
		}else{		
			this.layer.getOffScreen().isDirty = true;
		}
	};
};

//## Background #################################
/**
 * Background
 * @constructor
 */
pike.components.Image = function(){
	
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	
	this.setImage = function( image ){
		this.image = image;
		this.w = image.width;
		this.h = image.height;
	};	
	
	this.onImageRender = function(e){
		this.layer.getOffScreen().context.drawImage(
				this.image,
				0, 0, this.w, this.h,
				0, 0, this.w, this.h				
		);
	};		
};


//## Watch #################################
/**
 * Watch
 * @constructor
 */
pike.components.Watch = function(){
		
	this.watchMe = function( viewport, gameWorld ){
		
		var oldX = viewport.x;	
		var oldY = viewport.y;
		
		if(this.x < this.leftInnerBoundary( viewport )){					
			viewport.x = Math.max(0, Math.min(
				Math.floor(this.x - (viewport.w * 0.25)),
				gameWorld.w - viewport.w
				));										    					
		}
					
		if(this.x + this.w > this.rightInnerBoundary(viewport)){				   				  
		    viewport.x = Math.max(0, Math.min(
				Math.floor(this.x + this.w - (viewport.w * 0.75)),
				gameWorld.w - viewport.w
				));			    		  
		}
							
		if( oldX != viewport.x || oldY != viewport.y ){			
			this.dispathEvent( new pike.events.ViewportChangePosition( this.viewport.x, this.viewport.y, this) );
		}
	};	
		
	this.rightInnerBoundary = function( viewport ){
  		return viewport.x + ( viewport.w * 0.75);
	};

	this.leftInnerBoundary = function( viewport ){
  		return viewport.x + ( viewport.w * 0.25);
	};
	
	this.topInnerBoundary = function( viewport ){
  		return viewport.y + (viewport.h * 0.25);
	};
	
	this.bottomInnerBoundary = function( viewport ){
  		return viewport.y + (viewport.h * 0.75);
	};		
};

//## Mouse #################################
/**
 * Mouse
 * @constructor
 */
pike.components.Mouse = function(){
	
	this.setMouseHandler = function( mouseHandler ){
		this.mousehandler = mouseHandler;
		this.handler.listen( this.mousehandler, pike.events.Down.EVENT_TYPE, goog.bind( this.onMouseDown ,this) );
	};	
	
	//this.onMouseDown = function(e){};
};




