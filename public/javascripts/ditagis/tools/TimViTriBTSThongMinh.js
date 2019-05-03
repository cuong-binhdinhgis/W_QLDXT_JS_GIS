var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "esri/layers/GraphicsLayer", "../core/Base", "esri/Graphic", "esri/geometry/Circle", "../core/ConstName", "esri/geometry/geometryEngine", "esri/Color", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "../toolview/GridWnd", "dojo/on"], function (require, exports, GraphicsLayer, Base, Graphic, Circle, constName, geometryEngine, Color, SimpleFillSymbol, SimpleLineSymbol, GridWnd, on) {
    "use strict";
    class TimViTriBTSThongMinh extends Base {
        constructor(view, params) {
            super();
            this.distance = 100;
            this.clickHandler = null;
            this.view = view;
            this.resultBufferGraphics = new GraphicsLayer({
                listMode: 'hide'
            });
            this.chooseGraphics = new GraphicsLayer({
                listMode: 'hide'
            });
            this.view.map.add(this.resultBufferGraphics);
            this.view.map.add(this.chooseGraphics);
            this.gridWnd = new GridWnd({
                window: { title: 'Vị trị đặt trạm BTS', width: 300, actions: ["Close"] },
                grid: {
                    height: 500, columns: [{
                            title: 'Tọa đô X',
                            field: 'X'
                        }, {
                            title: 'Tọa đô Y',
                            field: 'Y'
                        }],
                }
            });
        }
        get layer() {
            return this.view.map.findLayerById(constName.TramBTS);
        }
        getAllBTS(geometry) {
            return new Promise((resolve, reject) => {
                let query = this.layer.createQuery();
                query.geometry = geometry;
                this.layer.queryFeatures(query).then(value => {
                    resolve(value.features);
                });
            });
        }
        renderVungPhuBTS(graphic) {
            const point = graphic.geometry, attributes = graphic.attributes, distance = attributes.VungPhu;
            if (!point || !attributes || !distance)
                return null;
            let circle = new Circle({
                center: point,
                radius: distance
            });
            return circle;
        }
        buffer(point, distance) {
            if (!point || !distance)
                return null;
            let circle = new Circle({
                center: point,
                radius: distance
            });
            return circle;
        }
        find(geometry, distance) {
            return __awaiter(this, void 0, void 0, function* () {
                let dataSource = new kendo.data.DataSource();
                this.distance = distance;
                let results = [];
                let bts = yield this.getAllBTS(geometry);
                let vungPhuBTS = [];
                for (const item of bts) {
                    let circle = this.renderVungPhuBTS(item);
                    if (circle)
                        vungPhuBTS.push(circle);
                }
                let diff = geometry;
                if (vungPhuBTS.length > 0) {
                    let union = geometryEngine.union(vungPhuBTS);
                    diff = geometryEngine.difference(geometry, union);
                    if (diff == null) {
                        this.cancel();
                        kendo.alert("Không tìm thấy đặt trụ thích hợp tại khu vực này");
                        return;
                    }
                }
                this.view.graphics.add(new Graphic({
                    geometry: diff,
                    symbol: new SimpleFillSymbol({
                        color: new Color([127, 140, 141, .5]),
                        outline: new SimpleLineSymbol({
                            color: new Color([211, 84, 0]),
                            width: 1
                        })
                    })
                }));
                this.pointerMoveHhandler = this.view.on('pointer-move', e => {
                    e.stopPropagation();
                    this.resultBufferGraphics.removeAll();
                    if (this.clickHandler) {
                        this.clickHandler.remove();
                        this.clickHandler = null;
                    }
                    let p = this.view.toMap({ x: e.x, y: e.y });
                    let circle = this.buffer(p, this.distance);
                    if (!circle)
                        return;
                    let check = geometryEngine.within(circle, diff);
                    let color = check ? new Color([22, 160, 133]) : new Color([231, 76, 60]);
                    this.resultBufferGraphics.add(new Graphic({
                        geometry: circle,
                        symbol: new SimpleFillSymbol({
                            color: color,
                        })
                    }));
                    this.clickHandler = on.once(this.view, 'click', ec => {
                        ec.stopPropagation();
                        if (check) {
                            dataSource.add({ X: ec.mapPoint.longitude, Y: ec.mapPoint.latitude });
                            this.gridWnd.grid.setDataSource(dataSource);
                            this.chooseGraphics.add(new Graphic({
                                geometry: ec.mapPoint,
                                symbol: {
                                    type: "simple-marker",
                                    style: "square",
                                    color: "blue",
                                    size: "8px",
                                    outline: {
                                        color: [255, 255, 0],
                                        width: 3
                                    }
                                }
                            }));
                        }
                        this.gridWnd.open();
                    });
                });
                return yield results;
            });
        }
        cancel() {
            if (this.pointerMoveHhandler) {
                this.pointerMoveHhandler.remove();
                this.pointerMoveHhandler = null;
            }
            if (this.clickHandler) {
                this.clickHandler.remove();
                this.clickHandler = null;
            }
            this.resultBufferGraphics.removeAll();
            this.chooseGraphics.removeAll();
            this.gridWnd.grid.dataSource = new kendo.data.DataSource();
        }
    }
    return TimViTriBTSThongMinh;
});
