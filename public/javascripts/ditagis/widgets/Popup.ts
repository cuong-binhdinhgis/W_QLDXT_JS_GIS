import on = require("dojo/on");
import dom = require("dojo/dom");
import domConstruct = require("dojo/dom-construct");
import constName = require("../core/ConstName");
import EditingSupport = require("ditagis/support/Editing");
import HightlightGraphic = require("ditagis/support/HightlightGraphic");
import bootstrap = require("ditagis/toolview/bootstrap");
import SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
import watchUtils = require("esri/core/watchUtils");
import esriRequest = require("esri/request");
import HanhChinhUtils = require('../support/HanhChinhUtils');
import FeatureLayer = require('../layers/FeatureLayer');
import PopupTemplate = require("esri/PopupTemplate");
class Popup {
  private view: __esri.MapView;
  private options;
  private fireFields
  private editingSupport
  private hightlightGraphic
  private hanhChinhUtils: HanhChinhUtils;
  private kendoModel: kendo.data.ObservableObject;
  constructor(view: __esri.MapView) {
    this.view = view;
    this.options = {
      hightLength: 100
    }
    this.fireFields = ['created_user', 'created_date', 'last_edited_user', 'last_edited_date', 'XaPhuongTT', 'HuyenTXTP', 'TinhTrang', 'ChapThuanCuaSo', 'LoaiTram', 'DoCaoTram'];
    this.editingSupport = new EditingSupport();
    this.hightlightGraphic = new HightlightGraphic(view, {
      symbolMarker: {
        type: 'simple-marker',
        color: 'rgba(0, 0, 0, 0.2)',
        style: 'circle',
        size: '18px'
      },
      symbolLine: new SimpleLineSymbol(<__esri.SimpleLineSymbolProperties>{
        outline: {
          color: '#7EABCD',
          width: 2
        }
      })
    });
    this.hanhChinhUtils = new HanhChinhUtils({ map: view.map })
  }
  isFireField(fieldName) {
    return this.fireFields.indexOf(fieldName) !== -1;
  }
  startup() {
    this.view.on('layerview-create', (evt) => {
      let layer = evt.layer as FeatureLayer;
      if (layer.type == 'feature') {
        let actions = []
        if (layer.permission.edit) {
          actions.push({
            id: "update",
            title: "Cập nhật",
            className: "esri-icon-edit",
          });
        }
        if (layer.permission.delete) {
          actions.push({
            id: "delete",
            title: "Xóa",
            className: "esri-icon-erase",
          });
        }
        layer.popupTemplate = new PopupTemplate({
          content: (target) => {
            return this.contentPopup(target);
          },
          title: layer.title,
          actions: actions
        });
      }
    })
    this.view.popup.watch('visible', (newValue) => {
      if (!newValue) //unvisible
        this.hightlightGraphic.clear();
    })
    this.view.popup.on("trigger-action", (evt) => {
      this.triggerActionHandler(evt);
    }); //đăng ký sự kiện khi click vào action
  }
  private get layer(): FeatureLayer {
    return this.view.popup.selectedFeature.layer as FeatureLayer;
  }
  private get attributes(): any {
    return this.view.popup.selectedFeature.attributes;
  }
  triggerActionHandler(event) {
    let actionId = event.action.id,
      selectedFeature = this.view.popup.viewModel.selectedFeature,
      layer = selectedFeature.layer as FeatureLayer,
      attributes = selectedFeature.attributes,
      objectid = attributes.OBJECTID;
    const per = layer.permission;
    switch (actionId) {
      case "update":
        if (per && per.edit) {
          if (event.action.className === 'esri-icon-check-mark') {
            this.editFeature();
          } else {
            this.showEdit();
          }

        }
        break;
      case "delete":
        if (per && per.delete) {
          this.deleteFeature();
        }
        break;

      case "hoan-cong":
        kendo.confirm("Xác nhận hoàn công trạm BTS").then(f => {
          layer.applyEdits({
            updateFeatures: [<__esri.Graphic>{
              attributes: {
                objectId: objectid,
                TinhTrang: 3
              }
            }]
          }).then(r => {
            if (r.updateFeatureResults[0].error) {
              kendo.alert("Có lỗi xảy ra trong quá trình thực hiện")
            } else {
              kendo.alert("Thao tác thành công")
            }
          })
        })
        break;
      case "cap-phep":
        if (attributes.TenDoanhNghiep) {
          kendo.confirm("Chấp nhận cấp phép trạm BTS").then(f => {
            layer.applyEdits({
              updateFeatures: [<__esri.Graphic>{
                attributes: {
                  objectId: objectid,
                  TinhTrang: 2,
                  NgayGioCapPhepBTS: new Date().getTime()
                }
              }]
            }).then(r => {
              if (r.updateFeatureResults[0].error) {
                kendo.alert("Có lỗi xảy ra trong quá trình thực hiện")
              } else {
                kendo.alert("Cấp phép thành công")
              }
            })
          }, e => {
            layer.applyEdits({
              updateFeatures: [<__esri.Graphic>{
                attributes: {
                  objectId: objectid,
                  TinhTrang: 4
                }
              }]
            }).then(r => {
              if (r.updateFeatureResults[0].error) {
                kendo.alert("Có lỗi xảy ra trong quá trình thực hiện")
              } else {
                kendo.alert("Thao tác thành công")
              }
            })
          })
        } else {
          const codedValues = (layer.fields.find(f => f.name === "TenDoanhNghiep").domain as __esri.CodedValueDomain).codedValues;
          let dialog = $("<div/>").appendTo(document.body);
          dialog.kendoDialog({
            width: "400px",
            title: "Chọn doanh nghiệp",
            closable: false,
            modal: false,
            content: "<input style='width:100%'></input>",
            actions: [{
              text: 'Cấp phép',
              action: function () {
                let val = dialog.find('input').val();
                layer.applyEdits({
                  updateFeatures: [<__esri.Graphic>{
                    attributes: {
                      objectId: objectid,
                      TinhTrang: 2,
                      TenDoanhNghiep: val,
                      NgayGioCapPhepBTS: new Date().getTime()
                    }
                  }]
                }).then(r => {
                  if (r.updateFeatureResults[0].error) {
                    kendo.alert("Có lỗi xảy ra trong quá trình thực hiện")
                  } else {
                    kendo.alert("Thao tác thành công")
                  }
                })
              }
            },
            {
              text: 'Không cấp phép',
              action: function () {
                layer.applyEdits({
                  updateFeatures: [<__esri.Graphic>{
                    attributes: {
                      objectId: objectid,
                      TinhTrang: 4,
                    }
                  }]
                }).then(r => {
                  if (r.updateFeatureResults[0].error) {
                    kendo.alert("Có lỗi xảy ra trong quá trình thực hiện")
                  } else {
                    kendo.alert("Thao tác thành công")
                  }
                })
              }
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
          let cb = dialog.find('input');
          cb.kendoDropDownList({
            dataSource: codedValues,
            dataTextField: "name",
            dataValueField: "code"
          })
        }
        break;
      default:
        break;
    }
  }

  /**
   * Hiển thị popup
   * @param {esri/layers/FeatureLayer} layer - layer được chọn (clickEvent)
   * @param {object} attributes - thông tin của layer được chọn
   */
  showEdit() {
    let container = domConstruct.create('div', {
      id: 'show-edit-container',
      class: 'popup-content'
    });
    let divInfo = domConstruct.create('div', {
      class: 'form-horizontal'
    }, container);
    divInfo.innerHTML += '<legend>Thông tin</legend>'

    let model = {};
    let inputHTML = ''

    //duyệt thông tin đối tượng
    for (let field of this.layer.fields) {
      if (field.type === 'oid'
        || this.isFireField(field.name)
        || ((this.view as any).systemVariable.user.GroupRole !== "STTTT" && field.name === "TenDoanhNghiep"))
        continue;

      //Kiểm tra domain
      if (field.domain && field.domain.type === "codedValue") {
        //lấy domain
        let domain = field.domain as __esri.CodedValueDomain,
          codedValues = domain.codedValues;
        let optionHTML = codedValues.map(m => `<option value="${m.code}">${m.name}</option>`);
        //tạo html
        inputHTML = `
          <select class="form-control" data-bind="value:${field.name}">
            <option value='-1'>Chọn ${field.alias}</option>
            ${optionHTML}
          </select>
          `
      }
      else {
        let inputType = field.type === "string" ? "text" :
          field.type === "date" ? "date" : "number";
        inputHTML = `<input class="form-control" type="${inputType}" data-bind="value:${field.name}">`
      }

      let html = `
        <div class="form-group">
          <label class="col-sm-4 control-label" for="textinput">${field.alias}</label>
          <div class="col-sm-8">
            ${inputHTML}
          </div>
        </div>`;

      //gán giá trị cho model
      if (field.type === "date")
        model[field.name] = new Date(this.attributes[field.name])
      else model[field.name] = this.attributes[field.name]

      //thêm vào element
      divInfo.innerHTML += html;
    }
    if (this.layer.hasAttachments) {
      divInfo.innerHTML += `<legend>Tệp đính kèm</legend>
      <div class="attachment-popup" id="attachment-popup"></div>`

      this.layer.getAttachments(this.attributes['OBJECTID']).then(res => {
        let attachmentPopup = $("#attachment-popup");
        let form = $("<form/>", {
          enctype: "multipart/form-data", method: "post",
          html: `<input value="json" name="f" hidden/>`
        }).appendTo(attachmentPopup);
        let fileInput = $("<input/>", { type: "file", name: "attachment", multiple: true });
        fileInput.change(this.onInputAttachmentChangeHandler.bind(this));
        form.append(fileInput);
        if (res && res.attachmentInfos && res.attachmentInfos.length > 0) {
          for (let item of res.attachmentInfos) {
            let attachElement = this.renderAttachmentPopup(item, {
              edit: true
            });
            attachmentPopup.append(attachElement);
          }
        }
      })
    }
    this.view.popup.content = container;
    this.kendoModel = kendo.observable(model);
    kendo.bind($(container), this.kendoModel);
    this.view.popup.title = this.layer.title;
    let updateAction = this.view.popup.actions.find(function (action) {
      return action.id === 'update';
    })
    updateAction.className = 'esri-icon-check-mark';
    watchUtils.once(this.view.popup, 'selectedFeature').then(result => {
      updateAction.className = 'esri-icon-edit';
    })
    watchUtils.once(this.view.popup, 'visible').then(result => {
      updateAction.className = 'esri-icon-edit';
    })

  }
  private onInputAttachmentChangeHandler(e) {
    let fileInput = e.target;
    let file = fileInput.files[0] as File;
    if (file.size > 20000000) {
      kendo.alert("Dung lượng tệp quá lớn");
      return;
    }
    this.layer.addAttachments(this.attributes.OBJECTID, fileInput.form).then(addRes => {
      if (addRes.addAttachmentResult.success) {
        let attachmentPopup = $("#attachment-popup");
        this.layer.getAttachments(this.attributes.OBJECTID).then(getRes => {
          let attachInfo = getRes.attachmentInfos.find(f => f.id === addRes.addAttachmentResult.objectId);
          if (attachInfo) {
            let attachElement = this.renderAttachmentPopup(attachInfo, { edit: true })
            attachmentPopup.append(attachElement);
          }
        })
      } else {
        kendo.alert("Không thể thêm tệp đính kèm");
      }
    })
  }
  private renderAttachmentPopup(item, props: { edit?: boolean } = { edit: false }) {
    let itemDiv = $('<div/>', {
      class: 'attachment-item'
    });
    let itemName = $('<div/>', {
      class: 'attachment-name'
    }).appendTo(itemDiv);
    let aItemName = $('<a/>', {
      href: item.src,
      text: item.name,
      target: '_blank'
    }).appendTo(itemName);
    if (props.edit) {
      let itemDelete = $('<div/>', {
        class: 'delete-attachment esri-icon-trash'
      }).appendTo(itemDiv);
      on(itemDelete, 'click', () => {
        if (!this.kendoModel.get('deleteAttachment'))
          this.kendoModel.set('deleteAttachment', []);
        this.kendoModel.get('deleteAttachment').push(item.id);
        itemDiv.remove();
      });
    }
    return itemDiv;
  }
  /**
   * Hiển thị popup
   * @param {esri/layers/FeatureLayer} layer - layer được chọn (clickEvent)
   * @param {object} attributes - thông tin của layer được chọn
   */
  async contentPopup(target) {
    const graphic = target.graphic,
      layer: FeatureLayer = graphic.layer,
      attributes = graphic.attributes;
    //hightlight graphic
    this.hightlightGraphic.clear();
    this.hightlightGraphic.add(graphic);
    let container = $('<div/>', {
      class: 'popup-content',
    });
    let
      table = $('<table/>', {
      }).appendTo(container);
    //duyệt thông tin đối tượng
    for (let field of layer.fields) {
      let value = attributes[field.name];
      if (field.type === 'oid')
        continue;
      //tạo <tr>
      let row = $('<tr/>').appendTo(table);
      //tạo <td>
      let tdName = $('<th/>', {
        text: field.alias
      }).appendTo(row);
      let tdValue = $('<td/>').appendTo(row);
      if (value) {
        let input, content = value, formatString;
        //nếu là huyện 
        if (field.name === "HuyenTXTP" && value) {
          content = await this.hanhChinhUtils.districtIdToName(value)
        }
        else if (field.name === "XaPhuongTT" && value) {
          content = await this.hanhChinhUtils.wardIdToName(value)
        }
        //nếu field có domain thì hiển thị value theo name của codevalues
        else if (field.domain && field.domain.type === "codedValue") {
          const codedValues = (field.domain as __esri.CodedValueDomain).codedValues;
          content = codedValues.find(f => { return f.code === value }).name;
        } else if (field.type === 'date') formatString = 'DateFormat';
        //nếu như có formatString
        if (formatString) content = `{${field.name}:${formatString}}`;
        tdValue.text(content);
      }
    }
    if (layer.hasAttachments) {
      layer.getAttachments(attributes['OBJECTID']).then(res => {
        if (res && res.attachmentInfos && res.attachmentInfos.length > 0) {
          let div = $('<div/>', {
            class: 'attachment-container'
          }).appendTo($(this.view.popup.container).find(".popup-content"));
          $('<legend/>', {
            innerHTML: 'Tệp đính kèm'
          }).appendTo(div);
          let url = `${layer.url}/${layer.layerId}/${attributes['OBJECTID']}`;
          for (let item of res.attachmentInfos) {
            let attachElement = this.renderAttachmentPopup(item);
            div.append(attachElement);
          }
        }
      })
    }
    //ADD ACTON 
    if ((this.view as any).systemVariable.user.GroupRole === "STTTT" && layer.id === constName.TramBTS && attributes.TinhTrang === 1) {
      let action = this.view.popup.actions.find(f => {
        return f.id === 'cap-phep'
      });
      if (!action) {
        this.view.popup.actions.add(<__esri.Action>{
          id: 'cap-phep',
          title: 'Cấp phép trạm BTS',
          className: 'esri-icon-check-mark'
        })
        //RESTORE WHEN OUT EDIT MODE
        var watchFunc = () => {
          //DELETE ACTION 
          let action = this.view.popup.actions.find(f => {
            return f.id === 'cap-phep'
          });
          if (action) this.view.popup.actions.remove(action);
        }
        watchUtils.once(this.view.popup, 'selectedFeature').then(watchFunc)
        watchUtils.once(this.view.popup, 'visible').then(watchFunc)
      }
    }
    if ((this.view as any).systemVariable.user.GroupRole === "DN" && layer.id === constName.TramBTS && attributes.TinhTrang === 2) {
      let action = this.view.popup.actions.find(f => {
        return f.id === 'hoan-cong'
      });
      if (!action) {
        this.view.popup.actions.add(<__esri.Action>{
          id: 'hoan-cong',
          title: 'Hoàn công trạm BTS',
          className: 'esri-icon-check-mark'
        })
        //RESTORE WHEN OUT EDIT MODE
        var watchFunc = () => {
          //DELETE ACTION
          let action = this.view.popup.actions.find(f => {
            return f.id === 'hoan-cong'
          });
          if (action) this.view.popup.actions.remove(action);
        }
        watchUtils.once(this.view.popup, 'selectedFeature').then(watchFunc)
        watchUtils.once(this.view.popup, 'visible').then(watchFunc)
      }
    }

    return container[0].outerHTML;
  }

  /**
   * Sự kiện chỉnh sửa thông tin đối tượng
   */
  editFeature() {
    let applyAttributes: any = {
      objectId: this.attributes.OBJECTID
    };
    if (!this.attributes || !this.kendoModel) kendo.alert("Có lỗi xảy ra trong quá trình cập nhật");
    // ATTACHMENT
    if (this.kendoModel.get('deleteAttachment') && this.kendoModel.get('deleteAttachment').length > 0) {
      this.layer.deleteAttachments({
        objectId: this.attributes.OBJECTID,
        deletes: this.kendoModel.get('deleteAttachment')
      })
      this.kendoModel.set('deleteAttachment', []);
    }
    for (let field of this.layer.fields) {
      let value = this.kendoModel.get(field.name);
      if (!value ||
        (value && value == -1)) continue;
      if (field.type === 'date') {
        if ((value as Date).getTime() <= 0) continue;
        applyAttributes[field.name] = (value as Date).getTime();
      } else
        applyAttributes[field.name] = value;
    }
    const updatedInfo = this.editingSupport.getUpdatedInfo(this.view)
    for (let i in updatedInfo) {
      applyAttributes[i] = updatedInfo[i];
    }
    this.layer.applyEdits({
      updateFeatures: [<__esri.Graphic>{
        attributes: applyAttributes
      }]
    }).then((res) => {
      let updateFeatureResults = res.updateFeatureResults as __esri.FeatureEditResult[];
      //khi applyEdits, nếu phát hiện lỗi
      //không phát hiện lỗi nên tắt popup
      if (updateFeatureResults[0].objectId) {
        let query = this.layer.createQuery();
        query.outFields = ['*'];
        query.where = 'OBJECTID=' + this.attributes['OBJECTID'];
        this.layer.queryFeatures(query).then(res => {
          this.view.popup.open({
            features: res.features
          })
        })
      }
    })
  }
  /**
   * Xóa đối tượng được chọn
   * @param {esri/layers/FeatureLayer} layer 
   * @param {string} objectid 
   */
  deleteFeature() {
    this.layer.applyEdits({
      deleteFeatures: [{
        objectId: this.attributes.OBJECTID
      }] //xoa objectID truyen vao
    }).then((res) => {
      if (res.deleteFeatureResults.length > 0 && !res.deleteFeatureResults[0].error) {
        this.view.popup.close();
      }
    });
  }
}
export = Popup;