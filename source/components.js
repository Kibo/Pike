/**
* @fileoverview Game components
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/

goog.provide('pike.components.Collision');
goog.provide('pike.components.Sprite');
goog.provide('pike.components.Image');
goog.provide('pike.components.Watch');

goog.require('goog.events');
goog.require('pike.graphics.Rectangle');
goog.require('pike.animation.Animator');

//## Collision #################################
/**
 * Collision
 * @constructor
 */
pike.components.Collision = function(){
		
	/**
	 * Set collision boundary
	 * @param {number} x - this.boundary().x + x
	 * @param {number} y - this.boundary().y + y
	 * @param {number} w - this.boundary().w - w
	 * @param {number} h - this.boundary().h - h
	 * @return this
	 * 
	 * @example
	 * ~~~
	 * this.setCollisionBounds(0,30,0,30)
	 * 
	 * result:
	 * [this.bounds().x + 0, this.bounds().y + 30, this.bounds().w - 0, this.bounds().h - 30]
	 * ~~~
	 */
	this.setCollisionBounds = function(x,y,w,h){
		this.collisionBounds_ = new pike.graphics.Rectangle(x, y, w, h);
		return this;
	};
		
	/**
	 * Check if entity is in collision with others entities
	 * @param {pike.events.ChangePosition} e
	 * @fires {pike.events.Collision}
	 */
	this.checkCollision = function(e){
		var boundsInCluster = this.layer.getCluster().getIdToClusterBounds( this.id );
		var entities = this.layer.getCluster().getClusters()[boundsInCluster.y][boundsInCluster.x];
		
		for(var idx = 0; idx < entities.length; idx++){
			if(this.id == entities[idx].id){
				continue;
			}
			
			if(this.getCollisionBounds_(this).intersects( this.getCollisionBounds_( entities[idx] ))){								
				this.dispatchEvent( new pike.events.Collision(e.x, e.y, e.oldX, e.oldY, entities[idx], this));
			}					
		}				
	};
	
	/**
	 * Calculate inner collision boundary for entity
	 * @param {pike.core.Entity} entity
	 * @return {pike.graphics.Rectangle} bounds
	 * @private
	 */
	this.getCollisionBounds_ = function(entity){
		if(entity.collisionBounds_){
			return new pike.graphics.Rectangle(
					entity.getBounds().x + entity.collisionBounds_.x,
					entity.getBounds().y + entity.collisionBounds_.y,
					entity.getBounds().w - entity.collisionBounds_.w,
					entity.getBounds().h - entity.collisionBounds_.h);			
		}
				
		return entity.getBounds();
	};
	
	this.handler.listen( this, pike.events.ChangePosition.EVENT_TYPE, goog.bind( this.checkCollision, this));	
};

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
	
	this.spriteSource = {};
	
	/**
	 * Set sprite
	 * 
	 * @param {Object} image
	 * @param {number} sx - x position on source image
	 * @param {number} sy - y position on source image
	 * @param {number} sw - width on source image
	 * @param {number} sh - height on source image
	 * @param {number} numberOfFrames
	 * @param {number} duration - the duration of the one loop of the animation in milliseconds.
	 * @return this
	 */
	this.setSprite = function( image, sx, sy, sw, sh, numberOfFrames, duration ){
		this.spriteSource.image = image;
		this.spriteSource.x = sx;
		this.spriteSource.y = sy;
		this.spriteSource.w = sw;
		this.spriteSource.h = sh;	
		this.spriteSource.row = 0;
		this.spriteSource.numberOfFrames = numberOfFrames || 1;
		this.spriteSource.currentFrame = 0;				
		this.spriteSource.animator = new pike.animation.Animator( duration || 1000 );
		this.spriteSource.animator.start();
		this.spriteSource.lastUpdate = new Date().getTime();						
		return this;
	};
	
	/**
	 * On update handler
	 * @param {pike.events.Update} e
	 */
	this.onSpriteUpdate = function(e){	
		var now = e.now;
		var deltaTime = now - this.spriteSource.lastUpdate;
		this.spriteSource.lastUpdate = now;		
		var fraction = this.spriteSource.animator.update(deltaTime);			
		this.spriteSource.currentFrame = Math.floor(fraction * this.spriteSource.numberOfFrames);
							
		this.setDirty(this.getBounds());		
	};
	
	/**
	 * Set row in spriteSource image
	 * @param {number} vx
	 * @param {number} vy
	 */
	this.setSpriteRow = function( vx, vy ){			
		 if(Math.abs(vx) > Math.abs(vy)){
			   (vx >= 0) ? 
					   this.spriteSource.row = pike.components.Sprite.RIGHT : 
					   this.spriteSource.row = pike.components.Sprite.LEFT; 
		    	   	
		     }else{
		    	 (vy >= 0)?
		    			 this.spriteSource.row = pike.components.Sprite.DOWN :
		    			 this.spriteSource.row = pike.components.Sprite.UP;	 			    	     	
		     }
	};
	
	/**
	 * On render handler
	 * @param {pike.events.Render} e
	 */
	this.onSpriteRender = function(e){		
		this.layer.getOffScreen().context.drawImage(
				this.spriteSource.image,			
				this.spriteSource.x + (this.spriteSource.currentFrame * this.spriteSource.w ), this.spriteSource.y + (this.spriteSource.row * this.spriteSource.h), this.spriteSource.w, this.spriteSource.h,
				this.x, this.y, this.w, this.h				
		);			
	};
	
	/**
	 * Set dirty ares
	 * @param {pike.graphics.Rectangle} rect
	 */
	this.setDirty = function(rect){
		if(this.layer.hasDirtyManager()){
			this.layer.dirtyManager.markDirty( rect );				
		}else{		
			this.layer.getOffScreen().isDirty = true;
		}
	};
};

pike.components.Sprite.DOWN = 0;
pike.components.Sprite.LEFT = 1;
pike.components.Sprite.RIGHT = 2;
pike.components.Sprite.UP = 3;

//## Image #################################
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

