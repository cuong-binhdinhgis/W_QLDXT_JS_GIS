

/**
 * Phần này quan trọng không được xóa
 */
var view;

const constName = {
  INDEX_HANHCHINHHUYEN: 5,
  INDEX_HANHCHINH: 4,
  BASEMAP: 'dulieunen',
  TramBTS: 'TRAMBTS',
  DOANHNGHIEP: 'DoanhNghiep',
  HETHONGPHATTHANHTRUYENHINH: 'HeThongPhatThanhTruyenHinh',
  HETHONGTRUYENDANVIENTHONG: 'HeThongTruyenDanVienThong',
  DIEMCUNGCAPDICHVUVIENTHONG: 'DiemCungCapDichVuVienThong',
  COTANGTEN: 'CotAngTen',
  COTTREOCAP: 'CotTreoCap',
  TUYENCAPTREO: 'TuyenCapTreo',
  HATANGKYTHUATNGAM: 'HaTangKyThuatNgam',
  TUYENCAPNGAM: 'TuyenCapNgam',
  THIETBITRUYENDAN: 'ThietBiTruyenDan',
  SUCO: 'SuCo',
  QH_DIEMCUNGCAPDICHVUVIENTHONG: 'QH_DiemCungCapDichVuVienThong',
  QH_COTANGTEN: 'QH_CotAngTen',
  QH_COTTREOCAP: 'QH_CotTreoCap',
  QH_TUYENCAPTREO: 'QH_TuyenCapTreo',
  QH_HATANGKYTHUATNGAM: 'QH_HaTangKyThuatNgam',
  QH_TUYENCAPNGAM: 'QH_TuyenCapNgam',
  QH_THIETBITRUYENDAN: 'QH_ThietBiTruyenDan',
  QH_TRAMBTS: 'QH_TRAMBTS',
  GroupQH: 'chuyendequyhoach',
  GroupHT: 'chuyendehientrang'
}
require([
  "ditagis/config",
  "esri/request",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/MapImageLayer",
  "esri/layers/GroupLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/OpenStreetMapLayer",
  "esri/widgets/Expand",
  "esri/widgets/Locate",
  "esri/widgets/LayerList",
  "esri/widgets/Legend",
  "esri/widgets/Home",
  "esri/symbols/SimpleFillSymbol",

  "ditagis/classes/SystemStatusObject",

  "ditagis/widgets/LayerEditor",
  "ditagis/widgets/Report",
  "ditagis/widgets/Measure",
  "ditagis/widgets/BufferingObjects",
  "ditagis/widgets/User",
  "ditagis/widgets/Popup",
  "ditagis/support/HightlightGraphic",
  "ditagis/support/QueryDistance",
  "ditagis/widgets/widgetReport/DuocCapPhep",


  "dojo/on",
  "dojo/dom",
  "dojo/dom-construct",
  "dojo/sniff",
  "dojo/domReady!"

], function (mapconfigs, esriRequest, Map, MapView, MapImageLayer, GroupLayer, FeatureLayer, OpenStreetMap,
  Expand, Locate, LayerList, Legend, Home,
  SimpleFillSymbol,
  SystemStatusObject,
  LayerEditor, Report, Measure, BufferingObjects, UserWidget, Popup,
  HightlightGraphic, QueryDistance, DuocCapPhep,
  on, dom, domConstruct, has,
  ) {
    'use strict';
    esriRequest('/map', {
      method: 'post'
    }).then(res => {
      try {
        if (res.data) {
          var systemVariable = new SystemStatusObject();
          var map = new Map({
            // basemap: 'osm'
          });

          systemVariable.user = res.data;
          let definitionExpression = {};
          var userRole;
          if (systemVariable.user.role.length >= 3) {
            userRole = systemVariable.user.role.slice(3, systemVariable.user.role.length);
          }
          if (systemVariable.user.role.startsWith('QH')) {//role bat dau tu so 7
            definitionExpression.chuyende = `HuyenTP = '${userRole}'`;//vi du role = 725, => MaHuyenTP = 725
            definitionExpression.nen = `MaHuyenTP = '${userRole}'`;
          }
          view = new MapView({
            container: "map", // Reference to the scene div created in step 5
            map: map, // Reference to the map object created before the scene
            zoom: mapconfigs.zoom, // Sets the zoom level based on level of detail (LOD)
            center: mapconfigs.center, // Sets the center point of view in lon/lat
          });
          view.isMobile = has('android') | has('ios') || has('bb');//truy cap tren mobile
          view.systemVariable = systemVariable;
          view.snapping = {
            key: 'ctrlKey',
            isKeyPress: function () {
              return view.keyPress[this.key]
            }
          }
          view.keyPress = {
            ctrlKey: false
          }
          const initBaseMap = () => {

            let bmCfg = mapconfigs.basemap;//basemap config
            if (definitionExpression.nen) {
              for (let sublayer of bmCfg.sublayers) {
                sublayer.definitionExpression = definitionExpression.nen;
              }
            }
            let basemap = new MapImageLayer(bmCfg),
              osm = new OpenStreetMap({ title: 'OpenStreetMap', id: 'osm', visible: false }),
              worldImage = new MapImageLayer({ url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/', title: 'Ảnh vệ tinh', id: 'worldimagery', visible: false });
            map.addMany([osm, worldImage, basemap])
            basemap.then(() => {
              if (definitionExpression.nen) {
                let layer = basemap.findSublayerById(constName.INDEX_HANHCHINHHUYEN);
                let query = layer.createQuery();
                query.where = definitionExpression.nen;
                query.returnGeometry = true;
                query.outSpatialReference = view.spatialReference;
                layer.queryFeatures(query).then(res => {
                  let ft = res.features[0];
                  view.goTo({
                    target: ft.geometry
                  })
                })
              }
            })
            function watchVisible(newValue, oldValue, property, target) {
              if (newValue) {
                switch (target) {
                  case osm: basemap.visible = worldImage.visible = !newValue; break;
                  case basemap: osm.visible = worldImage.visible = !newValue; break;
                  case worldImage: osm.visible = basemap.visible = !newValue; break;
                }
              }
            }
            osm.watch('visible', watchVisible)
            worldImage.watch('visible', watchVisible)
            basemap.watch('visible', watchVisible)

          }


          const initFeatureLayers = () => {
            return new Promise((resolve, reject) => {
              esriRequest('/map/layerconfig', {
                method: 'post'
              }).then(res => {
                if (res.data) {
                  let layers = res.data.layers,
                    grLayers = res.data.groupLayers;
                  let groupLayerMap = {};
                  for (let grLayerInfo of grLayers) {
                    let grLayer = new GroupLayer({
                      id: grLayerInfo.id,
                      title: grLayerInfo.name
                    })
                    map.add(grLayer);
                    groupLayerMap[grLayerInfo.id] = grLayer;
                  }
                  for (let layer of layers) {
                    if (layer.permission && layer.permission.view) {
                      let where = [];
                      let definitionrequire = '';
                      let definition = '';
                      if (layer.definitionExpressionDN) {
                        let defiDN = layer.definitionExpressionDN.split(",");
                        if (systemVariable.user.role.startsWith('DN') && layer.id != constName.SUCO) {
                          // definitionrequire = `DonViQuanLy like '%${userRole}%' OR DONVISUDUNG like '%${userRole}%'`
                          for (const defi of defiDN) {
                            where.push(`${defi} like '%${userRole}%'`);
                          }
                        }
                      }

                      if (!systemVariable.user.role.startsWith('DN') && systemVariable.user.role != 1 && layer.id != constName.SUCO && layer.groupId == constName.GroupHT) {
                        // if (definitionrequire = '') {
                        //   definitionrequire += 'DuocCapPhep = 1';
                        // }
                        definitionrequire = 'DuocCapPhep = 1'
                      }


                      if (definitionExpression.chuyende)
                        definition += definitionExpression.chuyende;


                      if (layer.id === constName.SUCO) {
                        // let where = [];
                        if (systemVariable.user.role.startsWith('DN')) {
                          where.push(`DonViQuanLy ='${userRole}'`);

                          where.push(`(TrangThai = 2 AND DonViQuanLy is null AND (XacNhanKhongQL is null OR XacNhanKhongQL not like '%${userRole}%'))`);
                        }

                      }
                      if (where.length > 0)
                        definition += where.join(" OR ")
                      if (definition != '') {
                        if (definitionrequire != '') {
                          layer.definitionExpression = definition + " AND " + definitionrequire;
                        }
                        else {
                          layer.definitionExpression = definition;
                        }
                      }
                      else if (definitionrequire != '') {
                        layer.definitionExpression = definitionrequire;
                      }


                      // layer.definitionExpression = layer.definitionExpression + " AND " + definitionrequire;
                      let fl = new FeatureLayer(layer);
                      //neu co group layer
                      if (layer.groupId) {
                        let grLayer = groupLayerMap[layer.groupId];
                        fl.visible = false;
                        if (grLayer) grLayer.add(fl)
                        else map.add(fl);
                      } else map.add(fl);
                    }
                  }
                  resolve();
                } else {
                  throw 'cannot request permission';
                }
              })

            });
          }
          const initWidgets = () => {

            var userWidget = new UserWidget(view);
            userWidget.startup();
            view.ui.add(new Home({
              view: view,
            }), "top-left");
            view.ui.move(["zoom"], "top-left");
            //LOCATE
            view.ui.add(new Locate({
              view: view
            }), "top-left");

            new Measure(view, {
              icon: 'esri-icon-map-pin',
              position: 'top-right'
            });
            new Report(view, {
              icon: 'esri-icon-documentation',
              position: 'top-right'
            });
            new BufferingObjects(view, {
              icon: 'esri-icon-hollow-eye',
              position: 'top-right'
            });
            new DuocCapPhep(view);
            var layereditor = new LayerEditor(view);
            layereditor.startup();
            //LAYER LIST
            var layerList = new LayerList({
              container: document.createElement("div"),
              view: view,
            });
            view.ui.add(new Expand({
              expandIconClass: "esri-icon-layer-list",
              view: view,
              title: 'Lớp dữ liệu',
              content: layerList
            }), "top-left");

            //Add Logo DATAGIS to the bottom left of the view
            //neu khong phai la thiet bi di dong
            if (!view.isMobile) {
              //Add Logo DATAGIS to the bottom left of the view
              var logo = domConstruct.create("img", {
                src: "images/logo-ditagis.png",
                id: "logo",
                style: "background-color:transparent"
              });
              view.ui.add(logo, "bottom-left");

              //LEGEND
              view.ui.add(new Legend({ view: view }), "bottom-right");
            }
            else {
              //LEGEND
              view.ui.add(new Expand({
                expandIconClass: "esri-icon-collection",
                content: new Legend({ view: view })
              }), "bottom-right");
            }


            var popup = new Popup(view);
            popup.startup();
          }

          initBaseMap();
          initFeatureLayers().then(() => {
            initWidgets();
            view.then(function () {
              let oldUsername = localStorage.user;
              if (oldUsername === systemVariable.user.userName) {
                if (localStorage.latitude && localStorage.longitude) {
                  view.center = [parseFloat(localStorage.longitude), parseFloat(localStorage.latitude)];
                }
                if (localStorage.zoom) {
                  view.zoom = parseInt(localStorage.zoom);
                }
              } else {
                localStorage.removeItem('zoom');
                localStorage.removeItem('longitude');
                localStorage.removeItem('latitude');
              }
              //watch
              view.watch('center', function (oldVal, newVal) {
                localStorage.latitude = newVal.latitude;
                localStorage.longitude = newVal.longitude;
              })
              view.watch('zoom', function (oldVal, newVal) {
                localStorage.zoom = newVal;
              })
              localStorage.user = systemVariable.user.userName;
            })
          })

          // //Chức năng hightlight Graphic khi nhấn {view.snapping.key}
          var hightlightGraphic = new HightlightGraphic(view);
          view.on('pointer-move', (evt) => {
            const key = view.snapping.key,
              pressKey = evt.native[key];
            view.keyPress[key] = pressKey;

            if (pressKey) {
              hightlightGraphic.hightlight({
                x: evt.x,
                y: evt.y
              });
            } else {
              hightlightGraphic.clear();
            }

          })
        }
      } catch (error) {
        console.log(error);
        // location.href = '/map/error';
      } finally {
        Loader.hide();
      }
    })
  });