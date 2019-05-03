define([
    "esri/widgets/LayerList"

], function (LayerList) {

    'use strict';
    return class {
        constructor(view, options = {}) {
            this.view = view;
            this.options = {
                isOpen: true,
                top: 240,
                modal: true,
                left: 'calc(50% - 300px)',
                height: 500
            };
            this.DOM = {
                container: null,
                table: null
            }
            if (options && typeof options === 'object') {
                for (let index in options) {
                    if (options[index] !== undefined)
                        this.options[index] = options[index]
                }
            }
            this.DOM.container = $('<div/>', {
                id: 'layerlist-window',
                class: 'layerlist-window'
            }).appendTo(document.body);
            let layerList = new LayerList({
                container: this.DOM.container[0],
                view: view,
            })
            let changeLayerListEvt = layerList.operationalItems.on('change', function (e) {
                if (e.target.length > 0) {
                    layerList.operationalItems.items[0].open = true;
                    changeLayerListEvt.remove();
                }
            })
            this.window = this.DOM.container.kendoWindow({
                width: "600px",
                height: this.options.height,
                resizable: false,
                modal: this.options.modal,
                position: {
                    top: this.options.top,
                    left: this.options.left
                },
                title: "Chọn lớp dữ liệu",
                visible: false,
                actions: [
                    "Close"
                ],
            }).data("kendoWindow");
            if (this.options.isOpen)
                this.open();
        }
        open() {
            this.window.open();
        }
    }
});