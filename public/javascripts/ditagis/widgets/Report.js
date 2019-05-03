define([
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom",
    "dojo/on",

    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Polyline",
    "esri/geometry/Point",
    "esri/geometry/Circle",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/geometry/geometryEngine",
    "esri/geometry/geometryEngineAsync",
    "esri/geometry/SpatialReference",
    "ditagis/tools/SimpleDrawPolyline",
    "ditagis/toolview/Tooltip",
    "ditagis/support/supportReport",



], function (domConstruct, domClass, dom, on,
    Graphic, GraphicsLayer, Polyline, Point, Circle, SimpleLineSymbol, SimpleMarkerSymbol, SimpleFillSymbol,
    geometryEngine, geometryEngineAsync, SpatialReference, SimpleDrawPolyline, Tooltip, SupportReport) {

    'use strict';
    return class {
        constructor(view, options = {}) {
            this.view = view;
            this.user = view.systemVariable.user;
            this.options = {
                position: "top-right",
                distanceBuffer: 50,
                icon: "esri-icon-documentation",
                title: 'Báo cáo - thống kê',
                outFields: ["OBJECTID", "MoTa", "DiaDiem", "DonViQuanLy", "HinhThucXuLy", "TrangThai", "created_date", "deadline", "GhiChu"]
            };
            this.DOM = {
                container: null,
                spanComponent: null
            }
            this.isActive = false;
            if (options && typeof options === 'object') {
                for (let index in options) {
                    this.options[index] = options[index] || this.options[index];
                }
            }

            // this.view.map.findLayerById(constName.SUCO).then(layerView => {
            // this.layerView = layerView;
            if (this.layer) {
                this.initWindowKendo();
                this.initWidget();
            }
            // layerView.watch('updating', val => {
            //     if (!val && this.isActive) {  // wait for the layer view to finish updating
            //         layerView.queryFeatures().then(graphics => {
            //             let attributes = graphics.map(f => { return f.attributes });
            //             this.updateDataSource(attributes);
            //         });
            //     }
            // })
            // })

        }
        get layer() {
            return this.view.map.findLayerById(constName.SUCO);
        }
        initWindowKendo() {
            domConstruct.create('div', {
                id: 'window-report',
            }, document.body);
            this.window = $("#window-report");
            this.window.kendoWindow({
                title: "Danh sách các sự cố",
                visible: false,
                resizable: true,
                actions: [
                    "Close"
                ],
                open: function (e) {
                    this.wrapper.css({
                        top: 15,
                        left: 50
                    });
                },
                close: () => {
                    this.changeActive();
                }
            });

        }
        initWidget() {
            this.layer.then(() => {
                this.DOM.container = domConstruct.create('div', {
                    id: "dtg-wget-report",
                    class: "esri-widget esri-widget-button",
                    title: this.options.title
                });
                this.DOM.spanComponent = domConstruct.create('span', {
                    class: this.options.icon
                })
                domConstruct.place(this.DOM.spanComponent, this.DOM.container);
                domConstruct.place(this.DOM.container, document.body);

                this.view.ui.add(dom.byId('dtg-wget-report'), this.options.position);

                on(this.DOM.container, "click", (evt) => {
                    this.clickHandler(evt);
                });
            })
        }
        add(data) {
            this.kendoGrid.bootstrapTable('append', data);
        }
        addAll(datas) {
            datas.map(f => this.add(f));
        }
        removeAll() {
            this.kendoGrid.bootstrapTable('removeAll');
        }
        showTable(attributes = {}) {
            if (!this.kendoGrid) {
                this.window.append(domConstruct.create('div', {
                    id: 'dtg-widget-report-table'
                }));
                let columns = [];
                for (let fieldName of this.options.outFields) {
                    let field = this.layer.fields.find(function (f) {
                        return f.name === fieldName;
                    })
                    if (field)
                        columns.push({
                            field: field.name,
                            title: field.alias
                        })
                }
                this.kendoGrid = $('#dtg-widget-report-table').bootstrapTable({
                    pagination: true,
                    showRefresh: true,
                    columns: columns,
                    data: attributes,
                    onClickRow: (row, element, field) => {
                        this.onClickRowHandler(row, element, field);
                    },
                    onRefresh: (params) => {
                        this.refreshRowHandler(params);
                    }
                });
            }
        }
        refreshRowHandler(params) {
            this.layer.queryFeatures().then(results => {
                this.removeAll();
                results.features.map(f => {
                    this.add(f.attributes);
                })
            });
        }
        onClickRowHandler(row, element, field) {
            this.layer.queryFeatures({
                where: 'OBJECTID = ' + row['OBJECTID'],
                outFields: ['*'],
                outSpatialReference: this.view.spatialReference,
                returnGeometry: true
            }).then(results => {
                var feature = results.features;
                this.view.popup.open({
                    location: feature[0].geometry,
                    features: feature
                })
            });
        }
        // updateDataSource(dataSource) {
        //     let data = dataSource.map(attribute => {
        //         let tmpAttr = JSON.parse(JSON.stringify(attribute));
        //         if (attribute.NgayTao) tmpAttr.NgayTao = new Date(attribute.NgayTao);
        //         this.kendoGrid.data('kendoGrid').dataSource.add(tmpAttr);
        //         return tmpAttr;
        //     })
        //     // this.kendoGrid.data('kendoGrid').dataSource.add(data);
        // }
        clickHandler(evt) {
            if (!this.isActive) {
                this.window.data("kendoWindow").open();

                this.changeActive();
                this.showTable();
                this.refreshRowHandler();

            } else {
                this.window.data("kendoWindow").close();
            }

        }
        changeActive() {
            this.DOM.container.classList.toggle('widget-button-selected');
            this.isActive = !this.isActive;
        }
    }
});