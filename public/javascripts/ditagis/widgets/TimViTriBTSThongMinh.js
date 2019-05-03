define(["require", "exports", "esri/Color", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "../tools/TimViTriBTSThongMinh", "esri/widgets/Sketch/SketchViewModel"], function (require, exports, Color, SimpleFillSymbol, SimpleLineSymbol, TimViTriBTSThongMinhTool, SketchViewModel) {
    "use strict";
    class TimViTriBTSThongMinh {
        constructor(view, params) {
            this.isActive = false;
            this.view = view;
            this.tool = new TimViTriBTSThongMinhTool(view);
            this.draw = new SketchViewModel({
                view: view,
                polygonSymbol: new SimpleFillSymbol({
                    style: "none",
                    outline: new SimpleLineSymbol({
                        color: new Color("black"),
                        width: 1
                    })
                })
            });
            this.draw.on("draw-complete", e => {
                this.view.graphics.add(e.graphic);
                let vertices = e.vertices;
                kendo.prompt("Nhập vùng phủ trạm BTS", this.tool.distance + "").then(value => {
                    try {
                        this.tool.find(e.geometry, parseInt(value));
                    }
                    catch (error) {
                        kendo.alert(error);
                    }
                }, _ => {
                    kendo.alert('Hủy thao tác');
                });
            });
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
                }
                else {
                    this.draw.create('polygon');
                }
            });
        }
        changeActive() {
            this.container.toggleClass('widget-button-selected');
            this.isActive = !this.isActive;
        }
    }
    return TimViTriBTSThongMinh;
});
