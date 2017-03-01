// Jack Morris
// 10/20/16

console.log('loaded clock.js');

//
// GLOBAL TIME VARIABLES
//
var BASE               = 0,
    // CURRENT UNIT LENGTHS
    HOURS_PER_DAY      = 0,
    MINUTES_PER_HOUR   = 0,
    SECONDS_PER_MINUTE = 0,
    // CURRENT TIME
    CURRENT_HOURS      = 0,
    CURRENT_MINUTES    = 0,
    CURRENT_SECONDS    = 0;

//
// CONSTANTS
//
var DEFAULT_TOTAL_SECONDS = 86400 ; /* Number of seconds in a day */
var MS_PER_SECOND = 1000;

var getClockStep = function() {
  //
  // IN MS
  // FOR DEFAULTS, SHOULD RETURN 1000
  //
  var currentMS = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;
  return currentMS / DEFAULT_TOTAL_SECONDS;
}


var reset = function() {
  //
  // RESET BASE
  // 
  BASE = 10;
  //
  // RESET DEFAULT TOTALS
  // 
  HOURS_PER_DAY = 24;
  MINUTES_PER_HOUR = 60;
  SECONDS_PER_MINUTE = 60;
  //
  // GET DATE
  //
  var date = new Date();
  //
  // RESET CURRENT DATE
  //
  CURRENT_HOURS   = date.getHours();
  CURRENT_MINUTES = date.getMinutes();
  CURRENT_SECONDS = date.getSeconds();
}

var setClockFace = function() {
  $('#second').text( CURRENT_SECONDS );
  $('#minute').text( CURRENT_MINUTES );
  $('#hour')  .text( CURRENT_HOURS   );
}

var onClockStep = function() { 
  console.log('step');
  // INCREMENT
  CURRENT_SECONDS++;
  if(CURRENT_SECONDS == SECONDS_PER_MINUTE) {
    CURRENT_SECONDS = 0;
    CURRENT_MINUTES ++;
    if(CURRENT_MINUTES == MINUTES_PER_HOUR) {
      CURRENT_MINUTES = 0;
      CURRENT_HOURS ++;
      if(CURRENT_HOURS == HOURS_PER_DAY) {
        CURRENT_HOURS = 0;
        // No date control -- just roll over
      }
    }  
  }
  // SET STUFF
  setClockFace();
  // SET NEXT STEP
  setTimeout(onClockStep, getClockStep());
}


var onload = function() {
  reset();
  setClockFace();
  setTimeout(onClockStep, getClockStep());
}