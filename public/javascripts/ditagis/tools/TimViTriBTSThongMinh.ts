import FeatureLayer = require('esri/layers/FeatureLayer');
import GraphicsLayer = require('esri/layers/GraphicsLayer');
import Base = require('../core/Base');
import View = require('esri/views/View');
import MapView = require('esri/views/MapView');
import Graphic = require('esri/Graphic');
import Polygon = require('esri/geometry/Polygon');
import Point = require('esri/geometry/Point');
import Circle = require('esri/geometry/Circle');
import constName = require('../core/ConstName');
import geometryEngine = require('esri/geometry/geometryEngine')

import Color = require('esri/Color');
import SimpleFillSymbol = require('esri/symbols/SimpleFillSymbol');
import SimpleLineSymbol = require('esri/symbols/SimpleLineSymbol');
import GridWnd = require('../toolview/GridWnd');
import on = require('dojo/on');

interface ConstructorProperties {

}
class TimViTriBTSThongMinh extends Base {
  private view: MapView;
  public distance: number = 100;
  private pointerMoveHhandler: IHandle;
  private resultBufferGraphics: GraphicsLayer;
  private chooseGraphics: GraphicsLayer;
  private gridWnd: GridWnd;
  private clickHandler: IHandle = null;
  constructor(view: View, params?: ConstructorProperties) {
    super();
    this.view = view as MapView;
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
    })
  }
  get layer(): FeatureLayer {
    return this.view.map.findLayerById(constName.TramBTS) as FeatureLayer;
  }
  /**
   * Lấy tất cả trạm BTS tròng vùng
   * @param geometry vùng cần lấy trạm BST
   */
  private getAllBTS(geometry: Polygon): Promise<Graphic[]> {
    return new Promise((resolve, reject) => {
      let query = this.layer.createQuery();
      query.geometry = geometry;
      this.layer.queryFeatures(query).then(value => {
        resolve(value.features);
      })
    });

  }
  /**
   * Tạo vùng phủ cho trạm BTS
   * @param graphics đối tượng cần tạo vùng phủ
   */
  private renderVungPhuBTS(graphic: Graphic): Circle {
    const point: Point = graphic.geometry as Point,
      attributes = graphic.attributes,
      distance: number = attributes.VungPhu;
    if (!point || !attributes || !distance) return null;

    let circle = new Circle({
      center: point,
      radius: distance
    });
    return circle;
  }
  /**
   * Tạo buffer cho điểm với phạm vi
   * @param point Điểm cần tạo
   * @param distance Phạm vi
   */
  private buffer(point: Point, distance: number): Circle {
    if (!point || !distance) return null;

    let circle = new Circle({
      center: point,
      radius: distance
    });
    return circle;
  }
  public async find(geometry: Polygon, distance: number): Promise<Point[]> {
    let dataSource = new kendo.data.DataSource();
    this.distance = distance;
    let results: Point[] = [];
    let bts = await this.getAllBTS(geometry);
    let vungPhuBTS: Circle[] = [];
    for (const item of bts) {
      let circle = this.renderVungPhuBTS(item);
      if (circle)
        vungPhuBTS.push(circle);
    }
    let diff: Polygon = geometry;
    if (vungPhuBTS.length > 0) {
      let union = geometryEngine.union(vungPhuBTS);
      diff = geometryEngine.difference(geometry, union) as Polygon;
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
        outline: new SimpleLineSymbol({  // autocasts as SimpleLineSymbol
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
      if (!circle) return;
      let check = geometryEngine.within(circle, diff);
      let color = check ? new Color([22, 160, 133]) : new Color([231, 76, 60]);
      this.resultBufferGraphics.add(new Graphic({
        geometry: circle,
        symbol: new SimpleFillSymbol({
          color: color,
        })
      }))
      this.clickHandler = on.once(this.view, 'click', ec => {
        ec.stopPropagation();
        if (check) {
          // this.gridWnd.grid.dataSource.add({ X: ec.mapPoint.longitude, Y: ec.mapPoint.latitude })
          dataSource.add({ X: ec.mapPoint.longitude, Y: ec.mapPoint.latitude });
          this.gridWnd.grid.setDataSource(dataSource);
          this.chooseGraphics.add(new Graphic({
            geometry: ec.mapPoint,
            symbol: {
              type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
              style: "square",
              color: "blue",
              size: "8px",  // pixels
              outline: {  // autocasts as new SimpleLineSymbol()
                color: [255, 255, 0],
                width: 3  // points
              }
            }
          }));
        }
        this.gridWnd.open();
      }
      )
    })
    return await results;
  }
  public cancel() {
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
export = TimViTriBTSThongMinh;