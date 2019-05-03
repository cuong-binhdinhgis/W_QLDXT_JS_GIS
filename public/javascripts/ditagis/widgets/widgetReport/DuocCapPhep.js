define([
    "dojo/on",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom",
    "esri/widgets/Expand",

    "ditagis/tools/PointDrawingToolManager",
], function (on,
    domConstruct, domAttr, domClass, dom,
    Expand,
    PointDrawingToolManager) {
        'use strict';

        return class {
            constructor(view) {
                this.view = view;
                this.loaiThongKe = [{
                    name: "Danh sách chưa được cấp phép",
                    type: "chuacapphep"
                }];
                this.initView();
                this.view.ui.add(this.expandWidget, "top-right");
            }


            initView() {
                this.container = domConstruct.create("div");
                for (let loai of this.loaiThongKe) {
                    let btn = domConstruct.create("button", {
                        class: 'dtg-btn-widget',
                        innerHTML: loai.name
                    }, this.container);
                    this.clickBtnEvt = on(btn, 'click', () => {
                        this.clickBtnFunc(loai.type);
                    })

                }
                domConstruct.place(this.container, document.body)
                this.expandWidget = new Expand({
                    expandIconClass: "esri-icon-layer-list",
                    view: this.view,
                    content: this.container
                });

            }
            get drawLayer() {
                return this.systemVariable.selectedFeature;
            }
            clickBtnFunc(drawingMethod) {
                this.expandWidget.collapse();
            }
        }
    });