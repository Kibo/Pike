/**
* @fileoverview Utility methods
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.Utils');

goog.require('pike.input.InputHandlerBase');
goog.require('pike.input.MouseInputHandler');
goog.require('pike.input.TouchInputHandler');

/**
 * Is touch device
 * @return {boolean}
 */
pike.Utils.isTouchDevice = function(){
	return ('ontouchstart' in document.documentElement);	
};

/**
 * Get input handler
 * mouse or touch
 * @return {pike.input.MouseInputHandler | pike.input.TouchInputHandler} 
 */
pike.Utils.getDeviceInputHandler = function(){
	return pike.Utils.isTouchDevice() ? new pike.input.TouchInputHandler() : new pike.input.MouseInputHandler();
};