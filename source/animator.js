/**
* @fileoverview Animator
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.animation.Animator');

/**
 * Animator
 * @param {?number} duration - the duration of the one loop of the animation in milliseconds.
 * @constructor
 */
pike.animation.Animator = function( duration ){
	
	this.duration_ = duration;

	// total loops to do
	this.repeatCount_ = pike.animation.Animator.INFINITE;

	// how many loops were actually done
	this.loopsDone_ = 0;

	// default repeat behavior is REVERSE
	this.repeatBehavior_ = pike.animation.Animator.RepeatBehavior.REVERSE;

	// time, passed since the start of the loop
	this.timeSinceLoopStart_ = 0;

	this.started_ = false;
	this.running_ = false;

	// Flag to mark that this loop is going into the opposite direction
	this.reverseLoop_ = false;	
};

/**
 * A possible parameter to setLoopCount.
 * @const
 * @type {number}
 */
pike.animation.Animator.INFINITE = -1;

pike.animation.Animator.RepeatBehavior = {
	LOOP: 1,
	REVERSE: 2
};

/**
 * Starts the animator. 
 * After the animator is started you can't change its parameters until stop() is called.
 */
pike.animation.Animator.prototype.start = function(){	
	this.started_ = true;
	this.running_ = true;
};

/**
 * Checks if animator is currently running
 */
pike.animation.Animator.prototype.isRunning = function() {
	return this.running_;
};

/**
 * Stops the animator and resets the internal state.
 */
pike.animation.Animator.prototype.stop = function() {
	this.loopsDone_ = 0;
	this.timeSinceLoopStart_ = 0;
	this.running_ = false;
	this.started_ = false;
};

/**
 * Pauses the animator. The animator will ignore the updates while paused, "freezing"
 * the animation but not resetting its state. The animation can be then resumed.
 */
pike.animation.Animator.prototype.pause = function() {
	this.running_ = false;
};

/**
 * Updates the state of the animator.
 * @param {number} deltaTime - time passed since the last update. 0 is valid value.
 */
pike.animation.Animator.prototype.update = function(deltaTime) {	
			
	if (!this.started_) {
		return;
	}
	
	if (!this.running_) {
		deltaTime = 0;
	}

	this.timeSinceLoopStart_ += deltaTime;
		
	if (this.timeSinceLoopStart_ >= this.duration_) {			
		
		// Just in case, we skipped more than one loop, determine how many loops did we miss
		var loopsSkipped = Math.floor(this.timeSinceLoopStart_/this.duration_);
		this.timeSinceLoopStart_ %= this.duration_;
				
		// truncate to the number of loops skipped.
		if (this.repeatCount_ != pike.animation.Animator.INFINITE && loopsSkipped > this.repeatCount_ - this.loopsDone_) {			
			loopsSkipped = this.repeatCount_ - this.loopsDone_;
		}
			
		this.loopsDone_ += loopsSkipped;				
		this.reverseLoop_ = this.repeatBehavior_ == pike.animation.Animator.RepeatBehavior.REVERSE && this.loopsDone_ % 2 == 1;				
		
		
		
		// Check if we reached the end of the animation
		if (this.repeatCount_ != pike.animation.Animator.INFINITE && this.loopsDone_ == this.repeatCount_) {			
			this.stop();
			return;
		}
	}

	// If this is the loop that is going backwards - reverse the fraction as well
	var fraction = this.timeSinceLoopStart_/this.duration_;
	if (this.reverseLoop_){
		fraction = 0.99999999999999 - fraction;
	}
		
	return fraction;
};

/**
 * Ensures that the animator is not running
 */
pike.animation.Animator.prototype.throwIfStarted_ = function() {
	if (this.started_){
		throw new Error("Cannot change property on the started animator");
	}
};

/**
 * @return {number} the duration of one loop of the animation
 */
pike.animation.Animator.prototype.getDuration = function() {
	return this.duration_;
};

/**
 * Sets the duration of one loop of the animation. Should be value >=1
 * @param {?number} duration - the duration of the one loop of the animation in milliseconds.
 */
pike.animation.Animator.prototype.setDuration = function(duration) {
	this.throwIfStarted_();
	if (duration < 1) {
		throw Error("Duration can't be < 1");
	}
	
	this.duration_ = duration;
};

/**
 * Set the number of loops in the animation, default is 1. Valid values are integers, -1 or Animator.INFINITE for infinite looping
 * @param {number}
 */
pike.animation.Animator.prototype.setRepeatCount = function(repeatCount) {
	this.throwIfStarted_();

	if (repeatCount < 1 && repeatCount != pike.animation.Animator.INFINITE){
		throw Error("Repeat count must be greater than 0 or INFINITE");
	}
	
	this.repeatCount_ = repeatCount;
};

/**
 * Get repeat count
 * @return {number}
 */
pike.animation.Animator.prototype.getRepeatCount = function(){
	return this.repeatCount_;
};

/**
 * RepeatBehavior determines what animator does after reaching the end of the loop.
 * If it is set to pike.animation.Animator.RepeatBehavior.LOOP, then the next loop will start from 0 again, proceeding to 1. 
 * If the behavior is pike.animation.Animator.RepeatBehavior.REVERSE the odd loops will run backwards - from 1 to 0. Obviously setting this parameter only makes sense when the number of loops is more than 1.
 * @param {pike.animation.Animator.RepeatBehavior.LOOP | pike.animation.Animator.RepeatBehavior.REVERSE}
 */
pike.animation.Animator.prototype.setRepeatBehavior = function( repeatBehavior ) {
	return this.repeatBehavior_ = repeatBehavior;
};

/**
 * Returns the configured repeat behavior of the animator. 
 */
pike.animation.Animator.prototype.getRepeatBehavior = function() {
	return this.repeatBehavior_;
};
