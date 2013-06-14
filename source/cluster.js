/**
* @fileoverview Cluster
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.graphics.Cluster');

goog.require('pike.graphics.Rectangle');

/**
* Cluster 
* @param {number} clusterSize
* @param {number} width
* @param {number} height
* @constructor
*/
pike.graphics.Cluster = function( clusterSize, width, height ){
	
	this.clusterSize_ = clusterSize;	
	this.bounds_ = new pike.graphics.Rectangle(0, 0, width, height);
	
	/* the clusters arranged into the grid */
	this.clusters_= [];

    /* object id to Rect - the cluster bounds */
    this.idToClusterBounds_ = {}; 
    
    this.buildClusters();
};

/**
 * Build a cluster
 */
pike.graphics.Cluster.prototype.buildClusters = function(){
	this.clusters_ = [];	
	for (var i = 0; i < Math.ceil(this.bounds_.h/this.clusterSize_); i++) {		
        this.clusters_[i] = [];        
        for (var j = 0; j < Math.ceil(this.bounds_.w/this.clusterSize_); j++) {
            this.clusters_[i][j] = [];            
        }
    }
};

/**
 * Add entity to the clusters
 * @param {pike.core.Entity} entity
 * @returns {pike.graphics.Rectangle}
 */
pike.graphics.Cluster.prototype.addToClusters = function( entity ){
	var clusterBounds = entity.getBounds().getOverlappingGridCells(
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
 * Add entity from the clusters
 * @param {pike.core.Entity} entity
 */
pike.graphics.Cluster.prototype.removeFromClusters = function( entity ){
	var clusterBounds = this.idToClusterBounds_[entity.id];
    for (var clusterY = clusterBounds.y; clusterY < clusterBounds.y + clusterBounds.h; clusterY++) {
        for (var clusterX = clusterBounds.x; clusterX < clusterBounds.x + clusterBounds.w; clusterX++) {            
            goog.array.remove(this.clusters_[clusterY][clusterX], entity);            
        }
    }
    
    if(goog.DEBUG) console.log("[pike.graphics.Cluster] entity " + entity.id + " is removed from cluster " + clusterBounds);
};