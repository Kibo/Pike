/**
* @fileoverview Components
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.components.Sprite');
goog.provide('pike.components.Watch');
goog.provide('pike.components.Image');

goog.require('goog.events.EventHandler');
goog.require('pike.graphics.Rectangle');

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
 * Draws image
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
 * Watches a entity on the viewport
 * @constructor
 */
pike.components.Watch = function(){
		
	this.watchMe = function( viewport, gameWorld ){
		
		var viewportBounds = viewport.getBounds();
		var gameWorldBounds = gameWorld.getBounds();
		
		var currentX = viewportBounds.x;	
		var currentY = viewportBounds.y;
		
		
		if(this.x < this.leftInnerBoundary( viewportBounds )){					
			viewportBounds.x = Math.max(0, Math.min(
				Math.floor(this.x - (viewportBounds.w * 0.25)),
				gameWorldBounds.w - viewportBounds.w
				));										    					
		}
					
		if(this.x + this.w > this.rightInnerBoundary( viewportBounds )){				   				  
			viewportBounds.x = Math.max(0, Math.min(
				Math.floor(this.x + this.w - (viewportBounds.w * 0.75)),
				gameWorldBounds.w - viewportBounds.w
				));			    		  
		}
		
		if(this.y < this.topInnerBoundary( viewportBounds )){				    					    				  
			viewportBounds.y = Math.max(0, Math.min(
				Math.floor(this.y - (viewportBounds.h * 0.25)),
				gameWorldBounds.h - viewportBounds.h	
				));				    		 			   
		}
		
		if(this.y + this.h > this.bottomInnerBoundary( viewportBounds )){				   				  
			viewportBounds.y = Math.max(0, Math.min(
				Math.floor(this.y + this.h - (viewportBounds.h * 0.75)),
				gameWorldBounds.h - viewportBounds.h	
				));				    
		}
		
							
		if( currentX != viewportBounds.x || currentY != viewportBounds.y ){			
			viewport.setPosition(viewportBounds.x, viewportBounds.y);
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

