/**
* @fileoverview Rectangle
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.graphics.Rectangle');

/**
 * Create a new Rectangle
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @constructor
 */
pike.graphics.Rectangle = function( x, y, width, height){
	this.x = x;
    this.y = y;
    this.w = width;
    this.h = height;	
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
pike.graphics.Rectangle.prototype.intersect = function( r2 ){
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

