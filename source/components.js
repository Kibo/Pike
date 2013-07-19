/**
* @fileoverview Game components
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/

goog.provide('pike.components.Collision');
goog.provide('pike.components.Sprite');
goog.provide('pike.components.Image');
goog.provide('pike.components.Watch');
goog.provide('pike.components.Backpack');
goog.provide('pike.components.Dialogues');
goog.provide('pike.components.Hen');
goog.provide('pike.components.VisualizeGraph');
goog.provide('pike.components.VisualizeRectangle');

goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('pike.graphics.Rectangle');
goog.require('pike.animation.Animator');
goog.require('pike.events.StartDialogue');
goog.require('pike.events.ShowDialogue');
goog.require('pike.events.EndDialogue');

//## Collision #################################
/**
 * Collision
 * Adds the ability to detect collisions with another entity. * 
 * @constructor
 * 
 * @example
 * ~~~
 * var hero = new pike.core.Entity( pike.components.Collision )
 * hero.onCollision = function(e){
 * 	//do something  
 * }
 * hero.handler.listen( hero, pike.events.Collision.EVENT_TYPE, goog.bind( hero.onCollision, hero) );
 * ~~~
 * @author Tomas Jurman (tomasjurman@gmail.com)
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
			
			if(this.getCBounds().intersects( entities[idx].getCBounds() )){	
				var entity = entities[idx];
				var activeEvent = new pike.events.Collision(e.x, e.y, e.oldX, e.oldY, entity, this);
				this.dispatchEvent( activeEvent );	
				if(goog.DEBUG) window.console.log("[pike.components.Collision] collision active #" + this.id + ", x:" + activeEvent.x + ", y:" + activeEvent.y + ", oldX:" + activeEvent.oldX + ", oldY:" + activeEvent.oldY);
								
				var passiveEvent = new pike.events.Collision(entity.x, entity.y, entity.x, entity.y, this, this);
				entity.dispatchEvent( passiveEvent );
				if(goog.DEBUG) window.console.log("[pike.components.Collision] collision passive #" + entity.id + ", x:" + passiveEvent.x + ", y:" + passiveEvent.y + ", oldX:" + passiveEvent.oldX + ", oldY:" + passiveEvent.oldY);							
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
 * @example
 * ~~~
 * var hero = new pike.core.Entity( pike.components.Sprite )
 * hero.setSprite( imageManager.get("herosprite"), 0, 0, 32, 32, 3, 124);
 * hero.onEnterFrame = function(e){
 *      this.onSpriteUpdate(e);
 * }
 * hero.handler.listen(hero, pike.events.Render.EVENT_TYPE, goog.bind(hero.onSpriteRender, hero)); 
 * ~~~
 * @author Tomas Jurman (tomasjurman@gmail.com)
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
 * @example
 * ~~~
 * var background = new pike.core.Entity( pike.components.Image );
 * background.setImage( imageManager.get("background") );
 * background.handler.listen(background, pike.events.Render.EVENT_TYPE, goog.bind(background.onImageRender, background));
 * ~~~
 * @author Tomas Jurman (tomasjurman@gmail.com)
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
 * @example
 * ~~~
 * var hero = new pike.core.Entity( pike.components.Watch ) 
 * hero.onEnterFrame = function(e){
 *      this.watchMe(viewport, gameWorld);
 * }
 * ~~~
 * @author Tomas Jurman (tomasjurman@gmail.com)
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
 * @constructor
 * @example
 * ~~~
 * var sword = new pike.core.Entity( pike.components.Backpack )
 * var hero  = new pike.core.Entity( pike.components.Collision )
 * hero.onCollision = function(e){
 *   if(e.obj.hasComponent( pike.components.Backpack.NAME ) ){
 *   	e.obj.putInBackpack();	
 *   }	 
 * }
 * ~~~
 * @author Tomas Jurman (tomasjurman@gmail.com)
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
		return this.isOnBackpack_;
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
		this.layer.setDirty( this.getBounds() );
		
		this.isOnBackpack_ = true;		
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
						
		this.layer.setDirty( entity.getBounds() );
						
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


//## Dialogues #################################
/**
 * Dialogues
 * The component that adds an entity a ability to carry conversation. 
 * As data source it uses JSON file. 
 * For building source data structure you can use prepared Dialogues builder tool.
 * 
 * @see Dialogues builder tool ( http://kibo.github.com/dialoguesBuilder/ )
 * @constructor
 * @example
 * ~~~
 * var oldWoman = new pike.core.Entity( pike.components.Dialogues )
 * oldWoman.setDialogues( sourceData )
 * var dialog = oldWoman.getDialogue();
 * oldWoman.showDialogue( dialog );
 * ~~~
 * @author Tomas Jurman (tomasjurman@gmail.com)
 */
pike.components.Dialogues = function(){
	
	/**
	 * @private
	 */
	this.pike_components_Dialogues_ = {
			codeBeforeDialogueText:null,
			codeAfterDialogueText:null,
			
			codeBeforeDialogueElement:null,
			codeAfterDialogueElement:null,
			
			codeBeforeChoiceElement:null,
			codeAfterChoiceElement:null
	};
		
	/**
	 * Set source data
	 * @param {Object} data - source
	 * @fires {Error} data is not valid
	 * @return {Object} this
	 * @see Dialogues Builder tool ( http://kibo.github.com/dialoguesBuilder/ )
	 */
	this.setDialogues = function( data ){
		if( !this.isDialoguesSourceValid_( data )){
    		throw new Error("Data is not valid.");
    	}
		
		this.dialoguesData_ = data;				    	
    	return this;		
	};
	      
    /**
     * Get current dialogue or root of dialogues
     * @fires {pike.events.StartDialogue} e
     * @return {Object} current dialogue
     */
    this.getDialogue = function(){
    	if(!this.dialogue_){
    		this.setDialogue_( this.getRootOfDialogues().id );
    		if(goog.DEBUG) window.console.log("[pike.components.Dialogues] startdialogue");
    		this.dispatchEvent( new pike.events.StartDialogue( this.dialogue_, this ) );
    	}

    	return this.dialogue_;    	
    };
    
    /**
     * Show dialogue as HTML in your predefined container. 
     * @fires {pike.events.ShowDialogue} e  
     */
    this.showDialogue = function( dialogue ){
    	if( !dialogue ){
    		throw new Error("[pike.components.Dialogues] Error: There is not a dialogue.");
    	};
    	
    	this.cleanDialoguesContainer_(); 
    	
    	var dialogueAsHTML = dialogue.isChoice 
    		? this.getChoiceDialogueAsHTML_( dialogue ) 
    		: this.getSentenceDialogueAsHTML_( dialogue );
    		    		    	   
    	this.getDialoguesDOMContainer_().appendChild(  dialogueAsHTML  );
    	if(goog.DEBUG) window.console.log("[pike.components.Dialogues] showdialogue");
    	this.dispatchEvent( new pike.events.ShowDialogue( dialogue, this));
    };
           
    /**
     * Set current dialog
     * @param {number} id
     * @fires {pike.events.EndDialogue} e - when the conversation is at the end
     * @private
     */
    this.setDialogue_ = function( id ){
    	
    	//before it sets a new sentence, it executes a afterCode on last sentence
    	if(this.dialogue_){
    		this.executeCode_(this.dialogue_.codeAfter);
    	}
    	    	    
    	if(!id){    		
    		if(goog.DEBUG) window.console.log("[pike.components.Dialogues] enddialogue");
    		this.dispatchEvent( new pike.events.EndDialogue( this ) );	
    		return;
    	}
    	
    	for(var idx = 0; idx < this.dialoguesData_.dialogues.length; idx++){
    		if( this.dialoguesData_.dialogues[idx].id == id){	    				    				    	
    			
    			//sets a new sentence
    			this.dialogue_ = this.dialoguesData_.dialogues[idx];	    				    				    	
    			this.executeCode_(this.dialogue_.codeBefore);

    			if( !this.isActive_( this.dialogue_ )){ 
    				
    				var nextDialogueId = this.dialogue_.outgoingLinks.length == 1 
    					? this.dialogue_.outgoingLinks[0] 
    					: null; //final node or choice
    				
    				this.setDialogue_( nextDialogueId );
    			}

    			return;
    			break;
    		}
    	}

    	this.dialogue_ = null;    	
    };
    
    /**
     * Get root of dialogues
     * Root is the node, that has not parent.
     * @return {Object} root
     */
    this.getRootOfDialogues = function(){
    	for(var idx = 0; idx < this.dialoguesData_.dialogues.length; idx++){
    		if(!this.dialoguesData_.dialogues[idx].parent){
    			return this.dialoguesData_.dialogues[idx];
    			break;
    		}
    	}    	
    };
		
	/**
	 * Get actor
	 * @param {number} id
	 * @return {?Object} actor or null
	 */
	this.getActor = function( id ){
		if(!id){
    		return null;
    	}

    	for(var idx = 0; idx < this.dialoguesData_.actors.length; idx++){
    		if( this.dialoguesData_.actors[idx].id == id ){
    			return this.dialoguesData_.actors[idx];
    		}
    	}		    
   	  	return null;
	};
		
	/**
	 * Find dialogue by id
	 * @param {number} id
	 * @return {?Object} dialogue or null if dialogue is not exists
	 */
	this.findDialogueById = function(id){
		if(!id){
			return null;
		}

		for(var idx = 0; idx < this.dialoguesData_.dialogues.length; idx++){
			if( this.dialoguesData_.dialogues[idx].id == id){
				return this.dialoguesData_.dialogues[idx];
				break;
			}
		}

		return null;
		
	};
		
	/**
	 * Get sentence as HTML
	 * @param {Object} dialogue
	 * @private
	 */
	this.getSentenceDialogueAsHTML_ = function( dialogue ){
		var container = document.createElement("div");
		container.setAttribute("class", this.getActor( dialogue.actor ).name );	
		
		if(this.pike_components_Dialogues_.codeBeforeDialogueElement){
			container.appendChild( this.pike_components_Dialogues_.codeBeforeDialogueElement );
		}
			
		container.appendChild( this.createDialogueElement_(dialogue) );
		
		if( this.pike_components_Dialogues_.codeAfterDialogueElement ){
			container.appendChild( this.pike_components_Dialogues_.codeAfterDialogueElement );
		}
		
		return container;
	};
	
	/**
	 * Get choice as HTML
	 * @param {Object} choice
	 * @private
	 */
	this.getChoiceDialogueAsHTML_ = function( choice ){
		var container = document.createElement("div");
		container.setAttribute("class", "choice");
		
		if(this.pike_components_Dialogues_.codeBeforeChoiceElement){
			container.appendChild( this.pike_components_Dialogues_.codeBeforeChoiceElement );
		}
		
		for(var idx = 0; idx < choice.outgoingLinks.length; idx++ ){
			var dialogue = this.findDialogueById( choice.outgoingLinks[idx] );
			if( !this.isActive_( dialogue )) continue;
			
			container.appendChild( this.createChoiceElement_(dialogue) );			
		}
		
		if(this.pike_components_Dialogues_.codeAfterChoiceElement){
			container.appendChild( this.pike_components_Dialogues_.codeAfterChoiceElement );
		}
		
		return container;
	};
		
	/**
	 * Create choice item DOM element
	 * @private
	 */
	this.createChoiceElement_ = function( dialogue ){
		var container = document.createElement( pike.components.Dialogues.DIALOGUE_ELEMENT );
		container.setAttribute("data-dialogue", dialogue.id);
		
		goog.events.listen(container, goog.events.EventType.CLICK, goog.bind(function(e){
			var currentDialogue = this.findDialogueById( e.target.getAttribute("data-dialogue") );					
			this.setDialogue_( currentDialogue.id );
			if( this.dialogue_ ){
				this.showDialogue( this.getDialogue() );
			}			
		}, this));
		
			
		container.appendChild( document.createTextNode( dialogue.menuText));
						
		return container;		
	};
	
	/**
	 * Create dialogue DOM element
	 * @private
	 */
	this.createDialogueElement_ = function( dialogue ){
		var container = document.createElement( pike.components.Dialogues.DIALOGUE_ELEMENT );
		container.setAttribute("data-dialogue", dialogue.id);
		goog.events.listen(container, goog.events.EventType.CLICK, goog.bind(function(e){
			var currentDialogue = this.findDialogueById( e.target.getAttribute("data-dialogue") );		
			var nextDialogueId = currentDialogue.outgoingLinks.length == 1 
				? currentDialogue.outgoingLinks[0] 
				: null; //final node
			this.setDialogue_( nextDialogueId );
			if( this.dialogue_ ){
				this.showDialogue( this.getDialogue() );
			}			
		}, this));
							
		if(this.pike_components_Dialogues_.codeBeforeDialogueText){
			container.appendChild( this.pike_components_Dialogues_.codeBeforeDialogueText );
		}
		container.appendChild( document.createTextNode( dialogue.dialogueText) );
		
		if(this.pike_components_Dialogues_.codeAfterDialogueText){
			container.appendChild( this.pike_components_Dialogues_.codeAfterDialogueText );
		}
		
		return container;
	};
		
	/**
	 * Set code before dialogue text
	 * @param {Object} domElement - DOM Element
	 */
	this.setCodeBeforeDialogueText = function( domElement ){
		this.pike_components_Dialogues_.codeBeforeDialogueText = domElement;
	};
	
	/**
	 * Set code before dialogue text
	 * @param {Object} domElement - DOM Element
	 */
	this.setCodeAfterDialogueText = function(domElement){
		this.pike_components_Dialogues_.codeAfterDialogueText = domElement;
	};
	
	/**
	 * Set code before dialogue element
	 * @param {Object} domElement - DOM Element
	 */
	this.setCodeBeforeDialogueElement = function(domElement){
		this.pike_components_Dialogues_.codeBeforeDialogueElement = domElement;
	};
	
	/**
	 * Set code before dialogue element
	 * @param {Object} domElement - DOM Element
	 */
	this.setCodeAfterDialogueElement = function(domElement){
		this.pike_components_Dialogues_.codeAfterDialogueElement = domElement;
	};
	
	/**
	 * Set code before choice element
	 * @param {Object} domElement - DOM Element
	 */
	this.setCodeBeforeChoiceElement = function(domElement){
		this.pike_components_Dialogues_.codeBeforeChoiceElement = domElement;
	};
	
	/**
	 * Set code before choice element
	 * @param {Object} domElement - DOM Element
	 */
	this.setCodeAfterChoiceElement = function(domElement){
		this.pike_components_Dialogues_.codeAfterChoiceElement = domElement;
	};
		
	/**
	 * Remove all children from defined DOM dialogues container.
	 * @private
	 */
	this.cleanDialoguesContainer_ = function(){
		this.getDialoguesDOMContainer_().innerHTML = '';
	};
		
	/**
	 * Check the source data
	 * @param {Object} data
	 * @return {boolean}
	 * @private
	 */
	this.isDialoguesSourceValid_ = function( data ){
		var isValid = true;

    	if( !data ||
 			!data.dialogues ||
 			data.dialogues.length == 0 ||
 			!data.actors ||
 			data.actors.length <= 1 ||	 			
 			!this.hasDialoguesRoot_( data )	 			
    		){
 				isValid = false;
 			}

		return isValid;
	};
	
	/**
	 * Check if data has only the one root dialog
	 * @param {Object} data
	 * @return {boolean}
	 * @private
	 */
	this.hasDialoguesRoot_ = function(data){
		var roots = [];
    	for(var idx = 0; idx < data.dialogues.length; idx++){
    		if( !data.dialogues[idx].parent){
    			roots.push( data.dialogues[idx] );
    		}
    	}

    	return roots.length == 1 ? true : false;
	};
	
	/**
	 * Evaluates conditionString property in dialogue
	 * @param {Object} dialogue
	 * @return {boolean}
	 * @private
	 */
	this.isActive_ = function( dialogue ){
		var result = true;
    	if(dialogue.conditionsString){
    		result = this.executeCode_( dialogue.conditionsString );
    	}

    	return result;
	};	
	
	/**
	 * Parse String and execute it as JavaScript code.
	 * Use JavaScript eval(string) function
	 * 
	 * @param {String} code
	 * @see eval(string) (https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/eval)
	 * @private
	 */
	this.executeCode_ = function( code ){
		if(code){

			if(goog.DEBUG) window.console.log(" [pike.components.Dialogues] execute code: " + code);
    			    		
    		try {
				return eval( code ); 
			} catch (e) {
			    if (e) {
			        throw new Error("Syntax error on your code: " + code);
			    }
			}	 	    			    		   
    	}
	};
	
	/**
	 * Get dialogues DOM container
	 * @return {Object} DOM element
	 * @private
	 */
	this.getDialoguesDOMContainer_ = function(){
		var dialogues = document.getElementById( pike.components.Dialogues.ELEMENT_ID );
		
		if(!dialogues ){
			dialogues = document.createElement("div");
			dialogues.setAttribute("id", pike.components.Dialogues.ELEMENT_ID );
			document.getElementsByTagName("body")[0].appendChild( dialogues );	
		}
		
		return dialogues;
	};
	
	/**
     * On End dialogue handler
     * @param {pike.events.EndDialogue} e
     */
    this.onEndDialogue = function(e){
    	this.dialogue_ = null;
		this.cleanDialoguesContainer_();
    };
    
    this.handler.listen(this, pike.events.EndDialogue.EVENT_TYPE, goog.bind(this.onEndDialogue, this));	
};

/**
 * Component name
 * @const
 * @type {string}
 */
pike.components.Dialogues.NAME="pike.components.Dialogues";

/**
 * DOM Element id for Dialogues
 * @const
 * @type {string}
 */
pike.components.Dialogues.ELEMENT_ID = "pike-dialogues";

/**
 * DOM Element for one sentence
 * @const
 * @type {string}
 */
pike.components.Dialogues.DIALOGUE_ELEMENT = "p";

//## Hen #################################
/**
 * Hen
 * The component adds an entity a ability of movement as a hen.
 * @constructor
 * @example
 * ~~~ 
 * var hen = new pike.core.Entity( pike.components.Hen );
 * hen.handler.listen(timer, pike.events.Update.EVENT_TYPE, goog.bind(function(e){
 *		this.onHenUpdate(e);	
 * }, hen));
 * ~~~
 * @author Tomas Jurman (tomasjurman@gmail.com)
 */
pike.components.Hen = function(){
		
	/**
	 * @private
	 */
	this.pike_components_Hen = {						
			isMoving_:true,
			step_ : 50,
			duration_:2000,
			isEscaping_:false,
			init:function( parent ){
				this.parent = parent;
				this.animator = new pike.animation.Animator();
				this.animator.setRepeatBehavior(pike.animation.Animator.LOOP);
				this.animator.setRepeatCount(1);
											
				this.getNextPosition_();				
			},
	
			getNextPosition_:function( vx, vy, duration ){
								
				if(arguments.length == 0){
					vx = (Math.random() * (2 * this.step_) - this.step_);
					vy = (Math.random() * (2 * this.step_) - this.step_);
					duration = this.duration_;									
				}
																																				
				this.parent.vx = vx;
				this.parent.vy = vy;
															
				this.lastUpdate_ = new Date().getTime();			
				
				this.animator.stop();		
				this.animator.setDuration( duration );		
				this.animator.start();					
							
				this.startX_ = this.parent.x; 
				this.startY_ = this.parent.y;				
			}				
	};
	
	/**
	 * Set step
	 * @param {number} step - px
	 */
	this.setStep = function(step){
		this.pike_components_Hen.step_ = step;
	};
	
	/**
	 * Get step
	 * @return {number}
	 */
	this.getStep = function(){
		return this.pike_components_Hen.step_;
	};
	
	/**
	 * Set duration for one step
	 * @param {number} duration - ms
	 */
	this.setDuration = function(duration){
		this.pike_components_Hen.duration_ = duration;
	};
	
	/**
	 * Determine if the hen is in escaping state
	 * @return {boolean} 
	 */
	this.isEscaping = function(){
		return this.pike_components_Hen.isEscaping_;
	};
		
	/**
	 * On update handler
	 * @param {pike.events.Update} e
	 */
	this.onHenUpdate = function(e){	
		if( typeof this.vx == 'undefined' || typeof this.vy == 'undefined' ){		
			this.pike_components_Hen.init( this );	
			if(goog.DEBUG) window.console.log("[pike.components.Hen] init");			
		}
		
		var now = e.now;						
		var fraction = this.pike_components_Hen.animator.update( now - this.pike_components_Hen.lastUpdate_ );
		this.pike_components_Hen.lastUpdate_ = now;
					
		if( typeof fraction == 'undefined'){					
			this.pike_components_Hen.isMoving_ = !this.pike_components_Hen.isMoving_;	
			this.pike_components_Hen.isEscaping_ = false;
			this.pike_components_Hen.getNextPosition_();
			return
		};
		
		if( this.pike_components_Hen.isMoving_ ){
			
			var oldX = this.x;
			var oldY = this.y;
			
			this.x = this.pike_components_Hen.startX_ + (this.vx * fraction);
			this.y = this.pike_components_Hen.startY_ + (this.vy * fraction);  			
	    		    	    	    	    					    				   				    					
	    	this.x = (0.5 + this.x) << 0; //round
	    	this.y = (0.5 + this.y) << 0; //round
	    		    		    					    					    					    					    					    					    					    					   
	    	this.dispatchEvent( new pike.events.ChangePosition(this.x, this.y, oldX, oldY, this) );	
		}; 				    	    	    	
	};
	
	/**
	 * Set escaping state
	 * @param {number} vx
	 * @param {number} vy
	 * @param {number} duration
	 * @example
	 * ~~~
	 * var hen = new pike.core.Entity( pike.components.Hen );
	 * hen.handler.listen(hen, pike.events.Collision.EVENT_TYPE, goog.bind(function(e){
	 * 		this.x = e.oldX;
	 * 		this.y = e.oldY;
	 * 		if(!this.isEscaping()){
	 * 			this.setHenEscaping(100, 100, 1000);
	 * 		}
	 * }, hen));
	 * ~~~
	 */
	this.setHenEscaping = function(vx, vy, duration){		
		this.pike_components_Hen.isMoving_ = true;
		this.pike_components_Hen.isEscaping_ = true;
		this.pike_components_Hen.getNextPosition_(vx, vy, duration);			
	};		
};

/**
 * Component name
 * @const
 * @type {string}
 */
pike.components.Hen.NAME="pike.components.Hen";

//## pike.components.VisualizeGraph #################################
/**
 * VisualizeGraph
 * Draw a graph and a route.
 * @constructor
 * @see pike.ai.Graph
 * @example
 * ~~~ 
 * var visuGraph = new pike.core.Entity( pike.components.VisualizeGraph )
 * visuGraph.setGraph( graph );
 * visuGraph.setPath( route );
 * visuGraph.handler.listen(visuGraph, pike.events.Render.EVENT_TYPE, goog.bind(visuGraph.onPathRender, visuGraph));				 
 * ~~~
 * @author Tomas Jurman (tomasjurman@gmail.com)
 */
pike.components.VisualizeGraph = function(){
	
	this.drawConnectionLabels_ = true;
    this.drawConnections_ = true;
	
	/**
	 * Set a graph
	 * @param {pike.ai.Graph} graph
	 */
	this.setGraph = function(graph){
		this.graph_ = graph;
	};
	
	/**
	 * Set a path
	 * @param {Array.<pike.ai.Node>} path
	 */
	this.setPath = function(path){
		this.path_ = path;
	};
	
	
	/**
	 * On path render handler
	 * @param {pike.events.Render} e
	 */
	this.onPathRender = function(e){		
		this.drawGraph_( this.layer.getOffScreen().context, this.path_);
	};
	
	/**
	 * @private
	 */
	this.drawGraph_ = function(ctx, path) {
	    var self = this;
	    ctx.strokeStyle = "black";
	    ctx.fillStyle = "white";

	    // Draw connections
	    if (this.drawConnections_) {
	        this.graph_.nodes_.forEach(function(node) {
	            node.getConnections().forEach(function(connection) {
	                self.drawConnection_(ctx, node, connection.node, connection.weight, "black");
	            });
	        });
	    }

	    // Highlight the path
	    if (path) {
	        this.drawPath_(ctx, path);
	    }

	    if (this.drawConnectionLabels_) {
	        // Draw connection labels
	        this.graph_.nodes_.forEach(function(node) {
	            node.getConnections().forEach(function(connection) {
	                self.drawConnectionLabel_(ctx, Math.floor(connection.weight) + "", node, connection.node);
	            });
	        });
	    }

	    // Next draw nodes
	    this.graph_.nodes_.forEach(function(node) {
	        self.drawNode_(ctx, node);
	    });
	};
	
	/**
	 * @private
	 */
	this.drawNode_ = function(ctx, node) {
	    ctx.fillStyle = "#6ba4d9";
	    ctx.strokeStyle = "black";
	    ctx.font = "18px Arial";
	    ctx.textBaseline = "middle";
	    ctx.textAlign = "center";

	    ctx.beginPath();
	    ctx.arc(node.x, node.y, 12, 0, 2*Math.PI);
	    ctx.fill();
	    ctx.stroke();

	    var text = "" + node.id;
	    ctx.fillStyle = "black";
	    ctx.fillText(text, node.x, node.y);
	};	
	
	/**
	 * @private
	 */
	this.drawPath_ = function(ctx, path) {
	    ctx.save();
	    ctx.lineWidth = 4;
	    for (var i = 1; i < path.length; i++) {
	        this.drawConnection_(ctx, path[i], path[i - 1], "", "green");
	    }
	    ctx.restore();
	};

	/**
	 * @private
	 */
	this.drawConnection_ = function(ctx, node1, node2, weight, color) {
	    ctx.strokeStyle = color ? color : "black";
	    ctx.beginPath();
	    ctx.moveTo(node1.x, node1.y);
	    ctx.lineTo(node2.x, node2.y);
	    ctx.stroke();

	    ctx.font = "15px Arial";
	    ctx.textBaseline = "middle";
	    ctx.textAlign = "center";
	};

	/**
	 * @private
	 */
	this.drawConnectionLabel_ = function(ctx, text, node1, node2) {
	    var padding = 5;

	    var middleX = Math.floor((node1.x + node2.x)/2);
	    var middleY = Math.floor((node1.y + node2.y)/2);
	    var textWidth = ctx.measureText(text).width;
	    var width = textWidth + padding*2;
	    var height = 20;

	    ctx.fillStyle = "#DDD";
	    ctx.fillRect(middleX - width/2, middleY - height/2, width, height);

	    ctx.fillStyle = "black";
	    ctx.fillText(text, middleX, middleY);
	};	
};

/**
 * Component name
 * @const
 * @type {string}
 */
pike.components.VisualizeGraph.NAME="pike.components.VisualizeGraph";

//## VisualizeRectangle #################################
/**
 * VisualizeRectangle
 * Draw a rectangle
 * @constructor
 * @example
 * ~~~
 * var vRect = new pike.core.Entity( pike.components.VisualizeRectangle )
 * vRect.setRectangle( new pike.graphics.Rectangle(50,50,60,100) ); 
 * vRect.setColor("#333333");
 * vRect.handler.listen(vRect, pike.events.Render.EVENT_TYPE, vRect.onRectangleRender, false, vRect); 
 * ~~~
 * @author Tomas Jurman (tomasjurman@gmail.com)
 */
pike.components.VisualizeRectangle = function(){
		
	/**
	 * @private
	 */
	this.pike_components_VisualizeRectangle = {};
		
	/**
	 * Set source rectangle
	 * @param {pike.graphics.Rectangle} rect
	 */
	this.setRectangle = function( rect ){
		this.x = rect.x;
		this.y = rect.y;
		this.w = rect.w;
		this.h = rect.h;
		this.pike_components_VisualizeRectangle.rectangle = rect;
	};
	
	/**
	 * Get source rectangle
	 * @return {pike.graphics.Rectangle}
	 */
	this.getRectangle = function(){
		return this.pike_components_VisualizeRectangle.rectangle;
	};
	
	/**
	 * Set color of rectangle
	 * @param {string} color - 24-bit hex string
	 * @example
	 * ~~~
	 * this.setColor("#36584d");
	 * ~~~
	 */
	this.setColor = function( color ){
		this.pike_components_VisualizeRectangle.color = color;
	};
		
	/**
	 * On render handler
	 * @param {pike.events.Render} e
	 */
	this.onRectangleRender = function(e){		
		this.layer.getOffScreen().context.fillStyle = this.pike_components_VisualizeRectangle.color;
		this.layer.getOffScreen().context.fillRect(this.x, this.y, this.w, this.h);					
	};	
};

/**
 * Component name
 * @const
 * @type {string}
 */
pike.components.VisualizeRectangle.NAME="pike.components.VisualizeRectangle";

