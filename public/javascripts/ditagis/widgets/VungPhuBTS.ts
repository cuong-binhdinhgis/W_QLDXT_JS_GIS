import Base = require('../core/Base');
import Polyline = require("esri/geometry/Polyline");
import Graphic = require("esri/Graphic");
import Polygon = require("esri/geometry/Polygon");
import geometryEngine = require("esri/geometry/geometryEngine");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Draw = require("esri/views/2d/draw/Draw");
import VungPhuBTSTool = require('../tools/VungPhuBTS');
import TimViTriBTSThongMinh = require('../tools/TimViTriBTSThongMinh');
import constName = require('../core/ConstName');


class VungPhuBTS extends Base {
  private view: __esri.MapView;
  private container: JQuery;
  private tool: VungPhuBTSTool;
  private _active: boolean = false;
  private clickHandle: IHandle;
  private dlgContainer: JQuery;
  private dlgDropDown: kendo.ui.DropDownList
  private eHandleValue;
  constructor(options) {
    super();
    this.options = {
      position: "top-right",
      icon: "esri-icon-radio-checked",
      title: 'Vùng phủ BTS'
    };
    this.view = options.view;
    this.tool = new VungPhuBTSTool(this.view);
    // this.setOptions(options);
    this.initWidget();
    this.initWnd();
  }

  private initWidget() {
    this.container = $('<div/>', {
      class: "esri-widget esri-widget-button",
      title: this.options.title,
      id: 'print-tools',
      html: `<span class='${this.options.icon}'></span>`
    })
    this.container.click(_ => {
      this.changeActive();
    })
  }
  private changeActive() {
    this.container.toggleClass('widget-button-selected');
    this._active = !this._active;
    if (this._active) {
      $("#map").css("cursor", "crosshair")
      this.clickHandle = this.view.on('click', this.onViewClickHandler.bind(this))
    } else {
      $("#map").css("cursor", "default")
      this.clickHandle.remove();
      this.clickHandle = null;
      this.tool.clear();
      this.eHandleValue = null;
    }
  }
  private onViewClickHandler(e) {
    e.stopPropagation();
    this.view.hitTest({
      x: e.x,
      y: e.y
    }).then(hitTestResult => {
      const results = hitTestResult.results;
      let result = results.find(f => {
        return f.graphic.layer.id === constName.TramBTS;
      });
      if (result) {
        let graphic = result.graphic;
        let attributes = graphic.attributes;
        let dataSource = new kendo.data.DataSource();
        dataSource.add({ code: null, name: 'Tất cả' });
        if (attributes['ThietBiLapDat2G'])
          dataSource.add({ code: 'ThietBiLapDat2G', name: '2G' });
        if (attributes['ThietBiLapDat3G'])
          dataSource.add({ code: 'ThietBiLapDat3G', name: '3G' });
        if (attributes['ThietBiLapDat4G'])
          dataSource.add({ code: 'ThietBiLapDat4G', name: '4G' });
        this.dlgDropDown.setDataSource(dataSource);
        this.dlgDropDown.select(0);
        this.eHandleValue = e;
        this.wnd.open();
      } else {
        this.tool.clear();
        this.eHandleValue = null
      }
    });

  }
  private get wnd(): kendo.ui.Dialog {
    return this.dlgContainer.data("kendoDialog");
  }
  private initWnd() {
    this.dlgContainer = $("<div/>");
    this.dlgContainer.kendoDialog({
      width: "300px",
      title: "Chọn thiết bị",
      visible: false,
      closable: false,
      modal: false,
      content: "<input style='width:100%'></input>",
      actions: [{
        text: 'Hiển thị',
        action: this.onHienThiAction.bind(this)
      },
      {
        text: 'Đóng',
      }
      ]
    });
    let cb = this.dlgContainer.find('input');
    cb.kendoDropDownList({
      dataTextField: "name",
      dataValueField: "code"
    });
    this.dlgDropDown = cb.data("kendoDropDownList")
  }
  private onHienThiAction() {
    let val = this.dlgContainer.find('input').val();
    this.tool.singleBusiness(this.eHandleValue, val as string);
  }
}
export = VungPhuBTS;