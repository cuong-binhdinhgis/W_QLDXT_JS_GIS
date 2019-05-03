import constName = require('../core/ConstName');
class HanhChinhUtils {
  public map: __esri.Map;
  public static MA_HUYEN = "MaHuyenTp";
  public static TEN_HUYEN = "TenHuyenTp"
  public static MA_XA = "MaXaPhuongTT";
  public static TEN_XA = "TenXaPhuongTT"
  constructor(params: { map: __esri.Map }) {
    this.map = params.map;
  }
  private get districtLayer(): __esri.Sublayer {
    return (this.map.findLayerById(constName.BASEMAP) as __esri.MapImageLayer).findSublayerById(constName.INDEX_HANHCHINHHUYEN);
  }
  private get wardLayer(): __esri.Sublayer {
    return (this.map.findLayerById(constName.BASEMAP) as __esri.MapImageLayer).findSublayerById(constName.INDEX_HANHCHINHXA);
  }
  public selectAllDistrict(options: { returnGeometry?: false }): Promise<__esri.Graphic[]> {
    return new Promise((resolve, reject) => {
      let query = this.districtLayer.createQuery();
      query.returnGeometry = options.returnGeometry || false;
      query.where = "1=1";
      query.outFields = [HanhChinhUtils.MA_HUYEN, HanhChinhUtils.TEN_HUYEN];
      this.districtLayer.queryFeatures(query).then(r => {
        resolve(r.features)
      }).catch(e => reject(e));
    });
  }
  public selectAllWard(options: { returnGeometry?: boolean }): Promise<__esri.Graphic[]> {
    return new Promise((resolve, reject) => {
      let query = this.wardLayer.createQuery();
      query.returnGeometry = options.returnGeometry || false;
      query.where = "1=1";
      query.outFields = [HanhChinhUtils.MA_XA, HanhChinhUtils.TEN_XA];
      this.wardLayer.queryFeatures(query).then(r => {
        resolve(r.features)
      }).catch(e => reject(e));
    });
  }
  public queryDistrict(query: __esri.Query) {
    return this.districtLayer.queryFeatures(query);
  }
  public queryWard(query: __esri.Query) {
    return this.wardLayer.queryFeatures(query);
  }
  public districtIdToName(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.districtLayer.queryFeatures(<__esri.Query>{
        where: `${HanhChinhUtils.MA_HUYEN} = '${id}'`, outFields: [HanhChinhUtils.TEN_HUYEN]
      }).then(r => {
        if (r.features.length > 0) {
          resolve(r.features[0].attributes[HanhChinhUtils.TEN_HUYEN]);
        } else
          resolve(null)
      })
    });
  }
  public wardIdToName(id: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.wardLayer.queryFeatures(<__esri.Query>{
        where: `${HanhChinhUtils.MA_XA} = '${id}'`, outFields: [HanhChinhUtils.TEN_XA]
      }).then(r => {
        if (r.features.length > 0) {
          resolve(r.features[0].attributes[HanhChinhUtils.TEN_XA]);
        } else
          resolve(null)
      })
    });
  }
}
export = HanhChinhUtils