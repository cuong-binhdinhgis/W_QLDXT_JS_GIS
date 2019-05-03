
define([
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom",
    "dojo/on",

    "esri/Graphic",
    "esri/geometry/Circle",
    "esri/symbols/SimpleFillSymbol",
    "ditagis/tools/bufferings/PolygonBufferings",
    "ditagis/widgets/ReportObjects"
], function (domConstruct, domClass, dom, on,
    Graphic, Circle, SimpleFillSymbol,
    PolygonBufferings, ReportObjects) {

        'use strict';
        return class {
            constructor(view, layer) {
                this.view = view;
                this.layer = layer;
                this.reportObjects = new ReportObjects(view);
              
            }

            findObjectPolygon(bufferGraphic) {
                try {
                    // this.queryBufferingObjects(bufferGraphic.geometry).then((results) => this.displayResults(results));
                    this.queryBufferingObjects(bufferGraphic.geometry);
                } catch (error) {
                    console.log(error);
                }
            }
            queryBufferingObjects(geometry) {
                var query = this.layer.createQuery();
                query.geometry = geometry;
                this.layer.queryFeatures(query).then(results => {
                    var feature = results.features;
                    if (feature && feature.length > 0)
                        // this.view.popup.open({ features: feature })
                        this.reportObjects.showReport(this.layer, feature);
                    else {
                        if($ && $.notify) $.notify('Không tìm thấy đối tượng nào');
                    }

                })
            }
            
        }
    });