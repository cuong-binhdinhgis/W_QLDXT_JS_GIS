define(["require", "exports", "../core/Base", "esri/geometry/Point", "esri/tasks/support/ProjectParameters", "esri/tasks/GeometryService"], function (require, exports, Base, Point, ProjectParameters, GeometryService) {
    "use strict";
    class PointInput extends Base {
        constructor(view) {
            super();
            this.view = view;
            this.geometryService = new GeometryService({ url: "https://ditagis.com:6443/arcgis/rest/services/Utilities/Geometry/GeometryServer" });
            $('<div/>', {
                id: "nhaptoado"
            }).appendTo(document.body);
        }
        getPointInput() {
            return new Promise((resolve, reject) => {
                var inputWindow;
                $('#nhaptoado').html(`<div class="k-popup-edit-form k-window-content k-content">
        <div class="k-edit-form-container">
            <div class="k-edit-label">
                <label for="toadox">Tọa độ x:</label>
            </div>
            <div data-container-for="toadox" class="k-edit-field">
                <input type="text" name="toadox" class="k-input k-textbox" />
            </div>
            <div class="k-edit-label">
                <label for="toadoy">Tọa độ y:</label>
            </div>
            <div data-container-for="toadoy" class="k-edit-field">
                <input type="text" name="toadoy" class="k-input k-textbox" />
            </div>        
    
            <div class="k-edit-buttons k-state-default">
                <a role="button" class="k-button k-button-icontext k-primary k-grid-update">
                    <span class="k-icon k-i-check"> </span>Thêm</a>
                <a role="button" class="k-button k-button-icontext k-grid-cancel">
                    <span class="k-icon k-i-cancel"> </span>Hủy</a>
            </div>
        </div>
    </div>`);
                inputWindow = $('#nhaptoado').kendoWindow({
                    title: "Nhập tọa độ",
                    position: {
                        top: '10%',
                        left: 'calc(50% - 200px)'
                    },
                    visible: false,
                    actions: [
                        "Close"
                    ],
                }).data("kendoWindow");
                $('#nhaptoado .k-primary').click(() => {
                    const toadox = $("#nhaptoado input[name='toadox']").val().toString();
                    const toadoy = $("#nhaptoado input[name='toadoy']").val().toString();
                    if (!toadox || !toadoy)
                        kendo.alert('Vui lòng điền đầy đủ thông tin');
                    else {
                        let point = new Point({
                            x: parseFloat(toadox),
                            y: parseFloat(toadoy),
                            spatialReference: {
                                wkt: 'PROJCS["VN_2000_KT108-15_3deg",GEOGCS["GCS_VN_2000",DATUM["D_Vietnam_2000",SPHEROID["WGS_1984",6378137.0,298.257223563]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",108.25],PARAMETER["Scale_Factor",0.9999],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]',
                            }
                        });
                        kendo.ui.progress($("#nhaptoado"), true);
                        let projectParameters = new ProjectParameters({
                            geometries: [point], outSpatialReference: this.view.spatialReference
                        });
                        this.geometryService.project(projectParameters).then(results => {
                            kendo.ui.progress($("#nhaptoado"), false);
                            inputWindow.close();
                            resolve({ geometry: results[0] });
                        });
                    }
                });
                $('#nhaptoado .k-grid-cancel').click(function () {
                    inputWindow.close();
                });
                inputWindow.open();
            });
        }
    }
    return PointInput;
});
