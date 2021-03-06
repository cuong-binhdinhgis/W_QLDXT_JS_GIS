/*
$("#vertical").kendoSplitter({
  orientation: "vertical",
  panes: [{
      collapsible: false,
  },
  {
      collapsible: true,
      resizable: true
  }
  ]
});
*/
var app;


require([
    "esri/Map",
    "esri/views/MapView",

    "esri/request",
    "ditagis/core/ConstName",
    "ditagis/classes/SystemStatusObject",
    "ditagis/widgets/ExpandTools",
    "ditagis/widgets/QueryMethods",
    "ditagis/widgets/Popup",
    "ditagis/toolview/PaneManager",
    "ditagis/tools/VungPhuBTS",

    "esri/widgets/Legend",
    "ditagis/widgets/Measure",
    "ditagis/widgets/MeasureArea",

    "esri/geometry/Point",
    "ditagis/layers/FeatureLayer",
    "esri/widgets/Sketch/SketchViewModel",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",

    "esri/geometry/Polygon",
    "esri/tasks/support/ProjectParameters",
    "esri/tasks/GeometryService",

    "esri/PopupTemplate",
    "esri/symbols/TextSymbol",
    "esri/widgets/Search",
    "esri/widgets/Home",
    "esri/widgets/Print",
    //"esri/widgets/BasemapGallery",
    "esri/layers/MapImageLayer",
    "esri/layers/WebTileLayer",

    "esri/layers/OpenStreetMapLayer",
    "esri/layers/Layer",
    "esri/layers/GroupLayer",

    "esri/tasks/support/Query",
    "esri/tasks/QueryTask",


    "esri/core/watchUtils",




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
], function (Map, MapView, esriRequest, constName, SystemStatusObject, ExpandTools, QueryMethods, Popup, PaneManager, VungPhuBTSTools, Legend, Measure, MeasureArea, Point, FeatureLayer, SketchViewModel, Graphic, GraphicsLayer, Polygon, ProjectParameters, GeometryService, PopupTemplate, TextSymbol, Search, Home, Print, MapImageLayer, WebTileLayer, OpenStreetMap, Layer, GroupLayer, Query, QueryTask, watchUtils,
    query, dom, on, CalciteMaps, CalciteMapsArcGIS) {

        esriRequest('/session', {
            method: 'post'
        }).then(function (resultRequest) {


            /******************************************************************
             *
             * App settings
             *
             ******************************************************************/


            app = {
                //center: [109.172564,13.767122],
                center: [107.120639, 10.362463],

                scale: 100000,
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
                //basemap: app.basemap,
                //layers: [tempGraphicsLayer]
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

            app.activeView.systemVariable = new SystemStatusObject();
            app.activeView.systemVariable.user = resultRequest.data;

            this.geometryService = new GeometryService({ url: "https://ditagis.com:6443/arcgis/rest/services/Utilities/Geometry/GeometryServer" });







            /*
            let userurl;
          
                 
            for (let layerCfg of app.activeView.systemVariable.user.Layers) {
              if(layerCfg.id=="TramBTS" && layerCfg.permission.view==1){     
                  //alert(layerCfg.url);
                  userurl=layerCfg.url;
                }        
              }
              //alert(userurl);
          */

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

            //   var baseMap = new MapImageLayer({
            //     url: "http://117.3.71.234/arcgisadaptor/rest/services/BinhDinh/DuLieuNen/MapServer",
            //     visible: false,
            //     id: "dulieunen",
            //     title: 'Dữ liệu nền Bình Định',
            //     copyright: 'Bản đồ biên tập bởi Trung tâm DITAGIS',
            // });

            // map.add(baseMap);



            var basemap_worldimagery = dom.byId("basemapWorldimagery");
            on(basemap_worldimagery, "click", function () {

                if (dom.byId("chx_Worldimagery").checked == true) {
                    worldimagery.visible = false;
                    dom.byId("chx_Worldimagery").checked = false;
                    osm.visible = true;
                    dom.byId("chx_OpenStreetMap").checked = true;
                } else {
                    worldimagery.visible = true;
                    dom.byId("chx_Worldimagery").checked = true;
                    osm.visible = false;
                    dom.byId("chx_OpenStreetMap").checked = false;
                }



            });

            var basemap_openStreetMap = dom.byId("basemapOpenStreetMap");
            on(basemap_openStreetMap, "click", function () {

                if (dom.byId("chx_OpenStreetMap").checked == true) {
                    osm.visible = false;
                    dom.byId("chx_OpenStreetMap").checked = false;
                    worldimagery.visible = true;
                    dom.byId("chx_Worldimagery").checked = true;

                } else {
                    osm.visible = true;
                    dom.byId("chx_OpenStreetMap").checked = true;
                    worldimagery.visible = false;
                    dom.byId("chx_Worldimagery").checked = false;
                }


            });


            on(dom.byId("chx_Worldimagery"), "change", function () {
                if (dom.byId("chx_Worldimagery").checked == true) {
                    dom.byId("chx_Worldimagery").checked = false;
                    worldimagery.visible = false;
                    dom.byId("chx_OpenStreetMap").checked = false;
                    osm.visible = false;
                } else {
                    dom.byId("chx_Worldimagery").checked = true;
                    worldimagery.visible = true;
                    dom.byId("chx_OpenStreetMap").checked = false;
                    osm.visible = false;
                }
            });


            on(dom.byId("chx_OpenStreetMap"), "change", function () {
                if (dom.byId("chx_OpenStreetMap").checked == true) {
                    dom.byId("chx_OpenStreetMap").checked = false;
                    osm.visible = false;
                    dom.byId("chx_Worldimagery").checked = false;
                    worldimagery.visible = false;
                } else {
                    dom.byId("chx_OpenStreetMap").checked = true;
                    osm.visible = true;
                    dom.byId("chx_Worldimagery").checked = false;
                    worldimagery.visible = false;
                }
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
                view: app.activeView
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
                id: "dulieunen",
                sublayers: [
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


            function checkbox_nenBinhdinh_Change() {
                var nenBinhdinh_event = dom.byId("checkbox_nenBinhdinh");
                on(nenBinhdinh_event, "change", function () {

                    //nenBinhdinh.findSublayerById(0).visible=checkbox_nenBinhdinh.checked;
                    if (dom.byId("checkbox_nenBinhdinh").checked == true) {
                        if (dom.byId("chk_nenDaivatdactrung").checked == true) {
                            nenBinhdinh.findSublayerById(0).visible = chk_nenDaivatdactrung.checked;
                        }
                        if (dom.byId("chk_nenTimduong").checked == true) {
                            nenBinhdinh.findSublayerById(1).visible = chk_nenTimduong.checked;
                        }
                        if (dom.byId("chk_nenMatduongbo").checked == true) {
                            nenBinhdinh.findSublayerById(2).visible = chk_nenMatduongbo.checked;
                        }
                        if (dom.byId("chk_nenGiaothonghuyen").checked == true) {
                            nenBinhdinh.findSublayerById(3).visible = chk_nenGiaothonghuyen.checked;
                        }
                        if (dom.byId("chk_nenHanhchinhxa").checked == true) {
                            nenBinhdinh.findSublayerById(4).visible = chk_nenHanhchinhxa.checked;
                        }
                        if (dom.byId("chk_nenRanhgioihanhchinhhuyen").checked == true) {
                            nenBinhdinh.findSublayerById(5).visible = chk_nenRanhgioihanhchinhhuyen.checked;
                        }
                        if (dom.byId("chk_nenHanhchinhhuyen").checked == true) {
                            nenBinhdinh.findSublayerById(7).visible = chk_nenHanhchinhhuyen.checked;
                        }

                        nenBinhdinh_Visible();
                    } else {
                        nenBinhdinh.findSublayerById(0).visible = false;
                        nenBinhdinh.findSublayerById(1).visible = false;
                        nenBinhdinh.findSublayerById(2).visible = false;
                        nenBinhdinh.findSublayerById(3).visible = false;
                        nenBinhdinh.findSublayerById(4).visible = false;
                        nenBinhdinh.findSublayerById(5).visible = false;
                        nenBinhdinh.findSublayerById(7).visible = false;

                        dom.byId("chk_nenDaivatdactrung").disabled = true;
                        dom.byId("chk_nenTimduong").disabled = true;
                        dom.byId("chk_nenMatduongbo").disabled = true;
                        dom.byId("chk_nenGiaothonghuyen").disabled = true;
                        dom.byId("chk_nenHanhchinhxa").disabled = true;
                        dom.byId("chk_nenRanhgioihanhchinhhuyen").disabled = true;
                        dom.byId("chk_nenHanhchinhhuyen").disabled = true;
                    }
                });
            }
            checkbox_nenBinhdinh_Change();



            // conClick Hinh anh Nen Dinh Dinh
            var nenBinhdinh_img = dom.byId("img_nenBinhdinh");
            on(nenBinhdinh_img, "click", function () {

                //nenBinhdinh.findSublayerById(0).visible=checkbox_nenBinhdinh.checked;
                if (dom.byId("checkbox_nenBinhdinh").checked == false) {
                    if (dom.byId("chk_nenDaivatdactrung").checked == true) {
                        nenBinhdinh.findSublayerById(0).visible = chk_nenDaivatdactrung.checked;
                    }
                    if (dom.byId("chk_nenTimduong").checked == true) {
                        nenBinhdinh.findSublayerById(1).visible = chk_nenTimduong.checked;
                    }
                    if (dom.byId("chk_nenMatduongbo").checked == true) {
                        nenBinhdinh.findSublayerById(2).visible = chk_nenMatduongbo.checked;
                    }
                    if (dom.byId("chk_nenGiaothonghuyen").checked == true) {
                        nenBinhdinh.findSublayerById(3).visible = chk_nenGiaothonghuyen.checked;
                    }
                    if (dom.byId("chk_nenHanhchinhxa").checked == true) {
                        nenBinhdinh.findSublayerById(4).visible = chk_nenHanhchinhxa.checked;
                    }
                    if (dom.byId("chk_nenRanhgioihanhchinhhuyen").checked == true) {
                        nenBinhdinh.findSublayerById(5).visible = chk_nenRanhgioihanhchinhhuyen.checked;
                    }
                    if (dom.byId("chk_nenHanhchinhhuyen").checked == true) {
                        nenBinhdinh.findSublayerById(7).visible = chk_nenHanhchinhhuyen.checked;
                    }

                    dom.byId("checkbox_nenBinhdinh").checked = true;

                    nenBinhdinh_Visible();
                } else {
                    nenBinhdinh.findSublayerById(0).visible = false;
                    nenBinhdinh.findSublayerById(1).visible = false;
                    nenBinhdinh.findSublayerById(2).visible = false;
                    nenBinhdinh.findSublayerById(3).visible = false;
                    nenBinhdinh.findSublayerById(4).visible = false;
                    nenBinhdinh.findSublayerById(5).visible = false;
                    nenBinhdinh.findSublayerById(7).visible = false;

                    dom.byId("chk_nenDaivatdactrung").disabled = true;
                    dom.byId("chk_nenTimduong").disabled = true;
                    dom.byId("chk_nenMatduongbo").disabled = true;
                    dom.byId("chk_nenGiaothonghuyen").disabled = true;
                    dom.byId("chk_nenHanhchinhxa").disabled = true;
                    dom.byId("chk_nenRanhgioihanhchinhhuyen").disabled = true;
                    dom.byId("chk_nenHanhchinhhuyen").disabled = true;

                    dom.byId("checkbox_nenBinhdinh").checked = false;
                }
            });

            //onClick text Nen Binh Dinh
            var nenBinhdinh_div = dom.byId("div_nenBinhdinh");
            on(nenBinhdinh_div, "click", function () {

                //nenBinhdinh.findSublayerById(0).visible=checkbox_nenBinhdinh.checked;
                if (dom.byId("checkbox_nenBinhdinh").checked == false) {
                    if (dom.byId("chk_nenDaivatdactrung").checked == true) {
                        nenBinhdinh.findSublayerById(0).visible = chk_nenDaivatdactrung.checked;
                    }
                    if (dom.byId("chk_nenTimduong").checked == true) {
                        nenBinhdinh.findSublayerById(1).visible = chk_nenTimduong.checked;
                    }
                    if (dom.byId("chk_nenMatduongbo").checked == true) {
                        nenBinhdinh.findSublayerById(2).visible = chk_nenMatduongbo.checked;
                    }
                    if (dom.byId("chk_nenGiaothonghuyen").checked == true) {
                        nenBinhdinh.findSublayerById(3).visible = chk_nenGiaothonghuyen.checked;
                    }
                    if (dom.byId("chk_nenHanhchinhxa").checked == true) {
                        nenBinhdinh.findSublayerById(4).visible = chk_nenHanhchinhxa.checked;
                    }
                    if (dom.byId("chk_nenRanhgioihanhchinhhuyen").checked == true) {
                        nenBinhdinh.findSublayerById(5).visible = chk_nenRanhgioihanhchinhhuyen.checked;
                    }
                    if (dom.byId("chk_nenHanhchinhhuyen").checked == true) {
                        nenBinhdinh.findSublayerById(7).visible = chk_nenHanhchinhhuyen.checked;
                    }

                    dom.byId("checkbox_nenBinhdinh").checked = true;

                    nenBinhdinh_Visible();
                } else {
                    nenBinhdinh.findSublayerById(0).visible = false;
                    nenBinhdinh.findSublayerById(1).visible = false;
                    nenBinhdinh.findSublayerById(2).visible = false;
                    nenBinhdinh.findSublayerById(3).visible = false;
                    nenBinhdinh.findSublayerById(4).visible = false;
                    nenBinhdinh.findSublayerById(5).visible = false;
                    nenBinhdinh.findSublayerById(7).visible = false;

                    dom.byId("chk_nenDaivatdactrung").disabled = true;
                    dom.byId("chk_nenTimduong").disabled = true;
                    dom.byId("chk_nenMatduongbo").disabled = true;
                    dom.byId("chk_nenGiaothonghuyen").disabled = true;
                    dom.byId("chk_nenHanhchinhxa").disabled = true;
                    dom.byId("chk_nenRanhgioihanhchinhhuyen").disabled = true;
                    dom.byId("chk_nenHanhchinhhuyen").disabled = true;

                    dom.byId("checkbox_nenBinhdinh").checked = false;
                }



            });

            var chk_nenDaivatdactrung_event = dom.byId("chk_nenDaivatdactrung");
            on(chk_nenDaivatdactrung_event, "change", function () {
                if (dom.byId("checkbox_nenBinhdinh").checked == true) {
                    nenBinhdinh.findSublayerById(0).visible = chk_nenDaivatdactrung.checked;
                }
            });
            var lbl_Daivatdactrung_event = dom.byId("lbl_Daivatdactrung");
            on(lbl_Daivatdactrung_event, "click", function () {
                if (dom.byId("chk_nenDaivatdactrung").disabled == false) {
                    if (dom.byId("chk_nenDaivatdactrung").checked == false) {
                        dom.byId("chk_nenDaivatdactrung").checked = true;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(0).visible = true; }
                    } else {
                        dom.byId("chk_nenDaivatdactrung").checked = false;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(0).visible = false; }
                    }
                }
            });

            var chk_nenTimduong_event = dom.byId("chk_nenTimduong");
            on(chk_nenTimduong_event, "change", function () {
                if (dom.byId("checkbox_nenBinhdinh").checked == true) {
                    nenBinhdinh.findSublayerById(1).visible = chk_nenTimduong.checked;
                }
            });
            var lbl_Timduong_event = dom.byId("lbl_Timduong");
            on(lbl_Timduong_event, "click", function () {
                if (dom.byId("chk_nenTimduong").disabled == false) {

                    if (dom.byId("chk_nenTimduong").checked == false) {
                        dom.byId("chk_nenTimduong").checked = true;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(1).visible = true; }
                    } else {
                        dom.byId("chk_nenTimduong").checked = false;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(1).visible = false; }
                    }
                }
            });

            var chk_nenMatduongbo_event = dom.byId("chk_nenMatduongbo");
            on(chk_nenMatduongbo_event, "change", function () {
                if (dom.byId("checkbox_nenBinhdinh").checked == true) {
                    nenBinhdinh.findSublayerById(2).visible = chk_nenMatduongbo.checked;
                }
            });
            var lbl_Matduongbo_event = dom.byId("lbl_Matduongbo");
            on(lbl_Matduongbo_event, "click", function () {
                if (dom.byId("chk_nenMatduongbo").disabled == false) {

                    if (dom.byId("chk_nenMatduongbo").checked == false) {
                        dom.byId("chk_nenMatduongbo").checked = true;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(2).visible = true; }
                    } else {
                        dom.byId("chk_nenMatduongbo").checked = false;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(2).visible = false; }
                    }
                }
            });

            var chk_nenGiaothonghuyen_event = dom.byId("chk_nenGiaothonghuyen");
            on(chk_nenGiaothonghuyen_event, "change", function () {
                if (dom.byId("checkbox_nenBinhdinh").checked == true) {
                    nenBinhdinh.findSublayerById(3).visible = chk_nenGiaothonghuyen.checked;
                }
            });
            var lbl_Giaothonghuyen_event = dom.byId("lbl_Giaothonghuyen");
            on(lbl_Giaothonghuyen_event, "click", function () {
                if (dom.byId("chk_nenGiaothonghuyen").disabled == false) {
                    if (dom.byId("chk_nenGiaothonghuyen").checked == false) {
                        dom.byId("chk_nenGiaothonghuyen").checked = true;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(3).visible = true; }
                    } else {
                        dom.byId("chk_nenGiaothonghuyen").checked = false;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(3).visible = false; }
                    }
                }
            });


            var chk_nenHanhchinhxa_event = dom.byId("chk_nenHanhchinhxa");
            on(chk_nenHanhchinhxa_event, "change", function () {
                if (dom.byId("checkbox_nenBinhdinh").checked == true) {
                    nenBinhdinh.findSublayerById(4).visible = chk_nenHanhchinhxa.checked;
                }
            });
            var lbl_Hanhchinhxa_event = dom.byId("lbl_Hanhchinhxa");
            on(lbl_Hanhchinhxa_event, "click", function () {
                if (dom.byId("chk_nenHanhchinhxa").disabled == false) {
                    if (dom.byId("chk_nenHanhchinhxa").checked == false) {
                        dom.byId("chk_nenHanhchinhxa").checked = true;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(4).visible = true; }
                    } else {
                        dom.byId("chk_nenHanhchinhxa").checked = false;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(4).visible = false; }
                    }
                }
            });

            var chk_nenRanhgioihanhchinhhuyen_event = dom.byId("chk_nenRanhgioihanhchinhhuyen");
            on(chk_nenRanhgioihanhchinhhuyen_event, "change", function () {
                if (dom.byId("checkbox_nenBinhdinh").checked == true) {
                    nenBinhdinh.findSublayerById(5).visible = chk_nenRanhgioihanhchinhhuyen.checked;
                }
            });
            var lbl_Ranhgioihanhchinhhuyen_event = dom.byId("lbl_Ranhgioihanhchinhhuyen");
            on(lbl_Ranhgioihanhchinhhuyen_event, "click", function () {
                if (dom.byId("chk_nenRanhgioihanhchinhhuyen").disabled == false) {
                    if (dom.byId("chk_nenRanhgioihanhchinhhuyen").checked == false) {
                        dom.byId("chk_nenRanhgioihanhchinhhuyen").checked = true;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(5).visible = true; }
                    } else {
                        dom.byId("chk_nenRanhgioihanhchinhhuyen").checked = false;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(5).visible = false; }
                    }
                }
            });

            var chk_nenHanhchinhhuyen_event = dom.byId("chk_nenHanhchinhhuyen");
            on(chk_nenHanhchinhhuyen_event, "change", function () {
                if (dom.byId("checkbox_nenBinhdinh").checked == true) {
                    nenBinhdinh.findSublayerById(7).visible = chk_nenHanhchinhhuyen.checked;
                }
            });
            var lbl_Hanhchinhhuyen_event = dom.byId("lbl_Hanhchinhhuyen");
            on(lbl_Hanhchinhhuyen_event, "click", function () {
                if (dom.byId("chk_nenHanhchinhhuyen").disabled == false) {
                    if (dom.byId("chk_nenHanhchinhhuyen").checked == false) {
                        dom.byId("chk_nenHanhchinhhuyen").checked = true;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(7).visible = true; }
                    } else {
                        dom.byId("chk_nenHanhchinhhuyen").checked = false;
                        if (dom.byId("checkbox_nenBinhdinh").checked == true) { nenBinhdinh.findSublayerById(7).visible = false; }
                    }
                }
            });

            // Visible nenBinhdinh theo ty le======================

            function nenBinhdinh_Visible() {

                //app.mapView.when(function () {

                watchUtils.whenTrue(app.mapView, "stationary", function () {
                    //if (editExpand) {
                    if (dom.byId("checkbox_nenBinhdinh").checked == true) {
                        if (app.mapView.zoom < 15) {
                            dom.byId("chk_nenDaivatdactrung").disabled = true;
                        } else {
                            dom.byId("chk_nenDaivatdactrung").disabled = false;
                        }
                        if (app.mapView.zoom < 17) {
                            dom.byId("chk_nenTimduong").disabled = true;
                        } else {
                            dom.byId("chk_nenTimduong").disabled = false;
                        }
                        if (app.mapView.zoom < 16) {
                            dom.byId("chk_nenMatduongbo").disabled = true;
                        } else {
                            dom.byId("chk_nenMatduongbo").disabled = false;
                        }
                        if (app.mapView.zoom < 11) {
                            dom.byId("chk_nenGiaothonghuyen").disabled = true;
                        } else {
                            dom.byId("chk_nenGiaothonghuyen").disabled = false;
                        }
                        if (app.mapView.zoom < 14) {
                            dom.byId("chk_nenHanhchinhxa").disabled = true;
                        } else {
                            dom.byId("chk_nenHanhchinhxa").disabled = false;
                        }
                        if (app.mapView.zoom < 13) {
                            dom.byId("chk_nenRanhgioihanhchinhhuyen").disabled = true;
                        } else {
                            dom.byId("chk_nenRanhgioihanhchinhhuyen").disabled = false;
                        }
                        if (app.mapView.zoom < 10 || app.mapView.zoom > 12) {
                            dom.byId("chk_nenHanhchinhhuyen").disabled = true;
                        } else {
                            dom.byId("chk_nenHanhchinhhuyen").disabled = false;
                        }
                    }


                });
                //});

            }
            nenBinhdinh_Visible();





            //layersql========================================








            //Printer
            // app.activeView.when(function () {

            var print = new Print({
                view: app.activeView,
                // specify your own print service
                printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
                container: "PrinterPanelDiv"
            });

            // Add widget to the top right corner of the view
            //view.ui.add(print, "top-right");
            //});















            var expandTools = new ExpandTools(app.activeView, {
                position: 'top-right',
            });

            let gr = new GroupLayer({
                title: 'Dữ liệu chuyên đề',
                id: "chuyendehientrang"
            });

            map.add(gr);






            //show layer

            for (let layerCfg of app.activeView.systemVariable.user.Layers) {


                //tinh cmax===============================








                if (layerCfg.groupLayer === constName.CHUYEN_DE_DT && layerCfg.permission.view && layerCfg.id == constName.THONGTIN_MAU) {

                    //console.log(layerCfg.url);


                    if (layerCfg.permission.create) {

                        dom.byId("linkQuanTracChatThai").onclick = function () {

                            // //Ẩn bảng dữ liệu Chất Thỉa Lỏng
                            // document.getElementById("gridDisplayChatThaiLong").style = "width: calc(96% - 40px); left: 50px; top: 65px; height: calc(80% - 40px); display:none";
                            // //Hiện Form nhập Chất Thải Lỏng
                            // document.getElementById("panelAddThongTinMau").className = "panel collapse in";
                            // document.getElementById("panelAddThongTinMau").style.height = "auto";
                            // document.getElementById("collapseAddThongTinMau").className = "panel-collapse collapse in";



                        }


                        dom.byId("TTMLoaiDXT").onchange = function () {


                            //Lấy  MaDXT đổ vào combobox 
                            for (let layerCfg of app.activeView.systemVariable.user.Layers) {
                                if (layerCfg.id == constName.DIEMXATHAI) {
                                    //lay các domain đo vao combobox
                                    /*
                                    $.ajax({
                                        url: layerCfg.url + '?f=pjson',
                                        type: 'get',
                                        dataType: 'json',
                                        success: function (result) {
                                            var optionLoaiDXT="";
                                            for(let i=0;i<result.fields[2].domain.codedValues.length;i++)
                                            {
                                                optionLoaiDXT += '<option value="' + result.fields[2].domain.codedValues[i].code + '">' + result.fields[2].domain.codedValues[i].name+ '</option>';
                                            }
                                            dom.byId("TTMLoaiDXT").innerHTML='<option value="">Chọn Loại điểm xả thải</option>'+optionLoaiDXT;
                                        }
                                    });
                                    */
                                    //Lấy  MaDXT đổ vào combobox
                                    if (dom.byId("TTMLoaiDXT").value != "") {
                                        $.ajax({
                                            url: layerCfg.url + '/query?where=LoaiDXT%3D%27' + dom.byId("TTMLoaiDXT").value + '%27&outFields=MaDXT%2C+LoaiDXT%2C+MaCSKD&returnGeometry=false&f=pjson',
                                            type: 'get',
                                            dataType: 'json',
                                            success: function (result) {
                                                var optionMaDXT = "";
                                                for (let i = 0; i < result.features.length; i++) {
                                                    optionMaDXT += '<option value="' + result.features[i].attributes.MaDXT + '">' + result.features[i].attributes.MaDXT + '</option>';
                                                }
                                                dom.byId("TTMMaDXT").innerHTML = '<option value="">-- Lựa chọn --</option>' + optionMaDXT;

                                            }

                                        });
                                    }
                                    // if (dom.byId("TTMLoaiDXT").value == "CTL") {
                                    //     dom.byId("TTMLuuLuong").placeholder = "nước thải m3/ngày";
                                    // }
                                    // if (dom.byId("TTMLoaiDXT").value == "CTK") {
                                    //     dom.byId("TTMLuuLuong").placeholder = "khí thải Nm3/h";
                                    // }
                                }
                            }
                        }




                        dom.byId("tableTTMSave").onclick = function () {
                            AddThongTinMau();
                        };

                        function AddThongTinMau() {

                            if(dom.byId("TTMLoaiDXT").value=="CTK"){
                                alert("Hiện tại chức năng tính Cmax Chất thải khí chưa hoàn thành, vui lòng trở lại sau!")
                            }





                            if (dom.byId("TTMMaDoiTuong").value.trim() != "") {
                                var dtMaDoiTuong = dom.byId("TTMMaDoiTuong").value.trim();
                            } else {
                                alert("Nhập Mã Đối Tượng!")
                                return false;
                            }
                            if (dom.byId("TTMMaDXT").value.trim() != "") {
                                var dtMaDXT = dom.byId("TTMMaDXT").value.trim();
                            } else {
                                alert("Chọn Điểm xả thải!")
                                return false;
                            }
                            // if (dom.byId("TTMLuuLuong").value.trim() != "" && dom.byId("TTMLuuLuong").value.trim() > 0) {
                            //     var dtLuuLuong = dom.byId("TTMLuuLuong").value.trim();
                            // } else {
                            //     alert("Nhập lưu lượng!")
                            //     return false;
                            // }

                            var getTSo = {
                                SO2: dom.byId("TTMSO2").value,
                                NOx: dom.byId("TTMNOx").value,
                                CO: dom.byId("TTMCO").value,
                                NH3: dom.byId("TTMNH3").value,
                                H2S: dom.byId("TTMH2S").value,
                                HCI: dom.byId("TTMHCI").value,
                                Pb: dom.byId("TTMPb").value,
                                Cd: dom.byId("TTMCd").value,
                                Hg: dom.byId("TTMHg").value,
                                BOD5: dom.byId("TTMBOD5").value,
                                COD: dom.byId("TTMCOD").value,
                                TSS: dom.byId("TTMTSS").value,
                                NH4: dom.byId("TTMNH4").value,
                                Coliform: dom.byId("TTMColiform").value,
                                As_: dom.byId("TTMAs_").value,
                                CrIII: dom.byId("TTMCrIII").value,
                                CrVI: dom.byId("TTMCrVI").value,
                                Zn: dom.byId("TTMZn").value
                            };

                            if ((getTSo.SO2 == "" || getTSo.SO2 <= 0)
                                && (getTSo.NOx == "" || getTSo.NOx <= 0)
                                && (getTSo.CO == "" || getTSo.CO <= 0)
                                && (getTSo.NH3 == "" || getTSo.NH3 <= 0)
                                && (getTSo.H2S == "" || getTSo.H2S <= 0)
                                && (getTSo.HCI == "" || getTSo.HCI <= 0)
                                && (getTSo.Pb == "" || getTSo.Pb <= 0)
                                && (getTSo.Cd == "" || getTSo.Cd <= 0)
                                && (getTSo.Hg == "" || getTSo.Hg <= 0)
                                && (getTSo.BOD5 == "" || getTSo.BOD5 <= 0)
                                && (getTSo.COD == "" || getTSo.COD <= 0)
                                && (getTSo.TSS == "" || getTSo.TSS <= 0)
                                && (getTSo.NH4 == "" || getTSo.NH4 <= 0)
                                && (getTSo.Coliform == "" || getTSo.Coliform <= 0)
                                && (getTSo.As_ == "" || getTSo.As_ <= 0)
                                && (getTSo.CrIII == "" || getTSo.CrIII <= 0)
                                && (getTSo.CrVI == "" || getTSo.CrVI <= 0)
                                && (getTSo.Zn == "" || getTSo.Zn <= 0)) {

                                alert("Nhập ít nhất 1 thông số quan trắc có giá trị > 0");
                                return false;
                            }

                            //var dtLuuLuong = dom.byId("TTMLuuLuong").value.trim() != "" ? dom.byId("TTMLuuLuong").value.trim() : null;
                            var dtLTGLayMau = dom.byId("TTMTGLayMau").value.trim() != "" ? dom.byId("TTMTGLayMau").value.trim() : null;
                            var dtTGKyKetQua = dom.byId("TTMTGKyKetQua").value.trim() != "" ? dom.byId("TTMTGKyKetQua").value.trim() : null;
                            if (dom.byId("TTMLoaiDXT").value.trim() != "") {
                                var dtLoaiDXT = dom.byId("TTMLoaiDXT").value.trim();
                            } else {
                                alert("Chọn Loại điểm xả thải!")
                                return false;
                            }
                            var dtSO2 = dom.byId("TTMSO2").value.trim() != "" ? dom.byId("TTMSO2").value.trim() : null;
                            var dtNOx = dom.byId("TTMNOx").value.trim() != "" ? dom.byId("TTMNOx").value.trim() : null;
                            var dtCO = dom.byId("TTMCO").value.trim() != "" ? dom.byId("TTMCO").value.trim() : null;
                            var dtNH3 = dom.byId("TTMNH3").value.trim() != "" ? dom.byId("TTMNH3").value.trim() : null;
                            var dtH2S = dom.byId("TTMH2S").value.trim() != "" ? dom.byId("TTMH2S").value.trim() : null;
                            var dtHCI = dom.byId("TTMHCI").value.trim() != "" ? dom.byId("TTMHCI").value.trim() : null;
                            var dtPb = dom.byId("TTMPb").value.trim() != "" ? dom.byId("TTMPb").value.trim() : null;
                            var dtCd = dom.byId("TTMCd").value.trim() != "" ? dom.byId("TTMCd").value.trim() : null;
                            var dtHg = dom.byId("TTMHg").value.trim() != "" ? dom.byId("TTMHg").value.trim() : null;
                            var dtBOD5 = dom.byId("TTMBOD5").value.trim() != "" ? dom.byId("TTMBOD5").value.trim() : null;
                            var dtCOD = dom.byId("TTMCOD").value.trim() != "" ? dom.byId("TTMCOD").value.trim() : null;
                            var dtTSS = dom.byId("TTMTSS").value.trim() != "" ? dom.byId("TTMTSS").value.trim() : null;
                            var dtNH4 = dom.byId("TTMNH4").value.trim() != "" ? dom.byId("TTMNH4").value.trim() : null;
                            var dtColiform = dom.byId("TTMColiform").value.trim() != "" ? dom.byId("TTMColiform").value.trim() : null;
                            var dtAs_ = dom.byId("TTMAs_").value.trim() != "" ? dom.byId("TTMAs_").value.trim() : null;
                            var dtCrIII = dom.byId("TTMCrIII").value.trim() != "" ? dom.byId("TTMCrIII").value.trim() : null;
                            var dtCrVI = dom.byId("TTMCrVI").value.trim() != "" ? dom.byId("TTMCrVI").value.trim() : null;
                            var dtZn = dom.byId("TTMZn").value.trim() != "" ? dom.byId("TTMZn").value.trim() : null;

                            var form = new FormData();
                            form.append('f', 'json');
                            form.append('features', '[{"attributes":{'
                                + '"MaDoiTuong":' + dtMaDoiTuong + ','
                                + '"MaDXT":' + dtMaDXT + ','
                                //+ '"LuuLuong":' + dtLuuLuong + ','
                                + '"TGLayMau":' + dtLTGLayMau + ','
                                + '"TGKyKetQua":' + dtTGKyKetQua + ','
                                + '"LoaiDXT":' + dtLoaiDXT + ','
                                + '"SO2":' + dtSO2 + ','
                                + '"NOx":' + dtNOx + ','
                                + '"CO":' + dtCO + ','
                                + '"NH3":' + dtNH3 + ','
                                + '"H2S":' + dtH2S + ','
                                + '"HCI":' + dtHCI + ','
                                + '"Pb":' + dtPb + ','
                                + '"Cd":' + dtCd + ','
                                + '"Hg":' + dtHg + ','
                                + '"BOD5":' + dtBOD5 + ','
                                + '"COD":' + dtCOD + ','
                                + '"TSS":' + dtTSS + ','
                                + '"NH4":' + dtNH4 + ','
                                + '"Coliform":' + dtColiform + ','
                                + '"As_":' + dtAs_ + ','
                                + '"CrIII":' + dtCrIII + ','
                                + '"CrVI":' + dtCrVI + ','
                                + '"Zn":' + dtZn + ','
                                + '}}]');

                            fetch(layerCfg.url + '/addFeatures?f=json', {
                                method: 'POST',
                                body: form
                            })
                                .then(r => r.json())
                                .then(r => {
                                    //Tinh Cmax==================



                                    var getMaDXT = dom.byId("TTMMaDXT").value;

                                    var getTinhTrangDN = "";
                                    var getMaNguonTiepNhan = "";
                                    var getMaQuyChuan = "";
                                    var getLuuLuongChatThai = "";



                                    var getCot = "";
                                    var getKq = "";

                                    var getGiaTriC = "";
                                    var getKf = "";

                                    var CMAX_CTL="";

                                    //DIEMXATHAI:MaDXT------------------
                                    for (let layerCfg of app.activeView.systemVariable.user.Layers) {
                                        if (layerCfg.id == constName.DIEMXATHAI) {
                                            $.ajax({
                                                url: layerCfg.url + '/query?where=MaDXT%3D%27' + getMaDXT + '%27&outFields=*&returnGeometry=true&f=pjson',
                                                type: 'get',
                                                dataType: 'json',
                                                success: function (result) {
                                                    getMaNguonTiepNhan = result.features[0].attributes.MaNguonTiepNhap;
                                                    console.log("Mã nguồn tiếp nhận:" + getMaNguonTiepNhan);
                                                    //Nếu có 2 Mã quy chuẩn thì cắt lấy mã đầu tiên 2540 --> 25
                                                    getMaQuyChuan = result.features[0].attributes.MaQuyChuan.substring(0, 2).trim();
                                                    console.log("Mã Quy Chuẩn: " + getMaQuyChuan);

                                                    if (dom.byId("TTMLoaiDXT").value == "CTL") {
                                                        if (getMaNguonTiepNhan == "") {
                                                            alert("[Lỗi] Không xác định được: Nguồn tiếp nhận :(");
                                                            return false;
                                                        }
                                                        if (getMaQuyChuan == "") {
                                                            alert("[Lỗi] Không xác định được: Mã quy chuẩn :(");
                                                            return false;
                                                        }
                                                    }




                                                    if (dom.byId("TTMLoaiDXT").value == "CTL") {
                                                        getLuuLuongChatThai = result.features[0].attributes.LuuLuongNuocThai;

                                                    } else {
                                                        getLuuLuongChatThai = result.features[0].attributes.LuuLuongKhiThai;

                                                    }
                                                    //kiem tra chắc chắn có chưa?
                                                    if (getLuuLuongChatThai == "") {
                                                        alert("[Lỗi] Không xác định được: Lưu lượng chất thải :(");
                                                        return false;
                                                    }
                                                    console.log("Lưu lượng:" + getLuuLuongChatThai);

                                                    //DoanhNghiep------Tnh trang: DHD hay XP
                                                    for (let layerCfg of app.activeView.systemVariable.user.Layers) {
                                                        if (layerCfg.id == constName.DOANHNGHIEP_KCNKKT) {
                                                            $.ajax({
                                                                url: layerCfg.url + '/query?where=MaCSKD%3D%27' + result.features[0].attributes.MaCSKD.trim() + '%27&outFields=*&returnGeometry=true&f=pjson',
                                                                type: 'get',
                                                                dataType: 'json',
                                                                success: function (result) {
                                                                    getTinhTrangDN = result.features[0].attributes.TinhTrangDN;

                                                                    console.log("TinhTrangDN:" + result.features[0].attributes.TinhTrangDN);
                                                                }
                                                            });


                                                        }
                                                    }


                                                    //console.log(getMaNguonTiepNhan);
                                                    //NGUONTIEP_NHAN----------------
                                                    for (let layerCfg of app.activeView.systemVariable.user.Layers) {
                                                        if (layerCfg.id == constName.NGUONTIEP_NHAN) {
                                                            $.ajax({
                                                                url: layerCfg.url + '/query?where=MaNguonTiepNhan%3D%27' + getMaNguonTiepNhan + '%27&outFields=*&f=pjson',
                                                                type: 'get',
                                                                dataType: 'json',
                                                                success: function (result) {
                                                                    console.log(result);
                                                                    getCot = result.features[0].attributes.Cot;
                                                                    if(getCot==""){
                                                                        alert("[Lỗi] Không xác định được: Cột :(");
                                                                        return false;
                                                                    }

                                                                    console.log("COT:" + getCot);
                                                                    getKq = result.features[0].attributes.Kq;
                                                                    console.log("Kq:" + getKq);

                                                                    //GIATRI_C ---------------------
                                                                    for (let layerCfg of app.activeView.systemVariable.user.Layers) {
                                                                        if (layerCfg.id == constName.GIATRI_C) {
                                                                            //console.log(layerCfg.url)







                                                                            //Lất được giá trị C thông qua [Mã quy chuẩn], [Cột (ajax)]
                                                                            for (let xThongSo in getTSo) {
                                                                                //Chỉ lấy Thông số quan trắc hợp lệ (ko bằng rỗng và lớn hơn 0)
                                                                                if (getTSo[xThongSo] != null && getTSo[xThongSo] > 0) {
                                                                                    console.log("Thông số quan trắc:" + xThongSo);
                                                                                    $.ajax({
                                                                                        url: layerCfg.url + '/query?where=MaQuyChuan%3D%27' + getMaQuyChuan + '%27+and+ThongSo%3D%27' + xThongSo + '%27&outFields=*&f=pjson',
                                                                                        type: 'get',
                                                                                        dataType: 'json',
                                                                                        success: function (result) {



                                                                                            // //Nếu có hơn 1 giá trị C, và có Diều kiện phụ (XP, DHD)
                                                                                            for (let i = 0; i < result.features.length;) {
                                                                                                if (result.features[i].attributes.DieuKienPhu == getCot) {
                                                                                                    if (getCot == "CA") { getGiaTriC = result.features[i].attributes.CA; }
                                                                                                    if (getCot == "CB1") { getGiaTriC = result.features[i].attributes.CB1; }
                                                                                                    if (getCot == "CB2") { getGiaTriC = result.features[i].attributes.CB2; }
                                                                                                    if (getCot == "CB3") { getGiaTriC = result.features[i].attributes.CB3; }
                                                                                                    i = result.features.length
                                                                                                } else {
                                                                                                    i++;
                                                                                                }
                                                                                                if (getGiaTriC == "") {
                                                                                                    if (getCot == "CA") { getGiaTriC = result.features[0].attributes.CA; }
                                                                                                    if (getCot == "CB1") { getGiaTriC = result.features[0].attributes.CB1; }
                                                                                                    if (getCot == "CB2") { getGiaTriC = result.features[0].attributes.CB2; }
                                                                                                    if (getCot == "CB3") { getGiaTriC = result.features[0].attributes.CB3; }
                                                                                                }

                                                                                            }
                                                                                            console.log("Giá trị C:"+getGiaTriC);
                                                                                            if(getGiaTriC==""){
                                                                                                alert("[Lỗi] Không xác định được: Giá trị C :(");
                                                                                                return false;
                                                                                            }
                                                                                            // if (result.features.length > 1) {
                                                                                            //     //Thì lấy theo Tình Trạng DN (XP, DHD)
                                                                                            //     console.log(result);
                                                                                            //     $.ajax({
                                                                                            //         url: layerCfg.url + '/query?where=MaQuyChuan%3D%27'+getMaQuyChuan+'%27+and+ThongSo%3D%27'+xThongSo+'%27+and+DieuKienPhu%3D%27'+getTinhTrangDN+'%27&outFields='+getCot+'&f=pjson',
                                                                                            //         type: 'get',
                                                                                            //         dataType: 'json',
                                                                                            //         success: function (result) {
                                                                                            //             //console.log("Giá trị: "+result.features[0].attributes.CA);
                                                                                            //             console.log(result);

                                                                                            //          }
                                                                                            //     });


                                                                                            // }




                                                                                            // for (let i = 0; i < result.fields.length; i++) {

                                                                                            // }

                                                                                            //Xác định cột------ danglam...........



                                                                                            //getGiaTriC=getTSo[xThongSo];
                                                                                            // console.log("GiaTriC:" + getGiaTriC);

                                                                                            // console.log(getMaQuyChuan);
                                                                                            // console.log(xThongSo);
                                                                                            // console.log(getTSo[xThongSo]);
                                                                                            // console.log(result);
                                                                                            // console.log(result.fields);
                                                                                            // console.log("-----------------");
                                                                                            // console.log("Tìm Kf...................")
                                                                                            //50 < F <= 500
                                                                                            //var F = xThongSo;
                                                                                            //Lấy Kq--------------
                                                                                            for (let layerCfg of app.activeView.systemVariable.user.Layers) {
                                                                                                if (layerCfg.id == constName.HESO_Kf) {
                                                                                                    $.ajax({
                                                                                                        url: layerCfg.url + '/query?where=MaQuyChuan%3D%27' + getMaQuyChuan + '%27&outFields=*&orderByFields=OBJECTID&f=pjson',
                                                                                                        type: 'get',
                                                                                                        dataType: 'json',
                                                                                                        success: function (result) {
                                                                                                            //Liệt kê "Điều kiện" tính để tìm Kf
                                                                                                            //console.log(result);
                                                                                                            for (let i = 0; i < result.features.length;) {
                                                                                                                //Đưa các "Điều kiện" 50 < F ≤ 500 vào để tìm ra Kf
                                                                                                                var F = getLuuLuongChatThai;

                                                                                                                if (eval(result.features[i].attributes.DieuKien)) {
                                                                                                                    // console.log(F);
                                                                                                                    getKf=result.features[i].attributes.Kf;
                                                                                                                    if(getKf==""){
                                                                                                                        alert("[Lỗi] Không xác định được: Kf :(");
                                                                                                                    }
                                                                                                                    console.log("Thông số Kf:"+result.features[i].attributes.Kf);
                                                                                                                    i = result.features.length;

                                                                                                                    //Tính Cmax CTL================
                                                                                                                    CMAX_CTL=getGiaTriC*getKf*getKq;
                                                                                                                    console.log("==================================");
                                                                                                                    console.log("Cmax CTL: "+CMAX_CTL);
                                                                                                                    console.log("Thông số quan trắc "+xThongSo+": "+getTSo[xThongSo]);
                                                                                                                    console.log("-------------------------");
                                                                                                                    
                                                                                                                    console.log("Lấy Cmax - Thông số quan trắc= "+(CMAX_CTL-getTSo[xThongSo]));
                                                                                                                    console.log("Nếu Dương là không vượt, Âm là vượt");
                                                                                                                    console.log("Chỉ cần có 1 thông số quan trắc vượt Cmax, thì update trạng trái Điểm Xả Thải đó thành Nguy Hiểm");

                                                                                                                    
                                                                                                                     
                                                                                                                }
                                                                                                                else {
                                                                                                                    if (i < result.features.length) {
                                                                                                                    
                                                                                                                        //console.log("Điều kiện so sánh ko trùng:" + result.features[i].attributes.DieuKien);
                                                                                                                        i++;
                                                                                                                    } else {
                                                                                                                        alert("Lỗi: Không tìm ra tham số Kf")
                                                                                                                    }

                                                                                                                }

                                                                                                            }
                                                                                                        }

                                                                                                    });
                                                                                                }
                                                                                            }




                                                                                            // var DieuKien = "(50<F)&&(F<=500)";
                                                                                            // if (DieuKien) {
                                                                                            //     alert("1.1");
                                                                                            // } else {
                                                                                            //     alert("khac");
                                                                                            // }

                                                                                        }

                                                                                    });

                                                                                }

                                                                                ///query?where=MaQuyChuan%3D%2719%27+and+ThongSo%3D%27SO2%27&outFields=*&f=pjson

                                                                            }

                                                                            // console.log(getTSo);
                                                                            // console.log(getTSo[1]);//

                                                                            //for(let i=0;i<)


                                                                            // $.ajax({
                                                                            //     url: layerCfg.url + '/query?where=MaNguonTiepNhan%3D%27' + getMaNguonTiepNhan + '%27&outFields=*&f=pjson',
                                                                            //     type: 'get',
                                                                            //     dataType: 'json',
                                                                            //     success: function (result) {
                                                                            //         // getCot = result.features[0].attributes.Cot;
                                                                            //         // getKq = result.features[0].attributes.Kq;

                                                                            //         console.log(getTSo);


                                                                            //         //console.log("Cot:"+getCot+"Kq:"+getKq);



                                                                            //     }
                                                                            // });
                                                                        }
                                                                    }

                                                                }
                                                            });
                                                        }
                                                    }


                                                }
                                            });
                                        }
                                    }



                                    alert("Đã thêm mới OBJECTID: " + r.addResults[0].objectId+" Bấm F12 vào Console xem kết quả Cmax");
                                });

                            //.then(r => console.log(r))
                        };
                    }

                }




                //Doanh nghiệp trong KCN/KKT Layer===============================
                if (layerCfg.groupLayer === constName.CHUYEN_DE_HT && layerCfg.permission.view && layerCfg.id == constName.DOANHNGHIEP_KCNKKT) {
                    let DOANHNGHIEP_KCNKKTLayer = new FeatureLayer(layerCfg);
                    gr.add(DOANHNGHIEP_KCNKKTLayer);


                    //opacity
                    //DOANHNGHIEP_KCNKKTLayer.opacity = 0.8;
                    dom.byId("optDN_KCNKKT").onchange = function () {
                        DOANHNGHIEP_KCNKKTLayer.opacity = dom.byId("optDN_KCNKKT").value;
                    };

                    /*
                    //scale when zoom========================
                    //var minDiemdautu=12;
                    var maxDN_KCNKKT = 14;
                    dom.byId("scaleDN_KCNKKT").onchange = function () {
                        maxDN_KCNKKT = dom.byId("scaleDN_KCNKKT").value;
                    };
                    watchUtils.whenTrue(app.mapView, "stationary", function () {
                        //if (editExpand) {

                        if (app.mapView.zoom < maxDN_KCNKKT) {
                            DOANHNGHIEP_KCNKKTLayer.visible = false;
                            //alert("fgfg");
                        } else {
                            DOANHNGHIEP_KCNKKTLayer.visible = true;
                        }

                        // if (app.mapView.zoom < 10 || app.mapView.zoom > 12) {
                        //     dom.byId("chk_nenHanhchinhhuyen").disabled = true;
                        // } else {
                        //     dom.byId("chk_nenHanhchinhhuyen").disabled = false;
                        // }


                    });
                    */

                    //MenuGoto==================================================
                    dom.byId("menuKhucongnghiep").onclick = function () {
                        let queryItems = DOANHNGHIEP_KCNKKTLayer.createQuery();
                        queryItems.where = '';// + iditem;
                        queryItems.orderByFields = 'OBJECTID ASC';
                        queryItems.outSpatialReference = app.activeView.spatialReference;
                        queryItems.returnGeometry = true;
                        DOANHNGHIEP_KCNKKTLayer.queryFeatures(queryItems).then(results => {


                            var itemCoSoKinhDoanh = "";

                            for (var i = 0; i < results.features.length; i++) {
                                itemCoSoKinhDoanh += "<tr id='" + results.features[i].attributes.OBJECTID + "' role='button'><td><span class='esri-icon-organization'></span>&nbsp;&nbsp;" + results.features[i].attributes.TenCSKD + "</td></tr>";
                            }
                            dom.byId("menuitemCoSoKinhDoanh").innerHTML = '<table id="tableitemCoSoKinhDoanh"><tbody>' + itemCoSoKinhDoanh + '</tbody></table>';

                            dom.byId("tableitemCoSoKinhDoanh").onclick = function (e) {
                                let id = e.path[1].id;
                                let query = DOANHNGHIEP_KCNKKTLayer.createQuery();
                                query.where = 'OBJECTID = ' + id;
                                query.outSpatialReference = app.activeView.spatialReference;
                                query.returnGeometry = true;
                                DOANHNGHIEP_KCNKKTLayer.queryFeatures(query).then(results => {
                                    app.activeView.popup.open({
                                        features: results.features,
                                        updateLocationEnabled: true
                                    });

                                });

                            };

                        });
                    };
                    //================================


                    // on/off layer
                    /*
                    var DOANHNGHIEP_KCNKKTToggle = dom.byId("chx_DN_KCNKKT");
                    on(DOANHNGHIEP_KCNKKTToggle, "change", function () {
                        DOANHNGHIEP_KCNKKTLayer.visible = DOANHNGHIEP_KCNKKTToggle.checked;
                    });
                    */

                    //chu thich loai dat
                    var legend = new Legend({
                        view: app.activeView,
                        layerInfos: [{
                            layer: DOANHNGHIEP_KCNKKTLayer,
                            title: "Chú thích loại đất trong KCN/KKT:"
                        }], container: "LegendPanelDiv"
                    });





                    //Create===========================
                    if (layerCfg.permission.create) {

                        dom.byId("divaddDoanhnghiepKCNKKT").innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a role="button" data-target="#panelAddDoanhnghiepKCNKKT" aria-haspopup="true" onclick="return panelAddDoanhnghiepKCNKKTShow();"><span class="esri-icon-plus-circled"></span><strong> Thêm mới Cơ Sở Kinh Doanh</strong></a><br /><br /><legend></legend>';

                        const graphicsLayer = new GraphicsLayer({
                            id: "tempGraphics"
                        });

                        //cteate point===============================
                        const pointSymbol = {
                            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                            style: "square",
                            color: "#8A2BE2",
                            size: "16px",
                            outline: { // autocasts as new SimpleLineSymbol()
                                color: [255, 255, 255],
                                width: 3
                            }
                        };

                        const polygonSymbol = {
                            type: "simple-fill", // autocasts as new SimpleFillSymbol()
                            color: "rgba(138,43,226, 0.8)",
                            style: "solid",
                            outline: {
                                color: "white",
                                width: 1
                            }
                        };


                        // const sketchViewModel = new SketchViewModel({
                        //     view,
                        //     layer: graphicsLayer,
                        //     pointSymbol//,
                        //     // polylineSymbol,
                        //     // polygonSymbol
                        //   });

                        const sketchViewModel = new SketchViewModel({
                            view: app.activeView,
                            layer: graphicsLayer,
                            pointSymbol
                            //polygonSymbol
                        });

                        setUpClickHandler();
                        // Listen to create-complete event to add a newly created graphic to view
                        sketchViewModel.on("create-complete", addGraphic);



                        // set up logic to handle geometry update and reflect the update on "graphicsLayer"
                        function setUpClickHandler() {

                            app.activeView.on("click", function (event) {

                                app.activeView.hitTest(event).then(function (response) {

                                    var results = response.results;

                                    if (results.length > 0) {
                                        for (var i = 0; i < results.length; i++) {
                                            // Check if we're already editing a graphic

                                            console.log(results[i].graphic.layer.id);

                                            //if (!editGraphic && results[i].graphic.layer.id === "tempGraphics") {
                                            if (results[i].graphic.layer.id === "tempGraphics") {
                                                // Save a reference to the graphic we intend to update

                                                editGraphic = results[i].graphic;

                                                // Remove the graphic from the GraphicsLayer
                                                // Sketch will handle displaying the graphic while being updated
                                                graphicsLayer.remove(editGraphic);
                                                sketchViewModel.update(editGraphic);
                                                break;
                                            }

                                        }
                                    }
                                });
                            });
                        }





                        sketchViewModel.on("create", addGraphic);


                        function applyEdits(params) {

                            //unselectFeature();
                            var promise = DOANHNGHIEP_KCNKKTLayer.applyEdits(params);


                            //Tra form lại null 
                            //gdt1

                            // dom.byId("adddnkcnkktToBD").value = "";
                            // dom.byId("adddnkcnkktThuaBD").value = "";
                            // dom.byId("adddnkcnkktToadoVN2000").value = "";
                            // dom.byId("adddnkcnkktTenCSD").value = "";
                            // dom.byId("adddnkcnkktLoaiDat").value = "";
                            // dom.byId("adddnkcnkktMaDat").value = "";
                            // dom.byId("adddnkcnkktNganhNghe").value = "";
                            // dom.byId("adddnkcnkktTenLoaiDat").value = "";
                            // dom.byId("adddnkcnkktGCNDKDN").value = "";
                            // dom.byId("adddnkcnkktDiaChiTruSoChinh").value = "";
                            // dom.byId("adddnkcnkktDienThoai").value = "";
                            // dom.byId("adddnkcnkktEmail").value = "";
                            // dom.byId("adddnkcnkktViTriDaThue").value = "";
                            // dom.byId("adddnkcnkktQuyMoCongSuat").value = "";
                            // dom.byId("adddnkcnkktTongVonDauTu").value = "";
                            // dom.byId("adddnkcnkktTongsoLDTrongNuoc").value = "";
                            // dom.byId("adddnkcnkktTongsoLDNuocNgoai").value = "";
                            // dom.byId("adddnkcnkktMatDoXayDungToiDa").value = "";
                            // dom.byId("adddnkcnkktDoCaoTang").value = "";
                            // dom.byId("adddnkcnkktFax").value = "";
                            // dom.byId("adddnkcnkktmauDienTichDatDaThue_text").value = "";





                            editResultsHandler(promise);

                        }

                        function editResultsHandler(promise) {
                            promise
                                .then(function (editsResult) {
                                    var extractObjectId = function (result) {
                                        return result.objectId;
                                    };

                                    // get the objectId of the newly added feature
                                    if (editsResult.addFeatureResults.length > 0) {
                                        var adds = editsResult.addFeatureResults.map(extractObjectId);
                                        newIncidentId = adds[0];

                                        selectFeature(newIncidentId);
                                    }
                                })
                                .catch(function (error) {
                                    console.log("===============================================");
                                    console.error("[ applyEdits ] FAILURE: ", error.code, error.name, error.message);
                                    console.log("error = ", error);
                                    alert("Có lỗi xảy ra! :(")
                                });
                        }


                        function selectFeature(objectId) {

                            // symbol for the selected feature on the view
                            /*
                            var selectionSymbol = {
                              type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                              color: [0, 0, 0, 0],
                              style: "square",
                              size: "40px",
                              outline: {
                                color: [0, 255, 255, 1],
                                width: "3px"
                              }
                            };
                            */

                            var query = DOANHNGHIEP_KCNKKTLayer.createQuery();

                            query.where = DOANHNGHIEP_KCNKKTLayer.objectIdField + " = " + objectId;

                            DOANHNGHIEP_KCNKKTLayer.queryFeatures(query).then(function (results) {
                                if (results.features.length > 0) {
                                    editFeature = results.features[0];

                                    editFeature.symbol = selectionSymbol;
                                    view.graphics.add(editFeature);

                                }
                            });


                        }



                        // function addGraphic(event) {
                        //     // Create a new graphic and set its geometry to
                        //     // `create-complete` event geometry.
                        //     const graphic = new Graphic({
                        //       geometry: event.geometry,
                        //       symbol: sketchViewModel.graphic.symbol
                        //     });
                        //     graphicsLayer.add(graphic);
                        //   }





                        let graphic;
                        function addGraphic(event) {

                            // Create a new graphic and set its geometry to
                            // `create-complete` event geometry.
                            graphic = new Graphic({
                                geometry: event.geometry,
                                symbol: sketchViewModel.graphic.symbol
                            });

                            graphicsLayer.add(graphic);

                            map.add(graphicsLayer);

                            //luu tamj
                            var edits = {

                                addFeatures: [graphic]
                            };

                            applyEdits(edits);
                            //heheheeeee


                            var cmbTinhtrangDN = "";//12
                            for (var cbTT = 0; cbTT < DOANHNGHIEP_KCNKKTLayer.fields[12].domain.codedValues.length; cbTT++) {
                                cmbTinhtrangDN += '<option value="' + DOANHNGHIEP_KCNKKTLayer.fields[12].domain.codedValues[cbTT].code + '">' + DOANHNGHIEP_KCNKKTLayer.fields[12].domain.codedValues[cbTT].name + '</option>';
                            }
                            dom.byId("addcskdTinhTrangDN").innerHTML = cmbTinhtrangDN;

                            var cmbLoaiHinhDN = "";//14
                            for (var cbKD = 0; cbKD < DOANHNGHIEP_KCNKKTLayer.fields[14].domain.codedValues.length; cbKD++) {
                                cmbLoaiHinhDN += '<option value="' + DOANHNGHIEP_KCNKKTLayer.fields[14].domain.codedValues[cbKD].code + '">' + DOANHNGHIEP_KCNKKTLayer.fields[14].domain.codedValues[cbKD].name + '</option>';
                            }
                            dom.byId("addcskdLoaiHinhDN").innerHTML = cmbLoaiHinhDN;

                            var cmbNganhKT = "";//14
                            for (var cbKT = 0; cbKT < DOANHNGHIEP_KCNKKTLayer.fields[15].domain.codedValues.length; cbKT++) {
                                cmbNganhKT += '<option value="' + DOANHNGHIEP_KCNKKTLayer.fields[15].domain.codedValues[cbKD].code + '">' + DOANHNGHIEP_KCNKKTLayer.fields[15].domain.codedValues[cbKT].name + '</option>';
                            }
                            dom.byId("addcskdNganhKinhTe").innerHTML = cmbNganhKT;

                            //Hien thi Form nhap
                            dom.byId("AddDoanhnghiepKCNKKTUpdateDiv").style.display = "block";
                        }





                        document.getElementById("pointButtonDNKCNKKT").onclick = function () {


                            // set the sketch to create a polygon geometry
                            sketchViewModel.create("point");
                            map.add(graphicsLayer);
                            //setActiveButton(this);
                        };


                        var savePolygonButton = document.getElementById("polygonDoanhnghiepKCNKKTSave");
                        savePolygonButton.onclick = function () {



                            if (editFeature) {

                                editFeature.attributes["MaCSKD"] = dom.byId("addcskdMaCSKD").value.trim();
                                editFeature.attributes["MaSoKD"] = dom.byId("addcskdMaSoKD").value.trim();
                                editFeature.attributes["MaPhuongXa"] = dom.byId("addcskdMaPhuongXa").value.trim();
                                editFeature.attributes["MaHuyenTP"] = dom.byId("addcskdMaHuyenTP").value.trim();
                                editFeature.attributes["MaDuong"] = dom.byId("addcskdMaDuong").value.trim();
                                editFeature.attributes["NguoiCapNhat"] = dom.byId("addcskdNguoiCapNhat").value.trim();
                                editFeature.attributes["TGCapNhat"] = Date.parse(dom.byId("addcskdTGCapNhat").value.trim());
                                editFeature.attributes["NguoiTao"] = dom.byId("addcskdNguoiTao").value.trim();
                                editFeature.attributes["TGKinhDoanh"] = Date.parse(dom.byId("addcskdTGKinhDoanh").value.trim());
                                editFeature.attributes["TGKetThucKinhDoanh"] = Date.parse(dom.byId("addcskdTGKetThucKinhDoanh").value.trim());
                                editFeature.attributes["TinhTrangDN"] = dom.byId("addcskdTinhTrangDN").value.trim();
                                editFeature.attributes["TenCSKD"] = dom.byId("addcskdTenCSKD").value.trim();
                                editFeature.attributes["LoaiHinhDN"] = dom.byId("addcskdLoaiHinhDN").value.trim();
                                editFeature.attributes["NganhKinhTe"] = dom.byId("addcskdNganhKinhTe").value.trim();
                                editFeature.attributes["SoDienThoai"] = dom.byId("addcskdSoDienThoai").value.trim();
                                editFeature.attributes["DiaChiTruSo"] = dom.byId("addcskdDiaChiTruSo").value.trim();
                                editFeature.attributes["ChuSoHuu"] = dom.byId("addcskdChuSoHuu").value.trim();
                                editFeature.attributes["NguoiDaiDien"] = dom.byId("addcskdNguoiDaiDien").value.trim();
                                editFeature.attributes["MaSoThue"] = dom.byId("addcskdMaSoThue").value.trim();
                                editFeature.attributes["SoLanViPham"] = parseInt(dom.byId("addcskdSoLanViPham").value.trim());
                                editFeature.attributes["KhuVucSanXuat"] = dom.byId("addcskdKhuVucSanXuat").value.trim();
                                editFeature.attributes["DiaDiemHoatDong"] = dom.byId("addcskdDiaDiemHoatDong").value.trim();
                                editFeature.attributes["SoLuongNhanVien"] = parseInt(dom.byId("addcskdSoLuongNhanVien").value.trim());
                                editFeature.attributes["LoaiHinhHoatDong"] = dom.byId("addcskdLoaiHinhHoatDong").value.trim();
                                editFeature.attributes["CongSuatThietKe"] = dom.byId("addcskdCongSuatThietKe").value.trim();
                                editFeature.attributes["HoaChatSuDung"] = dom.byId("addcskdHoaChatSuDung").value.trim();
                                editFeature.attributes["NhienLieuSuDung"] = dom.byId("addcskdNhienLieuSuDung").value.trim();
                                editFeature.attributes["LuongNuocSuDung"] = dom.byId("addcskdLuongNuocSuDung").value.trim();
                                editFeature.attributes["ThuTucMoiTruong"] = dom.byId("addcskdThuTucMoiTruong").value.trim();
                                editFeature.attributes["SoThuTucMoiTruong"] = dom.byId("addcskdSoThuTucMoiTruong").value.trim();





                                var edits = {
                                    updateFeatures: [editFeature]
                                };

                                applyEdits(edits);
                            }



                            graphicsLayer.removeAll();
                            //setActiveButton(this);

                            dom.byId("AddDoanhnghiepKCNKKTUpdateDiv").style.display = "none";


                        };


                        on(dom.byId("polygonDoanhnghiepKCNKKTDelete"), "click", function () {
                            var edits = {
                                deleteFeatures: [editFeature]
                            };
                            applyEdits(edits);
                            graphicsLayer.removeAll();
                        });

                        //**************
                        // reset button
                        //**************
                        /*
                        document.getElementById("resetBtn").onclick = function () {
                            sketchViewModel.reset();
                            tempGraphicsLayer.removeAll();
                            //setActiveButton();
                        };
    */
                        //-------------------------------------------------------------------------

                        let X = XLSX;
                        let process_wb = (function () {
                            //var OUT = document.getElementById('out');

                            let to_json = function to_json(workbook) {

                                let result = {};
                                workbook.SheetNames.forEach(function (sheetName) {
                                    let roa = X.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: true });



                                    // Create a symbol for rendering the graphic
                                    let fillSymbol = {
                                        type: "simple-fill", // autocasts as new SimpleFillSymbol()
                                        color: [227, 139, 79, 0.8],
                                        outline: { // autocasts as new SimpleLineSymbol()
                                            color: [255, 255, 255],
                                            width: 1
                                        }
                                    };

                                    for (let xl = 0; xl < roa.length; xl++) {

                                        let pointExcel = (roa[xl]["Tọa độ"]).split(",");//[roa[0]["Tọa độ VN2000"]];
                                        // console.log(pointExcel[0]);



                                        // let ringsPolygon = [];

                                        // for (let x = 0; x < ringsExcel.length; x++) {

                                        //     ringsPolygon[x] = [ringsExcel[x].split(" ")[0], ringsExcel[x].split(" ")[1]];
                                        // }


                                        //1. google    

                                        let point = {
                                            type: "point", // autocasts as new Point()
                                            longitude: parseFloat(pointExcel[0]),
                                            latitude: parseFloat(pointExcel[1])
                                            //107.08461386383026, 10.367653315463448
                                        };

                                        // // 1. vn2000
                                        // let point = new Point({
                                        //     longitude: parseFloat(pointExcel[0]),
                                        //     latitude: parseFloat(pointExcel[1]),
                                        //     spatialReference: {
                                        //         wkt: 'PROJCS["VN_2000_KT108-15_3deg",GEOGCS["GCS_VN_2000",DATUM["D_Vietnam_2000",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",108.25],PARAMETER["Scale_Factor",0.9999],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]',
                                        //     }
                                        // });

                                        // //2. vn2000
                                        // let projectParameters = new ProjectParameters({
                                        //     geometries: point, outSpatialReference: app.activeView.spatialReference
                                        // });


                                        /*
                                        
                                                                                this.geometryService.project(projectParameters).then((e) => {
                                                                                    const geometry = e[0];
                                        
                                                                                    let polygonGraphic = new Graphic({
                                                                                        geometry,
                                                                                        symbol: fillSymbol
                                                                                    });
                                        
                                                                                    graphicsLayer.add(polygonGraphic);
                                        
                                                                                    polygonGraphic.attributes = {
                                                                                        ToBD: roa[xl]["Tên KCN/KKT"],
                                                                                        TenCSD: roa[xl]["Tên doanh nghiệp / Chủ sử dụng"],
                                                                                        mauGiayChungNhanDangKyDN: roa[xl]["GCN đăng ký doanh nghiệp"],
                                                                                        NganhNghe: roa[xl]["Ngành nghề"],
                                                                                        tenLoaiDat: roa[xl]["Loại đất"]
                                        
                                                                                    };
                                        
                                                                                    let edits = {
                                        
                                                                                        addFeatures: [polygonGraphic]
                                                                                    };
                                        
                                                                                    applyEdits(edits);
                                        
                                                                                }
                                        
                                                                                );
                                        
                                        */



















                                        // Create a graphic and add the geometry and symbol to it
                                        var pointGraphic = new Graphic({
                                            geometry: point//,
                                            //symbol: pointSymbol
                                        });



                                        graphicsLayer.add(pointGraphic);

                                        let domainTinhTrangDN = "";
                                        for (let xTT = 0; xTT < DOANHNGHIEP_KCNKKTLayer.fields[12].domain.codedValues.length; xTT++) {
                                            if (roa[xl]["Tình trạng DN"] === DOANHNGHIEP_KCNKKTLayer.fields[12].domain.codedValues[xTT].name) {
                                                domainTinhTrangDN = DOANHNGHIEP_KCNKKTLayer.fields[12].domain.codedValues[xTT].code;
                                            }
                                        }

                                        let domainLoaiHinhDN = "";//14
                                        for (let xLH = 0; xLH < DOANHNGHIEP_KCNKKTLayer.fields[14].domain.codedValues.length; xLH++) {
                                            if (roa[xl]["Loại hình DN"] === DOANHNGHIEP_KCNKKTLayer.fields[14].domain.codedValues[xLH].name) {
                                                domainLoaiHinhDN = DOANHNGHIEP_KCNKKTLayer.fields[14].domain.codedValues[xLH].code;
                                            }
                                        }

                                        let domainNganhKinhTe = "";//15
                                        for (let xKT = 0; xKT < DOANHNGHIEP_KCNKKTLayer.fields[15].domain.codedValues.length; xKT++) {
                                            if (roa[xl]["Ngành kinh tế"] === DOANHNGHIEP_KCNKKTLayer.fields[15].domain.codedValues[xKT].name) {
                                                domainNganhKinhTe = DOANHNGHIEP_KCNKKTLayer.fields[15].domain.codedValues[xKT].code;
                                            }
                                        }



                                        pointGraphic.attributes = {
                                            MaCSKD: roa[xl]["Mã CSKD"],
                                            MaSoKD: roa[xl]["Mã số KD"],
                                            MaPhuongXa: roa[xl]["Phường/Xã"],
                                            MaHuyenTP: roa[xl]["Huyện/TP"],
                                            MaDuong: roa[xl]["Mã Đường"],
                                            NguoiCapNhat: roa[xl]["Người Cập Nhật"],
                                            //TGCapNhat: roa[xl]["Thời Gian Cập Nhật"],
                                            TGCapNhat: Date.parse(roa[xl]["Thời Gian Cập Nhật"]),
                                            NguoiTao: roa[xl]["Người Tạo"],
                                            TGTao: Date.parse(roa[xl]["Thời Gian Tạo"]),
                                            TGKinhDoanh: Date.parse(roa[xl]["Thời gian Kinh Doanh"]),
                                            TGKetThucKinhDoanh: Date.parse(roa[xl]["Thời gian kết thúc KD"]),
                                            TinhTrangDN: domainTinhTrangDN,


                                            TenCSKD: roa[xl]["Tên Cơ sở KD"],
                                            LoaiHinhDN: domainLoaiHinhDN,
                                            NganhKinhTe: domainNganhKinhTe,
                                            SoDienThoai: roa[xl]["Số điện thoại"],
                                            DiaChiTruSo: roa[xl]["Địa chỉ trụ sở chính"],
                                            ChuSoHuu: roa[xl]["Chủ sở hửu"],
                                            NguoiDaiDien: roa[xl]["Người đại diện"],
                                            MaSoThue: roa[xl]["Mã số thuế"],
                                            SoLanViPham: parseInt(roa[xl]["Số lần vi phạm"]),
                                            KhuVucSanXuat: roa[xl]["Khu vực sản xuất"],
                                            DiaDiemHoatDong: roa[xl]["Địa chỉ hoạt động"],
                                            SoLuongNhanVien: parseInt(roa[xl]["Số lượng nhân viên"]),
                                            LoaiHinhHoatDong: roa[xl]["Loại hình hoạt động"],
                                            CongSuatThietKe: roa[xl]["Công suất thiết kế"],
                                            HoaChatSuDung: roa[xl]["Hóa chất sử dụng"],
                                            NhienLieuSuDung: roa[xl]["Nhiên liệu sử dụng"],
                                            LuongNuocSuDung: roa[xl]["Lượng nước sử dụng"],
                                            ThuTucMoiTruong: roa[xl]["Thủ tục môi trường"],
                                            SoThuTucMoiTruong: roa[xl]["Số thủ tục môi trường"]
                                        };


                                        let edits = {

                                            addFeatures: [pointGraphic]
                                        };

                                        applyEdits(edits);


                                        //hehe đang chuyển từ polygon sang point.....

                                        /*
                                        let polygon = new Polygon({
                                            rings: [ringsPolygon],
                                            spatialReference: {
                                                wkt: 'PROJCS["VN_2000_KT108-15_3deg",GEOGCS["GCS_VN_2000",DATUM["D_Vietnam_2000",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",108.25],PARAMETER["Scale_Factor",0.9999],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]',
                                            }
                                        });


                                        let projectParameters = new ProjectParameters({
                                            geometries: [polygon], outSpatialReference: app.activeView.spatialReference
                                        });

                                        this.geometryService.project(projectParameters).then((e) => {
                                            const geometry = e[0];

                                            let polygonGraphic = new Graphic({
                                                geometry,
                                                symbol: fillSymbol
                                            });

                                            graphicsLayer.add(polygonGraphic);

                                            polygonGraphic.attributes = {
                                                ToBD: roa[xl]["Tên KCN/KKT"],
                                                TenCSD: roa[xl]["Tên doanh nghiệp / Chủ sử dụng"],
                                                mauGiayChungNhanDangKyDN: roa[xl]["GCN đăng ký doanh nghiệp"],
                                                NganhNghe: roa[xl]["Ngành nghề"],
                                                tenLoaiDat: roa[xl]["Loại đất"]

                                            };

                                            let edits = {

                                                addFeatures: [polygonGraphic]
                                            };

                                            applyEdits(edits);

                                        }

                                        );
                                        */
                                        //==================================================


                                        document.getElementById('filenameExcelDN_KCNKKT').innerHTML = document.getElementById('xlfDN_KCNKKT').value.replace(/^.*[\\\/]/, '');
                                    }
                                    document.getElementById('xlfDN_KCNKKT').value = "";
                                    alert("Đã thêm " + roa.length + " dòng dữ liệu!")


                                    //--------

                                    //if (roa.length) result[sheetName] = roa;
                                });
                                return JSON.stringify(result, 2, 2);
                            };

                            return function process_wb(wb) {
                                let output = to_json(wb);

                            };

                        })();


                        let do_file = (function () {

                            let rABS = typeof FileReader !== "undefined" && (FileReader.prototype || {}).readAsBinaryString;
                            return function do_file(files) {
                                let f = files[0];
                                let reader = new FileReader();
                                reader.onload = function (e) {
                                    let data = e.target.result;
                                    if (!rABS) data = new Uint8Array(data);
                                    else process_wb(X.read(data, { type: rABS ? 'binary' : 'array' }));
                                };

                                if (dom.byId('xlfDN_KCNKKT').value != "") {
                                    reader.readAsBinaryString(f);
                                }
                                //if (rABS) reader.readAsBinaryString(f);

                            };
                        })();


                        (function () {
                            let xlf = document.getElementById('xlfDN_KCNKKT');
                            function handleFile(e) { do_file(e.target.files); }
                            xlf.addEventListener('change', handleFile, false);


                        })();








                    }



                }



                //DIEMXATHAI Layer===============================

                if (layerCfg.groupLayer === constName.CHUYEN_DE_HT && layerCfg.permission.view && layerCfg.id == constName.DIEMXATHAI) {
                    let DIEMXATHAILayer = new FeatureLayer(layerCfg);
                    DIEMXATHAI_LYR = layerCfg.url;

                    gr.add(DIEMXATHAILayer);

                    //opacity
                    // DIEMDAUTULayer.opacity = 0.4;
                    dom.byId("optDiemdautu").onchange = function () {
                        DIEMXATHAILayer.opacity = dom.byId("optDiemdautu").value;
                    };

                    /*
                    //scale when zoom========================
                    //var minDiemdautu=12;
                    var maxDiemdautu = 10;
                    dom.byId("scaleDiemdautu").onchange = function () {
                        maxDiemdautu = dom.byId("scaleDiemdautu").value;
                    };
                    watchUtils.whenTrue(app.mapView, "stationary", function () {
                        //if (editExpand) {
                        if (app.mapView.zoom < maxDiemdautu) {
                            DIEMDAUTULayer.visible = false;
                            //alert("fgfg");
                        } else {
                            DIEMDAUTULayer.visible = true;
                        }
                        // if (app.mapView.zoom < 10 || app.mapView.zoom > 12) {
                        //     dom.byId("chk_nenHanhchinhhuyen").disabled = true;
                        // } else {
                        //     dom.byId("chk_nenHanhchinhhuyen").disabled = false;
                        // }
                    });
                    */







                    //MenuGoto==================================================
                    dom.byId("menuDiemDautu").onclick = function () {

                        let queryItems = DIEMXATHAILayer.createQuery();
                        queryItems.where = '';// + iditem;
                        queryItems.orderByFields = 'OBJECTID ASC';
                        queryItems.outSpatialReference = app.activeView.spatialReference;
                        queryItems.returnGeometry = true;

                        DIEMXATHAILayer.queryFeatures(queryItems).then(results => {


                            var itemDiemxathai = "";

                            for (var i = 0; i < results.features.length; i++) {
                                itemDiemxathai += "<tr id='" + results.features[i].attributes.OBJECTID + "' role='button'><td><span class='esri-icon-map-pin'></span>&nbsp;&nbsp;" + results.features[i].attributes.MaDXT + "</td></tr>";
                            }
                            dom.byId("menuitemDiemdautu").innerHTML = '<table id="tableitemDiemdautu"><tbody>' + itemDiemxathai + '</tbody></table>';

                            dom.byId("tableitemDiemdautu").onclick = function (e) {
                                let id = e.path[1].id;
                                let query = DIEMXATHAILayer.createQuery();
                                query.where = 'OBJECTID = ' + id;
                                query.outSpatialReference = app.activeView.spatialReference;
                                query.returnGeometry = true;
                                DIEMXATHAILayer.queryFeatures(query).then(results => {
                                    app.activeView.popup.open({
                                        features: results.features,
                                        updateLocationEnabled: true
                                    });

                                });

                            };

                        });
                    };
                    //================================



                    // on/off layer=================
                    /*
                    var DIEMDAUTUToggle = dom.byId("chx_Diemdautu");
                    on(DIEMDAUTUToggle, "change", function () {
                        DIEMDAUTULayer.visible = DIEMDAUTUToggle.checked;
                    });
                    */





                    //Create===========================
                    if (layerCfg.permission.create) {

                        dom.byId("divaddDiemdautu").innerHTML = '<a role="button" data-target="#panelAddDiemdautu" aria-haspopup="true" onclick="return panelAddDiemdautuShow();"><span class="esri-icon-plus-circled"></span><strong> Thêm mới Điểm Xả Thải</strong></a><br /><br /><legend></legend>';

                        const graphicsLayer = new GraphicsLayer({
                            id: "tempGraphics"
                        });

                        const polygonSymbol = {
                            type: "simple-fill", // autocasts as new SimpleFillSymbol()
                            color: "rgba(138,43,226, 0.8)",
                            style: "solid",
                            outline: {
                                color: "white",
                                width: 1
                            }
                        };
                        const sketchViewModel = new SketchViewModel({
                            view: app.activeView,
                            layer: graphicsLayer,

                            polygonSymbol
                        });


                        sketchViewModel.on("create-complete", addGraphic);


                        function applyEdits(params) {
                            //alert("add vao diem dau tu");
                            //unselectFeature();
                            var promise = DIEMXATHAILayer.applyEdits(params);


                            //Tra form lại null
                            dom.byId("inputTenDiem").value = "";
                            dom.byId("inputDiaDiem").value = "";
                            dom.byId("inputTinhTrangDauTu").value = "Đang thu hút";
                            dom.byId("inputMoTa").value = "";
                            dom.byId("inputToadoVN2000").value = "";
                            dom.byId("inputMuctieuduan").value = "";
                            dom.byId("inputQuymoduan").value = "";
                            dom.byId("inputTongmucdautudukien").value = "";
                            dom.byId("inputQuyhoachsudungdat").value = "";
                            dom.byId("inputChinhsachuudai").value = "";
                            dom.byId("inputHieuquadautu").value = "";
                            dom.byId("inputLienhe").value = "";
                            dom.byId("inputDientich").value = "";



                            editResultsHandler(promise);

                        }

                        function editResultsHandler(promise) {
                            promise
                                .then(function (editsResult) {
                                    var extractObjectId = function (result) {
                                        return result.objectId;
                                    };

                                    // get the objectId of the newly added feature
                                    if (editsResult.addFeatureResults.length > 0) {
                                        var adds = editsResult.addFeatureResults.map(extractObjectId);
                                        newIncidentId = adds[0];

                                        selectFeature(newIncidentId);
                                    }

                                })
                                .catch(function (error) {
                                    console.log("===============================================");
                                    console.error("[ applyEdits ] FAILURE: ", error.code, error.name, error.message);
                                    console.log("error = ", error);
                                    alert("Có lỗi xảy ra! :(")
                                });
                        }


                        function selectFeature(objectId) {

                            graphicsLayer.removeAll();

                            // symbol for the selected feature on the view
                            /*
                            var selectionSymbol = {
                              type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                              color: [0, 0, 0, 0],
                              style: "square",
                              size: "40px",
                              outline: {
                                color: [0, 255, 255, 1],
                                width: "3px"
                              }
                            };
                            */

                            var query = DIEMXATHAILayer.createQuery();

                            query.where = DIEMXATHAILayer.objectIdField + " = " + objectId;

                            DIEMXATHAILayer.queryFeatures(query).then(function (results) {



                                if (results.features.length > 0) {

                                    editFeature = results.features[0];


                                    editFeature.symbol = selectionSymbol;

                                    view.graphics.add(editFeature);

                                    //hehehe

                                }
                            });



                        }



                        let graphic;
                        function addGraphic(event) {
                            // Create a new graphic and set its geometry to
                            // `create-complete` event geometry.
                            graphic = new Graphic({
                                geometry: event.geometry,
                                symbol: sketchViewModel.graphic.symbol
                            });

                            graphicsLayer.add(graphic);

                            map.add(graphicsLayer);

                            //luu tamj
                            var edits = {

                                addFeatures: [graphic]
                            };

                            applyEdits(edits);


                            dom.byId("AddDiemdautuUpdateDiv").style.display = "block";
                        }













                        var drawPolygonButton = document.getElementById("polygonButton");
                        drawPolygonButton.onclick = function () {
                            // set the sketch to create a polygon geometry
                            sketchViewModel.create("polygon");
                            map.add(graphicsLayer);
                            //setActiveButton(this);
                        };


                        var savePolygonButton = document.getElementById("polygonDiemdautuSave");
                        savePolygonButton.onclick = function () {
                            if (editFeature) {
                                editFeature.attributes["TenDiem"] = dom.byId("inputTenDiem").value;
                                editFeature.attributes["DiaDiem"] = dom.byId("inputDiaDiem").value;
                                editFeature.attributes["TinhTrangDauTu"] = dom.byId("inputTinhTrangDauTu").value;
                                editFeature.attributes["MoTa"] = dom.byId("inputMoTa").value;
                                editFeature.attributes["ToadoVN2000"] = dom.byId("inputToadoVN2000").value;
                                editFeature.attributes["MucTieuDuAn"] = dom.byId("inputMuctieuduan").value;
                                editFeature.attributes["QuyMoDuAn"] = dom.byId("inputQuymoduan").value;
                                editFeature.attributes["TongMucDauTuDuKien"] = dom.byId("inputTongmucdautudukien").value;
                                editFeature.attributes["QuyHoachSuDungDat"] = dom.byId("inputQuyhoachsudungdat").value;
                                editFeature.attributes["ChinhSachUuDai"] = dom.byId("inputChinhsachuudai").value;
                                editFeature.attributes["HieuQuaDauTu"] = dom.byId("inputHieuquadautu").value;
                                editFeature.attributes["LienHe"] = dom.byId("inputLienhe").value;
                                editFeature.attributes["DienTich"] = dom.byId("inputDientich").value;





                                var edits = {
                                    updateFeatures: [editFeature]
                                };

                                applyEdits(edits);
                            }






                            graphicsLayer.removeAll();
                            //setActiveButton(this);

                            dom.byId("AddDiemdautuUpdateDiv").style.display = "none";


                        };


                        on(dom.byId("polygonDiemdautuDelete"), "click", function () {
                            var edits = {
                                deleteFeatures: [editFeature]
                            };
                            applyEdits(edits);
                            graphicsLayer.removeAll();
                        });

                        //**************
                        // reset button
                        //**************
                        /*
                        document.getElementById("resetBtn").onclick = function () {
                            sketchViewModel.reset();
                            tempGraphicsLayer.removeAll();
                            //setActiveButton();
                        };
    */
                        //-------------------------------------------------------------------------

                        let X = XLSX;
                        let process_wb = (function () {
                            //var OUT = document.getElementById('out');

                            let to_json = function to_json(workbook) {

                                let result = {};
                                workbook.SheetNames.forEach(function (sheetName) {
                                    let roa = X.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: true });


                                    // Create a symbol for rendering the graphic
                                    let fillSymbol = {
                                        type: "simple-fill", // autocasts as new SimpleFillSymbol()
                                        color: [227, 139, 79, 0.8],
                                        outline: { // autocasts as new SimpleLineSymbol()
                                            color: [255, 255, 255],
                                            width: 1
                                        }
                                    };

                                    for (let xl = 0; xl < roa.length; xl++) {

                                        let ringsExcel = (roa[xl]["Tọa độ VN2000"]).split(", ");//[roa[0]["Tọa độ VN2000"]];
                                        let ringsPolygon = [];
                                        for (let x = 0; x < ringsExcel.length; x++) {

                                            ringsPolygon[x] = [ringsExcel[x].split(" ")[0], ringsExcel[x].split(" ")[1]];
                                        }



                                        let polygon = new Polygon({
                                            rings: [ringsPolygon],
                                            spatialReference: {
                                                wkt: 'PROJCS["VN_2000_KT108-15_3deg",GEOGCS["GCS_VN_2000",DATUM["D_Vietnam_2000",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",108.25],PARAMETER["Scale_Factor",0.9999],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]',
                                            }
                                        });


                                        let projectParameters = new ProjectParameters({
                                            geometries: [polygon], outSpatialReference: app.activeView.spatialReference
                                        });

                                        this.geometryService.project(projectParameters).then((e) => {
                                            const geometry = e[0];

                                            let polygonGraphic = new Graphic({
                                                geometry,
                                                symbol: fillSymbol
                                            });

                                            graphicsLayer.add(polygonGraphic);

                                            polygonGraphic.attributes = {
                                                TenDiem: roa[xl]["Tên điểm"],
                                                DiaDiem: roa[xl]["Địa điểm"],
                                                TinhTrangDauTu: roa[xl]["Tình trạng đầu tư"],
                                                TongMucDauTuDuKien: roa[xl]["Tổng mức đầu tư dự kiến"]
                                            };

                                            let edits = {

                                                addFeatures: [polygonGraphic]
                                            };


                                            applyEdits(edits);

                                            //map.add(graphicsLayer);

                                        }

                                        );


                                        document.getElementById('filenameExcel').innerHTML = document.getElementById('xlf').value.replace(/^.*[\\\/]/, '');

                                    }
                                    //document.getElementById('filenameExcel').innerHTML=": "+document.getElementById('xlf').value;
                                    document.getElementById('xlf').value = "";
                                    //console.log("Truyvan:" + roa[0]["Tọa độ VN2000"]);
                                    //polygon vn2000---





                                    //--------

                                    //if (roa.length) result[sheetName] = roa;
                                });
                                return JSON.stringify(result, 2, 2);
                            };

                            return function process_wb(wb) {
                                let output = to_json(wb);

                            };

                        })();



                        let do_file = (function () {

                            let rABS = typeof FileReader !== "undefined" && (FileReader.prototype || {}).readAsBinaryString;
                            return function do_file(files) {
                                let f = files[0];
                                let reader = new FileReader();
                                reader.onload = function (e) {
                                    let data = e.target.result;
                                    if (!rABS) data = new Uint8Array(data);
                                    else process_wb(X.read(data, { type: rABS ? 'binary' : 'array' }));
                                };

                                if (dom.byId('xlf').value != "") {
                                    reader.readAsBinaryString(f);
                                }
                                //if (rABS) reader.readAsBinaryString(f);

                            };
                        })();


                        (function () {
                            let xlf = document.getElementById('xlf');
                            //if (!xlf.addEventListener) return;
                            function handleFile(e) { do_file(e.target.files); }
                            xlf.addEventListener('change', handleFile, false);


                        })();











                    }



                }


            }

            //end show layer===================




            //Read excel=========================================
            //console.log("read excel");

            // var X = XLSX;
            // var process_wb = (function () {
            //     //var OUT = document.getElementById('out');

            //     var to_json = function to_json(workbook) {

            //         var result = {};
            //         workbook.SheetNames.forEach(function (sheetName) {
            //              var roa = X.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: true });


            //             // Create a symbol for rendering the graphic
            //             let fillSymbol = {
            //                 type: "simple-fill", // autocasts as new SimpleFillSymbol()
            //                 color: [227, 139, 79, 0.8],
            //                 outline: { // autocasts as new SimpleLineSymbol()
            //                     color: [255, 255, 255],
            //                     width: 1
            //                 }
            //             };

            //             for (let xl = 0; xl < roa.length; xl++) {

            //                 var ringsExcel = (roa[xl]["Tọa độ VN2000"]).split(", ");//[roa[0]["Tọa độ VN2000"]];
            //                 var ringsPolygon = [];
            //                 for (var x = 0; x < ringsExcel.length; x++) {
            //                     // var xy=ringsExcel[x].split(" ");
            //                     // var toax=parseFloat(xy[0]);
            //                     // var toay=parseFloat(xy[1]);
            //                     // ringsPolygon[x]=[toax,toay];
            //                     ringsPolygon[x] = [ringsExcel[x].split(" ")[0], ringsExcel[x].split(" ")[1]];
            //                 }



            //                 let polygon = new Polygon({
            //                     rings: [ringsPolygon],
            //                     spatialReference: {
            //                         wkt: 'PROJCS["VN_2000_KT108-15_3deg",GEOGCS["GCS_VN_2000",DATUM["D_Vietnam_2000",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",108.25],PARAMETER["Scale_Factor",0.9999],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]',
            //                     }
            //                 });


            //                 let projectParameters = new ProjectParameters({
            //                     geometries: [polygon], outSpatialReference: app.activeView.spatialReference
            //                 });

            //                 this.geometryService.project(projectParameters).then((e) => {
            //                     const geometry = e[0];

            //                     let polygonGraphic = new Graphic({
            //                         geometry,
            //                         symbol: fillSymbol
            //                     });

            //                     graphicsLayer.add(polygonGraphic);

            //                     polygonGraphic.attributes = {
            //                         TenDiem: roa[xl]["Tên điểm"],
            //                         DiaDiem: roa[xl]["Địa điểm"],
            //                         TinhTrangDauTu: roa[xl]["Tình trạng đầu tư"],
            //                         TongMucDauTuDuKien: roa[xl]["Tổng mức đầu tư dự kiến"]
            //                     };

            //                     var edits = {

            //                         addFeatures: [polygonGraphic]
            //                     };


            //                     applyEdits(edits);

            //                     //map.add(graphicsLayer);

            //                 }

            //                 );


            //                 document.getElementById('filenameExcel').innerHTML = document.getElementById('xlf').value.replace(/^.*[\\\/]/, '');

            //             }
            //             //document.getElementById('filenameExcel').innerHTML=": "+document.getElementById('xlf').value;
            //             document.getElementById('xlf').value = "";
            //             //console.log("Truyvan:" + roa[0]["Tọa độ VN2000"]);
            //             //polygon vn2000---





            //             //--------

            //             //if (roa.length) result[sheetName] = roa;
            //         });
            //         return JSON.stringify(result, 2, 2);
            //     };

            //     return function process_wb(wb) {
            //         var output = to_json(wb);
            //     };

            // })();

            // var do_file = (function () {

            //     var rABS = typeof FileReader !== "undefined" && (FileReader.prototype || {}).readAsBinaryString;
            //     return function do_file(files) {
            //         var f = files[0];
            //         var reader = new FileReader();
            //         reader.onload = function (e) {
            //             var data = e.target.result;
            //             if (!rABS) data = new Uint8Array(data);
            //             else process_wb(X.read(data, { type: rABS ? 'binary' : 'array' }));
            //         };

            //         if (dom.byId('xlf').value != "") {
            //             reader.readAsBinaryString(f);
            //         }
            //         //if (rABS) reader.readAsBinaryString(f);

            //     };
            // })();

            // (function () {
            //     var xlf = document.getElementById('xlf');
            //     //if (!xlf.addEventListener) return;
            //     function handleFile(e) { do_file(e.target.files); }
            //     xlf.addEventListener('change', handleFile, false);

            // })();

            //======================================












            new Popup(app.activeView).startup();
            var paneManager = new PaneManager({
                element: "#pane-tools"
            })

            function addPane(pane) {
                paneManager.add(pane);
            }
            //EXPAND TOOLS




            var measure = new Measure(app.activeView);
            app.activeView.ui.add(measure.container[0], "bottom-left")


            var measureArea = new MeasureArea({
                view: app.activeView
            });
            app.activeView.ui.add(measureArea.container[0], "bottom-left")


            var queryMethods = new QueryMethods(app.activeView, {});
            queryMethods.on("click", addPane);
            expandTools.append(queryMethods.container);




            //an grid tim kiem
            // dom.byId("gridDisplayHide").onclick=function(){
            //     dom.byId("gridDisplay").style.display = "none";
            // };


            //console.log("hehehe");
            // dom.byId("esri-filter").onclick=function(){


            //     if (document.getElementById("esri-filter-modal").style.display == "none") {
            //         document.getElementById("esri-filter-modal").style.display = "block";
            //         dom.byId("esri-filter-modal").innerHTML='<div>&nbsp;<input type="checkbox"> <label role="button">Đạivật</label></div><div>&nbsp;<input type="checkbox"> <label role="button">Đạidrgdd dfg g dg </label></div>';
            //     } else {
            //         document.getElementById("esri-filter-modal").style.display = "none";

            //     }


            // };

            // dom.byId("menuKhucongnghiep").onclick = function () {





            //const u = new User({ username: 'pikalong' })









        });

    });



