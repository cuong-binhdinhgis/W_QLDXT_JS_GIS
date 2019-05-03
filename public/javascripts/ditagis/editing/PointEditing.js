define([
    "../core/ConstName",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "ditagis/support/Editing",
    "esri/layers/FeatureLayer"
], function (constName, QueryTask, Query, EditingSupport, FeatureLayer) {
    'use strict';
    return class PointEditing {
        constructor(view) {
            this.view = view;
            this.editingSupport = new EditingSupport(view);
            this.systemVariable = view.systemVariable;

        }
        get layer() {
            return this._layer;
        }
        set layer(value) {
            this._layer = value;
        }
        draw(point) {
            this.draw(this.layer, point);
        }

        async draw(layer, graphic) {
            try {
                let attributes = {};

                /**
                 * ví dụ sử dụng domain thì cần phải gán domain vào attributes thì khi thêm đối tượng
                 * vào cơ sở dữ liệu thì mới hiển thị lên được bản đồ
                 */
                if (graphic.attributes) {
                    for (let i in graphic.attributes) {
                        attributes[i] = graphic.attributes[i];
                    }
                }
                if (layer.drawingAttributes) {
                    for (let i in layer.drawingAttributes) {
                        attributes[i] = layer.drawingAttributes[i];
                    }
                }
                //lấy thông tin cập nhật gồm người tạo và thời gian tạo
                // if(notify)
                // notify.update({ 'type': 'info', 'message': 'Đang lấy định danh...', 'progress': 20 });
                const createdInfo = await this.editingSupport.getCreatedInfo(this.view);
                for (let i in createdInfo) {
                    attributes[i] = createdInfo[i];
                }
                // if(notify)
                // notify.update({ 'type': 'info', 'message': 'Lấy định danh thành công', 'progress': 30 });
                // point.attributes = attributes;
                if (layer.id === constName.TramBTS) {
                    attributes.TinhTrang = 1;
                    if (layer.drawingAttributes['TenDoanhNghiep'])
                        attributes.TenDoanhNghiep = layer.drawingAttributes['TenDoanhNghiep'].split(", ")[0];
                }
                if (this.systemVariable.user.GroupRole === 'DN') {
                    attributes.TenDoanhNghiep = this.systemVariable.user.Role;
                }
                let edits = {
                    addFeatures: [{
                        geometry: graphic.geometry,
                        attributes: attributes
                    }]
                };
                layer.applyEdits(edits).then((result) => {
                    if (result.addFeatureResults.length > 0) {
                        let objectId = result.addFeatureResults[0].objectId;
                        if (objectId) {
                            //lấy thông tin xã huyện
                            // if(notify)
                            // notify.update({ 'type': 'info', 'message': 'Đang lấy vị trí...!', 'progress': 55 });

                            //POPUP OPEN
                            layer.queryFeatures({
                                returnGeometry: true,
                                outSpatialReference: this.view.spatialReference,
                                where: 'OBJECTID = ' + objectId,
                                outFields: ['*']
                            }).then(res => {
                                //neu tim duoc
                                if (res.features[0]) {
                                    let ft = res.features[0];
                                    this.editingSupport.getLocationInfo({
                                        geometry: ft.geometry
                                    }).then(locationInfo => {
                                        // if(notify) notify.update({ 'type': 'info', 'message': 'Lấy vị trí thành công!', 'progress': 80 });
                                        for (let i in locationInfo) {
                                            ft.attributes[i] = locationInfo[i];
                                        }
                                        layer.applyEdits({
                                            updateFeatures: [{
                                                attributes: ft.attributes
                                            }]
                                        }).then((result) => {
                                            // if (!result.updateFeatureResults[0].error)
                                            // if(notify) notify.update({ 'type': 'success', 'message': 'Cập nhật vị trí thành công!', 'progress': 100 });
                                            // else
                                            // if(notify) notify.update({ 'type': 'danger', 'message': 'Cập nhật vị trí không thành công', 'progress': 100 });
                                        });
                                    })
                                    this.view.popup.open({
                                        features: [ft],
                                        updateLocationEnabled: true
                                    });
                                }
                            });
                        }
                        //khi applyEdits, nếu phát hiện lỗi
                        // if (!res.updateFeatureResults[0].error)
                        // if(notify) notify.update({ 'type': 'danger', 'message': 'Có lỗi xảy ra trong quá trình thực hiện', 'progress': 100 });
                    }
                })
            } catch (err) {
                console.log(err);
            }
        }

    }

});