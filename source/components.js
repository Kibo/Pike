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
	
	this.x = 0;
	this.y = 0;
	this.w = 0;
	this.h = 0;	
	
	this.init = function(){ 
		console.log('init');
	};
	
	this.setLayer = function(name){
		console.log(name);
	}; 
	this.onSpriteRender = function(e){
		console.log('render');
	};
	this.onSpriteUpdate = function(e){
		console.log('update');
	};
		
	this.init();	
};




