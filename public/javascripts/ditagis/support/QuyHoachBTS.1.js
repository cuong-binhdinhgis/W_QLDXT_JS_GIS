var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../core/Base", "../core/ConstName", "esri/geometry/geometryEngine", "../layers/FeatureTable", "esri/tasks/QueryTask", "esri/tasks/support/Query"], function (require, exports, Base, constName, geometryEngine, FeatureTable, QueryTask, Query) {
    "use strict";
    const KHOANG_CACH_VOI_TRAM_BTS = {
        DO_THI: 100, NGOAI_DO_THI: 300
    };
    class QuyHoachBTS extends Base {
        constructor(view) {
            super();
            this.view = view;
            this.quyHoachBTS = new FeatureTable({ url: "http://117.3.71.234/arcgisadaptor/rest/services/BinhDinh/QuyHoachBTS/MapServer/1" });
            this.quyHoachBTSVung = new QueryTask({
                url: "http://117.3.71.234/arcgisadaptor/rest/services/BinhDinh/QuyHoachBTS/MapServer/0"
            });
        }
        get timDuongLayer() {
            if (!this._timDuongLayer) {
                let baseMap = this.view.map.findLayerById(constName.BASEMAP);
                if (!baseMap)
                    throw "Không có lớp dữ liệu nền";
                this._timDuongLayer = baseMap.findSublayerById(constName.INDEX_TIMDUONG);
            }
            return this._timDuongLayer;
        }
        get hanhChinhXaLayer() {
            if (!this._hanhChinhXaLayer) {
                let baseMap = this.view.map.findLayerById(constName.BASEMAP);
                if (!baseMap)
                    throw "Không có lớp dữ liệu nền";
                this._hanhChinhXaLayer = baseMap.findSublayerById(constName.INDEX_HANHCHINHXA);
            }
            return this._hanhChinhXaLayer;
        }
        get pointCheck() {
            return this.btsGraphic.geometry;
        }
        doiChieuTimDuong() {
            return __awaiter(this, void 0, void 0, function* () {
                let query = this.timDuongLayer.createQuery();
                query.geometry = this.pointCheck;
                query.outFields = ["ID"];
                query.distance = 300;
                query.units = "meters";
                query.returnGeometry = true;
                query.outSpatialReference = this.view.spatialReference;
                let featureSet = yield this.timDuongLayer.queryFeatures(query);
                if (featureSet.features.length === 0)
                    return { tinhTrang: true };
                let quyHoachTheoTimDuong = yield this.kiemTraDuLieuTimDuong(featureSet);
                return yield this.kiemTraTimDuongPhuHopVoiQuyHoach(quyHoachTheoTimDuong);
            });
        }
        kiemTraDuLieuTimDuong(featureSet) {
            return __awaiter(this, void 0, void 0, function* () {
                let wheres = featureSet.features.map(m => "ID = " + m.attributes.ID);
                let quyHoachFeatures = yield this.quyHoachBTS.queryFeatures({
                    where: `(${wheres.join(" or ")}) and LoaiDoiChieu = 1`, outFields: ["*"]
                });
                if (quyHoachFeatures.features.length > 0) {
                    quyHoachFeatures.features.forEach(quyHoach => {
                        let timDuong = featureSet.features.find(f => f.attributes.ID === quyHoach.attributes.ID);
                        if (timDuong)
                            quyHoach.geometry = timDuong.geometry;
                    });
                    return quyHoachFeatures.features;
                }
                else {
                    return [];
                }
            });
        }
        kiemTraTimDuongPhuHopVoiQuyHoach(quyHoachTheoTimDuong) {
            return __awaiter(this, void 0, void 0, function* () {
                let btsLayer = this.view.map.findLayerById(constName.TramBTS);
                if (!btsLayer)
                    throw "Không tìm thấy BTS Layer";
                if (quyHoachTheoTimDuong) {
                    for (const duLieuQuyHoach of quyHoachTheoTimDuong) {
                        let attributes = duLieuQuyHoach.attributes;
                        let doThi = attributes.LoaiTram
                            && (attributes.LoaiTram === "A1a" || attributes.LoaiTram === "A1b");
                        let khoangCachVoiTramBTS = doThi ? KHOANG_CACH_VOI_TRAM_BTS.DO_THI : KHOANG_CACH_VOI_TRAM_BTS.NGOAI_DO_THI;
                        let soLuongTramBTSTheoKhoangCach = yield btsLayer.queryFeatureCount(new Query({
                            geometry: this.pointCheck,
                            distance: khoangCachVoiTramBTS,
                            units: "meters"
                        }));
                        if (soLuongTramBTSTheoKhoangCach > 0)
                            return {
                                tinhTrang: false,
                                loiNhan: "Tồn tại Trạm BTS thuộc đơn vị khác"
                            };
                        if (attributes.CachTimDuong) {
                            let khoangCachSoVoiTimDuong = geometryEngine.distance(duLieuQuyHoach.geometry, this.pointCheck, "meters");
                            if (khoangCachSoVoiTimDuong && khoangCachSoVoiTimDuong < attributes.CachTimDuong)
                                return {
                                    tinhTrang: false,
                                    loiNhan: "Khoảng cách so với tim đường không phù hợp"
                                };
                        }
                        if (attributes.LoaiTram && this.btsGraphic.attributes.LoaiTram != attributes.LoaiTram)
                            return {
                                tinhTrang: false,
                                loiNhan: "Khu vực chỉ được phép trồng cột " + attributes.LoaiTram
                            };
                        if (attributes.DoCao) {
                            let kiemTra = this.kiemTraChieuCao(attributes.DoCao);
                            if (!kiemTra)
                                return {
                                    tinhTrang: false,
                                    loiNhan: "Khu vực chỉ được phép trồng cột có chiều cao" + attributes.DoCao
                                };
                        }
                    }
                }
                return {
                    tinhTrang: true
                };
            });
        }
        doiChieuVung() {
            return __awaiter(this, void 0, void 0, function* () {
                let query = new Query({
                    geometry: this.pointCheck,
                    returnGeometry: true, outSpatialReference: this.view.spatialReference
                });
                let featureSet = yield this.quyHoachBTSVung.execute(query);
                if (featureSet.features.length === 0)
                    return { tinhTrang: true };
                return yield this.kiemTraPhuHopVoiVung(featureSet);
            });
        }
        kiemTraPhuHopVoiVung(duLieuVung) {
            return __awaiter(this, void 0, void 0, function* () {
                let btsLayer = this.view.map.findLayerById(constName.TramBTS);
                if (!btsLayer)
                    throw "Không tìm thấy BTS Layer";
                if (duLieuVung) {
                    for (const duLieuQuyHoach of duLieuVung.features) {
                        let attributes = duLieuQuyHoach.attributes;
                        let doThi = attributes.LoaiTram
                            && (attributes.LoaiTram === "A1a" || attributes.LoaiTram === "A1b");
                        let khoangCachVoiTramBTS = doThi ? KHOANG_CACH_VOI_TRAM_BTS.DO_THI : KHOANG_CACH_VOI_TRAM_BTS.NGOAI_DO_THI;
                        let soLuongTramBTSTheoKhoangCach = yield btsLayer.queryFeatureCount(new Query({
                            geometry: this.pointCheck,
                            distance: khoangCachVoiTramBTS,
                            units: "meters"
                        }));
                        if (soLuongTramBTSTheoKhoangCach > 0)
                            return {
                                tinhTrang: false,
                                loiNhan: "Tồn tại Trạm BTS thuộc đơn vị khác"
                            };
                        if (attributes.LoaiTram && this.btsGraphic.attributes.LoaiTram != attributes.LoaiTram)
                            return {
                                tinhTrang: false,
                                loiNhan: "Khu vực chỉ được phép trồng cột " + attributes.LoaiTram
                            };
                        if (attributes.DoCao) {
                            let kiemTra = this.kiemTraChieuCao(attributes.DoCao);
                            if (!kiemTra)
                                return {
                                    tinhTrang: false,
                                    loiNhan: "Khu vực chỉ được phép trồng cột có chiều cao" + attributes.DoCao
                                };
                        }
                    }
                }
                return {
                    tinhTrang: true
                };
            });
        }
        doiChieuHanhChinh() {
            return __awaiter(this, void 0, void 0, function* () {
                let query = this.hanhChinhXaLayer.createQuery();
                query.geometry = this.pointCheck;
                query.outFields = ["MaXaPhuongTT"];
                query.returnGeometry = true;
                query.outSpatialReference = this.view.spatialReference;
                let featureSet = yield this.hanhChinhXaLayer.queryFeatures(query);
                if (featureSet.features.length === 0)
                    return { tinhTrang: true };
                let quyHoachTheoTimDuong = yield this.kiemTraDuLieuHanhChinh(featureSet);
                return yield this.kiemTraHanhChinhPhuHopVoiQuyHoach(quyHoachTheoTimDuong);
            });
        }
        kiemTraDuLieuHanhChinh(featureSet) {
            return __awaiter(this, void 0, void 0, function* () {
                let wheres = featureSet.features.map(m => "ID = " + m.attributes.MaXaPhuongTT);
                let quyHoachFeatures = yield this.quyHoachBTS.queryFeatures({
                    where: `(${wheres.join(" or ")}) and LoaiDoiChieu = 2`, outFields: ["*"]
                });
                if (quyHoachFeatures.features.length > 0) {
                    quyHoachFeatures.features.forEach(quyHoach => {
                        let timDuong = featureSet.features.find(f => f.attributes.MaXaPhuongTT === quyHoach.attributes.ID);
                        if (timDuong)
                            quyHoach.geometry = timDuong.geometry;
                    });
                    return quyHoachFeatures.features;
                }
                else {
                    return [];
                }
            });
        }
        kiemTraHanhChinhPhuHopVoiQuyHoach(quyHoachTheoTimDuong) {
            return __awaiter(this, void 0, void 0, function* () {
                let btsLayer = this.view.map.findLayerById(constName.TramBTS);
                if (!btsLayer)
                    throw "Không tìm thấy BTS Layer";
                if (quyHoachTheoTimDuong) {
                    for (const duLieuQuyHoach of quyHoachTheoTimDuong) {
                        let attributes = duLieuQuyHoach.attributes;
                        let doThi = attributes.LoaiTram
                            && (attributes.LoaiTram === "A1a" || attributes.LoaiTram === "A1b");
                        let khoangCachVoiTramBTS = doThi ? KHOANG_CACH_VOI_TRAM_BTS.DO_THI : KHOANG_CACH_VOI_TRAM_BTS.NGOAI_DO_THI;
                        let soLuongTramBTSTheoKhoangCach = yield btsLayer.queryFeatureCount(new Query({
                            geometry: this.pointCheck,
                            distance: khoangCachVoiTramBTS,
                            units: "meters"
                        }));
                        if (soLuongTramBTSTheoKhoangCach > 0)
                            return {
                                tinhTrang: false,
                                loiNhan: "Tồn tại Trạm BTS thuộc đơn vị khác, liên hệ Sở để được xử lý"
                            };
                        if (attributes.LoaiTram && this.btsGraphic.attributes.LoaiTram != attributes.LoaiTram)
                            return {
                                tinhTrang: false,
                                loiNhan: "Khu vực chỉ được phép trồng cột " + attributes.LoaiTram
                            };
                        if (attributes.DoCao) {
                            let kiemTra = this.kiemTraChieuCao(attributes.DoCao);
                            if (!kiemTra)
                                return {
                                    tinhTrang: false,
                                    loiNhan: "Khu vực chỉ được phép trồng cột có chiều cao " + attributes.DoCao
                                };
                        }
                    }
                }
                return {
                    tinhTrang: true
                };
            });
        }
        run(btsGraphic) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!btsGraphic)
                    return { tinhTrang: false };
                this.btsGraphic = btsGraphic;
                if (!btsGraphic
                    || (btsGraphic && !btsGraphic.geometry && !btsGraphic.attributes && !btsGraphic.attributes.LoaiTram))
                    return { tinhTrang: false, loiNhan: "Không đủ dữ liệu để kiểm tra" };
                let kiemTra = { tinhTrang: true };
                kiemTra = yield this.doiChieuTimDuong();
                if (kiemTra.tinhTrang)
                    kiemTra = yield this.doiChieuVung();
                if (kiemTra.tinhTrang)
                    kiemTra = yield this.doiChieuHanhChinh();
                return kiemTra;
            });
        }
        kiemTraChieuCao(danhSachChieuCao) {
            if (!this.btsGraphic.attributes.LoaiTram
                || !this.btsGraphic.attributes.DoCaoTram) {
                return false;
            }
            let split = danhSachChieuCao.split(";");
            for (const chieuCao of split) {
                let i = chieuCao.search("<");
                let loaiTram = chieuCao.slice(0, i);
                let gioiHan = parseInt(chieuCao.slice(i + 1, chieuCao.length));
                if (this.btsGraphic.attributes.LoaiTram == loaiTram
                    && this.btsGraphic.attributes.DoCaoTram
                    && this.btsGraphic.attributes.DoCaoTram >= gioiHan) {
                    return false;
                }
            }
            return true;
        }
    }
    return QuyHoachBTS;
});
