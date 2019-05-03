define(["require", "exports", "../core/Base", "../layers/FeatureLayer", "esri/widgets/LayerList"], function (require, exports, Base, FeatureLayer, LayerList) {
    "use strict";
    class LayerListDTG extends Base {
        constructor(view) {
            super();
            this.view = view;
            this.pane = $("<div/>");
            let layerList = new LayerList({
                view: view, container: this.pane[0]
            });
            this.options = {
                position: "top-right",
                icon: "esri-icon-layers",
                title: 'Thông tin bản đồ'
            };
            this.initWidget();
        }
        initWidget() {
            this.container = $('<div/>', {
                class: "esri-widget esri-widget-button",
                title: this.options.title,
                html: `<span class='${this.options.icon}'></span>`
            });
            this.container.click(e => {
                this.fire("click", this.pane);
            });
        }
        onLayerViewCreate(e) {
            if (e.layer.listMode != "hide" && !(e.layer instanceof FeatureLayer)) {
                console.log(e.layer);
            }
        }
    }
    return LayerListDTG;
});
