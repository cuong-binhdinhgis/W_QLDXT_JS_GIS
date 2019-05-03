define(["require", "exports", "../jszip", "../core/Base"], function (require, exports, JSZip, Base) {
    "use strict";
    class GridWnd extends Base {
        constructor(options) {
            super();
            this.wndResultCtr = null;
            this.wnd = null;
            this.grid = null;
            this.options = {
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
            };
            this.setOptions(options);
            this.renderWnd();
            this.initGrid();
            window.JSZip = JSZip;
        }
        initGrid() {
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
            if (this.options.grid) {
                for (const key in this.options.grid) {
                    options[key] = this.options.grid[key];
                }
            }
            this.grid = $("<div/>").appendTo(this.wndResultCtr).kendoGrid(options).data("kendoGrid");
        }
        renderWnd() {
            this.wndResultCtr = $('<div/>', {
                class: this.options.class
            });
            this.wnd = this.wndResultCtr.kendoWindow(this.options.window).data("kendoWindow");
        }
        renderTable(columns, dataSource, change) {
            columns.forEach(f => { if (!f.width)
                f.width = 200; });
            if (!this.grid)
                this.initGrid();
            this.grid.columns = columns;
            if (change)
                this.grid.bind('change', change);
            if (dataSource) {
                if (dataSource instanceof kendo.data.DataSource) {
                    this.grid.setDataSource(dataSource);
                }
                else if (dataSource instanceof Array) {
                    this.grid.setDataSource(new kendo.data.DataSource({
                        pageSize: 5,
                        data: dataSource,
                    }));
                }
            }
        }
        addValue(value) {
            if (this.grid) {
                this.grid.dataSource.add(value);
            }
        }
        get isRenderTable() {
            return this.grid !== null;
        }
        open() {
            this.wnd.open();
        }
    }
    return GridWnd;
});
