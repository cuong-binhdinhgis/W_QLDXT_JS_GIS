define(["require", "exports", "../core/ConstName"], function (require, exports, constName) {
    "use strict";
    class HanhChinhUtils {
        constructor(params) {
            this.map = params.map;
        }
        get districtLayer() {
            return this.map.findLayerById(constName.BASEMAP).findSublayerById(constName.INDEX_HANHCHINHHUYEN);
        }
        get wardLayer() {
            return this.map.findLayerById(constName.BASEMAP).findSublayerById(constName.INDEX_HANHCHINHXA);
        }
        selectAllDistrict(options) {
            return new Promise((resolve, reject) => {
                let query = this.districtLayer.createQuery();
                query.returnGeometry = options.returnGeometry || false;
                query.where = "1=1";
                query.outFields = [HanhChinhUtils.MA_HUYEN, HanhChinhUtils.TEN_HUYEN];
                this.districtLayer.queryFeatures(query).then(r => {
                    resolve(r.features);
                }).catch(e => reject(e));
            });
        }
        selectAllWard(options) {
          
            return new Promise((resolve, reject) => {
                let query = this.wardLayer.createQuery();
                query.returnGeometry = options.returnGeometry || false;
                query.where = "1=1";
                query.outFields = [HanhChinhUtils.MA_XA, HanhChinhUtils.TEN_XA];
                this.wardLayer.queryFeatures(query).then(r => {
                    resolve(r.features);
                }).catch(e => reject(e));
            });
        }
        queryDistrict(query) {
            return this.districtLayer.queryFeatures(query);
        }
        queryWard(query) {
            return this.wardLayer.queryFeatures(query);
        }
        districtIdToName(id) {
            return new Promise((resolve, reject) => {
                this.districtLayer.queryFeatures({
                    where: `${HanhChinhUtils.MA_HUYEN} = '${id}'`, outFields: [HanhChinhUtils.TEN_HUYEN]
                }).then(r => {
                    if (r.features.length > 0) {
                        resolve(r.features[0].attributes[HanhChinhUtils.TEN_HUYEN]);
                    }
                    else
                        resolve(null);
                });
            });
        }
        wardIdToName(id) {
            return new Promise((resolve, reject) => {
                this.wardLayer.queryFeatures({
                    where: `${HanhChinhUtils.MA_XA} = '${id}'`, outFields: [HanhChinhUtils.TEN_XA]
                }).then(r => {
                    if (r.features.length > 0) {
                        resolve(r.features[0].attributes[HanhChinhUtils.TEN_XA]);
                    }
                    else
                        resolve(null);
                });
            });
        }
    }
    HanhChinhUtils.MA_HUYEN = "MaHuyenTp";
    HanhChinhUtils.TEN_HUYEN = "TenHuyenTp";
    HanhChinhUtils.MA_XA = "MaXaPhuongTT";
    HanhChinhUtils.TEN_XA = "TenXaPhuongTT";
    return HanhChinhUtils;
});
