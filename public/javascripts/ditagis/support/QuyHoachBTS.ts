import Base = require('../core/Base');
import constName = require('../core/ConstName');
import geometryEngine = require("esri/geometry/geometryEngine");
import FeatureTable = require('../layers/FeatureTable');
import QueryTask = require("esri/tasks/QueryTask");
import Query = require("esri/tasks/support/Query");
const KHOANG_CACH_VOI_TRAM_BTS = {
  DO_THI: 100, NGOAI_DO_THI: 300, MAC_DINH: 200
}
/**
 * Trồng A1 thì không dược trồng A2
 * A2 thì có thể trồng A1
 */
class QuyHoachBTS extends Base {
  private view: __esri.MapView;
  private quyHoachBTS: FeatureTable;
  private btsGraphic: __esri.Graphic;
  private quyHoachBTSVung: QueryTask;
  constructor(view: __esri.MapView) {
    super();
    this.view = view;

    this.quyHoachBTS = new FeatureTable({ url: "http://117.3.71.234/arcgisadaptor/rest/services/BinhDinh/QuyHoachBTS/MapServer/1" });
    this.quyHoachBTSVung = new QueryTask({
      url: "http://117.3.71.234/arcgisadaptor/rest/services/BinhDinh/QuyHoachBTS/MapServer/0"
    })
  }

  private _timDuongLayer: __esri.Sublayer;

  private _btsLayer: __esri.FeatureLayer;
  public get btsLayer(): __esri.FeatureLayer {
    if (!this._btsLayer) {
      this._btsLayer = this.view.map.findLayerById(constName.TramBTS) as __esri.FeatureLayer
      if (!this.btsLayer)
        throw "Không tìm thấy dữ liệu trạm BTS";
    }
    return this._btsLayer;
  }

  public get timDuongLayer(): __esri.Sublayer {
    if (!this._timDuongLayer) {
      let baseMap = this.view.map.findLayerById(constName.BASEMAP) as __esri.MapImageLayer;
      if (!baseMap) throw "Không có lớp dữ liệu nền";
      this._timDuongLayer = baseMap.findSublayerById(constName.INDEX_TIMDUONG);
    }
    return this._timDuongLayer;
  }


  private _hanhChinhXaLayer: __esri.Sublayer;
  public get hanhChinhXaLayer(): __esri.Sublayer {
    if (!this._hanhChinhXaLayer) {
      let baseMap = this.view.map.findLayerById(constName.BASEMAP) as __esri.MapImageLayer;
      if (!baseMap) throw "Không có lớp dữ liệu nền";
      this._hanhChinhXaLayer = baseMap.findSublayerById(constName.INDEX_HANHCHINHXA);
    }
    return this._hanhChinhXaLayer;
  }
  private async kiemTraLoaiTramA1(): Promise<KetQuaKiemTra> {
    let kiemTra: KetQuaKiemTra = { tinhTrang: true };
    //kiểm tra trong phạm vi 50m có con đường nào không
    //lấy tim đường trong khoảng cách từ {pointCheck} trong bán kinh 300m
    let query = this.timDuongLayer.createQuery();
    query.geometry = this.btsGraphic.geometry;
    query.outFields = ["ID", "TenDuong"];//chỉ lấy ID
    query.distance = 50;//khoảng cách 50m
    query.units = "meters";//theo mét
    let featureSet = await this.timDuongLayer.queryFeatures(query);

    //nếu không tìm thấy tim đường
    if (featureSet.features.length === 0) {
      //kiểm tra trong khu vực có trạm BTS trùng BTS hay không
      let kiemTraTonTai = await this.kiemTraTonTaiBTS(true);
      if (kiemTraTonTai) {
        kiemTra.loiNhan = "Tồn tại Trạm BTS thuộc đơn vị khác"
        kiemTra.tinhTrang = false;
      } else {
        kiemTra.tinhTrang = true;
      }
    } else {
      //xuất danh sách những tim đường vi phạm khoảng cách 50m
      let danhSachViPham = featureSet.features.map(m => m.attributes.TenDuong);
      kiemTra.tinhTrang = false;
      kiemTra.loiNhan = `Khoảng cách không phù hợp với ${danhSachViPham.length > 1 ? "các" : ""} đường `
        + danhSachViPham.join(", ");

    }
    return kiemTra;
  }
  private async kiemTraTonTaiBTS(doThi: boolean = false): Promise<boolean> {
    let soLuongTramBTSTheoKhoangCach = await this.btsLayer.queryFeatureCount(new Query({
      geometry: this.btsGraphic.geometry,
      distance: KHOANG_CACH_VOI_TRAM_BTS.MAC_DINH,
      units: "meters"
    }));

    //nếu tồn tại thì số lượng lớn hơn 0 thì không đạt tiêu chí
    return soLuongTramBTSTheoKhoangCach > 0;
  }
  private async kiemTraLoaiTramA2(): Promise<KetQuaKiemTra> {
    let kiemTra: KetQuaKiemTra = { tinhTrang: true };
    /**
     * Kiểm tra khu vực có tồn tại trạm BTS nào không
     * Kiểm tra có thuộc vùng chỉ được trồng A1
     * 1. Kiểm tra hành chính
     * 2. Kiểm tra vùng
     * 3. Kiểm tra tim đường
     */
    let kiemTraTonTai = await this.kiemTraTonTaiBTS(false);
    //nếu có tồn tại
    if (kiemTraTonTai)
      return {
        loiNhan: "Tồn tại Trạm BTS thuộc đơn vị khác",
        tinhTrang: false
      }
    // 1. Kiểm tra hành chính
    let kiemTraHanhChinh = await this.kiemTraHanhChinh();
    //nếu kiểm tra hành chính không đáp ứng thì trả về kết quả
    if (!kiemTraHanhChinh.tinhTrang) {
      return kiemTraHanhChinh;
    }
    // 2. Kiểm tra vùng
    let kiemTraVung = await this.kiemTraVung();
    //nếu kiểm tra vùng không đáp ứng thì trả về kết quả
    if (!kiemTraVung.tinhTrang) {
      return kiemTraVung;
    }
    // 3. Kiểm tra tim đường
    let kiemTraTimDuong = await this.kiemTraTimDuong();
    if (!kiemTraTimDuong.tinhTrang) return kiemTraTimDuong;

    const kiemTraDoCao = (doCao): KetQuaKiemTra => {
      let kiemTraDoCao = this.kiemTraDoCao(doCao);
      //nếu không đạt độ cao
      if (!kiemTraDoCao) {
        return {
          tinhTrang: false,
          loiNhan: "Khu vực chỉ được phép trồng cột có chiều cao " + doCao
        };
      } else return { tinhTrang: true }
    }
    //kiểm tra độ cao
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
  }
  private async kiemTraHanhChinh(): Promise<KetQuaKiemTra> {
    //lấy hành chính tại vị trí {pointCheck}
    let query = this.hanhChinhXaLayer.createQuery();
    query.geometry = this.btsGraphic.geometry;
    query.outFields = ["MaXaPhuongTT"];//chỉ lấy ID
    let featureSet = await this.hanhChinhXaLayer.queryFeatures(query);

    //nếu không tìm thấy hành chính nào thì return true
    if (featureSet.features.length === 0)
      return { tinhTrang: true };

    // kiểm tra trong dữ liệu quy hoạch xem đối tượng hành chính có
    // thuộc loại A1 hay không
    let hanhChinhFeature = featureSet.features[0];

    //lấy dữ liệu quy hoạch theo hành chính
    let duLieuQuyHoach = await this.quyHoachBTS.queryFeatures(<__esri.Query>{
      where: `LoaiDoiChieu = 2 and ID = ${hanhChinhFeature.attributes.MaXaPhuongTT}`,
      outFields: ["LoaiTram", "DoCao"]
    });

    //nếu không có đối tượng quy hoạch thì return true
    if (duLieuQuyHoach.features.length === 0) {
      return { tinhTrang: true };
    }

    let duLieuQuyHoachFeature = duLieuQuyHoach.features[0],
      attrDuLieuQuyHoachFeature = duLieuQuyHoachFeature.attributes as QuyHoachBTSModel;

    //kiểm tra có đúng loại trạm hay không
    if (attrDuLieuQuyHoachFeature.LoaiTram) {
      if (attrDuLieuQuyHoachFeature.LoaiTram.startsWith("A1")) {
        return {
          tinhTrang: false,
          loiNhan: "Khu vực hành chính chỉ được phép trồng trụ " + attrDuLieuQuyHoachFeature.LoaiTram
        }
      } else {
        return {
          tinhTrang: true, body: attrDuLieuQuyHoachFeature.DoCao
        }
      }
    }
  }

  private async kiemTraVung(): Promise<KetQuaKiemTra> {
    //kiểm tra có tồn tại dữ liệu quy hoạch tại khu vực này hay không
    let query = new Query({
      geometry: this.btsGraphic.geometry,
      outFields: ["DoCao", "LoaiTram"]
    });
    let featureSet = await this.quyHoachBTSVung.execute(query);

    //nếu không có dữ liệu quy hoạch thì return true
    if (featureSet.features.length === 0) {
      return { tinhTrang: true }
    }

    let duLieuQuyHoach = featureSet.features[0],
      attrDuLieuQuyHoach = duLieuQuyHoach.attributes as QuyHoachBTSVungModel;

    //kiểm tra có đúng loại trạm hay không
    if (attrDuLieuQuyHoach.LoaiTram) {
      if (attrDuLieuQuyHoach.LoaiTram.startsWith("A1")) {
        return {
          tinhTrang: false,
          loiNhan: "Khu vực chỉ được phép trồng trụ " + attrDuLieuQuyHoach.LoaiTram
        }
      }
    }

    if (attrDuLieuQuyHoach.DoCao) {
      //kiểm tra chiều cao có phù hợp hay không
      let doCao = attrDuLieuQuyHoach.DoCao;
      let kiemTraDoCao = this.kiemTraDoCao(doCao);
      //nếu không đạt độ cao
      if (!kiemTraDoCao) {
        return {
          tinhTrang: false,
          loiNhan: "Khu vực chỉ được phép trồng cột có chiều cao " + attrDuLieuQuyHoach.DoCao
        };
      }
    }
  }

  private async kiemTraTimDuong(): Promise<KetQuaKiemTra> {
    //lấy tim đường trong khoảng cách từ {pointCheck} trong bán kinh 300m
    let query = this.timDuongLayer.createQuery();
    query.geometry = this.btsGraphic.geometry;
    query.outFields = ["ID", "TenDuong"];
    query.distance = 300;//khoảng cách 300
    query.units = "meters";//theo mét
    query.returnGeometry = true;
    query.outSpatialReference = this.view.spatialReference;

    let featureSet = await this.timDuongLayer.queryFeatures(query);

    //nếu không tìm thấy tim đường nào thì return true
    if (featureSet.features.length === 0)
      return { tinhTrang: true }

    //nếu có dữ liệu thì thực hiện tìm kiếm
    let quyHoachTheoTimDuong = await this.kiemTraDuLieuTimDuong(featureSet);

    return await this.kiemTraTimDuongPhuHopVoiQuyHoach(quyHoachTheoTimDuong);
  }

  private async kiemTraDuLieuTimDuong(featureSet: __esri.FeatureSet): Promise<__esri.Graphic[]> {
    //duyệt con đường
    let wheres = featureSet.features.map(m => "ID = " + m.attributes.ID);

    let quyHoachFeatures = await this.quyHoachBTS.queryFeatures(<__esri.Query>{
      where: `(${wheres.join(" or ")}) and LoaiDoiChieu = 1`, outFields: ["*"], orderByFields: ["LoaiTram"]
    });

    //nếu tồn tại tim đường trong quy hoạch
    if (quyHoachFeatures.features.length > 0) {
      //cập nhật geometry
      quyHoachFeatures.features.forEach(quyHoach => {
        let timDuong = featureSet.features.find(f => f.attributes.ID === quyHoach.attributes.ID);
        if (timDuong) {
          quyHoach.geometry = timDuong.geometry;
          quyHoach.attributes.TenDuong = timDuong.attributes.TenDuong;
        }

      })
      return quyHoachFeatures.features;
    } else {
      return [];
    }
  }
  /**
   * Kiểm tra dữ liệu tim đường phù hợp với quy hoạch
   * @param quyHoachTheoTimDuong Dữ liệu tim đường trong phạm vi 300m tính từ vị trí kiểm tra
   */
  private async kiemTraTimDuongPhuHopVoiQuyHoach(quyHoachTheoTimDuong: __esri.Graphic[]): Promise<KetQuaKiemTra> {
    if (quyHoachTheoTimDuong) {
      for (const duLieuQuyHoach of quyHoachTheoTimDuong) {
        let attributes = duLieuQuyHoach.attributes as QuyHoachBTSModel;
        //kiểm tra phù hợp khoảng cách hay không
        if (attributes.CachTimDuong) {
          let khoangCachSoVoiTimDuong = geometryEngine.distance(duLieuQuyHoach.geometry, this.btsGraphic.geometry, "meters");
          //nếu khoảng cách từ điểm kiểm tra đến tim đường nhỏ hơn khoảng cách yêu cầu của quy hoạch
          //có nghĩa không phù hợp
          if (khoangCachSoVoiTimDuong && khoangCachSoVoiTimDuong < attributes.CachTimDuong)
            return {
              tinhTrang: false,
              loiNhan: `Khoảng cách so với đường ${(attributes as any).TenDuong} không phù hợp`
            }
        }
        //kiểm tra có đúng loại trạm hay không
        if (attributes.LoaiTram) {
          if (attributes.LoaiTram.startsWith("A1")) {
            return {
              tinhTrang: false,
              loiNhan: `Khu vực thuộc đường ${(attributes as any).TenDuong} chỉ được phép trồng trụ ${attributes.LoaiTram}`
            }
          }
        }

        //kiểm tra chiều cao
        if (attributes.DoCao) {
          let kiemTra = this.kiemTraDoCao(attributes.DoCao);
          if (!kiemTra)
            return {
              tinhTrang: false,
              loiNhan: `Khu vực đường ${(attributes as any).TenDuong} chỉ được phép trồng cột có chiều cao ${attributes.DoCao}`
            }
        }
      }
    }
    return {
      tinhTrang: true
    };
  }

  private async run(btsGraphic: __esri.Graphic): Promise<KetQuaKiemTra> {
    if (!btsGraphic) return { tinhTrang: false }
    this.btsGraphic = btsGraphic;
    if (!btsGraphic
      || (btsGraphic && !btsGraphic.geometry && !btsGraphic.attributes && !btsGraphic.attributes.LoaiTram))
      return { tinhTrang: false, loiNhan: "Không đủ dữ liệu để kiểm tra" };
    let kiemTra: KetQuaKiemTra = { tinhTrang: true };
    let loaiTram = btsGraphic.attributes.LoaiTram as string;
    if (loaiTram.startsWith("A1")) {
      kiemTra = await this.kiemTraLoaiTramA1();
    } else if (loaiTram.startsWith("A2")) {
      kiemTra = await this.kiemTraLoaiTramA2();
    } else {
      kiemTra.tinhTrang = false;
      kiemTra.loiNhan = "Không xác định được loại trạm, vui lòng kiểm tra lại dữ liệu đầu vào";
    }
    return kiemTra;
  }
  private kiemTraDoCao(danhSachChieuCao: string) {
    if (!this.btsGraphic.attributes.LoaiTram
      || !this.btsGraphic.attributes.DoCaoTram) {
      return false;
    }
    let split = danhSachChieuCao.split(";")
    for (const chieuCao of split) {
      let i = chieuCao.search("<");
      let loaiTram: string = chieuCao.slice(0, i);
      let gioiHan: number = parseInt(chieuCao.slice(i + 1, chieuCao.length));
      if (this.btsGraphic.attributes.LoaiTram == loaiTram
        && this.btsGraphic.attributes.DoCaoTram
        && this.btsGraphic.attributes.DoCaoTram >= gioiHan) {
        return false;
      }
    }
    return true;
  }
}
export = QuyHoachBTS;
interface QuyHoachBTSModel {
  OBJECTID: number,
  ID: number,
  DiaDanh: string,
  DoRongDuong: number,
  DoCao: string,
  CachTimDuong: number,
  LoaiDoiChieu: number,
  LoaiTram: string,
  ThoiDiemChuyenGiao: number
}
interface QuyHoachBTSVungModel {
  OBJECTID: number,
  DoCao: string,
  LoaiTram: string,
}
interface KetQuaKiemTra {
  tinhTrang: boolean;
  loiNhan?: string;
  body?: any;
}