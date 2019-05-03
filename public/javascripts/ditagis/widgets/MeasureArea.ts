import Base = require('../core/Base');
import Polyline = require("esri/geometry/Polyline");
import Graphic = require("esri/Graphic");
import Polygon = require("esri/geometry/Polygon");
import geometryEngine = require("esri/geometry/geometryEngine");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Draw = require("esri/views/2d/draw/Draw");
class MeasureArea extends Base {
  private view: __esri.MapView;
  private container: JQuery;
  private graphics: GraphicsLayer;
  private draw: Draw;
  private _active: boolean = false;
  constructor(options) {
    super();
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
    // this.setOptions(options);
    this.initWidget();
  }

  private initWidget() {
    this.container = $('<div/>', {
      class: "esri-widget esri-widget-button",
      title: this.options.title,
      id: 'print-tools',
      html: `<span class='${this.options.icon}'></span>`
    })
    this.container.click(_ => {
      this.graphics.removeAll();
      if (!this._active)
        this.enableCreatePolygon(this.draw);
      this.changeActive();
    })
  }
  private enableCreatePolygon(draw) {
    // create() will return a reference to an instance of PolygonDrawAction
    var action = draw.create("polygon");

    // focus the view to activate keyboard shortcuts for drawing polygons
    this.view.focus();

    // listen to vertex-add event on the action
    action.on("vertex-add", this.drawPolygon.bind(this));

    // listen to cursor-update event on the action
    action.on("cursor-update", this.drawPolygon.bind(this));

    // listen to vertex-remove event on the action
    action.on("vertex-remove", this.drawPolygon.bind(this));

    // *******************************************
    // listen to draw-complete event on the action
    // *******************************************
    action.on("draw-complete", this.drawPolygon.bind(this));
  }

  // this function is called from the polygon draw action events
  // to provide a visual feedback to users as they are drawing a polygon
  private drawPolygon(evt) {
    var vertices = evt.vertices;

    //remove existing graphic
    this.graphics.removeAll();

    // create a new polygon
    var polygon = this.createPolygon(vertices);

    // create a new graphic representing the polygon, add it to the view
    var graphic = this.createGraphic(polygon);
    this.graphics.add(graphic);

    // calculate the area of the polygon
    var area = geometryEngine.geodesicArea(polygon, "square-meters");
    if (area < 0) {
      // simplify the polygon if needed and calculate the area again
      var simplifiedPolygon: Polygon = geometryEngine.simplify(polygon) as Polygon;
      if (simplifiedPolygon) {
        area = geometryEngine.geodesicArea(simplifiedPolygon, "square-meters");
      }
    }
    // start displaying the area of the polygon
    this.labelAreas(polygon, area);
  }

  // create a polygon using the provided vertices
  private createPolygon(vertices) {
    return new Polygon({
      rings: vertices,
      spatialReference: this.view.spatialReference
    });
  }

  // create a new graphic representing the polygon that is being drawn on the view
  private createGraphic(polygon) {
    var graphic = new Graphic({
      geometry: polygon,
      symbol: {
        type: "simple-fill", // autocasts as SimpleFillSymbol
        color: [178, 102, 234, 0.8],
        style: "solid",
        outline: { // autocasts as SimpleLineSymbol
          color: [255, 255, 255],
          width: 2
        }
      }
    });
    return graphic;
  }

  //Label polyon with its area
  private labelAreas(geom, area) {
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
        font: { // autocast as Font
          size: 14,
          family: "sans-serif"
        }
      }
    });
    this.graphics.add(graphic);
  }
  private changeActive() {
    this.container.toggleClass('widget-button-selected');
    this._active = !this._active;
  }
}
export = MeasureArea;