define(["require", "exports", "esri/views/2d/draw/Draw", "esri/layers/GraphicsLayer", "esri/Graphic", "esri/geometry/Polyline", "esri/geometry/geometryEngine", "esri/geometry/Point", "esri/symbols/TextSymbol"], function (require, exports, Draw, GraphicsLayer, Graphic, Polyline, geometryEngine, Point, TextSymbol) {
    "use strict";
    class Measure {
        constructor(view) {
            this.events = [];
            this.view = view;
            this.initWidget();
            this.draw = new Draw({ view: view });
        }
        initWidget() {
            this.container = $('<div/>', {
                class: "esri-widget esri-widget-button",
                title: "Đo khoảng cách",
                html: `<span class="esri-icon-map-pin"></span>`
            });
            this.container.click(this.onClickWidget.bind(this));
        }
        onClickWidget() {
            if (this.isActive)
                this.finish();
            else {
                this.graphicsLayer = new GraphicsLayer({ listMode: "hide" });
                this.view.map.add(this.graphicsLayer);
                this.labelGraphicsLayer = new GraphicsLayer({ listMode: "hide" });
                this.view.map.add(this.labelGraphicsLayer);
                this.enableCreateLine();
            }
            this.changeActive();
        }
        enableCreateLine() {
            let action = this.draw.create("polyline");
            this.events.push(action.on("vertex-add", this.updateVertices.bind(this)));
            this.events.push(action.on("vertex-remove", this.updateVertices.bind(this)));
            this.events.push(action.on("cursor-update", this.updateVertices.bind(this)));
            this.events.push(action.on("draw-complete", this.updateVertices.bind(this)));
        }
        changeActive() {
            this.container.toggleClass('widget-button-selected');
            this.isActive = !this.isActive;
        }
        getLastPointFromVertices(vertices) {
            if (vertices.length > 0) {
                let lastVer = vertices[vertices.length - 1];
                let point = new Point({
                    x: lastVer[0], y: lastVer[1], spatialReference: this.view.spatialReference
                });
                return point;
            }
            else {
                return null;
            }
        }
        displayLabel(geom, txt, type) {
            let isLargeSize = type === "draw-complete" || type === "vertex-add";
            let symbolProperties = {
                color: "#005eb5",
                text: txt + " m",
                xoffset: 3,
                yoffset: 3,
                font: {
                    size: isLargeSize ? 17 : 12,
                    family: "sans-serif"
                }
            };
            let symbol = new TextSymbol(symbolProperties);
            var graphic = new Graphic({
                geometry: geom,
                symbol: symbol
            });
            if (isLargeSize)
                this.labelGraphicsLayer.add(graphic);
            else
                this.graphicsLayer.add(graphic);
        }
        getDistance(geometry) {
            let distance = geometryEngine.geodesicLength(geometry, 'meters');
            distance = Math.round(distance * 10000) / 10000;
            return distance;
        }
        updateVertices(evt) {
            this.graphicsLayer.removeAll();
            let graphic = this.createGraphic(evt.vertices);
            let lastPoint = this.getLastPointFromVertices(evt.vertices);
            if (lastPoint) {
                this.displayLabel(lastPoint, this.getDistance(graphic.geometry), evt.type);
            }
            this.graphicsLayer.add(graphic);
        }
        createGraphic(vertices) {
            var graphic = new Graphic({
                geometry: new Polyline({
                    paths: [vertices],
                    spatialReference: this.view.spatialReference
                }),
                symbol: {
                    type: "simple-line",
                    style: "dash",
                    color: "#000",
                    width: 1,
                    cap: "round",
                    join: "round"
                }
            });
            return graphic;
        }
        finish() {
            this.events.forEach(f => {
                f.remove();
            });
            this.events = [];
            this.graphicsLayer.removeAll();
            this.labelGraphicsLayer.removeAll();
            this.view.map.remove(this.graphicsLayer);
            this.view.map.remove(this.labelGraphicsLayer);
        }
    }
    return Measure;
});
