/**
* @fileoverview Components
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.components.Sprite');

goog.require('goog.events.EventHandler');

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




