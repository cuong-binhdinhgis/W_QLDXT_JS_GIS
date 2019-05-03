
require([
 
   
  "esri/request",
 
  "esri/views/MapView",

  "ditagis/classes/SystemStatusObject",


 

  "dojo/domReady!"
], function (
  esriRequest,
   MapView, 
   SystemStatusObject ) {
      esriRequest('/session', {
          method: 'post'
      }).then(function (resultRequest) {
          //var map = new Map();
       
          
          var view = new MapView({
             
          });
          
          view.systemVariable = new SystemStatusObject();
          view.systemVariable.user = resultRequest.data;
         

         
          for (let layerCfg of view.systemVariable.user.Layers) {

              alert(layerCfg.url);       
                     
          }
          
           
      });

     
  });
  //console.log("hehehehe"+layerCfg);
