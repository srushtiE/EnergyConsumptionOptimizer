// Function to motor direction
$(document).ready(function() {

  // Timeout
  $.ajaxSetup({
    timeout: 1500 //Time in milliseconds
  });
  var powervalue = 0;
  var timevar = 0;
  var values = [];
  var v = 0;

  // Function to control the lamp
  $("#1").click(function() {
    $.getq('queue', 'smart_lamp/digital/8/0');
  });

  $("#2").click(function() {
    $.getq('queue', 'smart_lamp/digital/8/1');
  });

  // Update power
  function refreshPower() {
    $.getq('queue', 'smart_lamp/power', function(json_data) {
    

      $("#powerDisplay").html("Power: " + json_data.power + " W");    
		  powervalue = json_data.power;
      timevar = timevar + 5;
       console.log(powervalue); 
       console.log(timevar); 
       values[v] = powervalue;
       v=v+1;

      if(timevar > 10){
        creategraph1();
      }
      // Update status
/*      if (json_data.connected == 1){
        $("#status").html("Device Online");
        $("#status").css("color","green");    
      }
      else {
        $("#status").html("Device Offline");
        $("#status").css("color","red");     
      }*/

    });
  }
  
  function creategraph1() {
      google.load('visualization', '1', {'packages':['corechart'], callback:drawVisualisation});
      console.log("Inside creategraph1");
  }
  function drawVisualisation(){
      var data = new google.visualization.DataTable();
      data.addColumn('number', 'Time');
      data.addColumn('number', 'Power in Watts');
      data.addRow([timevar,powervalue]);
      for(i=0; i < values.length; i++){
        timevari = i*10;
        data.addRow([timevari,values[i]]);
      }
      console.log("inside draw visualization");
      var options = {
            title: 'Power Consumption'
        };
      var chart = new google.visualization.LineChart($('#chart_div')[0]);
      chart.draw(data, options);
  }

  refreshPower();
  setInterval(refreshPower, 10000);
  //setInterval(creategraph, 5000);

});