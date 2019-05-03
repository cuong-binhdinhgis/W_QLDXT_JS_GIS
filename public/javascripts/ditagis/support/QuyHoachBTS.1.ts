import Base = require('../core/Base');
import constName = require('../core/ConstName');
import geometryEngine = require("esri/geometry/geometryEngine");
import FeatureTable = require('../layers/FeatureTable');
import QueryTask = require("esri/tasks/QueryTask");
import Query = require("esri/tasks/support/Query");
const KHOANG_CACH_VOI_TRAM_BTS = {
  DO_THI: 100, NGOAI_DO_THI: 300
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

  private get pointCheck(): __esri.Point {
    return this.btsGraphic.geometry as __esri.Point;
  }

  private async doiChieuTimDuong(): Promise<KetQuaKiemTra> {
    //lấy tim đường trong khoảng cách từ {pointCheck} trong bán kinh 300m
    let query = this.timDuongLayer.createQuery();
    query.geometry = this.pointCheck;
    query.outFields = ["ID"];//chỉ lấy ID
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
      where: `(${wheres.join(" or ")}) and LoaiDoiChieu = 1`, outFields: ["*"]
    });

    //nếu tồn tại tim đường trong quy hoạch
    if (quyHoachFeatures.features.length > 0) {
      //cập nhật geometry
      quyHoachFeatures.features.forEach(quyHoach => {
        let timDuong = featureSet.features.find(f => f.attributes.ID === quyHoach.attributes.ID);
        if (timDuong)
          quyHoach.geometry = timDuong.geometry;
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
    let btsLayer = this.view.map.findLayerById(constName.TramBTS) as __esri.FeatureLayer;
    if (!btsLayer)
      throw "Không tìm thấy BTS Layer";
    if (quyHoachTheoTimDuong) {
      for (const duLieuQuyHoach of quyHoachTheoTimDuong) {
        let attributes = duLieuQuyHoach.attributes as QuyHoachBTSModel;
        //kiểm tra thuộc đô thị hay ngoài đô thị
        let doThi: boolean = attributes.LoaiTram
          && (attributes.LoaiTram === "A1a" || attributes.LoaiTram === "A1b");
        /**
        * kiểm tra có trùng lặp BTS hay không
        * Đô thị:
        *  Các doanh nghiệp phải sử dụng chung cơ sở hạ tầng nhà trạm, cột ăng ten trong phạm vi bán kính 100m.
        * Ngoài đô thị:
        *  Các doanh nghiệp phải sử dụng chung cơ sở hạ tầng nhà trạm, cột ăng ten trong phạm vi bán kính 300m.
        **/
        let khoangCachVoiTramBTS = doThi ? KHOANG_CACH_VOI_TRAM_BTS.DO_THI : KHOANG_CACH_VOI_TRAM_BTS.NGOAI_DO_THI;
        let soLuongTramBTSTheoKhoangCach = await btsLayer.queryFeatureCount(new Query({
          geometry: this.pointCheck,
          distance: khoangCachVoiTramBTS,
          units: "meters"
        }));
        //nếu tồn tại thì số lượng lớn hơn 0 thì không đạt tiêu chí
        if (soLuongTramBTSTheoKhoangCach > 0)
          return {
            tinhTrang: false,
            loiNhan: "Tồn tại Trạm BTS thuộc đơn vị khác"
          };

        //kiểm tra phù hợp khoảng cách hay không
        if (attributes.CachTimDuong) {
          let khoangCachSoVoiTimDuong = geometryEngine.distance(duLieuQuyHoach.geometry, this.pointCheck, "meters");
          //nếu khoảng cách từ điểm kiểm tra đến tim đường nhỏ hơn khoảng cách yêu cầu của quy hoạch
          //có nghĩa không phù hợp
          if (khoangCachSoVoiTimDuong && khoangCachSoVoiTimDuong < attributes.CachTimDuong)
            return {
              tinhTrang: false,
              loiNhan: "Khoảng cách so với tim đường không phù hợp"
            }
        }

        //kiểm tra loại cột
        if (attributes.LoaiTram && this.btsGraphic.attributes.LoaiTram != attributes.LoaiTram)
          return {
            tinhTrang: false,
            loiNhan: "Khu vực chỉ được phép trồng cột " + attributes.LoaiTram
          }

        //kiểm tra chiều cao
        if (attributes.DoCao) {
          let kiemTra = this.kiemTraChieuCao(attributes.DoCao);
          if (!kiemTra)
            return {
              tinhTrang: false,
              loiNhan: "Khu vực chỉ được phép trồng cột có chiều cao" + attributes.DoCao
            }
        }
      }
    }
    return {
      tinhTrang: true
    };


  }
  private async doiChieuVung(): Promise<KetQuaKiemTra> {
    let query = new Query({
      geometry: this.pointCheck,
      returnGeometry: true, outSpatialReference: this.view.spatialReference
    });
    let featureSet = await this.quyHoachBTSVung.execute(query)

    //nếu không tìm thấy tim đường nào thì return true
    if (featureSet.features.length === 0)
      return { tinhTrang: true }

    return await this.kiemTraPhuHopVoiVung(featureSet);
  }
  private async kiemTraPhuHopVoiVung(duLieuVung: __esri.FeatureSet): Promise<KetQuaKiemTra> {
    let btsLayer = this.view.map.findLayerById(constName.TramBTS) as __esri.FeatureLayer;
    if (!btsLayer)
      throw "Không tìm thấy BTS Layer";
    if (duLieuVung) {
      for (const duLieuQuyHoach of duLieuVung.features) {
        let attributes = duLieuQuyHoach.attributes as QuyHoachBTSVungModel;
        //kiểm tra thuộc đô thị hay ngoài đô thị
        let doThi: boolean = attributes.LoaiTram
          && (attributes.LoaiTram === "A1a" || attributes.LoaiTram === "A1b");
        /**
        * kiểm tra có trùng lặp BTS hay không
        * Đô thị:
        *  Các doanh nghiệp phải sử dụng chung cơ sở hạ tầng nhà trạm, cột ăng ten trong phạm vi bán kính 100m.
        * Ngoài đô thị:
        *  Các doanh nghiệp phải sử dụng chung cơ sở hạ tầng nhà trạm, cột ăng ten trong phạm vi bán kính 300m.
        **/
        let khoangCachVoiTramBTS = doThi ? KHOANG_CACH_VOI_TRAM_BTS.DO_THI : KHOANG_CACH_VOI_TRAM_BTS.NGOAI_DO_THI;
        let soLuongTramBTSTheoKhoangCach = await btsLayer.queryFeatureCount(new Query({
          geometry: this.pointCheck,
          distance: khoangCachVoiTramBTS,
          units: "meters"
        }));
        //nếu tồn tại thì số lượng lớn hơn 0 thì không đạt tiêu chí
        if (soLuongTramBTSTheoKhoangCach > 0)
          return {
            tinhTrang: false,
            loiNhan: "Tồn tại Trạm BTS thuộc đơn vị khác"
          };

        //kiểm tra loại cột
        if (attributes.LoaiTram && this.btsGraphic.attributes.LoaiTram != attributes.LoaiTram)
          return {
            tinhTrang: false,
            loiNhan: "Khu vực chỉ được phép trồng cột " + attributes.LoaiTram
          }

        //kiểm tra chiều cao
        if (attributes.DoCao) {
          let kiemTra = this.kiemTraChieuCao(attributes.DoCao);
          if (!kiemTra)
            return {
              tinhTrang: false,
              loiNhan: "Khu vực chỉ được phép trồng cột có chiều cao" + attributes.DoCao
            }
        }
      }
    }
    return {
      tinhTrang: true
    };
  }
  private async doiChieuHanhChinh(): Promise<KetQuaKiemTra> {
    //lấy hành chính tại vị trí {pointCheck}
    let query = this.hanhChinhXaLayer.createQuery();
    query.geometry = this.pointCheck;
    query.outFields = ["MaXaPhuongTT"];//chỉ lấy ID
    query.returnGeometry = true;
    query.outSpatialReference = this.view.spatialReference;
    let featureSet = await this.hanhChinhXaLayer.queryFeatures(query);

    //nếu không tìm thấy tim đường nào thì return true
    if (featureSet.features.length === 0)
      return { tinhTrang: true }

    let quyHoachTheoTimDuong = await this.kiemTraDuLieuHanhChinh(featureSet);

    return await this.kiemTraHanhChinhPhuHopVoiQuyHoach(quyHoachTheoTimDuong);
  }

  private async kiemTraDuLieuHanhChinh(featureSet: __esri.FeatureSet): Promise<__esri.Graphic[]> {
    //duyệt con đường
    let wheres = featureSet.features.map(m => "ID = " + m.attributes.MaXaPhuongTT);

    let quyHoachFeatures = await this.quyHoachBTS.queryFeatures(<__esri.Query>{
      where: `(${wheres.join(" or ")}) and LoaiDoiChieu = 2`, outFields: ["*"]
    });

    //nếu tồn tại tim đường trong quy hoạch
    if (quyHoachFeatures.features.length > 0) {
      //cập nhật geometry
      quyHoachFeatures.features.forEach(quyHoach => {
        let timDuong = featureSet.features.find(f => f.attributes.MaXaPhuongTT === quyHoach.attributes.ID);
        if (timDuong)
          quyHoach.geometry = timDuong.geometry;
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
  private async kiemTraHanhChinhPhuHopVoiQuyHoach(quyHoachTheoTimDuong: __esri.Graphic[]): Promise<KetQuaKiemTra> {
    let btsLayer = this.view.map.findLayerById(constName.TramBTS) as __esri.FeatureLayer;
    if (!btsLayer)
      throw "Không tìm thấy BTS Layer";
    if (quyHoachTheoTimDuong) {
      for (const duLieuQuyHoach of quyHoachTheoTimDuong) {
        let attributes = duLieuQuyHoach.attributes as QuyHoachBTSModel;
        //kiểm tra thuộc đô thị hay ngoài đô thị
        let doThi: boolean = attributes.LoaiTram
          && (attributes.LoaiTram === "A1a" || attributes.LoaiTram === "A1b");
        /**
        * kiểm tra có trùng lặp BTS hay không
        * Đô thị:
        *  Các doanh nghiệp phải sử dụng chung cơ sở hạ tầng nhà trạm, cột ăng ten trong phạm vi bán kính 100m.
        * Ngoài đô thị:
        *  Các doanh nghiệp phải sử dụng chung cơ sở hạ tầng nhà trạm, cột ăng ten trong phạm vi bán kính 300m.
        **/
        let khoangCachVoiTramBTS = doThi ? KHOANG_CACH_VOI_TRAM_BTS.DO_THI : KHOANG_CACH_VOI_TRAM_BTS.NGOAI_DO_THI;
        let soLuongTramBTSTheoKhoangCach = await btsLayer.queryFeatureCount(new Query({
          geometry: this.pointCheck,
          distance: khoangCachVoiTramBTS,
          units: "meters"
        }));
        //nếu tồn tại thì số lượng lớn hơn 0 thì không đạt tiêu chí
        if (soLuongTramBTSTheoKhoangCach > 0)
          return {
            tinhTrang: false,
            loiNhan: "Tồn tại Trạm BTS thuộc đơn vị khác, liên hệ Sở để được xử lý"
          };

        //kiểm tra loại cột
        if (attributes.LoaiTram && this.btsGraphic.attributes.LoaiTram != attributes.LoaiTram)
          return {
            tinhTrang: false,
            loiNhan: "Khu vực chỉ được phép trồng cột " + attributes.LoaiTram
          }

        //kiểm tra chiều cao
        if (attributes.DoCao) {
          let kiemTra = this.kiemTraChieuCao(attributes.DoCao);
          if (!kiemTra)
            return {
              tinhTrang: false,
              loiNhan: "Khu vực chỉ được phép trồng cột có chiều cao " + attributes.DoCao
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

    /**
     *  kiểm tra loại cột
     *  nếu cột là A1:
     *  - trong khu vực nếu hành chính hoặc vùng được phép trồng A1  trả về true
     *  - nếu không tồn tại hành chính hoặc khu vực thì tìm con đường tại vị trí 
     **/


    //Kiểm tra với tim đường
    kiemTra = await this.doiChieuTimDuong();
    //Nếu kiểm tra với tim đường đúng thì thực hiện kiểm tra với vùng
    if (kiemTra.tinhTrang)
      kiemTra = await this.doiChieuVung();
    //Nếu kiểm tra với vùng đúng thì thực hiện kiểm tra với hành chính
    if (kiemTra.tinhTrang)
      kiemTra = await this.doiChieuHanhChinh();
    return kiemTra;
  }
  private kiemTraChieuCao(danhSachChieuCao: string) {
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
}