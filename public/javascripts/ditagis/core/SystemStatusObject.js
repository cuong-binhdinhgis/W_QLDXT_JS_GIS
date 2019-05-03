define(["require", "exports", "./Base"], function (require, exports, Base) {
    "use strict";
    class SystemStatusObject extends Base {
        constructor() {
            super();
        }
        get selectedFeature() {
            return this._selectedFeature;
        }
        set selectedFeature(feature) {
            this._selectedFeature = feature;
            this.fire('change-selectedFeature', feature);
        }
    }
    return SystemStatusObject;
});
