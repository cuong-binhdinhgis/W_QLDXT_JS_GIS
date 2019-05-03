var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../core/Base", "dojo/dom-construct", "../core/ConstName", "../support/HanhChinhUtils", "esri/tasks/support/Query", "esri/tasks/QueryTask", "esri/geometry/geometryEngine"], function (require, exports, Base, domConstruct, ConstName, HanhChinhUtils, Query, QueryTask, geometryEngine) {
    "use strict";
    class ReportObject extends Base {
        constructor(view) {
            super();
            this.view = view;
            this.displayFields = {

                DN_KCNKKT: [
                    // Tạm ẩn
                    { width: 20, title: "STT", field: "STT" },
                    { width: 50, title: "OBJECTID", field: "OBJECTID" },
                    { width: 50, title: "Mã CSKD", field: "MaCSKD" },
                    { width: 50, title: "Mã số KD", field: "MaSoKD" },
                    { width: 50, title: "Phường/Xã", field: "MaPhuongXa" },
                    { width: 50, title: "Huyện/TP", field: "MaHuyenTP" },
                    { width: 50, title: "Mã Đường", field: "MaDuong" },
                    { width: 50, title: "Người Cập Nhật", field: "NguoiCapNhat" },
                    { width: 50, title: "Thời Gian Cập Nhật", field: "TGCapNhat" },
                    { width: 50, title: "Người Tạo", field: "NguoiTao" },
                    { width: 50, title: "Thời Gian Tạo", field: "TGTao" },
                    { width: 50, title: "Thời gian Kinh Doanh", field: "TGKinhDoanh" },
                    { width: 50, title: "Thời gian kết thúc KD", field: "TGKetThucKinhDoanh" },
                    { width: 50, title: "Tình trạng DN", field: "TinhTrangDN" },
                    { width: 50, title: "Tên Cơ sở KD", field: "TenCSKD" },
                    { width: 50, title: "Loại hình DN", field: "LoaiHinhDN" },
                    { width: 50, title: "Ngành kinh tế", field: "NganhKinhTe" },
                    { width: 50, title: "Số điện thoại", field: "SoDienThoai" },
                    { width: 50, title: "Địa chỉ trụ sở chính", field: "DiaChiTruSo" },
                    { width: 50, title: "Chủ sở hửu", field: "ChuSoHuu" },
                    { width: 50, title: "Người đại diện", field: "NguoiDaiDien" },
                    { width: 50, title: "Mã số thuế", field: "MaSoThue" },
                    { width: 50, title: "Số lần vi phạm", field: "SoLanViPham" },
                    { width: 50, title: "Khu vực sản xuất", field: "KhuVucSanXuat" },
                    { width: 50, title: "Địa chỉ hoạt động", field: "DiaDiemHoatDong" },
                    { width: 50, title: "Số lượng nhân viên", field: "SoLuongNhanVien" },
                    { width: 50, title: "Loại hình hoạt động", field: "LoaiHinhHoatDong" },
                    { width: 50, title: "Công suất thiết kế", field: "CongSuatThietKe" },
                    { width: 50, title: "Hóa chất sử dụng", field: "HoaChatSuDung" },
                    { width: 50, title: "Nhiên liệu sử dụng", field: "NhienLieuSuDung" },
                    { width: 50, title: "Lượng nước sử dụng", field: "LuongNuocSuDung" },
                    { width: 50, title: "Thủ tục môi trường", field: "ThuTucMoiTruong" },
                    { width: 50, title: "Số thủ tục môi trường", field: "SoThuTucMoiTruong" },
                    // { width: 50, title: "Tọa độ X", field: "ToadoLog" },
                    // { width: 50, title: "Tọa độ Y", field: "ToadoLat" },
                    { width: 50, title: "Tọa độ", field: "ShapeVN2000" }

                ],
                Diem_DauTu: [               
                    { width: 205, title: "STT", field: "STT" },
                    { width: 50, title: "OBJECTID", field: "OBJECTID" },
                    { width: 50, title: "Mã DXT", field: "MaDXT" },
                    { width: 50, title: "Loại DXT", field: "LoaiDXT" },
                    { width: 50, title: "Tình trạng DXT", field: "TinhTrangDXT" },
                    { width: 50, title: "Mã CSKD", field: "MaCSKD" },
                    { width: 50, title: "Người cập nhật", field: "NguoiCapNhat" },
                    { width: 50, title: "Thời gian cập nhật", field: "TGCapNhat" },
                    { width: 50, title: "Thời gian tạo", field: "TGTao" },
                    { width: 50, title: "Người tạo", field: "NguoiTao" },
                    { width: 50, title: "Thời gian lấy mẫu gần nhất", field: "TGLayMauGanNhat" },
                    { width: 50, title: "Thời gian ký kết quả gần nhất", field: "TGKyKetQuaGanNhat" },
                    { width: 50, title: "Lưu lượng khí thải", field: "LuuLuongKhiThai" },
                    { width: 50, title: "Lưu lượng nước thải", field: "LuuLuongNuocThai" },
                    { width: 50, title: "Tổng khối lượng", field: "TongKhoiLuong" },
                    { width: 50, title: "Tọa độ", field: "ShapeVN2000" }

                ]
            };

            this.initWindowKendo();
            this.hanhChinhUtils = new HanhChinhUtils({ map: this.view.map });




            /*
             
                        var drawPolygonButton = document.getElementById("polygonButton");
                        drawPolygonButton.onclick = function () {
                            // set the sketch to create a polygon geometry
                            sketchViewModel.create("polygon");
                            map.add(graphicsLayer);
                            //setActiveButton(this);
                        };
            */



        }
        initWindowKendo() {
            this.report_content = $("#gridDisplay");
            this.table = domConstruct.create('div', {
                id: 'table-report'
            });
            this.report_content.append(this.table);
        }
        convertAttributes(fields, lstAttributes) {
            if (fields && fields.length > 0) {

                fields.forEach(field => {
                    if (field.type === "date") {
                        lstAttributes.forEach(attributes => {
                            if (attributes[field.name])
                                attributes[field.name] = kendo.toString(new Date(attributes[field.name]), "HH:mm:ss dd-MM-yyyy");
                        });
                    }
                });

            }
            return lstAttributes;
        }




        showTable(layer, attributes) {
console.log(layer);
console.log(attributes);

            var htmlSTT = '<tr id="STT" role="button"><td>&nbsp;<input type="checkbox"  checked id="chkbox-STT"> STT</td></tr>';
            var htmlOID = '<tr id="OBJECTID" role="button"><td>&nbsp;<input type="checkbox" id="chkbox-OBJECTID"> OBJECTID</td></tr>';
            var htmlVN2000 = '<tr id="ShapeVN2000" role="button"><td>&nbsp;<input type="checkbox" id="chkbox-ShapeVN2000"> Tọa Độ</td></tr>';
            var htmlGridFilter = '';

            for (var f = 0; f < layer.fields.length; f++) {
                var inpchecked = "";

                for (var df = 0; df < this.displayFields[layer.id].length; df++) {

                    if (layer.fields[f].name == this.displayFields[layer.id][df].field) {
                        inpchecked = "checked";
                    }
                }
                if (layer.fields[f].name != "OBJECTID") {
                    htmlGridFilter += '<tr id="' + layer.fields[f].name + '" role="button"><td>&nbsp;<input type="checkbox" ' + inpchecked + ' id="chkbox-' + layer.fields[f].name + '"> ' + layer.fields[f].alias + '</td></tr>';
                }

            }


            document.getElementById("esri-filter").onclick = function () {

                if (document.getElementById("esri-filter-modal").style.display == "none") {
                    document.getElementById("esri-filter-modal").style.display = "block";
                    document.getElementById("dataGridFilter").innerHTML = '<tbody>' + htmlSTT + htmlOID + htmlGridFilter + htmlVN2000 + '</tbody>';

                } else {
                    document.getElementById("esri-filter-modal").style.display = "none";
                }
            };


            document.getElementById("dataGridFilter").onclick = function (e) {
                // function heheh() {
                //     alert("sdfsdfv");
                // };
                // heheh();
                console.log("chkbox-" + e.path[1].id);
                /*
                if (document.getElementById("chkbox-" + e.path[1].id).checked == true) {
                    document.getElementById("chkbox-" + e.path[1].id).checked = false;
                } else {
                    document.getElementById("chkbox-" + e.path[1].id).checked = true;
                }
                */






                // let id = e.path[1].id;
                // let query = CUM_CONGNGHIEPLayer.createQuery();
                // query.where = 'OBJECTID = ' + id;
                // query.outSpatialReference = app.activeView.spatialReference;
                // query.returnGeometry = true;
                // CUM_CONGNGHIEPLayer.queryFeatures(query).then(results => {
                //     app.activeView.popup.open({
                //         features: results.features,
                //         updateLocationEnabled: true
                //     });

                // });

            };



            let columns = this.displayFields[layer.id];
            console.log(columns);
            //var columnsFilter = [
            // { width: 15, title: "Tt", field: "STT" }//,
            // { width: 50, title: "Tên điểm", field: "TenDiem" },
            // { width: 50, title: "Địa điểm", field: "DiaDiem" },
            // { width: 50, title: "Tình trạng đầu tư", field: "TinhTrangDauTu" },
            // { width: 50, title: "Tổng mức đầu tư dự kiến", field: "TongMucDauTuDuKien" }
            //];

            // if (columnsFilter == []) {
            //     columns = this.displayFields[layer.id];
            // } else {
            //     columns = columnsFilter;
            // }


            var fields = layer.fields;




            for (let y = 0; y < attributes.length; y++) {

                //alert("vong lap for");
                let element2 = attributes[y];
                let toadoVN2000 = "";
                //console.log(element2);


                let query = layer.createQuery();
                query.where = 'OBJECTID = ' + element2.OBJECTID;
                //query.where = '';
                query.returnGeometry = true;
                query.showAttachments = true;
                // let toadoVN2000="";

                layer.queryFeatures(query).then(results => {

                    //Loi thay the thanh point vn2000
                    // for (var z = 0; z < results.features[0].geometry.rings[0].length; z++) {

                    //     //console.log(results.features[0].geometry.rings[0][z]);
                    //     if (toadoVN2000 == "") {
                    //         //toadoVN2000+=results.features[0].geometry.rings[0][z][0] +", "+results.features[0].geometry.rings[0][z][1];
                    //         toadoVN2000 += results.features[0].geometry.rings[0][z][0] + " " + results.features[0].geometry.rings[0][z][1];
                    //     } else {
                    //         //toadoVN2000+="], ["+results.features[0].geometry.rings[0][z][0] +", "+results.features[0].geometry.rings[0][z][1];
                    //         toadoVN2000 += ", " + results.features[0].geometry.rings[0][z][0] + " " + results.features[0].geometry.rings[0][z][1];
                    //     }


                    // }


                    toadoVN2000 = results.features[0].geometry.x + ", " + results.features[0].geometry.y;

                    element2["ShapeVN2000"] = toadoVN2000;

                    if (y == attributes.length - 1) {

                        let kendoData = this.convertAttributes(fields, attributes);

                        this.kendoGrid = $('#table-report').empty().kendoGrid({
                            height: "100%",




                            toolbar: [{ name: "excel", text: "Xuất báo cáo" }],

                            resizable: true,
                            excel: {
                                allPages: true,
                                fileName: "Thống kê dữ liệu.xlsx"
                            },


                            selectable: true,
                            pageable: true,
                            columns: columns,
                            dataSource: {
                                transport: {
                                    read: function (e) {
                                        e.success(kendoData);
                                        //console.log(e);
                                    },
                                    error: function (e) {
                                        alert("Status: " + e.status + "; Error message: " + e.errorThrown);
                                    }
                                },
                                pageSize: 10,
                                batch: false,
                                schema: {
                                    model: {
                                        id: "OBJECTID",
                                    }
                                }
                            },
                            change: e => {




                                let selectedRows = e.sender.select();
                                let id = e.sender.dataItem(selectedRows)['OBJECTID'];
                                let query = layer.createQuery();
                                query.where = 'OBJECTID = ' + id;
                                query.outSpatialReference = this.view.spatialReference;
                                query.returnGeometry = true;
                                layer.queryFeatures(query).then(results => {
                                    this.view.popup.open({
                                        features: results.features,
                                        updateLocationEnabled: true
                                    });
                                });


                            },
                            excelExport: (e) => {
                                this.showTable(layer, attributes);

                                if (e.data) {
                                    for (const item of e.data) {
                                        //item.TenDoanhNghiep = 'hihi';
                                        //console.log(item);





                                    }

                                }


                            }
                        });
                        //$("#vertical").data("kendoSplitter").expand(".k-pane:last");


                    }



                });





            }



            columns.forEach(c => {
                //alert("vong lap forecrch cua do dl");
                if (!c.title) {
                    let field = layer.fields.find(f => f.name === c.field);
                    if (field)
                        c.title = field.alias;
                }
            });


            /*
            
            let kendoData = this.convertAttributes(fields, attributes);
            this.kendoGrid = $('#table-report').empty().kendoGrid({
                height: "100%",
                toolbar: [{ name: "excel", text: "Xuất báo cáo" }],
                resizable: true,
                excel: {
                    allPages: true,
                    fileName: "Thống kê dữ liệu.xlsx"
                },
                selectable: true,
                pageable: true,
                columns: columns,
                dataSource: {
                    transport: {
                        read: function (e) {
                            e.success(kendoData);
                        },
                        error: function (e) {
                            alert("Status: " + e.status + "; Error message: " + e.errorThrown);
                        }
                    },
                    pageSize: 5,
                    batch: false,
                    schema: {
                        model: {
                            id: "OBJECTID",
                        }
                    }
                },
                change: e => {
                    let selectedRows = e.sender.select();
                    let id = e.sender.dataItem(selectedRows)['OBJECTID'];
                    let query = layer.createQuery();
                    query.where = 'OBJECTID = ' + id;
                    query.outSpatialReference = this.view.spatialReference;
                    query.returnGeometry = true;
                    layer.queryFeatures(query).then(results => {
                        this.view.popup.open({
                            features: results.features,
                            updateLocationEnabled: true
                        });
                    });
                    
                },
                excelExport: (e) => {
                    if (e.data) {
                        for (const item of e.data) {
                            item.TenDoanhNghiep = 'hihi';
                        }
                    }
                }
            });
            //$("#vertical").data("kendoSplitter").expand(".k-pane:last");
            */
        }




        showReport(layer, features) {

            return __awaiter(this, void 0, void 0, function* () {
                var attributes = features.map(m => m.attributes);
                //let duLieuHanhChinhXa = yield this.hanhChinhUtils.selectAllWard({});
                for (const field of layer.fields) {
                    if (field.domain) {
                        let codedValues = field.domain.codedValues;
                        attributes.forEach(attr => {
                            if (attr[field.name]) {
                                let codedValue = codedValues.find(f => f.code === attr[field.name]);
                                if (codedValue)
                                    attr[field.name] = codedValue.name;
                            }
                        });
                    }
                    /*
                    else if (field.name === "HuyenTXTP") {
                        yield this.hanhChinhUtils.selectAllDistrict({}).then(huyens => {
                            attributes.forEach((attr) => __awaiter(this, void 0, void 0, function* () {
                                if (attr[field.name]) {
                                    let huyen = huyens.find(f => f.attributes.MaHuyenTp == attr[field.name]);
                                    if (huyen)
                                        attr[field.name] = huyen.attributes.TenHuyenTp;
                                }
                            }));
                        });
                    }
                 
                    else if (field.name === "XaPhuongTT") {
                        attributes.forEach((attr) => __awaiter(this, void 0, void 0, function* () {
                            if (attr[field.name]) {
                                let xa = duLieuHanhChinhXa.find(f => f.attributes.MaXaPhuongTT == attr[field.name]);
                                if (xa)
                                    attr[field.name] = xa.attributes.TenXaPhuongTT;
                            }
                        }));
                    }
                    */
                    /*
                    else if(field.name==="TenDiem"){
                        alert("show tim kiem");
                        for(let i =0;i<features.length;i++){
                           let element=features[i];
                           element.attributes["TenDiem"]=element.attributes["TenDiem"].substring(0,5);
                       }

                    }
                    */

                }

                for (let i = 0; i < features.length; i++) {
                    //alert("do shap");
                    let element = features[i];
                    element.attributes["STT"] = i + 1;
                    //element.attributes["__OBJECTID"]=123;
                    element.attributes["ShapeVN2000"] = null;
                }




                // for (let y = 0; y < features.length; y++) {

                //     let element2 = features[y];
                //     let toadoVN2000="";

                //     let query = layer.createQuery();
                //     query.where = 'OBJECTID = ' + element2.attributes.OBJECTID;
                //     //query.where = '';
                //     query.returnGeometry = true;
                //    // let toadoVN2000="";
                //     layer.queryFeatures(query).then(results => {
                //        alert("querydfdfd");
                //         for (var z = 0; z < results.features[0].geometry.rings[0].length; z++){
                //            if(toadoVN2000 ==""){
                //             toadoVN2000 += results.features[0].geometry.rings[0][0][0] + " "+results.features[0].geometry.rings[0][0][1];
                //            }else{
                //             toadoVN2000 += ", "+results.features[0].geometry.rings[0][0][0] + " "+results.features[0].geometry.rings[0][0][1];
                //            }                           
                //         }
                //         alert("gan toa do");
                //        toadoVN2000=layer.geometryType.toUpperCase()+" (("+toadoVN2000+"))";
                //        console.log(toadoVN2000);

                //         element2.attributes["ShapeVN2000"]=toadoVN2000;
                //         alert("show toa do da gan"+element2.attributes["ShapeVN2000"]);
                //        // alert("gann");


                //     });

                // }




                /*
                if (layer.id === ConstName.TUYENCAPNGAM) {
                    let where = attributes.map(f => `OBJECTID = ${f.OBJECTID}`);
                    attributes.forEach((attr) => __awaiter(this, void 0, void 0, function* () {
                        let OBJECTID = attr.OBJECTID;
                        let results = yield layer.queryFeatures({
                            where: "OBJECTID = " + OBJECTID, returnGeometry: true, outFields: ["OBJECTID"]
                        });
                        let feature = results[0];
                        if (feature) {
                            let geometry = feature.geometry;
                            const diemDau = geometry.getPoint(0, geometry.paths[0].length - 1), diemCuoi = geometry.getPoint(geometry.paths.length - 1, geometry.paths[geometry.paths.length - 1].length - 1);
                            if (!diemDau || !diemCuoi) {
                                attr["XDiemDau"] = "Không xác định";
                                attr["YDiemDau"] = "Không xác định";
                                attr["XDiemCuoi"] = "Không xác định";
                                attr["YDiemCuoi"] = "Không xác định";
                                attr["XaPhuongDiemDau"] = "Không xác định";
                                attr["XaPhuongDiemCuoi"] = "Không xác định";
                                return;
                            }
                            attr["XDiemDau"] = diemDau.x.toFixed(5);
                            attr["YDiemDau"] = diemDau.y.toFixed(5);
                            attr["XDiemCuoi"] = diemCuoi.x.toFixed(5);
                            attr["YDiemCuoi"] = diemCuoi.y.toFixed(5);
                            attr["XaPhuongDiemDau"] = "Không xác định";
                            attr["XaPhuongDiemCuoi"] = "Không xác định";
                            let query = new Query();
                            query.geometry = diemDau;
                            duLieuHanhChinhXa.forEach(xa => {
                                if (geometryEngine.contains(xa.geometry, diemDau)) {
                                    attr["XaPhuongDiemDau"] = xa.attributes[HanhChinhUtils.TEN_XA];
                                }
                                if (geometryEngine.contains(xa.geometry, diemCuoi)) {
                                    attr["XaPhuongDiemCuoi"] = xa.attributes[HanhChinhUtils.TEN_XA];
                                }
                            });
                        }
                    }));
                }
                */
                this.showTable(layer, attributes);










                return true;
            });
        }







    }
    return ReportObject;

});
