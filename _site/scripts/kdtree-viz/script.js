// JACK MORRIS 07/17/16
console.log('LOADED SCRIPT.JS');

var CIRCLE_RAD   = 4;
var CIRCLE_SCALE = 1;

var DEFAULT_OPACITY = 0.85;
var OPACITY_SCALE   = 0.75;

var NODE_DENSITY  = 1/8000.;
var NODE_SPEED    = 1.5;
var NODE_DELAY    = 50;
var NUM_NEIGHBORS = 5;
var MAX_DEPTH     = 2;

var WINDOW_RESIZING = false;


var MIN_MOUSE_DIST = 50;
var oldMouseX = -MIN_MOUSE_DIST, oldMouseY = -MIN_MOUSE_DIST;

var w, h;

var totalNodesAdded = 0;

var tree , nodes ;

var distance = function(a, b){
  return Math.pow(a.x-b.x, 2) + Math.pow(a.y-b.y, 2);
} ;

var main = function () {
  w = $('#node-svg') . width() ;
  h = $('#node-svg') . height();

  // create nodes
  var NUM_NODES = parseInt( Math.round( w * h * NODE_DENSITY  ) );
  nodes = [] ;
  for(var i = 0; i < NUM_NODES; i++) {
    var node = {};
    node["x"] = parseInt( Math.random() * w ) ;
    node["y"] = parseInt( Math.random() * h ) ;
    node["z"] = Math.random() * 2 * Math.PI // z angle
    node["tag"] = totalNodesAdded ;
    totalNodesAdded ++;
    nodes.push(node);
  }
  // create ktree
  tree = new kdTree(nodes, distance, [ "x", "y" ] );
  // add nodes to DOM
  d3.select('#node-svg')
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr('class','hidden') // hide all on default
    .attr('cx',  function(d) { return d.x; })
    .attr('cy',  function(d) { return d.y; })
    .attr('tag', function(d) { return d.tag; })
    .attr('r', CIRCLE_RAD);
  // set hover method
  $('#node-svg').mousemove( onMouseMove );
  // set hide method
  $('#node-svg').mouseleave( onMouseLeave );
  // set resize method
  $(window).resize( onResize );
  // set timer
  window.setInterval(onTick, NODE_DELAY);
};

var onTick = function() {
  // sort nodes, we must
  nodes.sort(function(a,b) { return a.tag - b.tag; });
  // iterate through nodes
  var nodeElements = $('#node-svg > circle[class=shown]');
  // debugger;
  nodeElements.each(function(index) {
    var nodeElement = $(nodeElements[index]);
    var node = nodes[nodeElement.attr('tag')];
    // update in tree
    tree.remove(node);
    node.x += Math.cos(node.z) * NODE_SPEED;
    node.y += Math.sin(node.z) * NODE_SPEED;
    // check boundaries
    if(node.x > w || node.y > h || node.x < 0 || node.y < 0) {
      node.z = (node.z + Math.PI) % (Math.PI * 2.0);
    }
    tree.insert(node);
    // update circle
    $(nodeElement)
      .attr('cx', node.x)
      .attr('cy', node.y);
    // update line 1
    $('line[tag1=' + node.tag + ']')
      .attr('x1', node.x)
      .attr('y1', node.y);
    // update line 2
    $('line[tag2=' + node.tag + ']')
      .attr('x2', node.x)
      .attr('y2', node.y);
  });
};

var onResize = function(event) {
  if(WINDOW_RESIZING) return;
  WINDOW_RESIZING = true;
  //
  var oldWidth  = w;
  var oldHeight = h;
  //
  var newWidth  = $('#node-svg').width();
  var newHeight = $('#node-svg').height();
  //
  var oldNodesLength = nodes.length;
  var nodesRemoved = [];
  //
  if(newWidth < oldWidth) {
    // width decreased
    var nodesToRemove = nodes.filter(function(a) { return a.x >= newWidth; })
    nodesToRemove.forEach(function(node) {
      tree.remove( node );
      nodesRemoved.push(node);
    });
    nodes = nodes.filter(function(a) { return a.x < newWidth; })
  }
  //
  else if(newWidth > oldWidth) {
    // width increased
    var horizontalAreaAdded = (newWidth - oldWidth) * oldHeight;
    // create nodes
    var NUM_NODES = parseInt( Math.round( horizontalAreaAdded * NODE_DENSITY  ) );
    for(var i = 0; i < NUM_NODES; i++) {
      var node = {};
      node["x"] = parseInt( Math.random() * (newWidth - oldWidth) ) + oldWidth ;
      node["y"] = parseInt( Math.random() * oldHeight ) ;
      node["z"] = Math.random() * 2 * Math.PI;
      node["tag"] = totalNodesAdded;
      totalNodesAdded ++;
      nodes.push(node);
      tree.insert(node);
    }
  }
  //
  if(newHeight < oldHeight) {
    // height decreased
    var nodesToRemove = nodes.filter(function(a) { return a.y >= newHeight; })
    nodesToRemove.forEach(function(node) {
      tree.remove( node );
      nodesRemoved . push(node);
    });
    nodes = nodes.filter(function(a) { return a.y < newHeight; })
  }
  //
  else if(newHeight > oldHeight) {
    // height increased
    var verticalAreaAdded = (newWidth - oldWidth) * oldHeight;
    // create nodes
    var NUM_NODES = parseInt( Math.round( horizontalAreaAdded * NODE_DENSITY  ) );
    for(var i = 0; i < NUM_NODES; i++) {
      var node = {};
      node["x"] = parseInt( Math.random() * oldWidth) ;
      node["y"] = parseInt( Math.random() * (newHeight - oldHeight) ) + oldHeight ;
      node["z"] = Math.random() * 2 * Math.PI;
      node["tag"] = totalNodesAdded;
      totalNodesAdded ++;
      nodes.push(node);
      tree.insert(node);
    }
  }
  // height increased
  var cornerAreaAdded = (newWidth - oldWidth) * (newHeight - oldHeight);
  // create nodes
  var NUM_NODES = parseInt( Math.round( cornerAreaAdded * NODE_DENSITY  ) );
  for(var i = 0; i < NUM_NODES; i++) {
    var node = {};
    node["x"] = parseInt( Math.random() * (newWidth -  oldWidth ) ) + oldWidth ;
    node["y"] = parseInt( Math.random() * (newHeight - oldHeight) ) + oldHeight;
    node["z"] = Math.random() * 2 * Math.PI;
    node["tag"] = totalNodesAdded;
    totalNodesAdded ++;
    nodes.push(node);
    tree.insert(node);
  }
  if(oldNodesLength < nodes.length) {
    // add to DOM
    var nodesAdded = nodes.splice(oldNodesLength);
    d3.select('#node-svg')
      .selectAll("none")
      .data(nodesAdded)
      .enter()
      .append("circle")
      .attr('class','hidden') // hide all on default
      .attr('cx',  function(d) { return d.x; })
      .attr('cy',  function(d) { return d.y; })
      .attr('tag', function(d) { return d.tag; })
      .attr('r', CIRCLE_RAD);
  } else {
    // remove from DOM
    for(var i = 0; i < nodesRemoved; i++) {
      var node = nodesRemoved[i];
      d3.select('circle[x=' + node.x + '][y=' + node.y + ']').remove();
    }
  }
  // reset width & height
  w = newWidth;
  h = newHeight;
  // reset bool
  WINDOW_RESIZING = false;
};

var onMouseLeave = function(event) {
  // hide all
  $('#node-svg > *').attr('class', 'hidden');
}

var onMouseMove = function (event) {
  // get mouse coords
  var elementOffset = $(this).parent().offset();
  var mousePoint = { "x": event.pageX - elementOffset.left, "y": event.pageY - elementOffset.top };
  // check if mouse moved enough
  var mouseDistanceTraveled = distance({ x: oldMouseX, y: oldMouseY }, {x: mousePoint.x, y: mousePoint.y });
  if(mouseDistanceTraveled < MIN_MOUSE_DIST) return;
  // reset vars
  oldMouseX = mousePoint.x;
  oldMouseY = mousePoint.y;
  // remove tooltip
  $('#mouse-over-me').fadeTo(250, 0.0);
  // reset all circle attrs
  d3.select('#node-svg').selectAll('circle')
    .attr('visited', false)
    .attr('class','hidden')
    .attr('opacity', DEFAULT_OPACITY)
    .attr('r', CIRCLE_RAD);
  // remove all previous lines
  d3.select('#node-svg').selectAll('line').remove();
  // recur node color
  tagNodesAtPointAndDepth( mousePoint, 0 );
}

var tagNodesAtPointAndDepth = function(point, depth) {
  // base case
  if( depth > MAX_DEPTH ) return;
  // find closest point
  var closestNode = tree.nearest( point, 1 )[0][0];
  // enlarge closest point
  var closestCircle = $('circle[tag=' + closestNode.tag + ']');
  closestCircle
    .attr('visited',true)
    .attr('class', 'shown')
    .attr('opacity', closestCircle.attr('opacity') * OPACITY_SCALE)
    .attr('r', CIRCLE_RAD * CIRCLE_SCALE );
  // find nbrs
  NUM_NEIGHBORS = Math.min( nodes.length - 1, NUM_NEIGHBORS );
  var closestNeighbors = tree.nearest( point, NUM_NEIGHBORS + 1 ).splice(0, NUM_NEIGHBORS);
  var closestNeighborNodes = closestNeighbors.map(function(x) { return x[0]; } );
  // draw lines
  d3.select('#node-svg')
    .selectAll("none") // any empty selector works here - what is a common pattern for this?
    .data(closestNeighborNodes)
    .enter()
    .append("line")
    .attr('opacity', closestCircle.attr('opacity') * OPACITY_SCALE )
    .attr('x1', function(d) { return d.x; })
    .attr('y1', function(d) { return d.y; })
    .attr('tag1', function(d) { return d.tag; })
    .attr('x2', function(d) { return closestNode.x; })
    .attr('y2', function(d) { return closestNode.y; })
    .attr('tag2', function(d) { return closestNode.tag; });
  // enlarge neighbors
  closestNeighborNodes.forEach(function(closestNeighborNode) {
    // TAG
    $('circle[tag=' + closestNeighborNode.tag + '][visited=false]')
      .attr('class','shown')
      .attr('opacity', closestCircle.attr('opacity') * OPACITY_SCALE )
      .attr('r', CIRCLE_RAD );
    // recur
    var closestNeighborPoint = {"x": closestNeighborNode.x, "y": closestNeighborNode.y };
    tagNodesAtPointAndDepth(closestNeighborPoint, depth + 1);
  });
};

$(document).ready(main);
