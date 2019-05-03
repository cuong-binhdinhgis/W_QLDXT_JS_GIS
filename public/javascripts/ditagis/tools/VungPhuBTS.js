define(["require", "exports", "../core/Base", "../core/ConstName", "esri/geometry/Circle", "esri/Graphic", "esri/layers/GraphicsLayer", "esri/Color", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol"], function (require, exports, Base, constName, Circle, Graphic, GraphicsLayer, Color, SimpleFillSymbol, SimpleLineSymbol) {
    "use strict";
    const MAU_THIET_BI = {
        'ThietBiLapDat2G': '#ff0000',
        'ThietBiLapDat3G': '#0000cc',
        'ThietBiLapDat4G': '#8600b3'
    };
    class VungPhuTramBTS extends Base {
        constructor(view) {
            super();
            this.view = view;
            this.layer.then(_ => {
                this.bufferGraphics = new GraphicsLayer({
                    listMode: "hide",
                    minScale: this.layer.minScale,
                    maxScale: this.layer.maxScale
                });
                this.bufferGraphicsSingle = new GraphicsLayer({
                    listMode: "hide",
                    id: "bufferGraphicsSingle",
                    minScale: this.layer.minScale,
                    maxScale: this.layer.maxScale
                });
                this.view.map.add(this.bufferGraphicsSingle);
                this.view.map.add(this.bufferGraphics);
            });
        }
        get layer() {
            return this.view.map.findLayerById(constName.TramBTS);
        }
        all(loaiVungPhu) {
            if (!this.layer)
                return;
            if (this.view.scale > this.layer.minScale)
                return;
            this.bufferGraphics.removeAll();
            let query = this.layer.createQuery();
            query.outSpatialReference = this.view.spatialReference;
            query.outFields = ['TenDoanhNghiep', 'ThietBiLapDat2G', 'ThietBiLapDat3G', 'ThietBiLapDat4G', 'OBJECTID'];
            this.layer.queryFeatures(query).then(queryResult => {
                const features = queryResult.features;
                features.forEach(f => {
                    this.buffer(f);
                });
            });
        }
        clear(business, thietBi) {
            let removes;
            if (business) {
                if (thietBi) {
                    removes = this.bufferGraphics.graphics.filter(f => f.attributes.doanhNghiep === business
                        && (f.symbol
                            && f.symbol.outline
                            && f.symbol.outline.color
                            && f.symbol.outline.color.toHex() === MAU_THIET_BI[thietBi]));
                }
                else {
                    removes = this.bufferGraphics.graphics.filter(f => f.attributes.doanhNghiep === business);
                }
                removes.forEach(f => {
                    this.bufferGraphics.remove(f);
                });
            }
            else {
                this.bufferGraphics.removeAll();
                this.bufferGraphicsSingle.removeAll();
            }
        }
        onlyBusiness(business, thietBi) {
            if (!this.layer)
                return;
            let query = this.layer.createQuery();
            query.where = `TenDoanhNghiep = '${business}'`;
            query.outSpatialReference = this.view.spatialReference;
            query.outFields = ['TenDoanhNghiep', 'OBJECTID'];
            if (thietBi && (thietBi === 'ThietBiLapDat2G' || thietBi === 'ThietBiLapDat3G' || thietBi === 'ThietBiLapDat4G')) {
                query.outFields.push(thietBi);
            }
            else {
                query.outFields.push('ThietBiLapDat2G', 'ThietBiLapDat3G', 'ThietBiLapDat4G');
            }
            this.layer.queryFeatures(query).then(queryResult => {
                const features = queryResult.features;
                features.forEach(f => {
                    this.buffer(f);
                });
            });
        }
        singleBusiness(e, thietBi) {
            if (!this.layer)
                return;
            e.stopPropagation();
            this.view.hitTest({
                x: e.x,
                y: e.y
            }).then(hitTestResult => {
                const results = hitTestResult.results;
                let result = results.find(f => {
                    return f.graphic.layer.id === constName.TramBTS;
                });
                if (!result) {
                    this.bufferGraphicsSingle.removeAll();
                }
                else {
                    let attributes = result.graphic.attributes;
                    let bufferAttrs = {
                        TenDoanhNghiep: attributes.TenDoanhNghiep
                    };
                    if (thietBi && (thietBi === 'ThietBiLapDat2G' || thietBi === 'ThietBiLapDat3G' || thietBi === 'ThietBiLapDat4G')) {
                        bufferAttrs[thietBi] = attributes[thietBi];
                    }
                    else {
                        if (attributes['ThietBiLapDat2G'])
                            bufferAttrs['ThietBiLapDat2G'] = attributes['ThietBiLapDat2G'];
                        if (attributes['ThietBiLapDat3G'])
                            bufferAttrs['ThietBiLapDat3G'] = attributes['ThietBiLapDat3G'];
                        if (attributes['ThietBiLapDat4G'])
                            bufferAttrs['ThietBiLapDat4G'] = attributes['ThietBiLapDat4G'];
                    }
                    let graphic = result.graphic.clone();
                    graphic.attributes = bufferAttrs;
                    this.buffer(graphic, this.bufferGraphicsSingle);
                }
            });
        }
        buffer(graphic, graphicLayer = this.bufferGraphics) {
            const point = graphic.geometry, attributes = graphic.attributes, doanhNghiep = attributes.TenDoanhNghiep;
            if (!graphicLayer || !point || !attributes || !doanhNghiep)
                throw "Không đủ dữ liệu";
            const renderSymbol = (thietBi) => {
                let outlineColor = thietBi === 'ThietBiLapDat2G' ? MAU_THIET_BI.ThietBiLapDat2G :
                    thietBi === 'ThietBiLapDat3G' ? MAU_THIET_BI.ThietBiLapDat3G : MAU_THIET_BI.ThietBiLapDat4G;
                let symbol = new SimpleFillSymbol({
                    color: this.renderColor(doanhNghiep),
                    outline: new SimpleLineSymbol({
                        color: new Color(outlineColor)
                    })
                });
                return symbol;
            };
            const run = (thietBi) => {
                if (attributes[thietBi]) {
                    let circle = new Circle({
                        center: point,
                        radius: attributes[thietBi]
                    });
                    graphicLayer.add(new Graphic({
                        layer: graphicLayer,
                        attributes: {
                            doanhNghiep: doanhNghiep
                        },
                        geometry: circle,
                        symbol: renderSymbol(thietBi)
                    }));
                }
            };
            if (attributes.ThietBiLapDat2G)
                run('ThietBiLapDat2G');
            if (attributes.ThietBiLapDat3G)
                run('ThietBiLapDat3G');
            if (attributes.ThietBiLapDat4G)
                run('ThietBiLapDat4G');
        }
        renderColor(doanhNghiep) {
            let color = new Color([52, 73, 94, .25]);
            switch (doanhNghiep) {
                case "GTL":
                    color = new Color([255, 204, 36, .25]);
                    break;
                case "MBF":
                    color = new Color([249, 0, 0, .25]);
                    break;
                case "VNPT":
                case "VNP":
                    color = new Color([0, 148, 248, .25]);
                    break;
                case "VNM":
                    color = new Color([252, 160, 0, .25]);
                    break;
                case "VTL":
                    color = new Color([0, 249, 36, .25]);
                    break;
            }
            return color;
        }
        cancel() {
            this.bufferGraphics.removeAll();
        }
    }
    return VungPhuTramBTS;
});
