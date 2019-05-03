define(["require", "exports", "../core/Base", "../toolview/TableWnd",
    "ditagis/widgets/QueryLayer",
    "ditagis/widgets/BufferingObjects",
  ],
  function (require, exports, Base, TableWnd,
    QueryLayer, BufferingObjects) {
    "use strict";
    class QueryMethods extends Base {
      constructor(view, options) {
        super();
        this.view = view;
        this.options = {
          icon: "esri-icon-review",
          title: 'Truy vấn'
        };
        this.setOptions(options);
        this.layerListContent = [];
        this.queryLayer = new QueryLayer(view, {
          position: 'top-right'
        });
        this.queryLayer.on("query-start",_=>{
          kendo.ui.progress(this.attributeslayer,true)
        })
        this.queryLayer.on("query-success",_=>{
          kendo.ui.progress(this.attributeslayer,false)
        })
        this.queryBuffer = new BufferingObjects(this.view);
        this.pane = $("<div/>");
        this.initWidget();
      }
      render(){
        var pane = $("<div/>");
        var select = $("<input/>", {
          style: "width:100%"
        }).appendTo(pane);
        this.comboLayers = select.kendoComboBox({
          dataSource:this.layerListContent,
          placeholder: "Chọn lớp dữ liệu",
          dataTextField: "title",
          dataValueField: "id"
        }).data("kendoComboBox");
        this.attributeslayer = $("<div/>",{
          class:"query-method-widget",
          style:"padding:10px;width:300px;"
        }).appendTo(pane);
        return pane;
      }
      bindingDataSource() {
        this.initwidgetLayer();
        this.view.on('layerview-create', (evt) => {
          const layer = evt.layer;
          if (layer.type === 'feature' && layer.permission && layer.permission.view) {
            this.layerListContent.push({
              title: layer.title,
              id: layer.id,
            });
          }
        });
      }
      initwidgetLayer() {

      }
      onCbChangeQueryBuffer(evt) {
        this.queryBuffer.comboLayers_change(evt);
        // this.attributeslayer.append(div);
      }
      onCbChangeQueryLayer(evt) {
        var div = this.queryLayer.comboLayers_change(evt);
        this.attributeslayer.empty();
        this.attributeslayer.append(div);
      }
      initWidget() {
        this.bindingDataSource();
        this.container = {
          text: "Tìm kiếm",
          items: [{
            text: 'Truy vấn theo thuộc tính',
            value: 'query-attributes',
            select: (evt) => {
              var pane = this.render();
              this.fire("click", pane);
              this.comboLayers.unbind("change", this.onCbChangeQueryBuffer)
              this.comboLayers.bind("change", this.onCbChangeQueryLayer.bind(this))
            }
          }
          /*
          , {
            text: 'Truy vấn theo không gian',
            value: 'query-graphics',
            select: (evt) => {
              var pane = this.render();
              this.fire("click", pane);
              this.comboLayers.unbind("change", this.onCbChangeQueryLayer)
              this.comboLayers.bind("change", this.onCbChangeQueryBuffer.bind(this))
            }
          }*/
        ] //Sub items
        }
      }
    }

    return QueryMethods;
  });