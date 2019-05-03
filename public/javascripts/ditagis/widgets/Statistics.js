var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../core/Base", "../core/ConstName", "../toolview/GridWnd"], function (require, exports, Base, ConstName, GridWnd) {
    "use strict";
    class Statistics extends Base {
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
        getDataChart(chart, index) {
            let chartData = chart.options.series[0].data;
            let data = chartData.find(function (f) {
                return f.id === index;
            });
            return data;
        }
        setDataChart(chart, index, value) {
            this.getDataChart(chart, index).value = value;
        }
        bindingData() {
            var layer = this.view.map.findLayerById(ConstName.TramBTS);
            layer.then(_ => {
                let where = "1=1";
                if (layer.definitionExpression)
                    where = layer.definitionExpression;
                layer.queryFeatures({
                    where: where, outFields: ["TenDoanhNghiep", "TinhTrang"]
                }).then(f => {
                    let chartDN = this.chartDN.data("kendoChart"), chart = this.chart.data("kendoChart"), chart_1 = this.chart_1.data("kendoChart");
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
                    });
                    if (chartDN)
                        chartDN.refresh();
                    chart.refresh();
                    chart_1.options.series[0].data[0] = f.features.length;
                    chart_1.refresh();
                });
            });
            var diemCungCap = this.view.map.findLayerById(ConstName.DIEMDICHVU);
            diemCungCap.then(_ => {
                let where = "1=1";
                if (diemCungCap.definitionExpression)
                    where = diemCungCap.definitionExpression;
                diemCungCap.queryFeatureCount({
                    where: where
                }).then(r => {
                    let chart = this.chart_1.data("kendoChart");
                    chart.options.series[0].data[1] = r;
                    chart.refresh();
                });
            });
            var tuyenCapNgam = this.view.map.findLayerById(ConstName.TUYENCAPNGAM);
            let basemap = this.view.map.findLayerById(ConstName.BASEMAP);
            basemap.then(_ => {
                let huyenLayer = basemap.findSublayerById(ConstName.INDEX_HANHCHINHHUYEN);
                huyenLayer.queryFeatures({
                    outFields: ["MaHuyenTp"], where: "1=1", returnGeometry: true
                }).then(r => {
                    let chart = this.chart_1.data("kendoChart");
                    let where = "1=1";
                    if (tuyenCapNgam.definitionExpression)
                        where = tuyenCapNgam.definitionExpression;
                    r.features.forEach(f => {
                        let maHuyenTp = f.attributes.MaHuyenTp;
                        if (maHuyenTp && f.geometry) {
                            tuyenCapNgam.queryFeatureCount({
                                geometry: f.geometry, where: where
                            }).then(count => {
                                chart.options.series[0].data[2] = (chart.options.series[0].data[2] || 0) + (count || 0);
                                chart.refresh();
                            });
                        }
                    });
                });
            });
        }
        initView() {
            if (this.view.systemVariable.user.GroupRole === "STTTT") {
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
                categoryAxis: {
                    categories: ["Trạm BTS", "Điểm dịch vụ", "Tuyến cáp ngầm"]
                },
                seriesClick: this.onSeriesClick.bind(this)
            });
        }
        onSeriesClick(e) {
            var thongKeTramBTS = (huyenResults) => __awaiter(this, void 0, void 0, function* () {
                var dataSource = new kendo.data.DataSource({
                    pageSize: huyenResults.features.length
                });
                for (let i = 0; i < huyenResults.features.length; i++) {
                    const element = huyenResults.features[i];
                    const maHuyen = element.attributes.MaHuyenTp, tenHuyen = element.attributes.TenHuyenTp;
                    let layer = this.view.map.findLayerById(ConstName.TramBTS);
                    if (!layer)
                        return;
                    let where = "HuyenTXTP = " + maHuyen;
                    if (layer.definitionExpression)
                        where += " and " + layer.definitionExpression;
                    yield layer.queryFeatures({
                        where: where, outFields: ["TenDoanhNghiep"]
                    }).then(r => {
                        var layer = this.view.map.findLayerById(ConstName.TramBTS);
                        var codedDomain = layer.getFieldDomain("TenDoanhNghiep");
                        if (codedDomain) {
                            let item = {
                                STT: i + 1,
                                DiaDiem: tenHuyen,
                                Tong: r.features.length,
                            };
                            codedDomain.codedValues.forEach(codedValue => {
                                item[codedValue.code] = r.features.filter(fil => fil.attributes.TenDoanhNghiep === codedValue.code).length;
                            });
                            dataSource.add(item);
                        }
                    });
                }
                this.wndReport.grid.setDataSource(dataSource);
                kendo.ui.progress(this.wndReport.wnd.element, false);
            });
            var thongKeTuyenCapNgam = (huyenResults) => __awaiter(this, void 0, void 0, function* () {
                var dataSource = new kendo.data.DataSource({
                    pageSize: huyenResults.features.length
                });
                let layer = this.view.map.findLayerById(ConstName.TUYENCAPNGAM);
                if (!layer)
                    return;
                for (let i = 0; i < huyenResults.features.length; i++) {
                    const element = huyenResults.features[i];
                    const maHuyen = element.attributes.MaHuyenTp, tenHuyen = element.attributes.TenHuyenTp;
                    let where = "1=1";
                    if (layer.definitionExpression)
                        where += " and " + layer.definitionExpression;
                    yield layer.queryFeatures({
                        geometry: element.geometry, outFields: ["TenDoanhNghiep"], where: where
                    }).then(r => {
                        var layer = this.view.map.findLayerById(ConstName.TUYENCAPNGAM);
                        var codedDomain = layer.getFieldDomain("TenDoanhNghiep");
                        if (codedDomain) {
                            let item = {
                                STT: i + 1,
                                DiaDiem: tenHuyen,
                                SoLuongDieuTra: r.features.length,
                            };
                            codedDomain.codedValues.forEach(codedValue => {
                                item[codedValue.code] = r.features.filter(fil => fil.attributes.TenDoanhNghiep === codedValue.code).length;
                            });
                            dataSource.add(item);
                        }
                    });
                }
                this.wndReport.grid.setDataSource(dataSource);
                kendo.ui.progress(this.wndReport.wnd.element, false);
            });
            let category = e.category;
            var columns, calcFunc;
            let titleWindow = "";
            switch (category) {
                case "Trạm BTS":
                    columns = [
                        { title: "STT", field: "STT", width: 42 }, { title: "Địa điểm", field: "DiaDiem", width: 200 }
                    ];
                    var layer = this.view.map.findLayerById(ConstName.TramBTS);
                    var codedDomain = layer.getFieldDomain("TenDoanhNghiep");
                    if (codedDomain) {
                        let codedValues = [];
                        if (this.view.systemVariable.user.GroupRole === "DN") {
                            codedValues.push(codedDomain.codedValues.find(f => f.code === this.view.systemVariable.user.Role));
                        }
                        else {
                            codedValues = codedDomain.codedValues;
                        }
                        codedValues.forEach(codedValue => {
                            columns.push({ title: codedValue.name, field: codedValue.code, width: 60 });
                        });
                    }
                    columns.push({ title: "Tổng theo huyện", field: "Tong", width: 60 });
                    calcFunc = thongKeTramBTS;
                    titleWindow = "Thống kê Trạm BTS";
                    break;
                case "Tuyến cáp ngầm":
                    columns = [
                        { title: "STT", field: "STT", width: 42 }, { title: "Địa điểm", field: "DiaDiem", width: 200 },
                    ];
                    var layer = this.view.map.findLayerById(ConstName.TUYENCAPNGAM);
                    var codedDomain = layer.getFieldDomain("TenDoanhNghiep");
                    if (codedDomain) {
                        let codedValues = [];
                        if (this.view.systemVariable.user.GroupRole === "DN") {
                            codedValues.push(codedDomain.codedValues.find(f => f.code === this.view.systemVariable.user.Role));
                        }
                        else {
                            codedValues = codedDomain.codedValues;
                        }
                        codedValues.forEach(codedValue => {
                            columns.push({ title: codedValue.name, columns: [{ title: "Số tuyến cáp", field: codedValue.code, width: 60 }] });
                        });
                    }
                    columns.push({ title: "Số lượng điều tra", field: "SoLuongDieuTra", width: 60 });
                    titleWindow = "Thống kê tuyến cáp ngầm";
                    calcFunc = thongKeTuyenCapNgam;
                    break;
                default:
                    break;
            }
            if (!columns || !calcFunc)
                return;
            this.wndReport.wnd.setOptions({ title: titleWindow });
            this.wndReport.grid.setOptions({ columns: columns });
            this.wndReport.open();
            kendo.ui.progress(this.wndReport.wnd.element, true);
            let basemap = this.view.map.findLayerById(ConstName.BASEMAP);
            let huyenLayer = basemap.findSublayerById(ConstName.INDEX_HANHCHINHHUYEN);
            huyenLayer.queryFeatures({
                outFields: ["TenHuyenTp", "MaHuyenTp"], where: "1=1", returnGeometry: category === "Tuyến cáp ngầm"
            }).then(calcFunc);
        }
        initWidget() {
            this.container = $('<div/>', {
                class: "esri-widget esri-widget-button",
                title: this.options.title,
                id: 'print-tools',
                html: `<span class='${this.options.icon}'></span>`
            });
            this.container.click(e => {
                this.fire("click", this.pane);
            });
        }
    }
    return Statistics;
});
