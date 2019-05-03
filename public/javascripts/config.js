/*
    var dojoConfig = {
      isDebug:true,
      paths: {
        js: location.href.replace(/\/[^/]+$/, "") + "/js",
        ditagis: location.origin+ "/javascripts/ditagis",    
      },
      map: {
        '*': {
          'css': location.origin + '/javascripts/lib/css.min', // or whatever the path to require-css is
        }
      }
    };
*/    
    var dojoConfig = {
      isDebug:true,
      paths: {
        js: location.href.replace(/\/[^/]+$/, "") + "/js",
        ditagis: location.origin+ "/javascripts/ditagis",

      },
      map: {
        '*': {
          'css': location.origin + '/javascripts/lib/css.min', // or whatever the path to require-css is
        }
      },
      //---------------------------------------
      packages: [{
        name: "bootstrap",
        
        location: "/calcite-maps/dist/vendor/dojo-bootstrap"
      },
      {
        name: "calcite-maps",
        location: "/calcite-maps/dist/js/dojo"
      }]

    };


    /*
       var dojoConfig = {
      packages: [{
        name: "bootstrap",
        
        location: "https://esri.github.io/calcite-maps/dist/vendor/dojo-bootstrap"
      },
      {
        name: "calcite-maps",
        location: "https://esri.github.io/calcite-maps/dist/js/dojo"
      }]
    };
    */