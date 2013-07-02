/**
* @fileoverview AI helper classes
* @author tomasjurman@gmail.com (Tomas Jurman)
* @license Dual licensed under the MIT or GPL licenses.
*/
goog.provide('pike.ai.path.Node');
goog.provide('pike.ai.path.Graph');

goog.provide('pike.ai.decision.DecisionTreeNode');
goog.provide('pike.ai.decision.NumericDecisionNode');
goog.provide('pike.ai.decision.ProbabilisticDecisionNode');

//## NumericDecisionNode #####################################
/**
 * Create new Decision Node
 * Numeric decision is based on the value of the certain agent parameter.
 * If value is lesser or equal than the threshold, the leNode is executed otherwise - gNode.
 * @param {string} name - agent property name
 * @param {number} threshold
 * @param {Object} leNode - less then threshold Node
 * @param {Object} gNode - grow then threshold Node
 * @constructor
 * @example
 * ~~~
 * var hero = new Hero({intelligence:80, strength:30, communication:40});
 * 
 * function WinAction(){}
 *		WinAction.prototype.execute = function( hero ){
 *		console.log("Won");
 * }
 * 
 * function LossAction(){}
 * 		LossAction.prototype.execute = function( hero ){
 * 		console.log("Loss");
 * }
 * 
 * function decisionTree() {
 *	var winAction = new WinAction();
 *	var lossAction = new LossAction();
 *
 *	return new NumericDecisionNode("intelligence", 80, 
 *		new NumericDecisionNode("strength", 50, lossAction, winAction), 
 *		new ProbabilisticDecisionNode(0.5, lossAction, winAction));
 * }
 * 
 * var tree = decisionTree();
 * tree.execute( hero );
 * ~~~
 */
pike.ai.decision.NumericDecisionNode = function (name, threshold, leNode, gNode) {
    this.name_ = name;
    this.threshold_ = threshold;
    this.leNode_ = leNode;
    this.gNode_ = gNode;
};

goog.inherits(pike.ai.decision.NumericDecisionNode, pike.ai.decision.DecisionTreeNode);

/**
 * @inheritDoc
 */
pike.ai.decision.NumericDecisionNode.prototype.execute = function(agent, data) {
    var node = agent[this.name_] > this.threshold_ ? this.gNode_ : this.leNode_;    
    node.execute(agent);
};

//## ProbabilisticDecisionNode #####################################
/**
 * Create new Decision Node
 * Probabilistic decision is executed depending on the chance value
 * 0 - never
 * 1 - always
 * between 0-1 with the
 * @param {number} chance
 * @param {Object} trueNode
 * @param {Object} falseNode
 * @constructor
 * @example
 * ~~~
 * var hero = new Hero({intelligence:80, strength:30, communication:40});
 * 
 * function WinAction(){}
 *		WinAction.prototype.execute = function( hero ){
 *		console.log("Won");
 * }
 * 
 * function LossAction(){}
 * 		LossAction.prototype.execute = function( hero ){
 * 		console.log("Loss");
 * }
 * 
 * function decisionTree() {
 *	var winAction = new WinAction();
 *	var lossAction = new LossAction();
 *
 *	return new ProbabilisticDecisionNode(0.8, 
 *		new NumericDecisionNode("strength", 50, lossAction, winAction),  
 *		new ProbabilisticDecisionNode(0.5, lossAction, winAction));
 * }
 * 
 * var tree = decisionTree();
 * tree.execute( hero );
 * ~~~
 */
pike.ai.decision.ProbabilisticDecisionNode = function(chance, trueNode, falseNode) {
    this.chance_ = chance;
    this.trueNode_ = trueNode;
    this.falseNode_ = falseNode;
};

goog.inherits(pike.ai.decision.ProbabilisticDecisionNode, pike.ai.decision.DecisionTreeNode);

/**
 * @inheritDoc
 */
pike.ai.decision.ProbabilisticDecisionNode.prototype.execute = function(agent, data) {
    var node = Math.random() < this.chance_ ? this.trueNode_ : this.falseNode_;
    node.execute(agent);
};

//## DecisionTreeNode #####################################
/**
 * Abstract class for all decision node
 * @abstract
 */
pike.ai.decision.DecisionTreeNode = function(){};

/**
 * Executes the given node. The "decision" nodes should evaluate the conditions, 
 * select the child nodes and call execute on them. The action nodes should initiate 
 * the certain action of the agent
 * @param {Object} agent - the agent that needs to make a decision
 * @param {Object} data - any external data (for example, the information about the world)
 */
pike.ai.decision.DecisionTreeNode.prototype.execute = function( agent, data) {
    throw Error("Abstract method - must be overwritten");
};

//## Graph #####################################
/**
* Create a new Graph
* @param {Array.<pike.ai.path.Node>} nodes
* @param {Array} connections - matrix of connections
* @constructor
* @example
* ~~~
* function createGraph() {
*	var coords = [[248,76],[205,329],[592,230],[420,410], [95,410],[479,230],[420,16],[555,16]];
*	var matrix =
*		[[1, 1, 0, 0, 0, 0, 0, 0],
*		 [1, 1, 0, 1, 0, 0, 0, 0],
*		 [0, 0, 1, 1, 0, 1, 0, 0],
*		 [0, 1, 1, 1, 1, 1, 1, 0],
*		 [0, 0, 0, 1, 1, 0, 0, 0],
*		 [0, 0, 1, 1, 0, 1, 1, 0],
*		 [0, 0, 0, 1, 0, 1, 1, 1],
*		 [0, 0, 0, 0, 0, 0, 1, 1]];
*		
*	var nodes = [];
*	for (var i = 0; i < coords.length; i++) {
*		nodes.push(new Node(i, coords[i][0], coords[i][1]));
*	}
*	graph = new Graph(nodes, matrix);
* }
* ~~~
*/
pike.ai.path.Graph = function(nodes, connections){
	this.nodes_ = nodes;
	
	if (!connections) return;
	
	for (var i = 0; i < connections.length; i++) {
        for (var j = 0; j < connections[i].length; j++) {
            if (connections[i][j]) {            	
                nodes[i].addConnection(nodes[j], pike.ai.path.Graph.distance(nodes[i], nodes[j]));                              
            }
        }
    }
};

/**
 * Find path - A* 
 * @param {pike.ai.path.Node} startNode
 * @param {pike.ai.path.Node} endNode
 */
pike.ai.path.Graph.prototype.findPath = function(startNode, endNode){
		
	/*
	 * Every node has three properties
	 * 1) prev node
	 * 2) estimate cost to finish
	 * 3) route cost
	 */
	function updateNodeValues(node, prevNode, routeCost) {
		node.routeCost = routeCost;
		node.estimatedCost = routeCost + pike.ai.path.Graph.distance(node, endNode);
		node.prevNode = prevNode;			
	}
	
	var openList = [];
    var closedList = [];
    
    startNode.routeCost = 0;
    openList.push(startNode);
    var routeFound = false;
           
  while (openList.length > 0) {
	  	        
    	var currentNode = openList.sort(function(a, b){return a.estimatedCost - b.estimatedCost; })[0];
    	
    	if (currentNode == endNode) {    		
             routeFound = true;
             break;
        }
    	    	    	 	    	
    	currentNode.getConnections().forEach(function( connection ) {
    		    		    		      		  
    		var node = connection.node;
    		var newRouteCost = currentNode.routeCost + connection.weight;
    		
    		
    		    		    	
    		if (closedList.indexOf(node) > -1) {
                // The node is in closed list
                if (newRouteCost < node.routeCost) {
                	
                    // Remove from closed list
                    closedList.splice(closedList.indexOf(node), 1);

                    updateNodeValues(node, currentNode, newRouteCost);
                    openList.push(node);
                }
            } else if (openList.indexOf(node) > -1) {
                // The node is in open list
                if (newRouteCost < node.routeCost) {  
                	
                    updateNodeValues(node, currentNode, newRouteCost);
                }
            } else {
            	            	            
                // The node is not processed
                updateNodeValues(node, currentNode, newRouteCost);                                              
                openList.push(node);     
                
                
            }
    		    		    	    		    		    	  
    		if( openList.indexOf(currentNode) != -1 ){
    			// Remove from open list
    			openList.splice( openList.indexOf(currentNode), 1);
    		}
                       
            // Add to closed list
            closedList.push(currentNode);      
            
            
            
    	});    	    	    	  
    }
  
   var route = [];
   if (routeFound) {
       var routeNode = endNode;
       while (routeNode) {
           route.push(routeNode);
           routeNode= routeNode.prevNode;
       }
       route.reverse();
   }
   
   // Cleanup, so that old values don't mess around
   this.nodes_.forEach(function(node) {
       delete node.routeCost;
       delete node.estimatedCost;
       delete node.prevNode;
   });

   return route;          	    
};

/**
 * Serialize the graph
 * @return {Object} json
 */
pike.ai.path.Graph.serialize = function() {
    var data = {};
    data.nodes = [];
    this.nodes_.forEach(function(it) {
        data.nodes.push([it.x, it.y]);
    });
    return JSON.stringify(data);
};

/**
 * @param {pike.ai.path.Node} node1
 * @param {pike.ai.path.Node} node2
 * @returns {number}
 */
pike.ai.path.Graph.distance = function(node1, node2) {
    return Math.sqrt(
        (node1.x - node2.x)*(node1.x - node2.x) +
        (node1.y - node2.y)*(node1.y - node2.y));
};
//## Node #####################################
/**
* Create a new Node
* @param {*} id
* @param {number} x - position
* @param {number} y - position
* @constructor
*/
pike.ai.path.Node = function(id, x, y){
	this.id = id;
	this.x = x;
	this.y = y;
	this.connections_ = [];
};

/**
 * Add a connection
 * @param {pike.ai.path.Node} node
 * @param {number} weight
 */
pike.ai.path.Node.prototype.addConnection = function(node, weight) {
	this.connections_.push({ node: node, weight: weight });
};

/**
 * Get a connections of the Node
 * @returns {Array.<pike.ai.path.Node>}
 */
pike.ai.path.Node.prototype.getConnections = function() {
	return this.connections_;
};