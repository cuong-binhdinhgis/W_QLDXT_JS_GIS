define([
    "dojo/on",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom",
    "esri/widgets/Expand",

    "ditagis/tools/PointDrawingToolManager",
    "ditagis/tools/PolylineDrawingToolManager",

    "ditagis/classes/EventListener",

], function (on,
    domConstruct, domAttr, domClass, dom,
    Expand,
    PointDrawingToolManager, PolylineDrawingToolManager,
    EventListener) {
    'use strict';

    return class {
        constructor(view) {
            this.view = view;
            this.systemVariable = view.systemVariable;
            this.isStartup = false;

            this._drawLayer = null;
            this.drawingMethods = [{
                name: "Mặc định",
                type: "macdinh"
            }];

            this.drawingManager = new PolylineDrawingToolManager(view)
            this.eventListener = new EventListener(this);
            this.drawingManager.on('draw-finish', (evt) => {
                let method = evt.method;
                this.isStartup = false;
            })
            //đăng ký sự kiện khi có sự thay đổi giá trị của systemVariable
            this.systemVariable.on('change-selectedFeature', () => {
                //khi giá trị thay đổi thì cập nhật cho drawingManager
                this.drawingManager.drawLayer = this.drawLayer;
            })

        }
        startup() {
            if (!this.isStartup) {
                if (!this.drawLayer || this.drawLayer.geometryType !== 'polyline') return;
                this.drawingManager.drawSimple();
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
            this.drawingManager.cancel();
        }
        destroyView() {
            if (this.container && document.body.contains(this.container))
                document.body.removeChild(this.container);
        }
        initView() {


        }
        get drawLayer() {
            return this.systemVariable.selectedFeature;
        }


    }
});