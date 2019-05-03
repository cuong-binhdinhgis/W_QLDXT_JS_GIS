import Base = require('../core/Base');
import FeatureLayer = require('../layers/FeatureLayer');
import LayerList = require('esri/widgets/LayerList');

class LayerListDTG extends Base {
    private view: __esri.MapView;
    private container;
    private pane;
    constructor(view) {
        super();
        this.view = view;
        this.pane = $("<div/>");
        let layerList = new LayerList({
            view:view,container:this.pane[0]
        });
        this.options = {
            position: "top-right",
            icon: "esri-icon-layers",
            title: 'Thông tin bản đồ'
        };
        this.initWidget();
    }
    private initWidget() {
        this.container = $('<div/>', {
            class: "esri-widget esri-widget-button",
            title: this.options.title,
            html: `<span class='${this.options.icon}'></span>`
        })
        this.container.click(e => {
            this.fire("click", this.pane)
        });
    }
    private onLayerViewCreate(e: __esri.MapViewLayerviewCreateEvent) {
        if (e.layer.listMode != "hide" && !(e.layer instanceof FeatureLayer)) {
            console.log(e.layer);
        }
    }

}
export = LayerListDTG;