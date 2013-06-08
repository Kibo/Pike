/**
* @fileoverview Layer
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.assets.ImageManager');

/**
 * Create a new ImageManager
 * @constructor 
 */
pike.assets.ImageManager = function(){	
	this.images_ = {};
};

/**
 * Load multiple images
 * @param {Object} images
 * @param {function} onDone - callback when all images are loaded
 * @param {function} onProgress( itemLoaded, itemTotal, key, path, success ) - callback when an image is loaded
 * @example
 *  * ~~~
 *	im.load({
 *		"sheet"		: "img/sheet.png",
 *		"entities"	: "img/entities.png",
 *		"walls"		: "img/walls.png"
 *	});
 * ~~~
 */
pike.assets.ImageManager.prototype.load = function( images, onDone, onProgress){
	
	var queue = [];
    for (var name in images) {
        queue.push({
            key: name,
            path: images[name]
        });        
    }
    
    if (queue.length == 0) {
		onProgress && onProgress(0, 0, null, null, true);
		onDone && onDone();
		return;
	}
	
	var itemCounter = {
		loaded: 0,
		total: queue.length
	};

	for (var i = 0; i < queue.length; i++) {		
		this.loadImage_( queue[i], itemCounter, onDone, onProgress);		
	} 	
};

/**
 * Get a image registered with manager 
 * @param {string} key
 * @returns {Object} image - HTML DOM Image Object
 */
pike.assets.ImageManager.prototype.get = function( key ){
	return this.images_[key];
};

/** 
 * @private
 */
pike.assets.ImageManager.prototype.loadImage_ = function( queueItem, itemCounter, onDone, onProgress ){
	var self = this;
	var img = new Image();
	img.onload = function() {
		self.images_[queueItem.key] = img;
		self.onItemLoaded_(queueItem, itemCounter, onDone, onProgress, true);
	};

	img.onerror = function() {					
		self.onItemLoaded_(queueItem, itemCounter, onDone, onProgress, false);
	};
	img.src = queueItem.path;		
};

/**
 * @private
 */
pike.assets.ImageManager.prototype.onItemLoaded_ = function( queueItem, itemCounter, onDone, onProgress, success ){
	itemCounter.loaded++;
	onProgress && onProgress(itemCounter.loaded, itemCounter.total, queueItem.key, queueItem.path, success);
	if (itemCounter.loaded == itemCounter.total) {
		onDone && onDone();
	}	
};

