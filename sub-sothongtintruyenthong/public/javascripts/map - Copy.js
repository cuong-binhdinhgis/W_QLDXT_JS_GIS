
var app;

require([    
  "esri/Map",
  "esri/views/MapView",

  "esri/request",
  "ditagis/classes/SystemStatusObject",
  "esri/widgets/Legend",
 

  "esri/geometry/Point",
  "esri/layers/FeatureLayer",
  "esri/PopupTemplate",
  "esri/symbols/TextSymbol",
  "esri/widgets/Search",
  "esri/widgets/Home",
  "esri/widgets/Print",
  //"esri/widgets/BasemapGallery",
  "esri/layers/MapImageLayer",
  "esri/layers/WebTileLayer",
  "esri/layers/OpenStreetMapLayer",
  "esri/core/watchUtils",
  "ditagis/widgets/Measure",
  "ditagis/widgets/MeasureArea",

  "dojo/query",
  "dojo/dom",
  "dojo/on",

  // Calcite Maps
  "calcite-maps/calcitemaps-v0.7",

  // Calcite Maps ArcGIS Support
  "calcite-maps/calcitemaps-arcgis-support-v0.7",

  // Bootstrap
  "bootstrap/Collapse",
  "bootstrap/Dropdown",
  "bootstrap/Tab",

  "dojo/domReady!"
], function(Map, MapView, esriRequest, SystemStatusObject, Legend, Point, FeatureLayer, PopupTemplate, TextSymbol, Search, Home, Print, MapImageLayer, WebTileLayer, OpenStreetMap, watchUtils,
  Measure, MeasureArea, query, dom, on, CalciteMaps, CalciteMapsArcGIS) { 
    
    esriRequest('/session',{
      method:'post'
    }).then(function(resultRequest) { 
      

  /******************************************************************
   *
   * App settings
   *
   ******************************************************************/




  app = {
    //center: [109.172564,13.767122],
    center: [109.183579,13.767575],
    
    scale: 50000,
    //basemap: "hybrid",
    viewPadding: {
      top: 50,
      bottom: 0
    },
   // uiComponents: ["zoom", "compass", "attribution"],
    uiComponents: ["zoom", "attribution"],
    mapView: null,

    containerMap: "mapViewDiv"

    

  };

  /******************************************************************
   *
   * Create the map and scene view and ui components
   *
   ******************************************************************/

  // Map
  var map = new Map({
    //basemap: app.basemap
  });

   // 2D view
   app.mapView = new MapView({
    container: app.containerMap,
    map: map,
    center: app.center,
    scale: app.scale,
    padding: app.viewPadding,
   
  });

  setActiveView(app.mapView);
  // Set the active view to scene

  app.activeView.systemVariable=new SystemStatusObject();
  app.activeView.systemVariable.user = resultRequest.data;

  let userurl;

       
  for (let layerCfg of app.activeView.systemVariable.user.Layers) {
    if(layerCfg.id=="TramBTS" && layerCfg.permission.view==1){     
        //alert(layerCfg.url);
        userurl=layerCfg.url;
      }        
    }
    //alert(userurl);



   let worldimagery = new WebTileLayer({
            id: 'worldimagery',
            urlTemplate: 'https://mt1.google.com/vt/lyrs=y&x={col}&y={row}&z={level}',
            //title: 'Ảnh vệ tinh dfdfh',
            visible: true
        });
        map.add(worldimagery);


  var osm = new OpenStreetMap({
            //title: 'OpenStreetMap',
            id: "osm",
            visible: false
        });
        map.add(osm);

  


    var basemap_worldimagery = dom.byId("basemapWorldimagery");
    on(basemap_worldimagery, "click", function() {
      worldimagery.visible = true;
      osm.visible=false;
    });

     var basemap_openStreetMap = dom.byId("basemapOpenStreetMap");
    on(basemap_openStreetMap, "click", function() {
      worldimagery.visible = false;
      osm.visible=true;
    });


    

 
  


 
/*
  app.activeView.systemVariable=new SystemStatusObject();
  app.activeView.systemVariable.user = resultRequest.data;

       
         for (let layerCfg of app.activeView.systemVariable.user.Layers) {

            alert(layerCfg.url);       
                   
         }
  */

  // Create the search widget and add it to the navbar instead of view
  app.searchWidget = new Search({
    view: app.activeView
  }, "searchWidgetDiv");

  CalciteMapsArcGIS.setSearchExpandEvents(app.searchWidget);

  // Create basemap widget
  /*
  app.basemapWidget = new Basemaps({
    view: app.activeView,
    container: "basemapPanelDiv"
  });
  */


  // Create Home widget
  var homeBtn = new Home({
    view:app.activeView
  });
  // Add the home button to the top left corner of the view
  app.activeView.ui.add(homeBtn, "top-left");

  

  
  /******************************************************************
   *
   * Synchronize the view, search and popup
   *
   ******************************************************************/

  // Views
  function setActiveView(view) {
    app.activeView = view;

  }


  //BaseMap nen Binh Dinh===========================================================
   var nenBinhdinh = new MapImageLayer({
      url: "http://117.3.71.234/arcgisadaptor/rest/services/BinhDinh/DuLieuNen/MapServer",
      sublayers:[
        {
          id: 7, //Hành chính huyện              
          visible: false
        },
        {
          id: 5, //Ranh giới hành chính huyện
          visible: false
        },
        {
          id: 4, //Hành chính xã
          visible: false
        },
        {
          id: 3, //Giao thông huyện
          visible: false
        },
        {
          id: 2, //Mặt đường bộ
          visible: false
        },
        {
          id: 1, //Tim đường
          visible: false
        },
        {
          id: 0, //Đại vật đặc trưng
          visible: false
        }
      ]
    });
    map.add(nenBinhdinh);

   
   function checkbox_nenBinhdinh_Change(){
     var nenBinhdinh_event = dom.byId("checkbox_nenBinhdinh");
    on(nenBinhdinh_event, "change", function() {
     
      //nenBinhdinh.findSublayerById(0).visible=checkbox_nenBinhdinh.checked;
      if(dom.byId("checkbox_nenBinhdinh").checked==true){
        if(dom.byId("chk_nenDaivatdactrung").checked==true){
          nenBinhdinh.findSublayerById(0).visible=chk_nenDaivatdactrung.checked;
        }
        if(dom.byId("chk_nenTimduong").checked==true){
          nenBinhdinh.findSublayerById(1).visible=chk_nenTimduong.checked;
        }
        if(dom.byId("chk_nenMatduongbo").checked==true){
          nenBinhdinh.findSublayerById(2).visible=chk_nenMatduongbo.checked;
        }
        if(dom.byId("chk_nenGiaothonghuyen").checked==true){
          nenBinhdinh.findSublayerById(3).visible=chk_nenGiaothonghuyen.checked;
        }
        if(dom.byId("chk_nenHanhchinhxa").checked==true){
          nenBinhdinh.findSublayerById(4).visible=chk_nenHanhchinhxa.checked;
        }
        if(dom.byId("chk_nenRanhgioihanhchinhhuyen").checked==true){
          nenBinhdinh.findSublayerById(5).visible=chk_nenRanhgioihanhchinhhuyen.checked;
        }
        if(dom.byId("chk_nenHanhchinhhuyen").checked==true){
          nenBinhdinh.findSublayerById(7).visible=chk_nenHanhchinhhuyen.checked;
        }

        nenBinhdinh_Visible();
      }else{
        nenBinhdinh.findSublayerById(0).visible=false;
        nenBinhdinh.findSublayerById(1).visible=false;
        nenBinhdinh.findSublayerById(2).visible=false;
        nenBinhdinh.findSublayerById(3).visible=false;
        nenBinhdinh.findSublayerById(4).visible=false;
        nenBinhdinh.findSublayerById(5).visible=false;
        nenBinhdinh.findSublayerById(7).visible=false;

        dom.byId("chk_nenDaivatdactrung").disabled=true;
        dom.byId("chk_nenTimduong").disabled=true;
        dom.byId("chk_nenMatduongbo").disabled=true;
        dom.byId("chk_nenGiaothonghuyen").disabled=true;
        dom.byId("chk_nenHanhchinhxa").disabled=true;
        dom.byId("chk_nenRanhgioihanhchinhhuyen").disabled=true;
        dom.byId("chk_nenHanhchinhhuyen").disabled=true;
      }
    });
   }
   checkbox_nenBinhdinh_Change();

    

    // conClick Hinh anh Nen Dinh Dinh
    var nenBinhdinh_img = dom.byId("img_nenBinhdinh");
    on(nenBinhdinh_img, "click", function() {
     
      //nenBinhdinh.findSublayerById(0).visible=checkbox_nenBinhdinh.checked;
      if(dom.byId("checkbox_nenBinhdinh").checked==false){
        if(dom.byId("chk_nenDaivatdactrung").checked==true){
          nenBinhdinh.findSublayerById(0).visible=chk_nenDaivatdactrung.checked;
        }
        if(dom.byId("chk_nenTimduong").checked==true){
          nenBinhdinh.findSublayerById(1).visible=chk_nenTimduong.checked;
        }
        if(dom.byId("chk_nenMatduongbo").checked==true){
          nenBinhdinh.findSublayerById(2).visible=chk_nenMatduongbo.checked;
        }
        if(dom.byId("chk_nenGiaothonghuyen").checked==true){
          nenBinhdinh.findSublayerById(3).visible=chk_nenGiaothonghuyen.checked;
        }
        if(dom.byId("chk_nenHanhchinhxa").checked==true){
          nenBinhdinh.findSublayerById(4).visible=chk_nenHanhchinhxa.checked;
        }
        if(dom.byId("chk_nenRanhgioihanhchinhhuyen").checked==true){
          nenBinhdinh.findSublayerById(5).visible=chk_nenRanhgioihanhchinhhuyen.checked;
        }
        if(dom.byId("chk_nenHanhchinhhuyen").checked==true){
          nenBinhdinh.findSublayerById(7).visible=chk_nenHanhchinhhuyen.checked;
        }

        dom.byId("checkbox_nenBinhdinh").checked=true;

        nenBinhdinh_Visible();
      }else{
        nenBinhdinh.findSublayerById(0).visible=false;
        nenBinhdinh.findSublayerById(1).visible=false;
        nenBinhdinh.findSublayerById(2).visible=false;
        nenBinhdinh.findSublayerById(3).visible=false;
        nenBinhdinh.findSublayerById(4).visible=false;
        nenBinhdinh.findSublayerById(5).visible=false;
        nenBinhdinh.findSublayerById(7).visible=false;

        dom.byId("chk_nenDaivatdactrung").disabled=true;
        dom.byId("chk_nenTimduong").disabled=true;
        dom.byId("chk_nenMatduongbo").disabled=true;
        dom.byId("chk_nenGiaothonghuyen").disabled=true;
        dom.byId("chk_nenHanhchinhxa").disabled=true;
        dom.byId("chk_nenRanhgioihanhchinhhuyen").disabled=true;
        dom.byId("chk_nenHanhchinhhuyen").disabled=true;

        dom.byId("checkbox_nenBinhdinh").checked=false;
      }
    });

    //onClick text Nen Binh Dinh
    var nenBinhdinh_div = dom.byId("div_nenBinhdinh");
    on(nenBinhdinh_div, "click", function() {
     
      //nenBinhdinh.findSublayerById(0).visible=checkbox_nenBinhdinh.checked;
      if(dom.byId("checkbox_nenBinhdinh").checked==false){
        if(dom.byId("chk_nenDaivatdactrung").checked==true){
          nenBinhdinh.findSublayerById(0).visible=chk_nenDaivatdactrung.checked;
        }
        if(dom.byId("chk_nenTimduong").checked==true){
          nenBinhdinh.findSublayerById(1).visible=chk_nenTimduong.checked;
        }
        if(dom.byId("chk_nenMatduongbo").checked==true){
          nenBinhdinh.findSublayerById(2).visible=chk_nenMatduongbo.checked;
        }
        if(dom.byId("chk_nenGiaothonghuyen").checked==true){
          nenBinhdinh.findSublayerById(3).visible=chk_nenGiaothonghuyen.checked;
        }
        if(dom.byId("chk_nenHanhchinhxa").checked==true){
          nenBinhdinh.findSublayerById(4).visible=chk_nenHanhchinhxa.checked;
        }
        if(dom.byId("chk_nenRanhgioihanhchinhhuyen").checked==true){
          nenBinhdinh.findSublayerById(5).visible=chk_nenRanhgioihanhchinhhuyen.checked;
        }
        if(dom.byId("chk_nenHanhchinhhuyen").checked==true){
          nenBinhdinh.findSublayerById(7).visible=chk_nenHanhchinhhuyen.checked;
        }

        dom.byId("checkbox_nenBinhdinh").checked=true;
        
        nenBinhdinh_Visible();
      }else{
        nenBinhdinh.findSublayerById(0).visible=false;
        nenBinhdinh.findSublayerById(1).visible=false;
        nenBinhdinh.findSublayerById(2).visible=false;
        nenBinhdinh.findSublayerById(3).visible=false;
        nenBinhdinh.findSublayerById(4).visible=false;
        nenBinhdinh.findSublayerById(5).visible=false;
        nenBinhdinh.findSublayerById(7).visible=false;

        dom.byId("chk_nenDaivatdactrung").disabled=true;
        dom.byId("chk_nenTimduong").disabled=true;
        dom.byId("chk_nenMatduongbo").disabled=true;
        dom.byId("chk_nenGiaothonghuyen").disabled=true;
        dom.byId("chk_nenHanhchinhxa").disabled=true;
        dom.byId("chk_nenRanhgioihanhchinhhuyen").disabled=true;
        dom.byId("chk_nenHanhchinhhuyen").disabled=true;

        dom.byId("checkbox_nenBinhdinh").checked=false;
      }

      
      
    });



         var chk_nenDaivatdactrung_event = dom.byId("chk_nenDaivatdactrung");
        on(chk_nenDaivatdactrung_event, "change", function() {
          if(dom.byId("checkbox_nenBinhdinh").checked==true){
            nenBinhdinh.findSublayerById(0).visible=chk_nenDaivatdactrung.checked;
          }
        });
        var lbl_Daivatdactrung_event = dom.byId("lbl_Daivatdactrung");
        on(lbl_Daivatdactrung_event, "click", function() {
          if(dom.byId("chk_nenDaivatdactrung").disabled==false){              
            if(dom.byId("chk_nenDaivatdactrung").checked==false){
              dom.byId("chk_nenDaivatdactrung").checked=true;
              if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(0).visible=true;}
            }else{
                dom.byId("chk_nenDaivatdactrung").checked=false;
                if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(0).visible=false;}
            } 
          }
        });

         var chk_nenTimduong_event = dom.byId("chk_nenTimduong");
        on(chk_nenTimduong_event, "change", function() {
          if(dom.byId("checkbox_nenBinhdinh").checked==true){
            nenBinhdinh.findSublayerById(1).visible=chk_nenTimduong.checked;
          }
        });
        var lbl_Timduong_event = dom.byId("lbl_Timduong");
        on(lbl_Timduong_event, "click", function() {
          if(dom.byId("chk_nenTimduong").disabled==false){
          
            if(dom.byId("chk_nenTimduong").checked==false){
              dom.byId("chk_nenTimduong").checked=true;
              if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(1).visible=true;}
            }else{
                dom.byId("chk_nenTimduong").checked=false;
                if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(1).visible=false;}
            } 
          }
        });


         var chk_nenMatduongbo_event = dom.byId("chk_nenMatduongbo");
        on(chk_nenMatduongbo_event, "change", function() {
          if(dom.byId("checkbox_nenBinhdinh").checked==true){
            nenBinhdinh.findSublayerById(2).visible=chk_nenMatduongbo.checked;
          }
        });
        var lbl_Matduongbo_event = dom.byId("lbl_Matduongbo");
        on(lbl_Matduongbo_event, "click", function() {
          if(dom.byId("chk_nenMatduongbo").disabled==false){
          
            if(dom.byId("chk_nenMatduongbo").checked==false){
              dom.byId("chk_nenMatduongbo").checked=true;
              if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(2).visible=true;}
            }else{
                dom.byId("chk_nenMatduongbo").checked=false;
                if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(2).visible=false;}
            } 
          }
        });

        var chk_nenGiaothonghuyen_event = dom.byId("chk_nenGiaothonghuyen");
        on(chk_nenGiaothonghuyen_event, "change", function() {
          if(dom.byId("checkbox_nenBinhdinh").checked==true){
            nenBinhdinh.findSublayerById(3).visible=chk_nenGiaothonghuyen.checked;
          }
        });
         var lbl_Giaothonghuyen_event = dom.byId("lbl_Giaothonghuyen");
        on(lbl_Giaothonghuyen_event, "click", function() {
          if(dom.byId("chk_nenGiaothonghuyen").disabled==false){              
            if(dom.byId("chk_nenGiaothonghuyen").checked==false){
              dom.byId("chk_nenGiaothonghuyen").checked=true;
              if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(3).visible=true;}
            }else{
                dom.byId("chk_nenGiaothonghuyen").checked=false;
                if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(3).visible=false;}
            } 
          }
        });
        

         var chk_nenHanhchinhxa_event = dom.byId("chk_nenHanhchinhxa");
        on(chk_nenHanhchinhxa_event, "change", function() {
          if(dom.byId("checkbox_nenBinhdinh").checked==true){
            nenBinhdinh.findSublayerById(4).visible=chk_nenHanhchinhxa.checked;
          }
        });
         var lbl_Hanhchinhxa_event = dom.byId("lbl_Hanhchinhxa");
        on(lbl_Hanhchinhxa_event, "click", function() {
          if(dom.byId("chk_nenHanhchinhxa").disabled==false){              
            if(dom.byId("chk_nenHanhchinhxa").checked==false){
              dom.byId("chk_nenHanhchinhxa").checked=true;
              if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(4).visible=true;}
            }else{
                dom.byId("chk_nenHanhchinhxa").checked=false;
                if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(4).visible=false;}
            } 
          }
        });

        var chk_nenRanhgioihanhchinhhuyen_event = dom.byId("chk_nenRanhgioihanhchinhhuyen");
        on(chk_nenRanhgioihanhchinhhuyen_event, "change", function() {
          if(dom.byId("checkbox_nenBinhdinh").checked==true){
            nenBinhdinh.findSublayerById(5).visible=chk_nenRanhgioihanhchinhhuyen.checked;
          }
        });
         var lbl_Ranhgioihanhchinhhuyen_event = dom.byId("lbl_Ranhgioihanhchinhhuyen");
        on(lbl_Ranhgioihanhchinhhuyen_event, "click", function() {
          if(dom.byId("chk_nenRanhgioihanhchinhhuyen").disabled==false){              
            if(dom.byId("chk_nenRanhgioihanhchinhhuyen").checked==false){
              dom.byId("chk_nenRanhgioihanhchinhhuyen").checked=true;
              if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(5).visible=true;}
            }else{
                dom.byId("chk_nenRanhgioihanhchinhhuyen").checked=false;
                if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(5).visible=false;}
            } 
          }
        });

         var chk_nenHanhchinhhuyen_event = dom.byId("chk_nenHanhchinhhuyen");
        on(chk_nenHanhchinhhuyen_event, "change", function() {
          if(dom.byId("checkbox_nenBinhdinh").checked==true){
            nenBinhdinh.findSublayerById(7).visible=chk_nenHanhchinhhuyen.checked;
          }
        });
         var lbl_Hanhchinhhuyen_event = dom.byId("lbl_Hanhchinhhuyen");
        on(lbl_Hanhchinhhuyen_event, "click", function() {
          if(dom.byId("chk_nenHanhchinhhuyen").disabled==false){              
            if(dom.byId("chk_nenHanhchinhhuyen").checked==false){
              dom.byId("chk_nenHanhchinhhuyen").checked=true;
              if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(7).visible=true;}
            }else{
                dom.byId("chk_nenHanhchinhhuyen").checked=false;
                if(dom.byId("checkbox_nenBinhdinh").checked==true){nenBinhdinh.findSublayerById(7).visible=false;}
            } 
          }
        });

// Visible nenBinhdinh theo ty le======================

function nenBinhdinh_Visible(){
app.mapView.when(function() {
        watchUtils.whenTrue(app.mapView, "stationary", function() {
          //if (editExpand) {
            if(dom.byId("checkbox_nenBinhdinh").checked==true){
              if (app.mapView.zoom < 15) {
              dom.byId("chk_nenDaivatdactrung").disabled=true;
            }else {
              dom.byId("chk_nenDaivatdactrung").disabled=false;
              }
            if (app.mapView.zoom < 17) {
              dom.byId("chk_nenTimduong").disabled=true;
            }else {
              dom.byId("chk_nenTimduong").disabled=false;
              }
            if (app.mapView.zoom < 16) {
              dom.byId("chk_nenMatduongbo").disabled=true;
            }else {
              dom.byId("chk_nenMatduongbo").disabled=false;
              }
            if (app.mapView.zoom < 11) {
              dom.byId("chk_nenGiaothonghuyen").disabled=true;
            }else {
              dom.byId("chk_nenGiaothonghuyen").disabled=false;
              }  
            if (app.mapView.zoom < 14) {
              dom.byId("chk_nenHanhchinhxa").disabled=true;
            }else {
              dom.byId("chk_nenHanhchinhxa").disabled=false;
              }  
            if (app.mapView.zoom < 13) {
              dom.byId("chk_nenRanhgioihanhchinhhuyen").disabled=true;
            }else {
              dom.byId("chk_nenRanhgioihanhchinhhuyen").disabled=false;
              }  
            if (app.mapView.zoom < 10 || app.mapView.zoom > 12) {  
              dom.byId("chk_nenHanhchinhhuyen").disabled=true;             
            }else {
              dom.byId("chk_nenHanhchinhhuyen").disabled=false;
              } 
            }
               
          
        });
      });
      
}
nenBinhdinh_Visible();






var lyr1Khu_CN = new FeatureLayer({
  
    url:"http://arcgis-server:6080/arcgis/rest/services/sokhdtbinhdinh20180806/FeatureServer/1",
    visible: true,
    opacity: 0.5,
    popupTemplate: new PopupTemplate({
      title:"Khu Công Nghiệp/Khu Kinh Tế",
      content:[{
       
        type:"fields",
        fieldInfos:[

        {
          fieldName:"KhuCN",
          label:"Tên KCN/KKT"
        },
        {
          fieldName:"Khu",
          label:"Khu"
        },
        {
          fieldName:"mauDiaDiem",
          label:"Địa điểm"
        },
        {
          fieldName:"mauDienThoai",
          label:"Điện thoại"
        },
        {
          fieldName:"mauEmail",
          label:"Email"
        },
        {
          fieldName:"mauChuDauTuHaTang",
          label:"Chủ đầu tư hạ tầng"
        },
        {
          fieldName:"mauDienTichDatQuyHoach",
          label:"Diện tích đất quy hoạch"
        },
        {
          fieldName:"mauDienTichDatDaChoThue",
          label:"Diện tích đất đã cho thuê"
        },
        {
          fieldName:"mauHienTrangHaTang",
          label:"Hiện trạng hạ tầng (GPMB, đường, điện, nước, viễn thông, xử lý chất thải,...)"
        },
        {
          fieldName:"mauTyLeLapDay",
          label:"Tỷ lệ lấp đầy (%)"
        },
        {
          fieldName:"mauSoDoanhNghiepDangHoatDong",
          label:"Số doanh nghiệp đang hoạt động"
        },
        {
          fieldName:"mauSoDoanhNhiepDaDangKy",
          label:"Số doanh nghiep đã đăng ký"
        },
        {
          fieldName:"mauDienTichDatConTrong",
          label:"Diện tích đất còn trống"
        },
        {
          fieldName:"mauLinhVucNganhNgheDauTu",
          label:"Lĩnh vực ngành nghề đầu tư"
        },
        {
          fieldName:"mauGiaChoThue",
          label:"Giá cho thuê (đất thô, đã có hạ tầng, phí duy trì bảo dưỡng...)"
        }
      
      ]
      }
      
      ]
    })
  });
  map.add(lyr1Khu_CN);

var layer0 = new FeatureLayer({
  
    url:"http://arcgis-server:6080/arcgis/rest/services/sokhdtbinhdinh20180806/FeatureServer/0",
    visible: true,
    opacity: 0.6,
    popupTemplate: new PopupTemplate({
      title:"Doanh Nghiệp trong KCN/KKT",
      content:[{
       
        type:"fields",
        fieldInfos:[

        {
          fieldName:"TenCSD",
          label:"Tên doanh nghiệp"
        },
        {
          fieldName:"mauGiayChungNhanDangKyDN",
          label:"Giấy chứng nhận đăng ký doanh nghiệp"
        },
        {
          fieldName:"mauDiaChiTruSoChinh",
          label:"Địa chỉ trụ sở chính"
        },           
        {
          fieldName:"mauDienThoai",
          label:"Điện thoại"
        },           
        {
          fieldName:"mauEmail",
          label:"Email"
        },           
        {
          fieldName:"mauViTriDaThue",
          label:"Vị trí đã thuê/đăng ký"
        },           
        {
          fieldName:"mauDienTichDatDaThue",
          label:"Diện tích đất đã thuê"
        },           
        {
          fieldName:"mauQuyMoCongSuat",
          label:"Quy mô, công suất"
        },           
        {
          fieldName:"mauTongVonDauTu",
          label:"Tổng vốn đầu tư"
        },           
        {
          fieldName:"mauTongSoLaoDong_TrongNuoc",
          label:"Tổng số lao động trong nước"
        },           
        {
          fieldName:"mauTongSoLaoDong_NuocNgoai",
          label:"Tổng số lao động nước ngoài"
        },           
        {
          fieldName:"MatDoXayDungToiDa",
          label:"Mật độ xây dựng tối đa"
        },           
        {
          fieldName:"DoCaoTang",
          label:"Độ cao tầng"
        },           
        {
          fieldName:"ToBD",
          label:"Tờ bản đồ"
        },           
        {
          fieldName:"ThuaBD",
          label:"Số thửa"
        },           
        {
          fieldName:"ToadoVN2000",
          label:"Tọa độ VN2000"
        }
      
      ]
      },
      
      {
      
        type: "media",
        mediaInfos: [{
          title: "<b><a href='/images/khucongnghiepgiabinh_NEBI.jpg'>Palm tree lined street</a></b>",
          type: "image",
          value: {
            sourceURL: "/images/khucongnghiepgiabinh_NEBI.jpg"
          }
        },{
          title: "<a href='/images/pcttkcnchanhung_ASPE.jpg'><b>Pahehe ehe </a></b>",
          type: "image",
          value: {
            sourceURL: "/images/pcttkcnchanhung_ASPE.jpg"
          }
        },
        {
          title: "<a href='/images/serfergfegfg.jpg'><b>Pahehe ehe </a></b>",
          type: "image",
          value: {
            sourceURL: "/images/serfergfegfg.jpg"
          }
        }
        
        ]

      }
      
      ]
    })
  });
  map.add(layer0);



  var lyr4Cum_CN = new FeatureLayer({
  
    url:"http://arcgis-server:6080/arcgis/rest/services/sokhdtbinhdinh20180806/FeatureServer/4",
    visible: true,
    opacity: 0.5,
    popupTemplate: new PopupTemplate({
      title:"Cụm Công Nghiệp",
      content:[{
       
        type:"fields",
        fieldInfos:[

        {
          fieldName:"KhuCN",
          label:"Tên CCN"
        },
        {
          fieldName:"Khu",
          label:"Khu"
        },
        {
          fieldName:"mauDiaDiem",
          label:"Địa điểm"
        },
        {
          fieldName:"mauDienThoai",
          label:"Điện thoại"
        },
        {
          fieldName:"mauEmail",
          label:"Email"
        },
        {
          fieldName:"mauChuDauTuHaTang",
          label:"Chủ đầu tư hạ tầng"
        },
        {
          fieldName:"mauDienTichDatQuyHoach",
          label:"Diện tích đất quy hoạch"
        },
        {
          fieldName:"mauDienTichDatDaChoThue",
          label:"Diện tích đất đã cho thuê"
        },
        {
          fieldName:"mauHienTrangHaTang",
          label:"Hiện trạng hạ tầng (GPMB, đường, điện, nước, viễn thông, xử lý chất thải,...)"
        },
        {
          fieldName:"mauTyLeLapDay",
          label:"Tỷ lệ lấp đầy (%)"
        },
        {
          fieldName:"mauSoDoanhNghiepDangHoatDong",
          label:"Số doanh nghiệp đang hoạt động"
        },
        {
          fieldName:"mauSoDoanhNghiepDaDangKy",
          label:"Số doanh nghiep đã đăng ký"
        },
        {
          fieldName:"mauDienTichDatConTrong",
          label:"Diện tích đất còn trống"
        },
        {
          fieldName:"mauLinhVucNganhNgheDauTu",
          label:"Lĩnh vực ngành nghề đầu tư"
        },
        {
          fieldName:"mauGiaChoThue",
          label:"Giá cho thuê (đất thô, đã có hạ tầng, phí duy trì bảo dưỡng...)"
        }
      
      ]
      }
      
      ]
    })
  });
  map.add(lyr4Cum_CN);

  var lyr3CCN_Thuadat = new FeatureLayer({
  
    url:"http://arcgis-server:6080/arcgis/rest/services/sokhdtbinhdinh20180806/FeatureServer/3",
    visible: true,
    opacity: 0.6,
    popupTemplate: new PopupTemplate({
      title:"Doanh Nghiệp trong CCN",
      content:[{
       
        type:"fields",
        fieldInfos:[

          {
            fieldName:"TenCSD",
            label:"Tên doanh nghiệp"
          },
          {
            fieldName:"mauGiayChungNhanDangKyDN",
            label:"Giấy chứng nhận đăng ký doanh nghiệp"
          },
          {
            fieldName:"mauDiaChiTruSoChinh",
            label:"Địa chỉ trụ sở chính"
          },           
          {
            fieldName:"mauDienThoai",
            label:"Điện thoại"
          },           
          {
            fieldName:"mauEmail",
            label:"Email"
          },           
          {
            fieldName:"mauViTriDaThue",
            label:"Vị trí đã thuê/đăng ký"
          },           
          {
            fieldName:"mauDienTichDatDaThue",
            label:"Diện tích đất đã thuê"
          },           
          {
            fieldName:"mauQuyMoCongSuat",
            label:"Quy mô, công suất"
          },           
          {
            fieldName:"mauTongVonDauTu",
            label:"Tổng vốn đầu tư"
          },           
          {
            fieldName:"mauTongSoLaoDong_TrongNuoc",
            label:"Tổng số lao động trong nước"
          },           
          {
            fieldName:"mauTongSoLaoDong_NuocNgoai",
            label:"Tổng số lao động nước ngoài"
          },           
          {
            fieldName:"MatDoXayDungToiDa",
            label:"Mật độ xây dựng tối đa"
          },           
          {
            fieldName:"DoCaoTang",
            label:"Độ cao tầng"
          },           
          {
            fieldName:"ToBD",
            label:"Tờ bản đồ"
          },           
          {
            fieldName:"ThuaBD",
            label:"Số thửa"
          },           
          {
            fieldName:"ToadoVN2000",
            label:"Tọa độ VN2000"
          }
      
      ]
      },

      {
        type: "media",
        mediaInfos: [{
          title: "<b><a href='/images/cn_oanm.jpg'>Palm tree lined street</a></b>",
          type: "image",
          value: {
            sourceURL: "/images/cn_oanm.jpg"
          }
        },{
          title: "<a href='/images/jcn.jpg'><b>Pahehe ehe </a></b>",
          type: "image",
          value: {
            sourceURL: "/images/jcn.jpg"
          }
        }
        
        ]
      }


      
      ]
    })
  });
  map.add(lyr3CCN_Thuadat);


 

  var lyr2Diem_Dautu = new FeatureLayer({
  
    url:"http://arcgis-server:6080/arcgis/rest/services/sokhdtbinhdinh20180806/FeatureServer/2",
    visible: true,
    opacity: 0.3,
    popupTemplate: new PopupTemplate({
      title:"Điểm Đầu Tư",
      content:[{
       
        type:"fields",
        fieldInfos:[

        {
          fieldName:"TenDiem",
          label:"Tên điểm"
        },
        {
          fieldName:"DiaDiem",
          label:"Địa điểm"
        },
        {
          fieldName:"DienTich",
          label:"Diện tích"
        },
        {
          fieldName:"TinhTrangDauTu",
          label:"Tình trạng đầu tư"
        },
        {
          fieldName:"MucTieuDuAn",
          label:"Mục tiêu dự án"
        },
        {
          fieldName:"QuyMoDuAn",
          label:"Quy mô dự án"
        },
        {
          fieldName:"TongMucDauTuDuKien",
          label:"Tổng mức đầu tư dự kiến"
        },
        {
          fieldName:"QuyHoachSuDungDat",
          label:"Địa điểm"
        },
        {
          fieldName:"ChinhSachUuDai",
          label:"Chính sách ưu đãi"
        },
        {
          fieldName:"HieuQuaDauTu",
          label:"Hiệu quả đầu tư"
        },
        {
          fieldName:"LienHe",
          label:"Liên Hệ"
        }
      
      ]
      },
      {
      
        type: "media",
        mediaInfos: [{
          title: "<b><a href='/images/267_Anh_1_gui_zing.jpg'>Palm tree lined street</a></b>",
          type: "image",
          value: {
            sourceURL: "/images/267_Anh_1_gui_zing.jpg"
          }
        },{
          title: "<a href='/images/Anh-1dfgfg_.jpg'><b>Pahehe ehe </a></b>",
          type: "image",
          value: {
            sourceURL: "/images/Anh-1dfgfg_.jpg"
          }
        }
        
        ]

      }



      
      ]
    })
  });
  map.add(lyr2Diem_Dautu);




var legend = new Legend({
        view:app.activeView,
        layerInfos: [{
          layer: layer0,
          title: "Chú thích loại đất:"
        }],container:"LegendPanelDiv"
      });




//On/Off Layer----------------------
    app.activeView.when(function() {
      layer0.when(function() {
        view.goTo(layer0.fullExtent);
      });
    });

    var streetsLyrToggle = dom.byId("ThuaDat_Lyr0");

    on(streetsLyrToggle, "change", function() {
      layer0.visible = streetsLyrToggle.checked;
    });


app.activeView.when(function() {
      lyr1Khu_CN.when(function() {
        view.goTo(lyr1Khu_CN.fullExtent);
      });
    });

    var Khu_CNLyrToggle = dom.byId("Khu_CN_Lyr1");

    on(Khu_CNLyrToggle, "change", function() {
      lyr1Khu_CN.visible = Khu_CNLyrToggle.checked;
    });


//Cum cn

    app.activeView.when(function() {
      lyr4Cum_CN.when(function() {
        view.goTo(lyr4Cum_CN.fullExtent);
      });
    });

    var Cum_CNLyrToggle = dom.byId("Cum_CN_Lyr4");

    on(Cum_CNLyrToggle, "change", function() {
      lyr4Cum_CN.visible = Cum_CNLyrToggle.checked;
    });

//lo dat Cum cn

app.activeView.when(function() {
  lyr3CCN_Thuadat.when(function() {
    view.goTo(lyr3CCN_Thuadat.fullExtent);
  });
});

var CCNthuadatLyrToggle = dom.byId("CCNthuadat_Lyr3");

on(CCNthuadatLyrToggle, "change", function() {
  lyr3CCN_Thuadat.visible = CCNthuadatLyrToggle.checked;
});



//diem dau tu

app.activeView.when(function() {
  lyr2Diem_Dautu.when(function() {
    view.goTo(lyr2Diem_Dautu.fullExtent);
  });
});

var Diem_DautuLyrToggle = dom.byId("Diem_Dautu_Lyr3");

on(Diem_DautuLyrToggle, "change", function() {
  lyr2Diem_Dautu.visible = Diem_DautuLyrToggle.checked;
});


//Printer
app.activeView.when(function() {
      var print = new Print({
        view: app.activeView,
        // specify your own print service
        printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
        container:"PrinterPanelDiv"
      });

      // Add widget to the top right corner of the view
      //view.ui.add(print, "top-right");
    });






  // Zooms to the KCN Phu Tai  location
  function zoomtoPhutaiKCN() {
      return app.activeView.goTo({
        center: [109.147795,13.767921],
        scale: 50000
      });
  }

  on(dom.byId("zoomtoPhutaiKCN"), "click", function() {
      zoomtoPhutaiKCN();
  });

    // Zooms to the KCN Long My  location
  function zoomtoLongmyKCN() {
      return app.activeView.goTo({
        center: [109.131338,13.725532],
        scale: 20000
      });
  }

  on(dom.byId("zoomtoLongmyKCN"), "click", function() {
      zoomtoLongmyKCN();
  });

  // Zooms to the KCN Nhon Hoa  location
  function zoomtoNhonhoaKCN() {
      return app.activeView.goTo({
        center: [109.067897,13.838813], 
        scale: 28000
      });
  }

  on(dom.byId("zoomtoNhonhoaKCN"), "click", function() {
      zoomtoNhonhoaKCN();
  });

  // Zooms to the KCN Cat Trinh  location
  function zoomtoCattrinhKCN() {
      return app.activeView.goTo({
        center: [109.077255, 14.024861], 
        scale: 30000
      });
  }

  on(dom.byId("zoomtoCattrinhKCN"), "click", function() {
      zoomtoCattrinhKCN();
  });

  // Zooms to the KCN Hoa hoi  location
  function zoomtoHoahoiKCN() {
      return app.activeView.goTo({
        center: [109.040784, 14.043610], 
        scale: 30000
      });
  }

  on(dom.byId("zoomtoHoahoiKCN"), "click", function() {
      zoomtoHoahoiKCN();
  });
  
  // Zooms to the Khu kinh te Nhon Hoi - KCN A location
  function zoomtoKKTNhonhoiAKCN() {
      return app.activeView.goTo({
        center: [109.270861, 13.822546], 
        scale: 30000
      });
  }

  on(dom.byId("zoomtoKKTNhonhoiAKCN"), "click", function() {
      zoomtoKKTNhonhoiAKCN();
  });

  // Zooms to the Khu kinh te Nhon Hoi - KCN B location
  function zoomtoKKTNhonhoiBKCN() {
      return app.activeView.goTo({
        center: [109.267465, 13.840680], 
        scale: 30000
      });
  }

  on(dom.byId("zoomtoKKTNhonhoiBKCN"), "click", function() {
      zoomtoKKTNhonhoiBKCN();
  });

  // Zooms to the Khu kinh te Nhon Hoi - KCN C location
  function zoomtoKKTNhonhoiCKCN() {
      return app.activeView.goTo({
        center: [109.262690, 13.858963], 
        scale: 20000
      });
  }

  on(dom.byId("zoomtoKKTNhonhoiCKCN"), "click", function() {
      zoomtoKKTNhonhoiCKCN();
  });

  
  //===========================================
   // Zooms CCN Binh duong
   function zoomtoBinhduongCCN() {
    return app.activeView.goTo({
      center: [109.098826, 14.295446], 
      scale: 20000
    });
}

on(dom.byId("zoomtoBinhduongCCN"), "click", function() {
  zoomtoBinhduongCCN();
});

// Zooms CCN Dai Thanh
function zoomtoDaithanhCCN() {
  return app.activeView.goTo({
    center: [109.043330, 14.132537], 
    scale: 20000
  });
}

on(dom.byId("zoomtoDaithanhCCN"), "click", function() {
  zoomtoDaithanhCCN();
});

// Zooms CCN Dai Thanh
function zoomtoDientieuCCN() {
  return app.activeView.goTo({
    center: [109.060190, 14.201977], 
    scale: 20000
  });
}

on(dom.byId("zoomtoDientieuCCN"), "click", function() {
  zoomtoDientieuCCN();
});


//======================================================
// Zooms Diem Dau Tu - Khu phức hợp 01 Nguyễn Tất Thành
function zoomto01nguyentatthanhDDT() {
  return app.activeView.goTo({
    center: [109.223209, 13.775006], 
    scale: 5000
  });
}

on(dom.byId("zoomto01nguyentatthanh"), "click", function() {
  zoomto01nguyentatthanhDDT();
});

// Zooms Diem Dau Tu - Saferi Zoo Quy Nhơn
function zoomtoSaferizooDDT() {
  return app.activeView.goTo({
    center: [109.269804, 13.882098], 
    scale: 20000
  });
}

on(dom.byId("zoomtoSaferizoo"), "click", function() {
  zoomtoSaferizooDDT();
});

// Zooms Diem Dau Tu - Sân golf FLC
function zoomtoSangolfflcDDT() {
  return app.activeView.goTo({
    center: [109.277546, 13.882229], 
    scale: 20000
  });
}

on(dom.byId("zoomtoSangolfflc"), "click", function() {
  zoomtoSangolfflcDDT();
});

// Zooms Diem Dau Tu - Khu Dã Ngoại Biển Trung Lương
function zoomtoTrungluongDDT() {
  return app.activeView.goTo({
    center: [109.247707, 13.959818], 
    scale: 10000
  });
}

on(dom.byId("zoomtoTrungluong"), "click", function() {
  zoomtoTrungluongDDT();
});

// Zooms Diem Dau Tu - Khu du lịch sinh thái Vũng Chua
function zoomtoVungchuaDDT() {
  return app.activeView.goTo({
    center: [109.194253, 13.745261], 
    scale: 20000
  });
}

on(dom.byId("zoomtoVungchua"), "click", function() {
  zoomtoVungchuaDDT();
});

// Zooms Diem Dau Tu - Avani resort & spa
function zoomtoAvaniDDT() {
  return app.activeView.goTo({
    center: [109.231859, 13.682596], 
    scale: 10000
  });
}

on(dom.byId("zoomtoAvani"), "click", function() {
  zoomtoAvaniDDT();
});
  



/*
var measure = new Measure(view);
view.ui.add(measure.container[0], "bottom-left")
            
            
var measureArea = new MeasureArea({
  view: view
});
view.ui.add(measureArea.container[0], "bottom-left")
*/



//Measure------------
var measure = new Measure(view);
alert("dfdfbhdfbhdfghfgnh");
 app.activeView.ui.add(measure.container[0], "bottom-left")

//MeasureArea----------------
/*
var measureArea = new MeasureArea({
  view: app.activeView
});
app.activeView.ui.add(measureArea.container[0], "bottom-left")
*/



  });
 
});
