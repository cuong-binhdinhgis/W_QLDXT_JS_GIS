/**
 * Chức năng vẽ đường dẫn dây điện: là đường thẳng
 * Tham số truyền vào (view, fixedLayers, drawLayer, systemVariable)
 * fixedLayers: Layer trụ điện khi tìm kiếm so trùng (hittest) Graphics
 * drawLayer: là layer để vẽ dây điện: Nhánh dây mạch điện
 */
define([
  "ditagis/core/Base",
  "esri/views/2d/draw/Draw",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
  "esri/geometry/Polyline",
  "esri/symbols/TextSymbol",
], function (Base, Draw, GraphicsLayer, Graphic, Polyline, TextSymbol, ) {
  'use strict';
  return class extends Base {
    constructor(view) {
      super();
      this.view = view;
      this.graphicsLayer = new GraphicsLayer({
        listMode: "hide"
      });
      this.labelGraphicsLayer = new GraphicsLayer({
        listMode: "hide"
      });
      view.map.add(this.graphicsLayer);
      view.map.add(this.labelGraphicsLayer);
      this.esriDraw = new Draw({
        view: view
      })
      this.events = [];
      this.graphicNotify;
    }
    draw(layer) {
      this.cancel();
      let action = this.esriDraw.create("polyline")
      this.events.push(action.on("vertex-add", this.updateVertices.bind(this)))
      this.events.push(action.on("vertex-remove", this.updateVertices.bind(this)))
      this.events.push(action.on("cursor-update", this.updateVertices.bind(this)))
      this.events.push(action.on("draw-complete", this.updateVertices.bind(this)))
      this.graphicNotify = this.displayLabel(this.view.center, "Nhấn vào màn hình để vẽ");
      this.view.graphics.add(this.graphicNotify);
    }
    updateVertices(evt) {
      this.view.graphics.remove(this.graphicNotify);
      this.graphicsLayer.removeAll();
      let graphic = this.createGraphic(evt.vertices);
      if (evt.type === "draw-complete") {
        this.eventListener.fire('draw-finish', graphic.geometry);
      } else {
        this.graphicsLayer.add(graphic);
      }
    }
    createGraphic(vertices) {
      var graphic = new Graphic({
        geometry: new Polyline({
          paths: [vertices],
          spatialReference: this.view.spatialReference
        }),
        symbol: {
          type: "simple-line",
          color: [178, 102, 234],
          width: 1,
          cap: "round",
          join: "round"
        }
      });
      return graphic;
    }
    displayLabel(geom, txt) {
      let symbolProperties = {
        color: "#505459",
        text: txt,
        xoffset: 3,
        yoffset: 3,
        font: { // autocast as Font
          size: 12,
          family: "sans-serif"
        }
      };
      let symbol = new TextSymbol(symbolProperties);

      var graphic = new Graphic({
        geometry: geom,
        symbol: symbol
      });
      return graphic;
    }
    cancel() {
      this.events.forEach(f => {
        f.remove();
      })
      this.events = [];
      this.graphicsLayer.removeAll();
    }
  }
});