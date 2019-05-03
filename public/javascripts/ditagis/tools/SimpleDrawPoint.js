/**
 * Quá trình xử lý Vẽ Point với chức năng Tùy chọn điểm
 * Để khai báo lớp này, các tham số truyền vào
 * Ví dụ: var simpleDrawPoint = new SimpleDrawPoint(view,systemVariable)
 * systemVariable: Thông tin của khách hàng đang hiển thị
 */
define([
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom",
    "dojo/on",

    "esri/layers/FeatureLayer",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Polyline",
    "esri/geometry/Point",
    "esri/geometry/Circle",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleFillSymbol",


    "ditagis/editing/PointEditing",
    "ditagis/classes/EventListener",
    "ditagis/toolview/Tooltip",

], function (domConstruct, domClass, dom, on,
    FeatureLayer, Graphic, GraphicsLayer, Polyline, Point, Circle, SimpleLineSymbol, SimpleMarkerSymbol, SimpleFillSymbol,
    PointEditing,
    EventListener,
    Tooltip
) {
        'use strict';
        return class {
            constructor(view) {
                this.view = view;
                this.systemVariable = view.systemVariable;
                this.drawLayer = new PointEditing(view);
                this.eventListener = new EventListener(this);
            }
            /**
             * Truyền vào là layer dùng để vẽ trụ điện
             * @param {Feature Layer} layer 
             */
            draw(layer) {
                this.options = {
                    tooltip: {
                        move: 'Nhấn vào màn hình để vẽ'
                    }
                }
                this.drawLayer.layer = layer;
                // Lưu lại sự kiện hủy vẽ để xóa sau nếu không dùng sự kiện này bây giờ
                // Sự kiện vẽ điểm
                this.dragEventBufferFinal = on(this.view, 'click', (evt) => {
                    this.dragFuncBufferFinal(evt)
                });
                // Lưu lại sự kiện hủy vẽ để xóa sau nếu không dùng sự kiện này bây giờ
                this.tooltipMoveEvent = on(this.view, 'pointer-move', evt => {
                    Tooltip.instance().show([evt.x, evt.y], this.options.tooltip.move);
                })

            }
            /**
             * Sau khi kết thúc quá trình vẽ nếu sự kiện nào còn tồn tại thì hủy nó đi
             */
            clearEvents() {
                if (this.dragEventBufferFinal) {
                    this.dragEventBufferFinal.remove();
                    this.dragEventBufferFinal = null;
                }
                if (this.tooltipMoveEvent) {
                    Tooltip.instance().hide();
                    this.tooltipMoveEvent.remove();
                    this.tooltipMoveEvent = null;
                }
            }
            /**
             * Sự kiện vẽ Point
             * @param {Event handle} evt
             */
            dragFuncBufferFinal(evt) {
                evt.stopPropagation();
                let point;
                point = new Graphic({
                    geometry: this.view.toMap({
                        x: evt.x,
                        y: evt.y
                    }),
                    symbol: new SimpleMarkerSymbol()
                });
                this.eventListener.fire('draw-finish', point);
                this.clearEvents();
            }

        };

    });