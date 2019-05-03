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
$("#vertical").data("kendoSplitter").collapse(".k-pane:last");
kendo.ui.progress($("#page-content"), true);
require([
    "ditagis/config",
    "ditagis/core/ConstName",
    "ditagis/widgets/Measure",
    "esri/request",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/MapImageLayer",
    "esri/layers/OpenStreetMapLayer",
    "esri/layers/WebTileLayer",
    "esri/layers/Layer",
    "esri/layers/GroupLayer",
    "esri/widgets/Home",
    "esri/widgets/Locate",
    "ditagis/widgets/LayerList",
    "ditagis/widgets/LayerEditor",
    "ditagis/layers/FeatureLayer",
    "ditagis/widgets/Print",
    "ditagis/widgets/QueryLayer",
    "ditagis/classes/SystemStatusObject",
    "ditagis/widgets/BufferingObjects",
    "ditagis/widgets/ExpandTools",
    "ditagis/widgets/QueryMethods",
    "ditagis/widgets/Popup",
    "ditagis/widgets/Measure",
    "ditagis/widgets/TimViTriBTSThongMinh",
    "ditagis/widgets/Statistics",
    "ditagis/widgets/MeasureArea",
    "ditagis/widgets/VungPhuBTS",
    "ditagis/toolview/PaneManager",
    "ditagis/tools/VungPhuBTS",
    "dojo/dom-construct",
    "css!ditagis/styling/dtg-map.css",
    "dojo/domReady!"
], function (mapconfigs, constName, Measure,
    esriRequest,
    Map, MapView, MapImageLayer, OpenStreetMap, WebTileLayer, Layer, GroupLayer, Home, Locate,
    LayerList,
    LayerEditor, FeatureLayer,
    Print, QueryLayer,
    SystemStatusObject, BufferingObjects,
    ExpandTools, QueryMethods, Popup, Measure, TimViTriBTSThongMinh, Statistics, MeasureArea, VungPhuBTS,
    PaneManager, VungPhuBTSTools,
    domConstruct) {
        esriRequest('/session', {
            method: 'post'
        }).then(function (resultRequest) {
            var map = new Map();
            var baseMap = new MapImageLayer({
                url: "http://117.3.71.234/arcgisadaptor/rest/services/BinhDinh/DuLieuNen/MapServer",
                visible: false,
                id: constName.BASEMAP,
                title: 'Dữ liệu nền Bình Định',
                copyright: 'Bản đồ biên tập bởi Trung tâm DITAGIS',
            });
            var osm = new OpenStreetMap({
                title: 'OpenStreetMap',
                id: constName.OSM,
                // visible: false
            });
            map.add(osm);
            map.add(baseMap);
            let worldimagery = new WebTileLayer({
                id: 'worldimagery',
                urlTemplate: 'https://mt1.google.com/vt/lyrs=y&x={col}&y={row}&z={level}',
                title: 'Ảnh vệ tinh',
                visible: false,
            });
            map.add(worldimagery);
            switchBasemap([baseMap, osm, worldimagery])

            function switchBasemap(basemaps) {
                basemaps.forEach(function (f) {
                    f.watch('visible', watchVisible)
                })

                function watchVisible(newValue, oldValue, property, target) {
                    if (newValue) {
                        basemaps.forEach(function (f) {
                            if (f !== target)
                                f.visible = false;
                        })
                    }
                }
            }
            var view = new MapView({
                container: "map",
                map: map,
                ui: {
                    components: ["zoom"],
                    padding: 7
                },
                zoom: mapconfigs.zoom, // Sets the zoom level based on level of detail (LOD)
                center: mapconfigs.center, // Sets the center point  of view in lon/lat
            });
            view.systemVariable = new SystemStatusObject();
            view.systemVariable.user = resultRequest.data;

            let wndDoiMatKhau = renderDoiMatKhau();
            $("#btn-change-pwd").click(function () {
                wndDoiMatKhau.center().open();
            });

            let gr = new GroupLayer({
                title: 'Dữ liệu chuyên đề',
                id: constName.CHUYEN_DE_HT
            });
            map.add(gr);
            for (let layerCfg of view.systemVariable.user.Layers) {
                layerCfg.definitionExpression = `TenDoanhNghiep = '${view.systemVariable.user.Role}'`;
                if (layerCfg.groupLayer === 'chuyendehientrang' && layerCfg.permission.view && layerCfg.id == constName.TramBTS) {
                    var dsDN = [{
                        name: "GTL",
                        title: "GTel",
                        name_img: 'gtel'
                    }, {
                        name: "MBF",
                        title: "Mobifone",
                        name_img: 'mobifone'
                    }, {
                        name: "VNPT",
                        title: "VNPT",
                        name_img: "vina"
                    }, {
                        name: "VNM",
                        title: "Vietnamobile",
                        name_img: "vietnam"
                    }, {
                        name: "VTL",
                        title: "Viettel",
                        name_img: "viettel"
                    }];
                    var uniqueValueInfos = [];
                    for (var i = 1; i <= 4; i++) {
                        for (const dn of dsDN) {
                            var uniqueValueInfo = {
                                label: null,
                                value: null,
                                symbol: {
                                    url: null,
                                    type: "picture-marker",
                                    width: "14px",
                                    height: "14px"
                                }
                            };
                            uniqueValueInfo.value = dn.name + ', ' + i;
                            if (i == 1) {
                                uniqueValueInfo.label = dn.title;
                                uniqueValueInfo.create = true;
                                uniqueValueInfo.symbol.url = "/images/bts/" + dn.name_img + "_yeucau.png";
                            }
                            if (i == 2) {
                                uniqueValueInfo.symbol.url = "/images/bts/" + dn.name_img + "_yeucau_chapnhan.png";
                            }
                            if (i == 3) {
                                uniqueValueInfo.symbol.url = "/images/bts/" + dn.name_img + ".png";
                            }
                            if (i == 4) {
                                uniqueValueInfo.symbol.url = "/images/bts/" + dn.name_img + "_yeucau_kochapnhan.png";
                            }
                            uniqueValueInfos.push(uniqueValueInfo);
                        }
                    }
                    var renderer = {
                        type: "unique-value", // autocasts as new UniqueValueRenderer()
                        field: "TenDoanhNghiep",
                        field2: "TinhTrang",
                        fieldDelimiter: ", ",
                        uniqueValueInfos: uniqueValueInfos,
                        defaultSymbol: {
                            type: "picture-marker",
                            url: "/images/bts/chuaxacdinh.png",
                            width: "14px",
                            height: "14px"
                        },
                        defaultLabel: "Chưa xác định"
                    }
                    layerCfg.listMode = "hide";
                    let tramBTSLayer = new FeatureLayer(layerCfg);
                    tramBTSLayer.renderer = renderer;

                    gr.add(tramBTSLayer);

                    let customGroup = new GroupLayer({
                        title: "Trạm BTS",
                        id: "nhomTramBTS"
                    });
                    let vungPhuLayer = new GroupLayer({
                        title: "Vùng phủ",
                        id: "vungPhu",
                        visible: false
                    })
                    var vungPhuBTSTools = new VungPhuBTSTools(view);
                    customGroup.add(vungPhuLayer);
                    let vungPhu2G = new Layer({
                        id: "ThietBiLapDat2G", title: "2G", visible: false
                    })
                    let vungPhu3G = new Layer({
                        id: "ThietBiLapDat3G", title: "3G", visible: false
                    })
                    let vungPhu4G = new Layer({
                        id: "ThietBiLapDat4G", title: "4G", visible: false
                    })
                    function vungPhuThietBiWatch(newVal, oldVal, propertyName, target) {
                        if (!target) return;
                        if (newVal) {
                            if (view.scale > tramBTSLayer.minScale) {
                                target.visible = false
                            } else {
                                if (target.id)
                                    vungPhuBTSTools.onlyBusiness(view.systemVariable.user.Role, target.id);
                            }

                        } else {
                            vungPhuBTSTools.clear(view.systemVariable.user.Role, target.id);
                        }
                    }
                    vungPhu2G.watch("visible", vungPhuThietBiWatch);
                    vungPhu3G.watch("visible", vungPhuThietBiWatch);
                    vungPhu4G.watch("visible", vungPhuThietBiWatch);
                    vungPhuLayer.addMany([vungPhu4G, vungPhu3G, vungPhu2G]);
                    vungPhuLayer.watch("visible", function (newVal, oldVal) {
                        vungPhu2G.visible = newVal;
                        vungPhu3G.visible = newVal;
                        vungPhu4G.visible = newVal;
                    });

                    customGroup.watch("visible", function (newVal, oldVal) {
                        tramBTSLayer.visible = newVal;
                    })
                    gr.add(customGroup)
                } else if (layerCfg.groupLayer === 'chuyendehientrang' && layerCfg.permission.view) {
                    let fl = new FeatureLayer(layerCfg);
                    gr.add(fl);
                }
            }
            new Popup(view).startup();

            var paneManager = new PaneManager({
                element: "#pane-tools"
            })

            function addPane(pane) {
                paneManager.add(pane);
            }
            //EXPAND TOOLS
            var expandTools = new ExpandTools(view, {
                position: 'top-right',
            });
            var queryMethods = new QueryMethods(view, {});
            queryMethods.on("click", addPane);
            expandTools.append(queryMethods.container);
            var layereditor = new LayerEditor(view);
            layereditor.on("click", addPane);
            expandTools.add(layereditor.content);

            var layerList = new LayerList(view);
            layerList.on("click", addPane);
            expandTools.add(layerList.container)
            var statistics = new Statistics(view);
            statistics.on("click", addPane);
            expandTools.add(statistics.container)

            var printTool = new Print(view, {
                position: 'top-right',
            });
            printTool.on("click", addPane);
            expandTools.add(printTool.container);
            //WIDGET TOOLS
            view.ui.move(["zoom"], "bottom-left");
            view.ui.add(new Home({
                view: view,
                title: "Phóng toàn tỉnh"
            }), "bottom-left")
            view.ui.add(new Locate({
                view: view
            }), "bottom-left")
            var measure = new Measure(view);
            view.ui.add(measure.container[0], "bottom-left")
            var measureArea = new MeasureArea({
                view: view
            });
            view.ui.add(measureArea.container[0], "bottom-left")
            var vungPhuBTS = new VungPhuBTS({
                view: view
            });
            view.ui.add(vungPhuBTS.container[0], "bottom-left");
            var timViTriBTSThongMinh = new TimViTriBTSThongMinh(view);
            view.ui.add(timViTriBTSThongMinh.container[0], "bottom-left")
            kendo.ui.progress($("#page-content"), false);
        });

        function renderDoiMatKhau() {
            let divDoiMatKhau = $('<div/>', {
                html: `<div class="k-popup-edit-form k-window-content k-content">
            <div class="k-edit-form-container">
            <div class="k-edit-label">
                <label for="oldPwd">Mật khẩu cũ</label>
            </div>
            <div data-container-for="oldPwd" class="k-edit-field">
                <input type="text" name="oldPwd" data-bind="value:oldPwd" class="k-input k-textbox"/>
            </div>
            <div class="k-edit-label">
                <label for="pwd">Mật khẩu mới</label>
            </div>
            <div data-container-for="pwd" class="k-edit-field">
                <input type="password" name="pwd" data-bind="value:pwd" class="k-input k-textbox"/>
            </div>
            <div class="k-edit-label">
                <label for="newPwd">Nhập lại mật khẩu mới</label>
            </div>
            <div data-container-for="newPwd" class="k-edit-field">
                <input type="password" name="newPwd" data-bind="value:newPwd" class="k-input k-textbox"/>
            </div>
            <div class="k-edit-buttons k-state-default">
                <a role="button" href="javascript:void(0)"
                data-bind="events:{click:onSubmit}"
                class="k-button k-button-icontext k-primary k-grid-update">
                <span class="k-icon k-i-check"> </span>Cập nhật</a>
                <a role="button" href="javascript:void(0)"
                data-bind="events:{click:onCancel}"
                class="k-button k-button-icontext k-grid-cancel">
                <span class="k-icon k-i-cancel"> </span>Hủy</a>
            </div>
            </div>
        </div>
        </div>`
            })
            let model = kendo.observable({
                oldPwd: null,
                newPwd: null,
                pwd: null,
                onSubmit: function () {
                    const oldPwd = model.get("oldPwd");
                    const pwd = model.get("pwd");
                    const newPwd = model.get("newPwd");
                    if (!oldPwd || !pwd || !newPwd)
                        alert('Vui lòng điền đầy đủ thông tin')
                    else if (pwd !== newPwd)
                        alert('Mật khẩu mới không giống nhau');
                    else {
                        kendo.ui.progress(divDoiMatKhau, true);
                        $.post('/session').done(function (user) {
                            if (user.Password !== oldPwd)
                                kendo.alert('Mật khẩu cũ không chính xác');
                            else {
                                $.ajax({
                                    type: 'put',
                                    url: '/rest/sys_account',
                                    data: {
                                        ID: user.ID,
                                        Password: newPwd
                                    },
                                    dataType: 'json',
                                    success: function (results) {
                                        wndChangePwd.close();
                                        kendo.alert('Đổi mật khẩu thành công');
                                    },
                                    error: function (err) {
                                        kendo.alert('Có lỗi xảy ra trong quá trình xử lý, vui lòng thử lại');
                                    }
                                })
                            }
                            kendo.ui.progress(divDoiMatKhau, false);
                        })
                    }
                },
                onCancel: function () {
                    wndChangePwd.close();
                }
            });

            let wndChangePwd = divDoiMatKhau.kendoWindow({
                title: "Đổi mật khẩu",
                visible: false,
                actions: [
                    "Close"
                ],

            }).data("kendoWindow");
            kendo.bind(divDoiMatKhau, model);
            return wndChangePwd;
        }



        var measure = new Measure(view);
            view.ui.add(measure.container[0], "bottom-left")
            
            //var measureArea = new MeasureArea({
                //view: view
            //});

    });