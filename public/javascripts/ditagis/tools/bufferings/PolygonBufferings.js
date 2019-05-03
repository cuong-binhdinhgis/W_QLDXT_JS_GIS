define([
    "esri/geometry/Polygon",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom",
    "dojo/on",
    "esri/symbols/SimpleFillSymbol",
    "esri/Graphic",
    "ditagis/editing/FindObjects"
], function (Polygon,
    domConstruct, domClass, dom, on,
    SimpleFillSymbol,
    Graphic,
    FindObjects) {
    'use strict';
    return class {
        constructor(view) {
            this.view = view;
        }
        draw() {
            if (!this.layer) return;
            this.rings = [];
            this.firsring = undefined;
            this.clickBufferEvent = on(this.view, 'click', (evt) => {
                this.clickBufferFunc(evt);
            });
            this.doubleClickEvent = on(this.view, 'double-click', (evt) => {
                this.doubleClickFunc(evt);
            });

        }
        createPolygonGraphic(rings) {
            var polygon = new Polygon({
                rings: rings
            });

            // Create a symbol for rendering the graphic
            var fillSymbol = new SimpleFillSymbol({
                color: [178, 102, 234, 0.8],
                style: "solid",
                outline: { // autocasts as SimpleLineSymbol
                    color: [255, 255, 255],
                    width: 2
                }
            });

            // Add the geometry and symbol to a new graphic
            var polygonGraphic = new Graphic({
                geometry: polygon,
                symbol: fillSymbol
            });
            return polygonGraphic;
        }
        polygonMoveFunc(evt) {
            if (this.movePolygon) {
                this.view.graphics.remove(this.movePolygon);
                this.movePolygon = null;
            }
            if (!this.firsring) return;
            let rings = [];
            const screenCoors = {
                x: evt.x,
                y: evt.y
            };
            //Tìm kiếm graphic trùng với tọa độ màn hình khi drag
            this.point = this.view.toMap(screenCoors);

            for (let r of this.rings) {
                rings.push(r);
            }
            rings.push([this.point.longitude, this.point.latitude]);

            var polygonGraphic = this.createPolygonGraphic(rings);
            // Add the graphics to the view's graphics layer
            this.view.graphics.add(polygonGraphic);
            this.movePolygon = polygonGraphic;
        }
        clickBufferFunc(evt) {
            evt.stopPropagation();
            let screenCoors = {
                x: evt.x,
                y: evt.y
            };
            let clickPoint = this.view.toMap(screenCoors);
            if (!this.firsring) {
                this.polygonMoveEvent = on(this.view, 'pointer-move', evt => {
                    this.polygonMoveFunc(evt);
                })
                if (this.movePolygon) {
                    this.view.graphics.remove(this.movePolygon);
                    this.movePolygon = null;
                }
                this.rings = [];
                this.firsring = clickPoint;
            }
            this.rings.push([clickPoint.longitude, clickPoint.latitude]);

        }
        doubleClickFunc(evt) {
            evt.stopPropagation();
            this.rings.push([this.point.longitude, this.point.latitude]);
            var polygonGraphic = this.createPolygonGraphic(this.rings);
            var findObjects = new FindObjects(this.view, this.layer);
            findObjects.findObjectPolygon(polygonGraphic);
            this.firsring = undefined;
            this.finish();
            this.view.on("click", e=> {
                e.stopPropagation();
                if (e.button === 2) {
                    if (this.movePolygon) {
                        this.view.graphics.remove(this.movePolygon);
                        this.movePolygon = null;
                    }
                }
            })
        }
        finish() {
            // if (this.movePolygon) {
            //     this.view.graphics.remove(this.movePolygon);
            //     this.movePolygon = null;
            // }
            if (this.clickBufferEvent) {
                this.clickBufferEvent.remove();
                this.clickBufferEvent = null;
            }
            if (this.polygonMoveEvent) {
                this.polygonMoveEvent.remove();
                this.polygonMoveEvent = null;
            }
            if (this.doubleClickEvent) {
                this.doubleClickEvent.remove();
                this.doubleClickEvent = null;
            }
        }
    }


});