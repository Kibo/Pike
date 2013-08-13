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
goog.provide('pike.components.Practice');
goog.provide('pike.components.AStar');

goog.require('goog.events');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('pike.graphics.Rectangle');
goog.require('pike.animation.Animator');
goog.require('pike.events.StartDialogue');
goog.require('pike.events.ShowDialogue');
goog.require('pike.events.EndDialogue');
goog.require('pike.events.EndPractice');
goog.require('pike.events.ReachDestination');
goog.require('goog.style');
goog.require('pike.ai.path.Graph');
goog.require('pike.input.Utils');

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
	 * Set a event handler
	 * @param {pike.input.MouseInputHandler|pike.input.TouchInputHandler} eventHandler
	 */
	this.setGameEventHandler = function( eventHandler ){
		this.gameEventHandler_ = eventHandler;
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
		
		this.backpackItem_.style.position="relative";
	    this.backpackItem_.style.left="0px";
	    this.backpackItem_.style.top="0px";	   
			
		this.backpackItem_.style.cursor = "pointer";
		this.backpackItem_.style.padding = "2px 2px";
		
		this.backpackItem_.setAttribute("data-isDraggable", "true");
		this.backpackItem_.setAttribute("data-widget", this.id);
							
		this.getBackpackElement().appendChild( this.backpackItem_ );			
		this.layer.setDirty( this.getBounds() );
		
		this.isOnBackpack_ = true;		
		if(goog.DEBUG) window.console.log("[pike.components.Backpack] putInBag #" + this.id);
						
	    goog.events.listen( this.gameEventHandler_, pike.events.Down.EVENT_TYPE, this.dragStart_, false, this);	   
	};	
		
	/**
	 * Drag start handler
	 * @param {pike.events.Down} e
	 * @private
	 */
	this.dragStart_ = function(e){					
		if( e.posY < this.layer.viewport_.h){			
			return;
		}
		
		var position = goog.style.getRelativePosition( this.backpackItem_, e.target);
		var size = goog.style.getSize( this.backpackItem_ );
		var bounds = new pike.graphics.Rectangle(position.x, position.y, size.width, size.height);
			
		if(!bounds.containsPoint( e.posX, e.posY )){			
			return;
		}
		
		this.isDropAcceptable_ = true;
		
		goog.events.listen( this.gameEventHandler_ , pike.events.Move.EVENT_TYPE, this.dragMove_, false, this);
		goog.events.listen( this.gameEventHandler_ , pike.events.Up.EVENT_TYPE, this.drop_, false, this);
		
		if(goog.DEBUG) window.console.log("[pike.components.Backpack] dragstart");				
	};
	
	this.dragMove_ = function(e){						
		this.backpackItem_.style.left = (parseInt( this.backpackItem_.style.left ) + e.deltaX) + "px" ;
		this.backpackItem_.style.top = (parseInt( this.backpackItem_.style.top ) + e.deltaY) + "px" ;	 		
	};
	
	/**
	 * Drop over handler	
	 * @param {pike.events.Up} e
	 * @private
	 */
	this.drop_ = function(e){				
		goog.events.unlisten( this.gameEventHandler_ , pike.events.Move.EVENT_TYPE, this.dragMove_, false, this);
		goog.events.unlisten( this.gameEventHandler_ , pike.events.Up.EVENT_TYPE, this.drop_, false, this);
		
		this.backpackItem_.style.left="0px";
	    this.backpackItem_.style.top="0px";
		
		var viewport = this.layer.viewport_;
								
		var oldX = this.x;
		var oldY = this.y;		
		var x = e.posX + viewport.x;
		var y = e.posY + viewport.y;
				
		if( e.posX < 0 	
		 || e.posX > viewport.w
		 || e.posY < 0
		 || e.posY > viewport.h ){
			if(goog.DEBUG) window.console.log("[pike.components.Backpack] drop out of game area.");
			return;
		}
				
		this.x = x;						
		this.y = y;
					
		this.dispatchEvent( new pike.events.ChangePosition(this.x, this.y, oldX, oldY, this));
		if( !this.isDropAcceptable_ ){
			this.x = oldX;
			this.y = oldY;
			if(goog.DEBUG) window.console.log("[pike.components.Backpack] drop is not accepted");
			return; //comes back to backpack
		}
				
		this.layer.setDirty( this.getBounds() );											    								
		if(goog.DEBUG) window.console.log("[pike.components.Backpack] drop #" + this.id);		
					
		this.removeFromBackpack();		
	};	
	
	/**
	 * Remove DOM item from DOM backpack container
	 */
	this.removeFromBackpack = function(){		
		goog.events.unlisten( this.gameEventHandler_, pike.events.Down.EVENT_TYPE, this.dragStart_, false, this);			
		goog.dom.removeNode( this.backpackItem_ );
		this.backpackItem_ = null;
		this.isOnBackpack_ = false;			
		if(goog.DEBUG) window.console.log("[pike.components.Backpack] removeFromBag #" + this.id);
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
		
		var inputHandler = pike.input.Utils.getDeviceInputHandler();
		inputHandler.setEventTarget( container );		
		goog.events.listen(inputHandler, pike.events.Down.EVENT_TYPE, goog.bind(function(e){		
			var currentDialogue = this.findDialogueById( e.domEvent.target.getAttribute("data-dialogue") );					
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
		
		var inputHandler = pike.input.Utils.getDeviceInputHandler();
		inputHandler.setEventTarget( container );		
		goog.events.listen(inputHandler, pike.events.Down.EVENT_TYPE, goog.bind(function(e){		
			var currentDialogue = this.findDialogueById( e.domEvent.target.getAttribute("data-dialogue") );		
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

//## pike.components.Practice #################################
/**
 * Practice
 * Practicing English tenses
 * @constructor
 * @example
 * ~~~
 * var practice = new pike.core.Entity( pike.components.Practice );
 * practice.setPracticeData(data);  
 * 
 * hero.handler.listen(practice, pike.events.EndPractice.EVENT.TYPE, function(e){//do something}, false, this);
 * 
 * practice.showPractice();
 * 
 * practice.isPracticeFinished();
 * practice.hasPracticeError();
 * ~~~
 * @author Tomas Jurman (tomasjurman@gmail.com)
 */
pike.components.Practice = function(){	
	this.hasPracticeError_ = false;
	this.numberOfPractice_ = 5;
	this.practiceData_ = [];
	this.practiceDataIndex_ = 0;
	
	var root = document.getElementById(pike.components.Practice.ELEMENT_ID);
	var isPracticeCheck_ = false;
		
	/**
	 * Create practice form
	 */
	this.showPractice = function(){
		if( !this.practiceData_[ this.practiceDataIndex_ ]){
			throw new Error("[pike.components.Practice] practiceData: Array Out of Bounds");
		}
		
		if(!root){
			throw new Error("[pike.components.Practice] there is not root element #: " + pike.components.Practice.NAME);
		}
				
		root.innerHTML= ''; //reset
		
		var sentence = this.practiceData_[ this.practiceDataIndex_ ];
		
		var practiceWrapper = goog.dom.createDom('div');
					
		var assignment = goog.dom.createDom('ul', undefined,
				goog.dom.createDom('li', undefined, goog.dom.htmlToDocumentFragment('Subject: <b>' + sentence.subject + '</b>')),
				goog.dom.createDom('li', undefined, goog.dom.htmlToDocumentFragment('Verb: <b>' + sentence.verb + '</b>')),
				goog.dom.createDom('li', undefined, goog.dom.htmlToDocumentFragment('Verb Tense: <b>' + sentence.tense + '</b>')),
				goog.dom.createDom('li', undefined, goog.dom.htmlToDocumentFragment('Option: <b>' + sentence.option + '</b>')),
				goog.dom.createDom('li', undefined, goog.dom.htmlToDocumentFragment('Object: <b>' + sentence.object + '</b>'))				
		);
						
		var answer = goog.dom.createDom('div', {'id': pike.components.Practice.ANSWER_ELEMENT_ID}, 
				goog.dom.createDom('label', undefined,'Write the Sentence:'), 
				goog.dom.createDom('textarea'));
		
		var solutions = goog.dom.createDom('div', {'id':pike.components.Practice.SOLUTIONS_ELEMENT_ID}); 
				
		var buttonsWrapper = goog.dom.createDom('p', {'class':'buttons'}); 
																			
		var checkButton = goog.dom.createDom('input', {'type':'button', 'id':pike.components.Practice.BUTTON_CHECK_ELEMENT_ID, 'value':'Check', 'class':'btn'});
		var checkInputHandler = pike.input.Utils.getDeviceInputHandler();
		checkInputHandler.setEventTarget( checkButton );
		goog.events.listenOnce( checkInputHandler , pike.events.Down.EVENT_TYPE, this.checkButtonHandler, false, this);
		goog.dom.appendChild(buttonsWrapper, checkButton);
				
		var nextButton = goog.dom.createDom('input', {'type':'button', 'id':pike.components.Practice.BUTTON_NEXT_ELEMENT_ID, 'value':'Next', 'class':'hide btn'});
		var nextInputHandler = pike.input.Utils.getDeviceInputHandler();
		nextInputHandler.setEventTarget( nextButton );
		goog.events.listenOnce(nextInputHandler, pike.events.Down.EVENT_TYPE, this.nextButtonHandler, false, this);
		goog.dom.appendChild(buttonsWrapper, nextButton);
					
		var leaveButton = goog.dom.createDom('input', {'type':'button', 'id':pike.components.Practice.BUTTON_LEAVE_ELEMENT_ID, 'value':'Leave', 'class':'btn'});
		var leaveInputHandler = pike.input.Utils.getDeviceInputHandler();
		leaveInputHandler.setEventTarget( leaveButton );
		goog.events.listenOnce( leaveInputHandler, pike.events.Down.EVENT_TYPE, this.leaveButtonHandler, false, this);
		goog.dom.appendChild(buttonsWrapper, leaveButton);
					
		if(this.practiceInstructionText){						
			goog.dom.appendChild(practiceWrapper, goog.dom.createDom('div', {'id':pike.components.Practice.INSTRUCTION_ELEMENT_ID}, goog.dom.htmlToDocumentFragment( this.practiceInstructionText )));
		}	 
		goog.dom.appendChild(practiceWrapper, assignment);
		goog.dom.appendChild(practiceWrapper, answer);
		goog.dom.appendChild(practiceWrapper, solutions);
		goog.dom.appendChild(practiceWrapper, buttonsWrapper);
		goog.dom.appendChild(root, practiceWrapper);
		
				
		goog.dom.getLastElementChild( document.getElementById( pike.components.Practice.ANSWER_ELEMENT_ID ) ).focus(); 
		
		isPracticeCheck_ = false;
	};
		
	/**
	 * Check button handler
	 * @param {Object} e - DOM event
	 */
	this.checkButtonHandler = function(e){
		isPracticeCheck_ = true;
				
		goog.dom.classes.add( document.getElementById( pike.components.Practice.BUTTON_CHECK_ELEMENT_ID ), 'hide');
		if( this.hasNextPractice() ){
			goog.dom.classes.remove( document.getElementById( pike.components.Practice.BUTTON_NEXT_ELEMENT_ID ), 'hide');
		}
					
		var answer = goog.dom.getLastElementChild(document.getElementById(pike.components.Practice.ANSWER_ELEMENT_ID)).value.trim();
		var solutionsWrapper = document.getElementById( pike.components.Practice.SOLUTIONS_ELEMENT_ID );
		
		for(var i = 0; i < this.practiceData_[ this.practiceDataIndex_ ].solutions.length; i++){
			if( answer == this.practiceData_[ this.practiceDataIndex_ ].solutions[i] ){				
				goog.dom.classes.add( document.getElementById( pike.components.Practice.ANSWER_ELEMENT_ID ), 'correct');
				return;
			}			
		}
		
		goog.dom.classes.add( document.getElementById( pike.components.Practice.ANSWER_ELEMENT_ID ), 'error');
		this.hasPracticeError_ = true;

		goog.dom.appendChild(solutionsWrapper, goog.dom.createDom('h3', undefined, 'Solutions'));
		var solutions = goog.dom.createDom('ul');			
		for(var i = 0; i < this.practiceData_[ this.practiceDataIndex_ ].solutions.length; i++){
			var solution = goog.dom.createDom('li', undefined, this.practiceData_[ this.practiceDataIndex_ ].solutions[i]);			
			goog.dom.appendChild(solutions, solution);				
		}
		goog.dom.appendChild(solutionsWrapper, solutions);
	};
	
	/**
	 * Next button handler
	 * @param {Object} e - DOM event
	 */
	this.nextButtonHandler = function(e){
		if(this.hasNextPractice()){
			this.practiceDataIndex_ += 1;
			this.showPractice();			
		}
	};
	
	/**
	 * Leave button handler
	 * @param {Object} e - DOM event
	 */
	this.leaveButtonHandler = function(e){
		if(goog.DEBUG) window.console.log("[pike.components.Practice] endpractice");
		this.dispatchEvent( new pike.events.EndPractice( this ) );	
		return;
	};
					
	/**
	 * Has next practice
	 * @return {boolean}
	 */
	this.hasNextPractice = function(){
		return ((this.practiceDataIndex_ + 1) < this.practiceData_.length 
				&& (this.practiceDataIndex_ + 1) < this.numberOfPractice_ );
	};
		
	/**
	 * Shuffle practice data
	 */
	this.shufflePracticeData = function(){
		goog.array.shuffle( this.practiceDataIndex_ );
	};
		
	/**
	 * Set a practice data
	 * @param {Array.<Object>} data
	 */
	this.setPracticeData = function( data ){		
		this.practiceData_ = data;
	};

	/**
	 * Number of exercises
	 * @param {number} number
	 */
	this.setNumberOfPractice = function( number ){
		this.numberOfPractice_ = number;
	};
	
	/**
	 * Set instruction text
	 * @param {String} text
	 * @example
	 * ~~~
	 * practice.setPracticeInstructionText('Only <b>you</b> can prevent forest fires.')
	 * ~~~
	 */
	this.setPracticeInstructionText = function( text ){
		this.practiceInstructionText = text;
	};

	/**
	 * Is finished
	 * @return {boolean}
	 */
	this.isPracticeFinished = function(){
		return isPracticeCheck_ && (this.practiceDataIndex_ + 1) == this.numberOfPractice_;
	};

	/**
	 * Has error
	 * @return {boolean}
	 */
	this.hasPracticeError = function(){
		return this.hasPracticeError_;
	};
};

/**
 * Component name
 * @const
 * @type {string}
 */
pike.components.Practice.NAME="pike.components.Practice";

/**
 * DOM Element id
 * @const
 * @type {string}
 */
pike.components.Practice.ELEMENT_ID = "pike-practice";

/**
 * DOM Element id
 * @const
 * @type {string}
 */
pike.components.Practice.ANSWER_ELEMENT_ID = "practice-answer";

/**
 * DOM Element id
 * @const
 * @type {string}
 */
pike.components.Practice.SOLUTIONS_ELEMENT_ID = "practice-solutions";

/**
 * DOM Element id
 * @const
 * @type {string}
 */
pike.components.Practice.INSTRUCTION_ELEMENT_ID = "practice-instruction";

/**
 * DOM Element id
 * @const
 * @type {string}
 */
pike.components.Practice.BUTTON_CHECK_ELEMENT_ID = "practice-button-check";

/**
 * DOM Element id
 * @const
 * @type {string}
 */
pike.components.Practice.BUTTON_NEXT_ELEMENT_ID = "practice-button-next";

/**
 * DOM Element id
 * @const
 * @type {string}
 */
pike.components.Practice.BUTTON_LEAVE_ELEMENT_ID = "practice-leave-button";

//## pike.components.AStar #################################
/**
 * pike.components.AStar
 * A* algorithm for an entity
 * @constructor
 * @fires {pike.events.ReachDestination}
 * @example
 * ~~~
 * var enemy = new pike.core.Entity( pike.components.AStar );
 * enemy.setGraph( graph );
 * enemy.setDestinationNode( nodes[1] );
 * ~~~
 * @see pike.components.VisualizeGraph
 * @author Tomas Jurman (tomasjurman@gmail.com)
 */
pike.components.AStar = function(){
	
	/**
	 * @private
	 */
	this.isWalking_ = false;
	
	/**
	 * @private
	 */
	this.graph_ = null;
	
	/**
	 * @private
	 */
	this.tempo_ = 50;
	
	/**
	 * @private
	 */
	this.pike_components_AStar_ = {
			actualNode:null,
			path:null,
			animator:new pike.animation.Animator(),
			lastUpdate:null			
	};
	
	/**
	 * Set movement tempo
	 * @param {number} tempo - px per second
	 */
	this.setTempo = function( tempo ){
		this.tempo_ = tempo;
	};
	
	/**
	 * Set a graph
	 * @param {pike.ai.path.Graph} graph
	 */
	this.setGraph = function(graph){
		this.graph_ = graph;		
	};
	
	/**
	 * Get a graph
	 * @return {pike.ai.path.Graph}
	 */
	this.getGraph = function(){
		return this.graph_;		
	};
	
	/**
	 * Is walking
	 * @return {boolean}
	 */
	this.isWalking = function(){
		return this.isWalking_;
	};
	
	/**
	 * Stop walkning
	 */
	this.stopWalking = function(){
		this.isWalking_ = false;			
	};
	
	/**
	 * Start walkning
	 */
	this.startWalking = function(){		
		var targetNode = this.pike_components_AStar_.path[0];
		
		this.startX_ = this.x;
		this.startY_ = this.y;
		
		this.vx = targetNode.x - this.x;
		this.vy = targetNode.y - this.y;
		var magnitude = Math.sqrt((this.vx*this.vx)+(this.vy*this.vy));
		
		this.pike_components_AStar_.animator.stop();
		this.pike_components_AStar_.animator.setRepeatBehavior(pike.animation.Animator.LOOP);
		this.pike_components_AStar_.animator.setRepeatCount(1);
		this.pike_components_AStar_.animator.setDuration( (magnitude/this.tempo_) * 1000 ); 
		this.pike_components_AStar_.animator.start();
		
		this.pike_components_AStar_.lastUpdate = new Date().getTime();
		
		this.isWalking_ = true;
	};
	
	/**
	 * Set destination node
	 * @param {pike.ai.path.Node} destinationNode
	 */
	this.setDestinationNode = function( destinationNode ){			
		if(!this.graph_){
			throw new Error("[pike.components.AStar] Graph is not set.");
		}
		
		
					
		//Find the best path
		this.pike_components_AStar_.path = this.graph_.findPath( this.getActualNode_(), destinationNode );		
							
		this.setNextDestination_();
	};
	
	/**
	 * Set next destination
	 * @fires {pike.events.ReachDestination} - when the last node is reached
	 * @private
	 */
	this.setNextDestination_ = function(){
								
		//First node is actual node
		this.pike_components_AStar_.actualNode = this.pike_components_AStar_.path[0];
		
		//Removes actual node from path
		this.pike_components_AStar_.path.splice(0,1);
									
		//Reach the destination
		if(this.pike_components_AStar_.path.length == 0){				
			this.isWalking_ = false;	
			this.dispatchEvent( new pike.events.ReachDestination(this.x, this.y, this));
			if(goog.DEBUG) window.console.log("[pike.components.AStar] destination is reached");
			return; //===========>
		}
							
		this.startWalking();
	};
	
	/**
	 * On update handler
	 * @param {pike.events.Update} e
	 * @fires {pike.events.ReachPathDestination} - when the last node is reached
	 */
	this.onAStartUpdate = function( e ){		
		if(!this.isWalking_){
			return;
		}
				
		if(typeof this.vx == 'undefined' || typeof this.vy == 'undefined' ){
			return;
		}			
		
		var now = e.now;						
		var fraction = this.pike_components_AStar_.animator.update( now - this.pike_components_AStar_.lastUpdate );
		this.pike_components_AStar_.lastUpdate = now;
					
		if( typeof fraction == 'undefined'){			
			delete this.vx;
			delete this.vy;
			this.setNextDestination_();
			return
		};
					
		var oldX = this.x;
		var oldY = this.y;
		
		this.x = this.startX_ + (this.vx * fraction);
		this.y = this.startY_ + (this.vy * fraction); 
		
		this.x = (0.5 + this.x) << 0; //round
    	this.y = (0.5 + this.y) << 0; //round
    	
    	this.dispatchEvent( new pike.events.ChangePosition(this.x, this.y, oldX, oldY, this) );
    	
    	if( this.hasComponent( pike.components.Sprite.NAME ) ){
    		this.onSpriteUpdate( e );    		
    	}
	};
	
		
	/**
	 * Get actual node or first node in graph
	 * Actual node is node where an entity stays
	 * @return {pike.ai.path.Node}
	 * @private
	 */
	this.getActualNode_ = function(){
		if( !this.pike_components_AStar_.actualNode ){		
			for(var i = 0; i < this.graph_.getNodes().length; i++){
				
				if(	this.graph_.getNodes()[i].x == this.x 
					&& this.graph_.getNodes()[i].y == this.y){
					this.pike_components_AStar_.actualNode = this.graph_.getNodes()[i]; 
					return this.pike_components_AStar_.actualNode; //========>
				}
			}				
			throw new Error("[pike.components.AStar] Entity is not on graph position.");
		}
			
		return this.pike_components_AStar_.actualNode;
	};
};

/**
 * Component name
 * @const
 * @type {string}
 */
pike.components.AStar.NAME="pike.components.AStar";
