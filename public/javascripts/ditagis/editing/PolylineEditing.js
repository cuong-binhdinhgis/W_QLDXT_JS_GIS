define([

    "esri/geometry/support/webMercatorUtils",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/Graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/geometry/geometryEngineAsync",
    "esri/geometry/geometryEngine",
    "esri/geometry/SpatialReference",
    "ditagis/support/PolylineAttributes"
], function (webMercatorUtils, Point, Polyline, Graphic, SimpleMarkerSymbol,
    geometryEngineAsync, geometryEngine, SpatialReference, PolylineAttributes) {
    'use strict';
    return class {
        constructor(view) {
            this.view = view;
            this.systemVariable = view.systemVariable;
            this.plAttrs = new PolylineAttributes(this.view);
            this.systemVariable = this.view.systemVariable;
        }
        get layer() {
            return this._layer;
        }
        set layer(value) {
            this._layer = value;
        }

        draw(drawLayer = this.layer, geometry) {
            return new Promise((resolve, reject) => {
                let attributes = {};
                this.plAttrs.layer = drawLayer;
                for (var i in drawLayer.drawingAttributes) {
                    attributes[i] = drawLayer.drawingAttributes[i];
                }
                let edits = {
                    addFeatures: [{
                        geometry: geometry,
                        attributes: attributes
                    }]
                };
                drawLayer.applyEdits(edits).then((result) => {
                    if (result.addFeatureResults.length > 0) {
                        let objectId = result.addFeatureResults[0].objectId
                        if (objectId) {
                            drawLayer.queryFeatures({
                                returnGeometry: true,
                                spatialReference: this.view.spatialReference,
                                where: 'OBJECTID = ' + objectId,
                                outFields: ['*']
                            }).then(res => {
                                if (res.features[0]) {
                                    let ft = res.features[0];
                                    this.view.popup.open({
                                        features: [ft],
                                        updateLocationEnabled:true
                                    });
                                }
                            });
                        }
                    }
                })
            });
        }

    }

});