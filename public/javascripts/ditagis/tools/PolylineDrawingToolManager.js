/**
 * Lớp này dùng để gọi các chức năng của các lớp khi vẽ Point (Vẽ cung, đường thẳng)
 * Tham số truyền vào (view, systemVariable)
 * systemVariable: Thông tin khách hàng đang hiển thị
 */
define([
    "esri/Graphic", "esri/geometry/Polyline", "esri/symbols/SimpleLineSymbol",
    "esri/geometry/SpatialReference",
    "ditagis/tools/SimpleDrawPolyline",
    "ditagis/classes/EventListener",
    "ditagis/editing/PolylineEditing",
], function (Graphic, Polyline, SimpleLineSymbol, SpatialReference,
    SimpleDrawPolyline,
    EventListener, PolylineEditing
) {
        'use strict';
        return class {
            constructor(view, layers) {
                this.view = view;
                this.systemVariable = view.systemVariable;
                this._drawLayer = null;
                this.simpleDrawPolyline = new SimpleDrawPolyline(view);
                this.polylineEditing = new PolylineEditing(this.view)
                this.eventListener = new EventListener(this);
                this.registerEvent();

            }
            set drawLayer(val) {
                this._drawLayer = val;
            }
            get drawLayer() {
                return this._drawLayer;
            }
            drawFinish(geometry, method) {
                //kich hoat su kien
                this.eventListener.fire('draw-finish', {
                    geometry: geometry,
                    method: method
                });
                //applyEdit
                if (geometry && geometry.paths.length > 0)
                    this.addFeature(geometry);
            }
            addFeature(geometry) {
                this.polylineEditing.draw(this.drawLayer, geometry, this.view).then((res) => {
                    this.simpleDrawPolyline.clearGraphic();
                    this.simpleDrawPolyline.geometry = null;
                }).catch(err => {
                    this.simpleDrawPolyline.clearGraphic();
                })
            }
            registerEvent() {
                this.simpleDrawPolyline.on('draw-finish', (geometry) => {
                    this.drawFinish(geometry, 'simple')
                })
            }
            drawSimple() {
                this.cancel();
                this.simpleDrawPolyline.draw(this._drawLayer);

            }
            cancel() {
                this.simpleDrawPolyline.cancel();
            }

        }
    });