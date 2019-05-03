define([
  "../core/Base",
  "dojo/on",
  "dojo/dom-construct",
  "dojo/dom-class",
  "dojo/dom",
  "esri/widgets/Expand",
  "../core/ConstName",
  "ditagis/widgets/subwidgets/PointDrawingTools",
  "ditagis/widgets/subwidgets/PolylineDrawingTools"
], function (Base, on,
  domConstruct, domClass, dom,
  Expand, constName,
  PointDrawingTools, PolylineDrawingTools) {
  'use strict';
  return class extends Base {
    constructor(view, options = {}) {
      super();
      this.view = view;
      this.systemVariable = view.systemVariable;
      this.options = {
        position: "top-right",
        icon: 'esri-icon-authorize',
        title: 'Biên tập dữ liệu'
      }
      for (let i in options) {
        this.options[i] = options[i];
      }

      this._isStartup = false;
      this._layerGroups = [];
      this._hasLayer = false;
      this.initWidget();
      this.initView();
      this.polylineDrawingTools = new PolylineDrawingTools(view);
      this.pointDrawingTools = new PointDrawingTools(view);


    }
    initWidget() {
      this.content = $('<div/>', {
        class: "esri-widget esri-widget-button",
        title: this.options.title,
        html: `<span class='${this.options.icon}'></span>`
      })
      this.content.click(e => {
        this.fire("click", $(this._container));
        // this.initView();
        // this.startup();
        // pane_layer_list.style.display = 'block'
      });
    }
    set hasLayer(val) {
      if (!this._hasLayer) {
        this._hasLayer = true;
      }
    }
    get selectedFeature() {
      return this.systemVariable.selectedFeature;
    }
    set selectedFeature(value) {
      this.systemVariable.selectedFeature = value;
    }
    startup() {
      if (!this._isStartup) {
        this._isStartup = true;
      }
    }
    destroy() {
      if (this._isStartup) {
        this.pointDrawingTools.destroy();
        this.polylineDrawingTools.destroy();
        this._isStartup = false;
      }
    }
    rendererLayerGroup(layer) {
      if (layer.parent && layer.parent.type === 'group') {
        let testLayer = layer.parent;
        do {
          if (testLayer.id === "nhomTramBTS") {
            return;
          }
          testLayer = testLayer.parent;
        } while (testLayer)
        //none then create
        let panelGroup = this._layerGroups[layer.parent.id];
        if (!panelGroup) {
          let li = document.createElement('li');
          li.innerHTML = `<label class="title">${layer.parent.title}</label>`
          let div = document.createElement('div');
          div.classList.add('item-container');
          li.appendChild(div);
          panelGroup = document.createElement('div');
          panelGroup.classList.add('panel-group');
          panelGroup.id = "accordion-" + layer.parent.id;
          div.appendChild(panelGroup);
          this._ulContainer.appendChild(li);
          this._layerGroups[layer.parent.id] = panelGroup;
        }
        const symbol = layer.renderer.symbol || layer.renderer.uniqueValueInfos[0].symbol;
        let layerSymbols = [],
          collapseId = 'collapse' + layer.id;
        let button = document.createElement('button');
        button.classList.add('accordion');
        if (!layer.visible)
          button.classList.add('hidden');
        button.innerText = layer.title;
        button.onclick = function () {
          /* Toggle between adding and removing the "active" class,
          to highlight the button that controls the panel */
          this.classList.toggle("active");

          /* Toggle between hiding and showing the active panel */
          var panel = this.nextElementSibling;
          if (panel.style.display === "block") {
            panel.style.display = "none";
          } else {
            panel.style.display = "block";
          }
        }
        panelGroup.appendChild(button);
        //nếu như layer không hiển thị theo domain
        if (layer.renderer.symbol) {
          const img = symbol.url;
          let contentSymbol;
          if (img) {
            contentSymbol = `<img src='${img}'></img>`;
          } else {
            if (symbol.type === "simple-marker") {
              contentSymbol = `<svg overflow="hidden" width="30" height="30" style="touch-action: none;">
                            <circle fill="rgb(${symbol.color.r}, ${symbol.color.g},${symbol.color.b})" 
                            fill-opacity="1" 
                            stroke="rgb(0, 0, 0)" 
                            stroke-opacity="1" 
                            stroke-width="1.3333333333333333" 
                            x="0" cy="0" r="2.6666666666666665" 
                            transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)">
                            </circle>
                            </svg>`
            }
            //nếu là đường 
            else if (symbol.type === "simple-line") {
              contentSymbol = `<svg overflow="hidden" width="30" height="30" style="touch-action: none;">
                            <path 
                            fill="none" 
                            fill-opacity="0" 
                            stroke="rgb(${symbol.color.r}, ${symbol.color.g},${symbol.color.b})" 
                            stroke-opacity="1" 
                            stroke-width="1.3333333333333333" 
                            path="M -15,0 L 15,0 E" d="M-15 0L 15 0" 
                           transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)">
                           </path>
                           </svg>`
            }
          }
          layerSymbols.push({
            symbol: contentSymbol
          })
        }
        //hiển thị theo symbol
        else {
          let contentSymbol;
          if (layer.renderer.defaultSymbol) {
            const img = layer.renderer.defaultSymbol.url;
            contentSymbol = {
              symbol: `<img src='${img}' style="width: 25px;"></img>`,
              label: layer.renderer.defaultLabel
            }
            layerSymbols.push(contentSymbol);
          }
          for (let icon of layer.renderer.uniqueValueInfos) {
            let symbol = icon.symbol;
            //nếu là điểm
            if (symbol.type === "simple-marker") {
              // console.log(icon);
              contentSymbol = `<svg overflow="hidden" width="30" height="30" style="touch-action: none;">
                            <circle fill="rgb(${symbol.color.r}, ${symbol.color.g},${symbol.color.b})" 
                            fill-opacity="1" 
                            stroke="rgb(0, 0, 0)" 
                            stroke-opacity="1" 
                            stroke-width="1.3333333333333333" 
                            x="0" cy="0" r="2.6666666666666665" 
                            transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)">
                            </circle>
                            </svg>`
            }
            //nếu là đường 
            else if (symbol.type === "simple-line") {
              contentSymbol = `<svg overflow="hidden" width="30" height="30" style="touch-action: none;">
                            <path 
                            fill="none" 
                            fill-opacity="0" 
                            stroke="rgb(${symbol.color.r}, ${symbol.color.g},${symbol.color.b})" 
                            stroke-opacity="1" 
                            stroke-width="1.3333333333333333" 
                            path="M -15,0 L 15,0 E" d="M-15 0L 15 0" 
                           transform="matrix(1.00000000,0.00000000,0.00000000,1.00000000,15.00000000,15.00000000)">
                           </path>
                           </svg>`
            }
            //nếu như có hình ảnh thì hiển thị hình ảnh
            else {
              const img = symbol.url;
              contentSymbol = `<img src='${img}' style="width: 25px;"></img>`;
            }
            if (icon.create) {
              layerSymbols.push({
                symbol: contentSymbol,
                label: icon.label,
                value: icon.value
              })
            }
          }
        }
        let panelBody = document.createElement('div');
        panelBody.classList.add('panel-accordion', 'panel-body');
        panelGroup.appendChild(panelBody);
        if (this.view.systemVariable.user.GroupRole === "DN" &&
          layer.id === constName.TramBTS) {
          let symbol = layerSymbols.find(f => {
            if (f.value)
              return f.value.substring(0, f.value.search(",")) === this.view.systemVariable.user.Role
            return false;
          });
          layerSymbols = [symbol];
        }
        if (layerSymbols.length > 0) {
          let table = document.createElement('table');
          table.classList.add('table');
          panelBody.appendChild(table);
          for (let symbolItem of layerSymbols) {
            const symbol = symbolItem.symbol,
              label = symbolItem.label,
              value = symbolItem.value;
            let tr = document.createElement('tr');
            table.appendChild(tr);
            let tdSymbol = document.createElement('td');
            tdSymbol.innerHTML = symbol;
            tr.appendChild(tdSymbol);

            //nếu có label
            if (label) {
              let tdLabel = document.createElement('td');
              tdLabel.classList.add('icon-label');
              tdLabel.innerText = label;
              tr.appendChild(tdLabel);
            }
            on(tr, "click", (evt) => {
              this.layerItemClickHandler(layer, value);
            });

          }
        }
        return button;
      }

    }

    initView() {
      try {
        this._container = document.createElement('div');
        this._container.classList.add('esri-widget', 'ditagis-widget-layer-editor');
        this._ulContainer = document.createElement('ul');
        this._container.appendChild(this._ulContainer);
        this.view.on('layerview-create', (evt) => {
          const layer = evt.layer;
          if (layer.type === 'feature' && layer.permission && layer.permission.create) {
            this.hasLayer = true;
            let button = this.rendererLayerGroup(layer);
            layer.watch('visible', (newVal, oldVal) => {
              if (button) {
                if (oldVal && !newVal) {
                  button.classList.add('hidden');
                }
                if (!oldVal && newVal) {
                  button.classList.remove('hidden');
                }
              }
            })
          }
        });

      } catch (error) {
        throw error;
      }
    }
    layerItemClickHandler(layer, value) {
      const typeIdField = layer.typeIdField;
      if (value) {
        layer.drawingAttributes = {};
        layer.drawingAttributes[typeIdField] = value;
      }
      this.selectedFeature = layer;
      switch (layer.geometryType) {
        case 'point':
          this.pointDrawingTools.startup();
          if (!this.view.isMobile) {
            this.pointDrawingTools.expandWidget.expand();
            if (this.polylineDrawingTools.expandWidget)
              this.polylineDrawingTools.expandWidget.collapse();
          }
          this.polylineDrawingTools.destroy();

          break;
        case 'polyline':
          this.polylineDrawingTools.startup();
          this.pointDrawingTools.destroy();
          break;
        default:
          console.log("Chưa được liệt kê")
          break;
      }
    }
  }
});