import Base = require('../core/Base');
import ConstName = require('../core/ConstName');
import GridWnd = require('../toolview/GridWnd');

class Statistics extends Base {
  public container: JQuery;
  public pane: JQuery
  private chartDN: JQuery;
  private chart: JQuery;
  private chart_1: JQuery;
  private view: __esri.MapView;
  private wndReport: GridWnd
  constructor(view) {
    super();
    this.view = view;
    this.options = {
      position: "top-right",
      icon: "esri-icon-chart",
      title: 'Thống kê'
    };
    this.pane = $("<div/>");
    this.chart_1 = $("<div/>").appendTo(this.pane);
    this.chart = $("<div/>").appendTo(this.pane);
    this.chartDN = $("<div/>").appendTo(this.pane);
    this.wndReport = new GridWnd({
      window: {
        title: "Thống kê trạm BTS"
      },
      grid: { height: 500 }
    });
    this.initWidget();
    this.initView();
    this.bindingData();
  }
  private getDataChart(chart: kendo.dataviz.ui.Chart, index: number): any {
    let chartData = chart.options.series[0].data;
    let data = chartData.find(function (f) {
      return f.id === index;
    });
    return data;
  }
  private setDataChart(chart: kendo.dataviz.ui.Chart, index: number, value: number) {
    this.getDataChart(chart, index).value = value;
    // this.chart.refresh();
  }
  private bindingData() {
    var layer: __esri.FeatureLayer = this.view.map.findLayerById(ConstName.TramBTS) as __esri.FeatureLayer;
    layer.then(_ => {
      let where = "1=1";
      if (layer.definitionExpression)
        where = layer.definitionExpression;
      layer.queryFeatures(<__esri.Query>{
        where: where, outFields: ["TenDoanhNghiep", "TinhTrang"]
      }).then(f => {
        let chartDN = this.chartDN.data("kendoChart"),
          chart = this.chart.data("kendoChart"),
          chart_1 = this.chart_1.data("kendoChart");

        f.features.forEach(r => {
          if (r.attributes.TenDoanhNghiep) {
            if (chartDN) {
              var data = this.getDataChart(chartDN, r.attributes.TenDoanhNghiep);
              if (data)
                data.value += 1;
            }
          }
          if (r.attributes.TinhTrang) {
            var data = this.getDataChart(chart, r.attributes.TinhTrang);
            if (data)
              data.value += 1;
          }
        })
        if (chartDN)
          chartDN.refresh();
        chart.refresh();
        chart_1.options.series[0].data[0] = f.features.length;
        chart_1.refresh();
      })
    })
    var diemCungCap: __esri.FeatureLayer = this.view.map.findLayerById(ConstName.DIEMDICHVU) as __esri.FeatureLayer;
    diemCungCap.then(_ => {
      let where = "1=1";
      if (diemCungCap.definitionExpression)
        where = diemCungCap.definitionExpression;
      diemCungCap.queryFeatureCount({
        where: where
      }).then(r => {
        let chart = this.chart_1.data("kendoChart")
        chart.options.series[0].data[1] = r;
        chart.refresh();
      })
    })
    var tuyenCapNgam: __esri.FeatureLayer = this.view.map.findLayerById(ConstName.TUYENCAPNGAM) as __esri.FeatureLayer;
    let basemap = this.view.map.findLayerById(ConstName.BASEMAP) as __esri.MapImageLayer;
    basemap.then(_ => {
      let huyenLayer = basemap.findSublayerById(ConstName.INDEX_HANHCHINHHUYEN);
      huyenLayer.queryFeatures(<__esri.Query>{
        outFields: ["MaHuyenTp"], where: "1=1", returnGeometry: true
      }).then(r => {
        let chart = this.chart_1.data("kendoChart")

        let where = "1=1";
        if (tuyenCapNgam.definitionExpression)
          where = tuyenCapNgam.definitionExpression;

        r.features.forEach(f => {
          let maHuyenTp = f.attributes.MaHuyenTp;
          if (maHuyenTp && f.geometry) {
            tuyenCapNgam.queryFeatureCount(<__esri.Query>{
              geometry: f.geometry, where: where
            }).then(count => {
              chart.options.series[0].data[2] = (chart.options.series[0].data[2] || 0) + (count || 0);
              chart.refresh();
            })
          }
        })
      })
    })
    // tuyenCapNgam.then(_ => {
    //   let where = "1=1";
    //   if (tuyenCapNgam.definitionExpression)
    //     where = tuyenCapNgam.definitionExpression;
    //   tuyenCapNgam.queryFeatureCount({
    //     where: where
    //   }).then(r => {
    //     let chart = this.chart_1.data("kendoChart")
    //     chart.options.series[0].data[2] = r;
    //     chart.refresh();
    //   })
    // })
  }
  initView() {
    if ((this.view as any).systemVariable.user.GroupRole === "STTTT") {
      this.chartDN.kendoChart({
        title: {
          position: "top",
          text: "Biểu đồ số lượng trạm BTS của doanh nghiệp"
        },
        legend: {
          visible: false,
          position: "bottom"
        },
        chartArea: {
          background: "", height: 300, width: 400
        },
        series: [{
          type: "pie",
          startAngle: 150,
          data: [{
            category: "VNPT",
            id: "VNPT",
            value: 0,
            color: "rgb(0, 148, 248)"
          }, {
            category: "Viettel",
            id: "VTL",
            value: 0,
            color: "rgb(0, 249, 36)"
          }, {
            category: "GTel",
            id: "GTL",
            value: 0,
            color: "rgb(255, 204, 36)"
          }, {
            category: "Vietnamobile",
            id: "VNM",
            value: 0,
            color: "rgb(252, 160, 0)"
          }, {
            category: "Mobifone",
            id: "MBF",
            value: 0,
            color: "rgb(249, 0, 0)"
          }]
        }],
        tooltip: {
          visible: true,
          template: "#= category # : #= value#"
        }
      });
    }
    this.chart.kendoChart({
      title: {
        position: "top",
        text: "Biểu đồ trạng thái trạm BTS"
      },
      legend: {
        visible: false,
        position: "bottom"
      },
      chartArea: {
        background: "", height: 300, width: 400
      },
      series: [{
        type: "pie",
        startAngle: 150,
        data: [{
          category: "Doanh nghiệp xin cấp phép",
          id: 1,
          value: 0,
          color: "rgb(0, 148, 248)"
        }, {
          category: "Sở cấp phép",
          id: 2,
          value: 0,
          color: "rgb(0, 249, 36)"
        }, {
          category: "Hoàn công",
          id: 3,
          value: 0,
          color: "rgb(255, 204, 36)"
        }, {
          category: "Không cấp phép",
          id: 4,
          value: 0,
          color: "rgb(252, 160, 0)"
        }]
      }],
      tooltip: {
        visible: true,
        template: "#= category # : #= value#"
      }
    });
    this.chart_1.kendoChart({
      seriesDefaults: {
        type: "column",
        labels: {
          visible: true,
          background: "transparent"
        }
      },
      chartArea: {
        background: "", height: 300, width: 400
      },
      legend: {
        visible: false,
      },
      title: {
        text: "Số lượng dữ liệu viễn thông"
      },
      series: [{
        data: [0, 0, 0],
        color: "rgb(0, 94, 181)"
      }],
      categoryAxis: <any>{
        categories: ["Trạm BTS", "Điểm dịch vụ", "Tuyến cáp ngầm"]
      },
      seriesClick: this.onSeriesClick.bind(this)
    });
  }
  private onSeriesClick(e: kendo.dataviz.ui.ChartSeriesClickEvent) {
    var thongKeTramBTS = async (huyenResults: __esri.FeatureSet): Promise<any> => {
      var dataSource = new kendo.data.DataSource({
        pageSize: huyenResults.features.length
      });
      for (let i = 0; i < huyenResults.features.length; i++) {
        const element = huyenResults.features[i];
        const maHuyen = element.attributes.MaHuyenTp,
          tenHuyen = element.attributes.TenHuyenTp;
        let layer = this.view.map.findLayerById(ConstName.TramBTS) as __esri.FeatureLayer;
        if (!layer) return;
        let where = "HuyenTXTP = " + maHuyen;
        if (layer.definitionExpression)
          where += " and " + layer.definitionExpression;
        await layer.queryFeatures(<__esri.Query>{
          where: where, outFields: ["TenDoanhNghiep"]
        }).then(r => {
          var layer = this.view.map.findLayerById(ConstName.TramBTS) as __esri.FeatureLayer;
          var codedDomain = layer.getFieldDomain("TenDoanhNghiep") as __esri.CodedValueDomain;
          if (codedDomain) {
            let item = {
              STT: i + 1,
              DiaDiem: tenHuyen,
              Tong: r.features.length,
            };
            codedDomain.codedValues.forEach(codedValue => {
              item[codedValue.code] = r.features.filter(fil => fil.attributes.TenDoanhNghiep === codedValue.code).length;
            })
            dataSource.add(item);
          }
        })
      }
      this.wndReport.grid.setDataSource(dataSource);
      kendo.ui.progress(this.wndReport.wnd.element, false);
    }
    var thongKeTuyenCapNgam = async (huyenResults: __esri.FeatureSet): Promise<any> => {
      var dataSource = new kendo.data.DataSource({
        pageSize: huyenResults.features.length
      });
      let layer = this.view.map.findLayerById(ConstName.TUYENCAPNGAM) as __esri.FeatureLayer;
      if (!layer) return;
      for (let i = 0; i < huyenResults.features.length; i++) {
        const element = huyenResults.features[i];
        const maHuyen = element.attributes.MaHuyenTp,
          tenHuyen = element.attributes.TenHuyenTp;
        //truy vấn tuyến cáp theo huyện
        let where = "1=1";
        if (layer.definitionExpression)
          where += " and " + layer.definitionExpression;
        await layer.queryFeatures(<__esri.Query>{
          geometry: element.geometry, outFields: ["TenDoanhNghiep"], where: where
        }).then(r => {
          var layer = this.view.map.findLayerById(ConstName.TUYENCAPNGAM) as __esri.FeatureLayer;
          var codedDomain = layer.getFieldDomain("TenDoanhNghiep") as __esri.CodedValueDomain;
          if (codedDomain) {
            let item = {
              STT: i + 1,
              DiaDiem: tenHuyen,
              SoLuongDieuTra: r.features.length,
            };
            codedDomain.codedValues.forEach(codedValue => {
              item[codedValue.code] = r.features.filter(fil => fil.attributes.TenDoanhNghiep === codedValue.code).length;
            })
            dataSource.add(item);
          }

        })
      }
      this.wndReport.grid.setDataSource(dataSource);
      kendo.ui.progress(this.wndReport.wnd.element, false);
    }
    let category = e.category;
    var columns: kendo.ui.GridColumn[], calcFunc;
    let titleWindow = "";
    switch (category) {
      case "Trạm BTS":
        columns = [
          { title: "STT", field: "STT", width: 42 }, { title: "Địa điểm", field: "DiaDiem", width: 200 }
        ];
        var layer = this.view.map.findLayerById(ConstName.TramBTS) as __esri.FeatureLayer;
        var codedDomain = layer.getFieldDomain("TenDoanhNghiep") as __esri.CodedValueDomain;
        if (codedDomain) {
          let codedValues = [];
          if (((this.view as any).systemVariable as any).user.GroupRole === "DN") {
            codedValues.push(codedDomain.codedValues.find(f => f.code === ((this.view as any).systemVariable as any).user.Role));
          } else {
            codedValues = codedDomain.codedValues;
          }
          codedValues.forEach(codedValue => {
            columns.push({ title: codedValue.name, field: codedValue.code as string, width: 60 })
          })
        }
        columns.push({ title: "Tổng theo huyện", field: "Tong", width: 60 });
        calcFunc = thongKeTramBTS;
        titleWindow = "Thống kê Trạm BTS"
        break;
      case "Tuyến cáp ngầm":
        columns = [
          { title: "STT", field: "STT", width: 42 }, { title: "Địa điểm", field: "DiaDiem", width: 200 },
        ]
        var layer = this.view.map.findLayerById(ConstName.TUYENCAPNGAM) as __esri.FeatureLayer;
        var codedDomain = layer.getFieldDomain("TenDoanhNghiep") as __esri.CodedValueDomain;
        if (codedDomain) {
          let codedValues = [];
          if (((this.view as any).systemVariable as any).user.GroupRole === "DN") {
            codedValues.push(codedDomain.codedValues.find(f => f.code === ((this.view as any).systemVariable as any).user.Role));
          } else {
            codedValues = codedDomain.codedValues;
          }
          codedValues.forEach(codedValue => {
            columns.push({ title: codedValue.name, columns: [{ title: "Số tuyến cáp", field: codedValue.code, width: 60 }] })
          })
        }
        columns.push({ title: "Số lượng điều tra", field: "SoLuongDieuTra", width: 60 });
        titleWindow = "Thống kê tuyến cáp ngầm"
        calcFunc = thongKeTuyenCapNgam;
        break;
      default:
        break;
    }
    if (!columns || !calcFunc) return;
    this.wndReport.wnd.setOptions({ title: titleWindow })
    this.wndReport.grid.setOptions({ columns: columns });
    this.wndReport.open();
    kendo.ui.progress(this.wndReport.wnd.element, true);
    let basemap = this.view.map.findLayerById(ConstName.BASEMAP) as __esri.MapImageLayer;
    let huyenLayer = basemap.findSublayerById(ConstName.INDEX_HANHCHINHHUYEN);
    huyenLayer.queryFeatures(<__esri.Query>{
      outFields: ["TenHuyenTp", "MaHuyenTp"], where: "1=1", returnGeometry: category === "Tuyến cáp ngầm"
    }).then(calcFunc)
  }
  private initWidget() {
    this.container = $('<div/>', {
      class: "esri-widget esri-widget-button",
      title: this.options.title,
      id: 'print-tools',
      html: `<span class='${this.options.icon}'></span>`
    })
    this.container.click(e => {
      this.fire("click", this.pane);
    });

  }

}
export = Statistics