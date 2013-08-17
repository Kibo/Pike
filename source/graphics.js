/**
* @fileoverview Shapes and graphics components
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.graphics.Rectangle');
goog.provide('pike.graphics.Cluster');

//## Rectangle #####################################
/**
 * Create a new Rectangle
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @constructor
 */
pike.graphics.Rectangle = function( x, y, width, height){
	this.x = x || 0;
    this.y = y || 0;
    this.w = width || 0;
    this.h = height || 0;	
};

/**
 * Copy rectangle
 * @return {pike.graphics.Rectangle}
 */
pike.graphics.Rectangle.prototype.copy = function(){
	return new pike.graphics.Rectangle( this.x, this.y, this.w, this.h );
};

/**
 * Equals rectangles
 * @param {pike.graphics.Rectangle} r2 - rectangle
 * @return {boolean}
 */
pike.graphics.Rectangle.prototype.equals = function( r2 ){
	return (this.x == r2.x
	     && this.y == r2.y
	     && this.w == r2.w
	     && this.h == r2.h);	
};

/**
 * Converts Rectangle to string
 * @return {string}
 */
pike.graphics.Rectangle.prototype.toString = function(){
	return ("[x=" + this.x + ", y=" + this.y + ", width=" + this.w + ", height=" + this.h + "]");
};

/**
 * Determines whether to intersect
 * @param {pike.graphics.Rectangle} r2 - rectangle
 * @return {boolean}
 */
pike.graphics.Rectangle.prototype.intersects = function( r2 ){
	return (this.x <= r2.x + r2.w 
			&& this.x + this.w >= r2.x 
			&& this.y <= r2.y + r2.h 
			&& this.y + this.h >= r2.y);
};

/**
 * The intersection of two rectangles
 * @param {pike.graphics.Rectangle} r2
 * @return {?pike.graphics.Rectangle}
 */
pike.graphics.Rectangle.prototype.intersection = function( r2 ){
	 var x = Math.max(this.x, r2.x);
	 var y = Math.max(this.y, r2.y);
	 var width = Math.min(this.x + this.w, r2.x + r2.w) - x;
	 var height = Math.min(this.y + this.h, r2.y + r2.h) - y;
	
	  if (width <= 0 || height <= 0)
		  return null;
	
	  return new pike.graphics.Rectangle(x, y, width, height);
};

/**
 * Determines that the rectangle(this) fully covers the given rectangle(r2)
 * @param {pike.graphics.Rectangle} r2
 * @return {boolean}
 */
pike.graphics.Rectangle.prototype.covers = function( r2 ){
	return (r2.x >= this.x 
			&& r2.y >= this.y 
			&& r2.x + r2.w <= this.x + this.w 
			&& r2.y + r2.h <= this.y + this.h);	
};

/**
 * Determines that rectangle contains point
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
pike.graphics.Rectangle.prototype.containsPoint = function(x, y){
	return x >= this.x 
		&& x < this.x + this.w 
		&& y >= this.y 
		&& y < this.y + this.h;
};

/**
 * Creates rectangular container, which covers both rectangles.
 * Assumes that neither of rectangles is zero-area
 * @param {pike.graphics.Rectangle} r2
 * @return {pike.graphics.Rectangle}
 */
pike.graphics.Rectangle.prototype.convexHull = function( r2 ){
	var x = Math.min(this.x, r2.x);
    var y = Math.min(this.y, r2.y);
    var width = Math.max(this.x + this.w, r2.x + r2.w) - x;
    var height = Math.max(this.y + this.h, r2.y + r2.h) - y;

    return new pike.graphics.Rectangle(x, y, width, height);
};

/**
 * Test which cells are overlapped by the rectangle
 * @param {number} cellW
 * @param {number} cellH
 * @param {number} cellsInRow
 * @param {number} cellsInColumn
 * @return {pike.graphics.Rectangle}
 */
pike.graphics.Rectangle.prototype.getOverlappingGridCells = function(cellW, cellH, cellsInRow, cellsInColumn){
	var rectX = Math.max(0, Math.floor(this.x/cellW));
    var rectY = Math.max(0, Math.floor(this.y/cellH));
    var rectWidth = Math.min(cellsInRow - rectX, Math.floor((this.x + this.w)/cellW) - rectX + 1);
    var rectHeight = Math.min(cellsInColumn - rectY, Math.floor((this.y + this.h)/cellH) - rectY + 1);
    return new pike.graphics.Rectangle(rectX, rectY, rectWidth, rectHeight);
};

//## Cluster #####################################
/**
* Cluster 
* @param {number} clusterSize - side of the square in px. Must be dividable by width and height.
* @param {number} width - total width of the clusters
* @param {number} height - total height of the clusters
* @constructor
*/
pike.graphics.Cluster = function( clusterSize, width, height ){
	
	this.clusterSize_ = clusterSize;	
	this.bounds_ = new pike.graphics.Rectangle(0, 0, width, height);
	
	/* the clusters arranged into the grid */
	this.clusters_= [];

    /* object id to Rect - the cluster bounds */
    this.idToClusterBounds_ = {};        
};

/**
 * Set size
 * @param {number} width - total width of the clusters
 * @param {number} height - total height of the clusters
 */
pike.graphics.Cluster.prototype.setSize = function(width, height){
	this.bounds_.w = width;
	this.bounds_.h = height;
};

/**
 * Clusters
 * @return {Array.<Array>}
 */
pike.graphics.Cluster.prototype.getClusters = function(){
	return this.clusters_;
};

/**
 * Get cluster size
 * @return {number}
 */
pike.graphics.Cluster.prototype.getClusterSize = function(){
	return this.clusterSize_;
};

/**
 * Gets a entity bounds in clusters 
 * @param {number} id
 * @return {pike.graphics.Rectangle} - entity bounds in clusters
 */
pike.graphics.Cluster.prototype.getIdToClusterBounds = function(id){ 
	return this.idToClusterBounds_[id];
};

/**
 * Register entity in cluster 
 * @param {number} id
 * @param {pike.graphics.Rectangle} bounds
 */
pike.graphics.Cluster.prototype.setIdToClusterBounds = function(id, bounds){
	this.idToClusterBounds_[id] = bounds;
};

/**
 * Build a clusters
 */
pike.graphics.Cluster.prototype.build = function(){
	this.clusters_ = [];	
	for (var i = 0; i < Math.ceil(this.bounds_.h/this.clusterSize_); i++) {		
        this.clusters_[i] = [];        
        for (var j = 0; j < Math.ceil(this.bounds_.w/this.clusterSize_); j++) {
            this.clusters_[i][j] = [];            
        }
    }	
};

/**
 * Adds an entity to the clusters
 * @param {pike.core.Entity} entity
 * @param {?pike.graphics.Rectangle} clusterBounds
 * @returns {pike.graphics.Rectangle}
 */
pike.graphics.Cluster.prototype.addToClusters = function( entity, clusterBounds ){
	clusterBounds = clusterBounds || entity.getBounds().getOverlappingGridCells(
        this.clusterSize_, 
        this.clusterSize_, 
        this.clusters_[0].length, 
        this.clusters_.length);
		 
    for (var clusterY = clusterBounds.y; clusterY < clusterBounds.y + clusterBounds.h; clusterY++) {
        for (var clusterX = clusterBounds.x; clusterX < clusterBounds.x + clusterBounds.w; clusterX++) {
            this.clusters_[clusterY][clusterX].push( entity );              
        }
    }
    //save bounds in cluster
    this.idToClusterBounds_[entity.id] = clusterBounds;
    if(goog.DEBUG) window.console.log("[pike.graphics.Cluster] entity " +  entity.id +" is added to cluster " + clusterBounds);
    return clusterBounds;	
};

/**
 * Removes an entity from the clusters
 * @param {pike.core.Entity} entity
 * @param {?pike.graphics.Rectangle} clusterBounds
 */
pike.graphics.Cluster.prototype.removeFromClusters = function( entity, clusterBounds ){
	clusterBounds = clusterBounds || this.idToClusterBounds_[entity.id];
    for (var clusterY = clusterBounds.y; clusterY < clusterBounds.y + clusterBounds.h; clusterY++) {
        for (var clusterX = clusterBounds.x; clusterX < clusterBounds.x + clusterBounds.w; clusterX++) {            
            goog.array.remove(this.clusters_[clusterY][clusterX], entity);            
        }
    }
    
    if(goog.DEBUG) window.console.log("[pike.graphics.Cluster] entity " + entity.id + " is removed from cluster " + clusterBounds);
};

