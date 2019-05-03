/**
 * Lớp này dùng để gọi các chức năng của các lớp khi vẽ Point (Vẽ tùy chọn, hướng, giao hội)
 * Tham số truyền vào (view, systemVariable)
 * systemVariable: Thông tin khách hàng đang hiển thị
 */
define([
  "ditagis/tools/SimpleDrawPoint",
  "ditagis/editing/PointEditing",
  "esri/Graphic",
  "ditagis/classes/EventListener", './PointInput',
  "../support/QuyHoachBTS",
  "../core/ConstName"
], function (SimpleDrawPoint, PointEditing, Graphic,
  EventListener, PointInput, QuyHoachBTS, constName) {
  'use strict';
  return class {
    constructor(view) {
      this.view = view;
      this._drawLayer = null;
      this.systemVariable = view.systemVariable;
      // Chức năng vẽ Khoảng cách- Hướng
      // Chức năng vẽ giao hội
      // Chức năng vẽ tùy chọn
      this.simpleDrawPoint = new SimpleDrawPoint(this.view);
      this.eventListener = new EventListener(this);
      this.pointEditing = new PointEditing(this.view);
      this.pointInput = new PointInput(this.view);
      this.quyHoachBTS = new QuyHoachBTS(this.view);
      this.registerEvent();
    }
    addFeature(graphic) {
      //nếu là trạm BTS thì yêu cầu chọn loại trụ
      if (this.drawLayer.id === constName.TramBTS) {
        const codedValues = this.drawLayer.fields.find(f => f.name === "LoaiTram").domain.codedValues;
        let dialog = $("<div/>").appendTo(document.body);
        const chonLoaiCot = (e) => {
          let valChonLoaiCot = dialog.find('input[name=chonLoaiCot]').val();
          let valChieuCao = dialog.find('input[name=chieuCao]').val();
          if(!valChieuCao || !valChonLoaiCot)
            {
              kendo.alert("Vui lòng nhập đầy đủ thông tin");
              return false;
            }
          if (valChonLoaiCot) {
            if (!graphic.attributes) {
              graphic.attributes = {};
            }
            graphic.attributes.LoaiTram = valChonLoaiCot;
            graphic.attributes.DoCaoTram = parseInt(valChieuCao);
          }
          this.quyHoachBTS.run(graphic).then(ketQua => {
            if (ketQua.loiNhan)
              kendo.alert(ketQua.loiNhan)
            if (ketQua.tinhTrang) {
              this.pointEditing.draw(this.drawLayer, graphic);
            };
          })

        }
        dialog.kendoDialog({
          width: "400px",
          title: "Chọn loại cột",
          closable: false,
          modal: false,
          content: `<input name='chonLoaiCot' style='width:100%'></input>
                    <input name='chieuCao' class="k-textbox" type="number" style='width:100%;margin-top:10px'></input>`,
          actions: [{
              text: 'Chọn',
              action: chonLoaiCot
            },
            {
              text: 'Đóng',
            }
          ],
          close: function () {
            dialog.data("kendoDialog").destroy();
            dialog.remove();
          }
        });
        let cb = dialog.find('input[name=chonLoaiCot]');
        cb.kendoDropDownList({
          dataSource: codedValues,
          dataTextField: "name",
          dataValueField: "code"
        })
      } else {
        this.pointEditing.draw(this.drawLayer, graphic);
      }

    }
    registerEvent() {
      this.simpleDrawPoint.on('draw-finish', (geometry) => {
        this.eventListener.fire('draw-finish', {
          graphic: geometry,
          method: 'arcsegment'
        });
        this.addFeature(geometry);
      })
    }
    set drawLayer(val) {
      this._drawLayer = val;
    }
    get drawLayer() {
      return this._drawLayer;
    }
    // Vẽ Tùy chọn
    drawSimple() {
      this.simpleDrawPoint.clearEvents();
      this.simpleDrawPoint.draw(this.drawLayer);
    }
    drawByPointInput() {
      this.pointInput.getPointInput().then(geometry => {
        this.addFeature(geometry);
      })
    }
    clearEvents(){
      this.simpleDrawPoint.clearEvents();
    }
  }
});