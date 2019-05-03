import Base = require('./Base');
import User = require('./User');
import FeatureLayer = require('esri/layers/FeatureLayer');
class SystemStatusObject extends Base {
  user: User;
  private _selectedFeature: FeatureLayer;
  constructor() {
    super()
  }
  get selectedFeature(): FeatureLayer {
    return this._selectedFeature;
  }
  set selectedFeature(feature: FeatureLayer) {
    this._selectedFeature = feature;
    this.fire('change-selectedFeature', feature);
  }
}
export = SystemStatusObject;