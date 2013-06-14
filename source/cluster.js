/**
* @fileoverview Cluster
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.graphics.Cluster');

goog.require('pike.graphics.Rectangle');

/**
* Cluster 
* @param {number} clusterSize - side of the square in px
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
    if(goog.DEBUG) console.log("[pike.graphics.Cluster] entity " +  entity.id +" is added to cluster " + clusterBounds);
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
    
    if(goog.DEBUG) console.log("[pike.graphics.Cluster] entity " + entity.id + " is removed from cluster " + clusterBounds);
};