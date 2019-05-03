define(["require", "exports", "../core/Base", "esri/Graphic", "esri/geometry/Polygon", "esri/geometry/geometryEngine", "esri/layers/GraphicsLayer", "esri/views/2d/draw/Draw"], function (require, exports, Base, Graphic, Polygon, geometryEngine, GraphicsLayer, Draw) {
    "use strict";
    class MeasureArea extends Base {
        constructor(options) {
            super();
            this._active = false;
            this.options = {
                position: "top-right",
                icon: "esri-icon-polygon",
                title: 'Đo diện tích'
            };
            this.view = options.view;
            this.graphics = new GraphicsLayer({ listMode: "hide" });
            this.view.map.add(this.graphics);
            this.draw = new Draw({
                view: this.view
            });
            this.initWidget();
        }
        initWidget() {
            this.container = $('<div/>', {
                class: "esri-widget esri-widget-button",
                title: this.options.title,
                id: 'print-tools',
                html: `<span class='${this.options.icon}'></span>`
            });
            this.container.click(_ => {
                this.graphics.removeAll();
                if (!this._active)
                    this.enableCreatePolygon(this.draw);
                this.changeActive();
            });
        }
        enableCreatePolygon(draw) {
            var action = draw.create("polygon");
            this.view.focus();
            action.on("vertex-add", this.drawPolygon.bind(this));
            action.on("cursor-update", this.drawPolygon.bind(this));
            action.on("vertex-remove", this.drawPolygon.bind(this));
            action.on("draw-complete", this.drawPolygon.bind(this));
        }
        drawPolygon(evt) {
            var vertices = evt.vertices;
            this.graphics.removeAll();
            var polygon = this.createPolygon(vertices);
            var graphic = this.createGraphic(polygon);
            this.graphics.add(graphic);
            var area = geometryEngine.geodesicArea(polygon, "square-meters");
            if (area < 0) {
                var simplifiedPolygon = geometryEngine.simplify(polygon);
                if (simplifiedPolygon) {
                    area = geometryEngine.geodesicArea(simplifiedPolygon, "square-meters");
                }
            }
            this.labelAreas(polygon, area);
        }
        createPolygon(vertices) {
            return new Polygon({
                rings: vertices,
                spatialReference: this.view.spatialReference
            });
        }
        createGraphic(polygon) {
            var graphic = new Graphic({
                geometry: polygon,
                symbol: {
                    type: "simple-fill",
                    color: [178, 102, 234, 0.8],
                    style: "solid",
                    outline: {
                        color: [255, 255, 255],
                        width: 2
                    }
                }
            });
            return graphic;
        }
        labelAreas(geom, area) {
            var graphic = new Graphic({
                geometry: geom.centroid,
                symbol: {
                    type: "text",
                    color: "white",
                    haloColor: "black",
                    haloSize: "1px",
                    text: area.toFixed(2) + " m2",
                    xoffset: 3,
                    yoffset: 3,
                    font: {
                        size: 14,
                        family: "sans-serif"
                    }
                }
            });
            this.graphics.add(graphic);
        }
        changeActive() {
            this.container.toggleClass('widget-button-selected');
            this._active = !this._active;
        }
    }
    return MeasureArea;
});
