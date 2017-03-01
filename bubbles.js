var svg = d3.select("#stage");

// animation 
var eases = ["sine", "quad", "cubic", "bounce","back"];

var curEase = eases[3];
var curScale = 1;

// dummy data
var centerX = $(window).width() / 2;
var centerY = $(window).height() / 2;

var mainTitle = "blubeta".toUpperCase().split(' ')

var titleA = "Antonio".toUpperCase().split(' ');
var titleB = "Jerry".toUpperCase().split(' ');
var titleC = "Maddie".toUpperCase().split(' ');
var titleD = "Lorena".toUpperCase().split(' '); 
var titleE = "Isaac".toUpperCase().split(' '); 

var titles = [titleA,titleB,titleC,titleD,titleE];

var bubble = {id: 0, 
              title: "", 
              frequency: 0, 
              trend: 0, 
              x: 0, 
              y: 200,
              radius: 20}; 

var mainBubble = _.clone(bubble);
mainBubble.title = mainTitle;
mainBubble.frequency = 600;
mainBubble.trend = 0;
mainBubble.x = 50; 


////////////////////////////// MAKE DATA  

var getData = function( freqNum ){
  
  mainBubble.frequency = freqNum;
  var bubbleData = [mainBubble];
  
  freqNum = typeof freqNum === "undefined" ? 500 : freqNum; 

   var totalBubbles = Math.floor( Math.random() * 5 ) + 1; 
  
  _.times(totalBubbles, function(index){

    var subBubble = _.clone(bubble);
    subBubble.title = titles[index];
    subBubble.frequency = Math.floor(Math.random() * freqNum + 200);
    subBubble.trend = Math.floor(Math.random() * 7) + 1; 
    subBubble.x = 120 * (index + 1 ); 
    subBubble.id = index + 1; 
   
    bubbleData.push(subBubble);

  });
  
  return bubbleData; 
}

var bubbleData = getData(250); 



var transition = function(){
  
  console.log("transition");
  
  var freqNum = Math.floor(Math.random() * 600);
  var bubbleData = getData(freqNum); 
  
  console.log("data: ", bubbleData);
  
  draw(bubbleData);
  animate();

  
}; 


$("#transition").on("click", function(){
  transition();                    
});
                  
////////////////////////////// UTILITIES 

var getRadius = function( d ){
  
  var radius = Math.floor( d.frequency / 4 );
  
  if ( radius <= 20) radius = 20;
  return d.radius = radius;
}

var getColor = function( trend ){
  var colors = ["#3f9ce8","#BBDEFB", "#D1C4E9", "#C5CAE9", "#B2EBF2", "#B3E5FC", "#d8eacc", "#FFDDEC"]; 
  return colors[trend]; 
}

var getEase = function(){
  var index = Math.floor( Math.random() * eases.length);
  return eases[index];
}
                               
var getTextStyle = function (d, textColor) {
  var that = this;
  var magicNum = 1.7; // trial and error - there's a probably a proper algorithm for this but I obviously don't know it but this works
  var textColor = (undefined !== textColor) ? textColor : "#000";

  //var bubbleRadius = (null !== selRadius ) ? ( selRadius + 20 ) : d.radius; 
  var longestStrNum = _.max( d.title, function(name){ return name.length; }).length; 

  // if its 5 or less letters... just use 5 so small words like CAT don't look oddly large
  var longestSizeNum = ( longestStrNum <= 5 ) ? 5 : longestStrNum;
  var fontSize = Math.round ( d.radius / ( longestSizeNum / magicNum ) );
  
  var styleStr = "font-family: Helvetica, sans-serif; font-weight:bold; font-size: " + fontSize + "px; fill: " + textColor;
  
  return styleStr; 
};


 var getFontSize = function( textArray ) {
   var textSizeArray = [];
   for (var i = 0; i < textArray.length; i++) {
     textSizeArray.push( textArray[i].length );
   }

   return Math.max.apply(Math, textSizeArray); 

}
 
 var getDestinationVector = function( originVector, angle, distance) {
    var destinationVector = {x: 0, y: 0};

    destinationVector.x = Math.round(Math.cos(angle * Math.PI / 180) * distance + originVector.x);
    destinationVector.y = Math.round(Math.sin(angle * Math.PI / 180) * distance + originVector.y);

    return destinationVector;
}

var getSubBubblePoint = function(d,index){
 
  var angles = [-45, -120, -235, -320, -900];
  
  var mainBubbleRadius = bubbleData[0].radius;
  var centerPoint = {x: centerX, y: centerY};
  
  // bug: why doesn't it have a radius sometimes?!
  var targetRadius = d.radius;
  
  var distance = mainBubbleRadius + targetRadius;
  var angle = angles[index-1]; 
  
  var targetPoint = getDestinationVector(centerPoint, angle, distance);

  return targetPoint;
}
 
var getTranslation = function(d,index){

   // move 0 to the center;
   var bubbleGroupX;
   var bubbleGroupY;
   
   switch( d.trend) {
       
     case 0 :
       bubbleGroupX = centerX;
       bubbleGroupY = centerY;
       break;
    default :
       var subBubblePoint = getSubBubblePoint(d, index);
       bubbleGroupX = subBubblePoint.x;
       bubbleGroupY = subBubblePoint.y;
       break;   
       
       
   }
  
  console.log(arguments);
  console.log("bubbleGroupX: " + bubbleGroupX);
  console.log("bubbleGroupY: " + bubbleGroupY);
  
   return "translate(" + bubbleGroupX + "," + bubbleGroupY + ") scale(1)";
   
 }

////////////////////////////// DRAW
      
var draw = function( bubbles ){
  
  var bubbles = svg.selectAll("g")
                .data(bubbles, function(d){ return d.id });
  

  
  // ENTER
  // only create the elements
  
  var bubbleGroupsEnter = bubbles.enter()
                      .append("g")
                          .attr("transform", function(d){return "translate("+d.x+","+d.y+")"})
                          .attr("class", "bubble");
  
  
  bubbleGroupsEnter.append("circle");
  bubbleGroupsEnter.append("text");
  
 
  // UPDATE 
  
  // update group
  var bubbleGroupsUpdate = bubbles; 
  
  bubbleGroupsUpdate
      .transition()
          .duration(500)
          .attr("transform", function(d){return "translate("+d.x+","+d.y+")"});
  
  // update circle 
  bubbleGroupsUpdate 
    .select("circle")
        .attr("fill", function(d){return getColor(d.trend)})
        .transition()
          .attr("r", function(d){return getRadius(d)} )
          .duration(1000);
  
  // add text to bubbleGroup  
  bubbleGroupsUpdate
      .each(function (d, i) {
          var container = d3.select(this);
          var dy0 = -(d.title.length - 1) / 2;
          var magicNum = 1.75; 
    
          container
               .selectAll("text").remove();

          for (var i = 0; i < d.title.length; i++)
          {
            container
              .append('svg:text')
              .attr('pointer-events', 'none')
              .attr("text-anchor", "middle")

              .attr("dy", (dy0 + i) + "em")
              .attr("class", "circleText")
              .attr("style", function(d) { return getTextStyle(d, null); }) 
              .text(function(d) { return d.title[i]; })
            ;
          }
      });
  
  var bubblesExit = bubbles.exit();
  
  bubblesExit
    .transition()
      .duration(500)
        .attr("transform", "scale(0)")
        .remove();
   
}

var animate = function(){
  
  var positionCallback = function(){
  
  }

  d3.selectAll(".bubble")
        .transition()
        .duration(2000)
        .attr("transform", function(d, index){ return getTranslation(d, index)} ) 
        .ease(curEase)
        .each("end", positionCallback);  
 
}

draw(bubbleData); 
animate();

