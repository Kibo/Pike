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
 * Adds the ability to detect collisions with another entity.
 * @constructor
 */
pike.components.Collision = function(){
	
	this.collisionBounds_ = new pike.graphics.Rectangle(0, 0, 0, 0);
		
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
						
			if(this.getCBounds(this).intersects( entities[idx].getCBounds() )){								
				this.dispatchEvent( new pike.events.Collision(e.x, e.y, e.oldX, e.oldY, entities[idx], this));
			}					
		}				
	};
	
	/**
	 * Get boundaries of Entity for collision
	 */
	this.getCBounds = function(){		
		return new pike.graphics.Rectangle(
				this.x + this.collisionBounds_.x,
				this.y + this.collisionBounds_.y,
				this.w - this.collisionBounds_.w,
				this.h - this.collisionBounds_.h);			
						
	};
	
	this.handler.listen( this, pike.events.ChangePosition.EVENT_TYPE, goog.bind( this.checkCollision, this));	
};
/**
 * Component name
 * @const
 * @type {string}
 */
pike.components.Collision.NAME="pike.components.Collision";

//## Sprite #################################
/**
 * Sprite
 * Adds sprite support
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

/**
 * Component name
 * @const
 * @type {string}
 */
pike.components.Sprite.NAME="pike.components.Sprite";

/**
 * Down
 * @const
 * @type {number}
 */
pike.components.Sprite.DOWN = 0;

/**
 * Left
 * @const
 * @type {number}
 */
pike.components.Sprite.LEFT = 1;

/**
 * Right
 * @const
 * @type {number}
 */
pike.components.Sprite.RIGHT = 2;

/**
 * Up
 * @const
 * @type {number}
 */
pike.components.Sprite.UP = 3;

//## Image #################################
/**
 * Image
 * Draws image
 * @constructor
 */
pike.components.Image = function(){
	
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;
	
	/**
	 * Set image
	 * @param {Object} image - DOM image
	 */
	this.setImage = function( image ){
		this.image = image;
		this.w = image.width;
		this.h = image.height;
	};	
	
	/**
	 * On image render handler
	 * @param {pike.events.Render} e
	 */
	this.onImageRender = function(e){
		this.layer.getOffScreen().context.drawImage(
				this.image,
				0, 0, this.w, this.h,
				0, 0, this.w, this.h				
		);
	};		
};

/**
 * Component name
 * @const
 * @type {string}
 */
pike.components.Image.NAME="pike.components.Image";

//## Watch #################################
/**
 * Watch
 * Watches a entity on the viewport
 * @constructor
 */
pike.components.Watch = function(){
	
	/**
	 * Watch entity on Viewport
	 * @param {pike.core.Viewport} viewport
	 * @param {pike.core.Gameworld} gameWorld
	 */
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
		
	/**
	 * @private
	 */
	this.rightInnerBoundary = function( viewport ){
  		return viewport.x + ( viewport.w * 0.75);
	};

	/**
	 * @private
	 */
	this.leftInnerBoundary = function( viewport ){
  		return viewport.x + ( viewport.w * 0.25);
	};
	
	/**
	 * @private
	 */
	this.topInnerBoundary = function( viewport ){
  		return viewport.y + (viewport.h * 0.25);
	};
	
	/**
	 * @private
	 */
	this.bottomInnerBoundary = function( viewport ){
  		return viewport.y + (viewport.h * 0.75);
	};		
};

/**
 * Component name
 * @const
 * @type {string}
 */
pike.components.Watch.NAME="pike.components.Watch";


//## Backpack #################################
/**
 * Backpack
 * Lets put an entity to a DOM container(Backpack) as a DOM element 
 * and with drag-and-drop get back on canvas
 * @depending pike.core.Stage
 * @constructor
 */
pike.components.Backpack = function(){
	
	/**
	 * Set a icon for item in backpack
	 * @param {string} url - icon
	 */
	this.setIconUrl = function(url){
		this.iconUrl_ = url;
	};
	
	/**
	 * Determines that entity is on the backpack
	 * @return {boolean}
	 */
	this.isOnBackpack = function(){
		return this.inOnBackpack_;
	};
	
	/**
	 * Determines that entity is drop acceptable
	 * @return {boolean}
	 */
	this.isDropAcceptable = function(){
		return this.isDropAcceptable_;
	};
	
	/**
	 * Set drop acceptable
	 * @param {boolean} isAcceptable
	 */
	this.setDropAcceptable = function( isAcceptable ){
		this.isDropAcceptable_ = isAcceptable;
	};
	
		
	/**
	 * Get backpack DOM container
	 * @return {Object} DOM element
	 */
	this.getBackpackElement = function(){
		var backpack = document.getElementById( pike.components.Backpack.ELEMENT_ID );
		
		if(! backpack ){
			backpack = document.createElement("div");
			backpack.setAttribute("id", pike.components.Backpack.ELEMENT_ID );
			document.getElementsByTagName("body")[0].appendChild( backpack );	
		}
		
		return backpack;
	};
		
	/**
	* Create DOM representation of entity and attach it on backpack DOM container
	*/
	this.putInBackpack = function(){
		
		this.backpackItem_ = document.createElement('img');
		this.backpackItem_.src = this.iconUrl_;
		this.backpackItem_.style.cursor = "pointer";
		this.backpackItem_.style.padding = "2px 2px";
		this.backpackItem_.setAttribute("data-widget", this.id);
		this.backpackItem_.setAttribute("draggable", "true");	
						
		this.getBackpackElement().appendChild( this.backpackItem_ );
		
		if(this.hasComponent( pike.components.Sprite.NAME )){
			//clear area 
			this.setDirty( this.getBounds() );
		}
								
		var oldX = this.x;
		var oldY = this.y;						
		this.y = -this.h; //hide entity						
		this.dispatchEvent( new pike.events.ChangePosition(this.x, this.y, oldX, oldY, this) );
		this.inOnBackpack_ = true;		
		if(goog.DEBUG) window.console.log("[pike.components.Backpack] putInBag #" + this.id);
		
		//set listener
		goog.events.listen(this.backpackItem_, goog.events.EventType.DRAGSTART, goog.bind(this.dragStart_, this));
		goog.events.listen(this.backpackItem_, goog.events.EventType.DRAGEND, goog.bind(this.dragEnd_, this));
																		
		var stageElement = document.getElementById( pike.core.Stage.ELEMENT_ID )
		if(!goog.events.hasListener( stageElement, goog.events.EventType.DRAGOVER)){						
			goog.events.listen(stageElement, goog.events.EventType.DRAGOVER, goog.bind(this.dragOver_, this));
			if(goog.DEBUG) window.console.log("[pike.components.Backpack] set Stage listener: dragover");
		};
		
		if(!goog.events.hasListener( stageElement, goog.events.EventType.DROP)){
			goog.events.listen(stageElement, goog.events.EventType.DROP, goog.bind(this.drop_, this));							
			if(goog.DEBUG) window.console.log("[pike.components.Backpack] set Stage listener: drop");
		};				
	};	
	
	/**
	 * Remove DOM item from DOM backpack container
	 */
	this.removeFromBackpack = function(){		
		goog.dom.removeNode( this.backpackItem_ );
		this.backpackItem_ = null;
		this.inOnBackpack_ = false;
		if(goog.DEBUG) window.console.log("[pike.components.Backpack] removeFromBag #" + this.id);
	};
	
	/**
	 * Drag start handler
	 * @param {Object} e -Closure DOM event
	 * @private
	 */
	this.dragStart_ = function(e){
		var event = e.getBrowserEvent();
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData("text/plain", event.target.getAttribute("data-widget"));   			 								
		event.dataTransfer.setDragImage(e.target, 15, 15); //TODO
		this.isDropAcceptable_ = true;
		if(goog.DEBUG) window.console.log("[pike.components.Backpack] dragstart");
		return true;						
	};
	
	/**
	 * Drag end handler
	 * @param {Object} e -Closure DOM event
	 * @private
	 */
	this.dragEnd_ = function(e){
		var event = e.getBrowserEvent();		
		event.dataTransfer.clearData("text/plain");
		if(goog.DEBUG) window.console.log("[pike.components.Backpack] dragend");
		return true;
	};
	
	
	/**
	 * Drag over handler
	 * Common for all items - dont use "this"
	 * @param {Object} e -Closure DOM event
	 * @private
	 */
	this.dragOver_ = function(e){
		var event = e.getBrowserEvent();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
		if(goog.DEBUG) window.console.log("[pike.components.Backpack] dragover");
		return false;
	};
	
	/**
	 * Drop over handler
	 * Common for all items - dont use "this"
	 * @param {Object} e -Closure DOM event
	 * @private
	 */
	this.drop_ = function(e){
		var event = e.getBrowserEvent();
		event.stopPropagation();
		var entityId = event.dataTransfer.getData("text/plain");						
								
		var entity = this.layer.getEntity( entityId ); //TODO potential bug - if entities is not in the same layer
		var oldX = entity.x;
		var oldY = entity.y;
		entity.x = e.offsetX + entity.layer.viewport_.x;
		entity.y = e.offsetY + entity.layer.viewport_.y;
				
		if(this.hasComponent( pike.components.Sprite.NAME )){
			//clear area 
			entity.setDirty( entity.getBounds() );
		}
					
		entity.dispatchEvent( new pike.events.ChangePosition(entity.x, entity.y, oldX, oldY, entity));									    									
		if(goog.DEBUG) window.console.log("[pike.components.Backpack] drop #" + entity.id);
		
		if( !entity.isDropAcceptable_ ){
			if(goog.DEBUG) window.console.log("[pike.components.Backpack] drop is not accepted");
			return true; //comes back to backpack
		}
					
		entity.removeFromBackpack();
		return false; //success
	};																												
};

/**
 * Component name
 * @const
 * @type {string}
 */
pike.components.Backpack.NAME="pike.components.Backpack";

/**
 * DOM Element id for Backpack
 * @const
 * @type {string}
 */
pike.components.Backpack.ELEMENT_ID = "pike-backpack";
