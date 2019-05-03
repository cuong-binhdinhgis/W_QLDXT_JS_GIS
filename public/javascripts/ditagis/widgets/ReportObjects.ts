import Base = require('../core/Base');
import domConstruct = require("dojo/dom-construct");
import FeatureLayer = require('../layers/FeatureLayer');
import ConstName = require('../core/ConstName');
import HanhChinhUtils = require('../support/HanhChinhUtils');
import Query = require("esri/tasks/support/Query");
import geometryEngine = require("esri/geometry/geometryEngine");
class ReportObject extends Base {
	private view: __esri.MapView;
	private displayFields: {};
	private report_content;
	private table;
	private kendoGrid;
	private hanhChinhUtils: HanhChinhUtils;
	constructor(view) {
		super();
		this.view = view;
		this.displayFields = {
			TramBTS: [
				{ width: 60, title: "Tt", field: "STT" },
				{ width: 60, title: "Tên DN", field: "TenDoanhNghiep" },
				{ width: 60, title: "Tên trạm", field: "TenTram" },
				{ width: 60, title: "Mã trạm", field: "MaTram" },
				{ width: 60, title: "Tọa độ X", field: "ToaDoX" },
				{ width: 60, title: "Tọa độ Y", field: "ToaDoY" },
				{ width: 60, title: "Huyện, T/phố", field: "HuyenTXTP" },
				{ width: 60, title: "Xã, phường", field: "XaPhuongTT" },
				{ width: 60, title: "Địa chỉ", field: "DiaChi" },
				{ width: 60, title: "Họ và tên chủ sở hữu đất, nhà", field: "ChuSoHuuDat" },
				{ width: 60, title: "Loại anten (Tự đứng/Dây co)", field: "LoaiAngTen" },
				{ width: 60, title: "Cột khác", field: "CotKhac" },
				{ width: 60, title: "Độ cao trạm (m)", field: "DoCaoTram" },
				{ width: 60, title: "Loại trạm (Loại 1/ Loại 2)", field: "LoaiTram" },
				{ width: 60, title: "Độ cao tầng", field: "DoCaoTang" },
				{ width: 60, title: "Công suất (w)", field: "CongSuat" },
				{ width: 60, title: "Vùng phủ (m)", field: "VungPhu" },
				{ width: 60, title: "Góc ngẩn anten", field: "GocNgan" },
				{ width: 60, field: "NgayGioCapPhepBTS" },
				{ width: 60, title: "Thời gian xây dựng", field: "TGXayDung" },
				{ width: 60, title: "Thời gian phát sóng", field: "TGPhatSong" },
				{ width: 60, title: "Gíây phép xây dựng (Có/ Không)", field: "GiayPhepXayDung" },
				{ width: 60, title: "Chấp thuận của Sở (Chưa có/ Đã có)", field: "ChapThuanCuaSo" },
				{ width: 60, title: "Số công văn của Sở", field: "SoCongVan" },
				{ width: 60, title: "Đã lắp thiết bị 3G/4G", field: "ThietBiLapDat" },
				{ width: 60, title: "Giấy kiểm định công trình (Đã có/ Chưa có)", field: "GiayKiemDinhCongTrinh" },
				{ width: 60, title: "Ngày cấp giấy kiểm định công trình", field: "NgayCap" },
				{ width: 60, title: "Ngày hết hạn giấy kiểm định công trình", field: "NgayHetHan" },
				{ width: 60, title: "Số công văn hồ sơ kiểm định", field: "SoCongVanHSKD" },
				{ width: 60, title: "Ngày nộp hồ sơ kiểm định", field: "NgayNopHSKD" },
				{ width: 60, title: "Họ tên người cung cấp thông tin", field: "NguoiCungCapThongTin" },
				{ width: 60, title: "Ghi chú", field: "GhiChu" }
			],
			TuyenCapNgam: [
				{ width: 60, title: "TT", field: "STT" },
				{ width: 60, title: "Tên tuyến", field: "TenTuyen" },
				{ width: 60, title: "Tên DN", field: "TenDoanhNghiep" },
				{ width: 60, title: "Điểm đầu", field: "DiemDau" },
				{ width: 60, title: "Tọa độ X điểm đầu ", field: "XDiemDau" },
				{ width: 60, title: "Tọa độ Y điểm đầu ", field: "YDiemDau" },
				{ width: 60, title: "Xã, phường, thị trấn điểm đầu", field: "XaPhuongDiemDau" },
				{ width: 60, title: "Điểm cuối", field: "DiemCuoi" },
				{ width: 60, title: "Tọa độ X điểm cuối ", field: "XDiemCuoi" },
				{ width: 60, title: "Tọa độ Y điểm cuối ", field: "YDiemCuoi" },
				{ width: 60, title: "Xã, phường, thị trấn điểm cuối", field: "XaPhuongDiemCuoi" },
				{ width: 60, title: "Các tuyến đường của tuyến cáp", field: "CacTuyenDuong" },
				{ width: 60, title: "Chiều dài tuyến (Km)", field: "ChieuDaiThucTe" },
				{ width: 60, title: "Trên/Dưới hè đường", field: "ViTriTuyenCap" },
				{ width: 60, title: "Khoảng cách so với lề đường (m)", field: "KhoangCachSoVoiLe" },
				{ width: 60, title: "2 tuyến cáp ngầm", field: "HaiTuyenCapNgam" },
				{ width: 60, title: "Số lượng ống cáp", field: "SoLuongOngCap" },
				{ width: 60, title: "Số lượng ống cáp đang sử dụng", field: "SoLuongOngDangDung" },
				{ width: 60, title: "Loại cáp (Cáp quang, cáp đồng)", field: "LoaiCap" },
				{ width: 60, title: "Dung lượng cáp sử dụng", field: "DungLuongCap" },
				{ width: 60, title: "Loại công trình hạ tầng kỹ thuật (N1, N2)", field: "LoaiCongTrinh" },
				{ width: 60, title: "Dùng chung hạ tầng, phương thức ngầm", field: "KhaNangDungChung" },
				{ width: 60, title: "Ghi chú", field: "GhiChu" },
			],
			DiemDichVu: [
				{ field: "STT", title: "TT", width: 60 },
				{ field: "SoHieu", width: 60 },
				{ field: "TenDiem", width: 60 },
				{ field: "TenDoanhNghiep", width: 60 },
				{ field: "SoDienThoai", width: 60 },
				{ field: "ToaDoX", width: 60 },
				{ field: "ToaDoY", width: 60 },
				{ field: "MaHuyenTXTP", width: 60 },
				{ field: "MaXaPhuongTT", width: 60 }
			]
		}
		this.initWindowKendo();
		this.hanhChinhUtils = new HanhChinhUtils({ map: this.view.map });
	}
	initWindowKendo() {
		this.report_content = $("#report-objects");

		this.table = domConstruct.create('div', {
			id: 'table-report'
		});
		this.report_content.append(this.table);


	}
	private convertAttributes(fields: __esri.Field[], lstAttributes: any[]) {
		if (fields && fields.length > 0) {
			fields.forEach(field => {
				if (field.type === "date") {
					lstAttributes.forEach(attributes => {
						if (attributes[field.name])
							attributes[field.name] = kendo.toString(new Date(attributes[field.name]), "HH:mm:ss dd-MM-yyyy");
					})

				}
			})
		}
		return lstAttributes
	}
	showTable(layer: FeatureLayer, attributes: any[]) {
		let columns: kendo.ui.GridColumn[] = this.displayFields[layer.id];
		var fields = layer.fields;
		columns.forEach(c => {
			if (!c.title) {
				let field = layer.fields.find(f => f.name === c.field);
				if (field)
					c.title = field.alias;
			}
		})
		let kendoData = this.convertAttributes(fields, attributes)
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
						// handle data operation error
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
					})
				})
			},
			excelExport: (e) => {
				if (e.data) {
					for (const item of e.data) {
						item.TenDoanhNghiep = 'hihi'
					}
				}
			}
		});
		$("#vertical").data("kendoSplitter").expand(".k-pane:last");
	}

	async showReport(layer: FeatureLayer, features: __esri.Graphic[]): Promise<boolean> {
		var attributes = features.map(m => m.attributes);
		let duLieuHanhChinhXa = await this.hanhChinhUtils.selectAllWard({});
		for (const field of layer.fields) {
			if (field.domain) {
				let codedValues = (field.domain as __esri.CodedValueDomain).codedValues;
				attributes.forEach(attr => {
					if (attr[field.name]) {
						let codedValue = codedValues.find(f => f.code === attr[field.name]);
						if (codedValue)
							attr[field.name] = codedValue.name
					}
				})
			} else if (field.name === "HuyenTXTP") {
				await this.hanhChinhUtils.selectAllDistrict({}).then(huyens => {
					attributes.forEach(async attr => {
						if (attr[field.name]) {
							let huyen = huyens.find(f => f.attributes.MaHuyenTp == attr[field.name]);
							if (huyen) attr[field.name] = huyen.attributes.TenHuyenTp;
						}
					})
				})
			} else if (field.name === "XaPhuongTT") {
				attributes.forEach(async attr => {
					if (attr[field.name]) {
						let xa = duLieuHanhChinhXa.find(f => f.attributes.MaXaPhuongTT == attr[field.name]);
						if (xa) attr[field.name] = xa.attributes.TenXaPhuongTT;
					}
				})
			}
		}
		//cập nhật stt
		for (let i = 0; i < features.length; i++) {
			let element = features[i];
			element.attributes["STT"] = i + 1;
		}
		if (layer.id === ConstName.TUYENCAPNGAM) {
			let where: string[] = attributes.map(f => `OBJECTID = ${f.OBJECTID}`);
			attributes.forEach(async attr => {
				let OBJECTID = attr.OBJECTID;
				let results = await layer.queryFeatures({
					where: "OBJECTID = " + OBJECTID, returnGeometry: true, outFields: ["OBJECTID"]
				});
				let feature = results[0];
				if (feature) {
					let geometry = feature.geometry as __esri.Polyline;
					const diemDau = geometry.getPoint(0, geometry.paths[0].length - 1),
						diemCuoi = geometry.getPoint(geometry.paths.length - 1, geometry.paths[geometry.paths.length - 1].length - 1);
					if (!diemDau || !diemCuoi) {
						attr["XDiemDau"] = "Không xác định";
						attr["YDiemDau"] = "Không xác định"
						attr["XDiemCuoi"] = "Không xác định";
						attr["YDiemCuoi"] = "Không xác định";
						attr["XaPhuongDiemDau"] = "Không xác định";
						attr["XaPhuongDiemCuoi"] = "Không xác định"
						return;
					}
					attr["XDiemDau"] = diemDau.x.toFixed(5);
					attr["YDiemDau"] = diemDau.y.toFixed(5);
					attr["XDiemCuoi"] = diemCuoi.x.toFixed(5);
					attr["YDiemCuoi"] = diemCuoi.y.toFixed(5);
					attr["XaPhuongDiemDau"] = "Không xác định";
					attr["XaPhuongDiemCuoi"] = "Không xác định"
					let query = new Query();
					query.geometry = diemDau;
					duLieuHanhChinhXa.forEach(xa => {
						if (geometryEngine.contains(xa.geometry, diemDau)) {
							attr["XaPhuongDiemDau"] = xa.attributes[HanhChinhUtils.TEN_XA]
						}
						if (geometryEngine.contains(xa.geometry, diemCuoi)) {
							attr["XaPhuongDiemCuoi"] = xa.attributes[HanhChinhUtils.TEN_XA]
						}
					})
				}
			})
		}
		this.showTable(layer, attributes);
		return true;
	}
}
export = ReportObject;