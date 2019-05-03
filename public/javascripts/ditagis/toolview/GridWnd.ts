import JSZip = require('../jszip');
import Base = require('../core/Base');
interface ConstructorProperties {
  class?: string,
  //  width?: string | number; height?: string | number; position?: { top?: string | number; left?: string | number }
  window?: kendo.ui.WindowOptions;
  grid?: kendo.ui.GridOptions;
}
class GridWnd extends Base {
  private wndResultCtr: JQuery = null;
  public wnd: kendo.ui.Window = null;
  public grid: kendo.ui.Grid = null;
  constructor(options?: ConstructorProperties) {
    super();
    this.options = <ConstructorProperties>{
      class: 'querylayer-window',
      window: {
        title: "Kết quả truy vấn",
        width: 700,
        visible: false,
        position: {
          top: 0,
          left: 0
        },
        actions: [
          "Pin",
          "Minimize",
          "Maximize",
          "Close"
        ],
      }
    }
    this.setOptions(options);
    this.renderWnd();
    this.initGrid();
    (<any>window).JSZip = JSZip
  }
  private initGrid() {
    let options = {
      messages: {
        commands: {
          excel: 'Xuất Excel'
        }
      },
      toolbar: ["excel"],
      excel: {
        allPages: true,
        fileName: "Dữ liệu " + new Date().getTime() + ".xlsx",
        proxyURL: "https://demos.telerik.com/kendo-ui/service/export",
        filterable: true
      },
      sortable: true,
      pageable: false,
      selectable: true,
    };
    if(this.options.grid){
      for (const key in this.options.grid) {
        options[key]=this.options.grid[key];
      }
    }

    this.grid = $("<div/>").appendTo(this.wndResultCtr).kendoGrid(options).data("kendoGrid");
  }
  private renderWnd() {
    this.wndResultCtr = $('<div/>', {
      class: this.options.class
    });
    this.wnd = this.wndResultCtr.kendoWindow((this.options as ConstructorProperties).window).data("kendoWindow");
  }
  public renderTable(columns: kendo.ui.GridColumn[], dataSource?: any, change?: Function) {
    columns.forEach(f => { if (!f.width) f.width = 200 });
    if (!this.grid)
      this.initGrid();
    this.grid.columns = columns;
    if (change)
      this.grid.bind('change', change);
    if (dataSource) {
      if (dataSource instanceof kendo.data.DataSource) {
        this.grid.setDataSource(dataSource)
      } else if (dataSource instanceof Array) {
        this.grid.setDataSource(new kendo.data.DataSource({
          pageSize: 5,
          data: dataSource,
        }))
      }
    }

  }
  public addValue(value: any) {
    if (this.grid) {
      this.grid.dataSource.add(value);
    }
  }
  public get isRenderTable(): boolean {
    return this.grid !== null;
  }
  open() {
    this.wnd.open();
  }
}
export = GridWnd;