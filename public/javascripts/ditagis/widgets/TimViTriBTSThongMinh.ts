import Draw = require("esri/views/2d/draw/Draw");
import View = require('esri/views/View');
import PolygonDrawAction = require('esri/views/2d/draw/PolygonDrawAction');
import Graphic = require('esri/Graphic');
import Polygon = require('esri/geometry/Polygon');
import Color = require('esri/Color');
import SimpleFillSymbol = require('esri/symbols/SimpleFillSymbol');
import SimpleLineSymbol = require('esri/symbols/SimpleLineSymbol');
import TimViTriBTSThongMinhTool = require('../tools/TimViTriBTSThongMinh');
import SketchViewModel = require('esri/widgets/Sketch/SketchViewModel');
class TimViTriBTSThongMinh {
  private view: View;
  private draw: SketchViewModel;
  private drawAction: PolygonDrawAction;
  private tool: TimViTriBTSThongMinhTool;
  private container: JQuery;
  private isActive: boolean = false;

  constructor(view: View, params?) {
    this.view = view;
    this.tool = new TimViTriBTSThongMinhTool(view);
    this.draw = new SketchViewModel({
      view: view,
      polygonSymbol: new SimpleFillSymbol({
        style: "none",
        outline: new SimpleLineSymbol({  // autocasts as SimpleLineSymbol
          color: new Color("black"),
          width: 1
        })
      })
    });

    this.draw.on("draw-complete", e => {
      this.view.graphics.add(e.graphic)
      let vertices: any = e.vertices;
      kendo.prompt("Nhập vùng phủ trạm BTS", this.tool.distance + "").then(value => {
        try {
          this.tool.find(e.geometry, parseInt(value));  
        } catch (error) {
          kendo.alert(error);
        }
        
      }, _ => {
        kendo.alert('Hủy thao tác');
      })
    })
    this.initWidget();
  }
  initWidget() {
    this.container = $('<div/>', {
      class: "esri-widget esri-widget-button",
      title: "Tìm vị trí trạm BTS Thông minh",
      html: `<span class='esri-icon-environment-settings'></span>`
    }).appendTo(document.body);
    this.container.click(e => {
      this.changeActive();
      this.view.graphics.removeAll();
      if (!this.isActive) {
        this.draw.reset();
        this.tool.cancel();
      } else {
        this.draw.create('polygon');
      }
    })
  }
  changeActive() {
    this.container.toggleClass('widget-button-selected');
    this.isActive = !this.isActive;
  }
}
export = TimViTriBTSThongMinh;