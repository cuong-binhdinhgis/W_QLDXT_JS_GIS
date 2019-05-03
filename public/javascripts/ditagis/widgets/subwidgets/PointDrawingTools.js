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
                this.systemVariable = view.systemVariable;
                this.isStartup = false;

                this.drawingMethods = [{
                    name: "Mặc định",
                    type: "macdinh"
                },
                {
                    name: "Tọa độ X-Y",
                    type: "nhaptoado"
                }];

                this.drawManager = new PointDrawingToolManager(this.view);
                //đăng ký sự kiện khi có sự thay đổi giá trị của systemVariable
                this.systemVariable.on('change-selectedFeature', () => {
                    //khi giá trị thay đổi thì cập nhật cho drawManager
                    this.drawManager.drawLayer = this.drawLayer;
                })
            }
            startup() {
                if (!this.isStartup) {
                    if (this.view.isMobile) {
                        this.drawManager.drawSimple();
                    } else {
                        this.initView();
                        this.view.ui.add(this.expandWidget, "top-right");
                    }

                    this.isStartup = true;
                }
            }
            destroy() {
                if (this.isStartup) {

                    if (!this.view.isMobile) {
                        this.view.ui.remove(this.expandWidget);
                        this.destroyView();
                    }
                    this.isStartup = false;
                }
                this.drawManager.clearEvents();
            }
            destroyView() {
                if (this.container && document.body.contains(this.container))
                    document.body.removeChild(this.container);
            }
            initView() {
                this.container = domConstruct.create("div");
                for (let drawingMethod of this.drawingMethods) {
                    let btn = domConstruct.create("button", {
                        class: 'methods',
                        innerHTML: drawingMethod.name
                    }, this.container);
                    this.clickBtnEvt = on(btn, 'click', () => {
                        this.clickBtnFunc(drawingMethod.type);
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
                if (!this.drawLayer || this.drawLayer.geometryType !== 'point') return;
                switch (drawingMethod) {
                    case this.drawingMethods[0].type:
                        this.drawManager.drawSimple();
                        break;
                    case this.drawingMethods[1].type:
                        this.drawManager.drawByPointInput();
                        break;

                    default:
                        break;
                }
                this.expandWidget.collapse();
            }
        }
    });