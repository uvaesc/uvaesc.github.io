// jack morris 09/28/16


// GLOBAL VALS
var MAP = null,
    CURRENT_BUBBLES = [];

var DEFAULT_BUBBLE_RADIUS = 7.5;
var DEFAULT_ANIMATION_STEPS = 25;
var DEFAULT_ANIMATION_DELAY = 100;
var ANIMATION_STEP = 0;
var TIMEOUT_ID;
var lastSliderVal;


// REUSABLE DOM

var theSlider = $('#slider');

// initialize jquery slider

var loadSlider = function() {
  // create slider
  theSlider.slider({
    value: -8100,
    min: -8100,
    max: 2016
  });
  
  lastSliderVal = theSlider.slider("option","value");

  theSlider.on("slide", onSlide);
  onSlide();
}


// detect slider change

var onSlide = function(event, ui) {

  var val = theSlider.slider("option","value");
  
  // reset slider text
  var sliderText = '<b>' + Math.abs(val) + '</b> ' + ((val < 0) ? 'BC' : 'AD');
  $("#year")[0].innerHTML = sliderText;

  // increase marker number
  var x = 0;
  if(lastSliderVal < val) {
    var markersToAdd = [];
    for(var i = 0; i < MAP_DATA.length; i++) {
      var dataPoint = MAP_DATA[i];
      dataPoint.radius = DEFAULT_BUBBLE_RADIUS;
      var year = parseInt(dataPoint["year"]);
      // reset colors
      if(!dataPoint.age) {
        dataPoint.age = 0;
      }
      // manipulate arr
      if(year <= lastSliderVal) {
        // skip this one (already added)
        CURRENT_BUBBLES[x].age ++;
        CURRENT_BUBBLES[x].fillKey = (CURRENT_BUBBLES[x].age > DEFAULT_ANIMATION_STEPS / 5) ? 'default' : 'highlight'
        x ++ ;
        continue;
      }
      if(lastSliderVal < year && year <= val) {
        // add marker
        dataPoint.fillKey = 'highlight';
        dataPoint.age = 0;
        CURRENT_BUBBLES.push(dataPoint);
      }
      else {
        // past markers to add (since they are in year order)
        continue;
      }
    }
  }
  // decrease marker number
  else {
    var markersToAdd = [];
    for(var i = MAP_DATA.length - 1; i >= 0; i--) {
      var dataPoint = MAP_DATA[i];
      var year = parseInt(dataPoint["year"]);
      if(lastSliderVal < year) {
        // skip this one
        continue;
      }
      if(val < year && year <= lastSliderVal) {
        // remove marker
        CURRENT_BUBBLES.pop();
      }
      else {
        // past markers to remove (since they are in year order)
        break;
      }
    }
  }
  // reset bubbles
  MAP.bubbles(CURRENT_BUBBLES);
  // reset value
  lastSliderVal = val;
};


// button load functions

var loadButton = function() {
  var buttonClicked = function() {
     if($(this).is(':disabled')) { 
      // button already disabled
     } else {
      // run animation
      $(this).prop("disabled",true);
      theSlider.slider("disable");
      // get min
      var SLIDER_MIN = $("#slider").slider("option", "min");
      // get max
      var SLIDER_MAX = $("#slider").slider("option", "max");
      // set slider to bottom value
      theSlider.slider("value", SLIDER_MIN );
      // step
      var sliderStep = (SLIDER_MAX - SLIDER_MIN) * 1.0 / DEFAULT_ANIMATION_STEPS;
      TIMEOUT_ID = setInterval(function() { 
        // TAPER OFF
        sliderStep *= 0.965; ////decay
        // check value
        var sliderValue = theSlider.slider("option","value");
        // base case
        if(sliderValue == SLIDER_MAX) {
          // end timeout sequence & reset
          clearInterval(TIMEOUT_ID);
          ANIMATION_STEP = 0;
          // enable DOM elements
          $('#button').prop("disabled",false);
          theSlider.slider("enable");
        } else {
          // move slider
          ANIMATION_STEP ++;
          // get value
          // set new value
          var newSliderValue = sliderValue + sliderStep;
          theSlider.slider("value", newSliderValue);
          // call slider func
          onSlide();
        }
      }, DEFAULT_ANIMATION_DELAY);
     }
  }
  $('#animate-button').click(buttonClicked);
}

// mark map

var createMap = function() {
  // MAP = new Datamap($('#map-container'));
  var mapContainer = $('#map-container')[0];
  MAP = new Datamap({
    element: mapContainer,
    projection: 'mercator',
    geographyConfig: {
        hideAntarctica: true,
        borderWidth: 0.25,
        borderOpacity: 0,
        borderColor: '#FDFDFD',
        popupTemplate: function(geography, data) { //this function should just return a string
          return '<div class="hoverinfo"><strong>' + geography.properties.name + '</strong></div>';
        },
        popupOnHover: true, //disable the popup while hovering
        highlightOnHover: true,
        highlightFillColor: '#FC8D59',
        highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
        highlightBorderWidth: 2,
        highlightBorderOpacity: 1
    },
    fills: {
        'default': '#F00',
        'highlight': '#00F'
    },
  });
};

var load = function() {
  createMap();
  loadSlider();
  loadButton();
};

$(load);