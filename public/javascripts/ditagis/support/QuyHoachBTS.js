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
        DO_THI: 100, NGOAI_DO_THI: 300, MAC_DINH: 200
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
        get btsLayer() {
            if (!this._btsLayer) {
                this._btsLayer = this.view.map.findLayerById(constName.TramBTS);
                if (!this.btsLayer)
                    throw "Không tìm thấy dữ liệu trạm BTS";
            }
            return this._btsLayer;
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
        kiemTraLoaiTramA1() {
            return __awaiter(this, void 0, void 0, function* () {
                let kiemTra = { tinhTrang: true };
                let query = this.timDuongLayer.createQuery();
                query.geometry = this.btsGraphic.geometry;
                query.outFields = ["ID", "TenDuong"];
                query.distance = 50;
                query.units = "meters";
                let featureSet = yield this.timDuongLayer.queryFeatures(query);
                if (featureSet.features.length === 0) {
                    let kiemTraTonTai = yield this.kiemTraTonTaiBTS(true);
                    if (kiemTraTonTai) {
                        kiemTra.loiNhan = "Tồn tại Trạm BTS thuộc đơn vị khác";
                        kiemTra.tinhTrang = false;
                    }
                    else {
                        kiemTra.tinhTrang = true;
                    }
                }
                else {
                    let danhSachViPham = featureSet.features.map(m => m.attributes.TenDuong);
                    kiemTra.tinhTrang = false;
                    kiemTra.loiNhan = `Khoảng cách không phù hợp với ${danhSachViPham.length > 1 ? "các" : ""} đường `
                        + danhSachViPham.join(", ");
                }
                return kiemTra;
            });
        }
        kiemTraTonTaiBTS(doThi = false) {
            return __awaiter(this, void 0, void 0, function* () {
                let soLuongTramBTSTheoKhoangCach = yield this.btsLayer.queryFeatureCount(new Query({
                    geometry: this.btsGraphic.geometry,
                    distance: KHOANG_CACH_VOI_TRAM_BTS.MAC_DINH,
                    units: "meters"
                }));
                return soLuongTramBTSTheoKhoangCach > 0;
            });
        }
        kiemTraLoaiTramA2() {
            return __awaiter(this, void 0, void 0, function* () {
                let kiemTra = { tinhTrang: true };
                let kiemTraTonTai = yield this.kiemTraTonTaiBTS(false);
                if (kiemTraTonTai)
                    return {
                        loiNhan: "Tồn tại Trạm BTS thuộc đơn vị khác",
                        tinhTrang: false
                    };
                let kiemTraHanhChinh = yield this.kiemTraHanhChinh();
                if (!kiemTraHanhChinh.tinhTrang) {
                    return kiemTraHanhChinh;
                }
                let kiemTraVung = yield this.kiemTraVung();
                if (!kiemTraVung.tinhTrang) {
                    return kiemTraVung;
                }
                let kiemTraTimDuong = yield this.kiemTraTimDuong();
                if (!kiemTraTimDuong.tinhTrang)
                    return kiemTraTimDuong;
                const kiemTraDoCao = (doCao) => {
                    let kiemTraDoCao = this.kiemTraDoCao(doCao);
                    if (!kiemTraDoCao) {
                        return {
                            tinhTrang: false,
                            loiNhan: "Khu vực chỉ được phép trồng cột có chiều cao " + doCao
                        };
                    }
                    else
                        return { tinhTrang: true };
                };
                if (kiemTraHanhChinh.body) {
                    let ktdc = kiemTraDoCao(kiemTraHanhChinh.body);
                    if (!ktdc.tinhTrang)
                        return ktdc;
                }
                if (kiemTraVung.body) {
                    let ktdc = kiemTraDoCao(kiemTraVung.body);
                    if (!ktdc.tinhTrang)
                        return ktdc;
                }
                return kiemTra;
            });
        }
        kiemTraHanhChinh() {
            return __awaiter(this, void 0, void 0, function* () {
                let query = this.hanhChinhXaLayer.createQuery();
                query.geometry = this.btsGraphic.geometry;
                query.outFields = ["MaXaPhuongTT"];
                let featureSet = yield this.hanhChinhXaLayer.queryFeatures(query);
                if (featureSet.features.length === 0)
                    return { tinhTrang: true };
                let hanhChinhFeature = featureSet.features[0];
                let duLieuQuyHoach = yield this.quyHoachBTS.queryFeatures({
                    where: `LoaiDoiChieu = 2 and ID = ${hanhChinhFeature.attributes.MaXaPhuongTT}`,
                    outFields: ["LoaiTram", "DoCao"]
                });
                if (duLieuQuyHoach.features.length === 0) {
                    return { tinhTrang: true };
                }
                let duLieuQuyHoachFeature = duLieuQuyHoach.features[0], attrDuLieuQuyHoachFeature = duLieuQuyHoachFeature.attributes;
                if (attrDuLieuQuyHoachFeature.LoaiTram) {
                    if (attrDuLieuQuyHoachFeature.LoaiTram.startsWith("A1")) {
                        return {
                            tinhTrang: false,
                            loiNhan: "Khu vực hành chính chỉ được phép trồng trụ " + attrDuLieuQuyHoachFeature.LoaiTram
                        };
                    }
                    else {
                        return {
                            tinhTrang: true, body: attrDuLieuQuyHoachFeature.DoCao
                        };
                    }
                }
            });
        }
        kiemTraVung() {
            return __awaiter(this, void 0, void 0, function* () {
                let query = new Query({
                    geometry: this.btsGraphic.geometry,
                    outFields: ["DoCao", "LoaiTram"]
                });
                let featureSet = yield this.quyHoachBTSVung.execute(query);
                if (featureSet.features.length === 0) {
                    return { tinhTrang: true };
                }
                let duLieuQuyHoach = featureSet.features[0], attrDuLieuQuyHoach = duLieuQuyHoach.attributes;
                if (attrDuLieuQuyHoach.LoaiTram) {
                    if (attrDuLieuQuyHoach.LoaiTram.startsWith("A1")) {
                        return {
                            tinhTrang: false,
                            loiNhan: "Khu vực chỉ được phép trồng trụ " + attrDuLieuQuyHoach.LoaiTram
                        };
                    }
                }
                if (attrDuLieuQuyHoach.DoCao) {
                    let doCao = attrDuLieuQuyHoach.DoCao;
                    let kiemTraDoCao = this.kiemTraDoCao(doCao);
                    if (!kiemTraDoCao) {
                        return {
                            tinhTrang: false,
                            loiNhan: "Khu vực chỉ được phép trồng cột có chiều cao " + attrDuLieuQuyHoach.DoCao
                        };
                    }
                }
            });
        }
        kiemTraTimDuong() {
            return __awaiter(this, void 0, void 0, function* () {
                let query = this.timDuongLayer.createQuery();
                query.geometry = this.btsGraphic.geometry;
                query.outFields = ["ID", "TenDuong"];
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
                    where: `(${wheres.join(" or ")}) and LoaiDoiChieu = 1`, outFields: ["*"], orderByFields: ["LoaiTram"]
                });
                if (quyHoachFeatures.features.length > 0) {
                    quyHoachFeatures.features.forEach(quyHoach => {
                        let timDuong = featureSet.features.find(f => f.attributes.ID === quyHoach.attributes.ID);
                        if (timDuong) {
                            quyHoach.geometry = timDuong.geometry;
                            quyHoach.attributes.TenDuong = timDuong.attributes.TenDuong;
                        }
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
                if (quyHoachTheoTimDuong) {
                    for (const duLieuQuyHoach of quyHoachTheoTimDuong) {
                        let attributes = duLieuQuyHoach.attributes;
                        if (attributes.CachTimDuong) {
                            let khoangCachSoVoiTimDuong = geometryEngine.distance(duLieuQuyHoach.geometry, this.btsGraphic.geometry, "meters");
                            if (khoangCachSoVoiTimDuong && khoangCachSoVoiTimDuong < attributes.CachTimDuong)
                                return {
                                    tinhTrang: false,
                                    loiNhan: `Khoảng cách so với đường ${attributes.TenDuong} không phù hợp`
                                };
                        }
                        if (attributes.LoaiTram) {
                            if (attributes.LoaiTram.startsWith("A1")) {
                                return {
                                    tinhTrang: false,
                                    loiNhan: `Khu vực thuộc đường ${attributes.TenDuong} chỉ được phép trồng trụ ${attributes.LoaiTram}`
                                };
                            }
                        }
                        if (attributes.DoCao) {
                            let kiemTra = this.kiemTraDoCao(attributes.DoCao);
                            if (!kiemTra)
                                return {
                                    tinhTrang: false,
                                    loiNhan: `Khu vực đường ${attributes.TenDuong} chỉ được phép trồng cột có chiều cao ${attributes.DoCao}`
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
                let loaiTram = btsGraphic.attributes.LoaiTram;
                if (loaiTram.startsWith("A1")) {
                    kiemTra = yield this.kiemTraLoaiTramA1();
                }
                else if (loaiTram.startsWith("A2")) {
                    kiemTra = yield this.kiemTraLoaiTramA2();
                }
                else {
                    kiemTra.tinhTrang = false;
                    kiemTra.loiNhan = "Không xác định được loại trạm, vui lòng kiểm tra lại dữ liệu đầu vào";
                }
                return kiemTra;
            });
        }
        kiemTraDoCao(danhSachChieuCao) {
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
