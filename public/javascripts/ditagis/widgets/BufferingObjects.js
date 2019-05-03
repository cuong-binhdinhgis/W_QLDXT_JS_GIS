
define([
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom",
    "dojo/on",

    "esri/Graphic",
    "esri/geometry/Circle",
    "esri/symbols/SimpleFillSymbol",
    "ditagis/tools/bufferings/PolygonBufferings",
], function (domConstruct, domClass, dom, on,
    Graphic, Circle, SimpleFillSymbol,
    PolygonBufferings) {

        'use strict';
        return class {
            constructor(view) {
                this.view = view;
                this.allLayers = this.view.map.layers
                    .filter(f => {
                        return f.type == 'group';
                    });
                this._polygonBufferings = new PolygonBufferings(this.view);
            }
            comboLayers_change(evt) {
                var attributeslayer =$("<div/>");
                if (!evt) return;
                var selected = evt.sender._old;
                // let layer = this.view.map.findLayerById(selected);
                this.selectItem(selected);
            }

            selectItem(layerID) {
                this._polygonBufferings.layer = this.view.map.findLayerById(layerID);
                this._polygonBufferings.draw();
            }
        }
    });