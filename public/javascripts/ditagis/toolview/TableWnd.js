define([], function (require, factory) {
    'use strict';
    return class {
      constructor(params) {
        this.options = {
          title: "Kết quả truy vấn",
          class: 'querylayer-window'
        }
        for (const key in params) {
          this.options[key] = params[key]
        }
        this.renderWnd();
      }
      renderWnd() {
        this.wndResultCtr = $('<div/>', {
          class: this.options.class
        }).appendTo(document.body)
  
        this.wndResult = this.wndResultCtr.kendoWindow({
          width: "700px",
          height: "500px",
          position: {
            top: 280,
            left: 400
          },
          title: this.options.title,
          visible: false,
          actions: [
            "Pin",
            "Minimize",
            "Maximize",
            "Close"
          ],
        }).data("kendoWindow");
      }
      renderTable(columns, dataSource, change) {
        this.wndResultCtr.empty();
        this.wndResulTable = $("<div/>").appendTo(this.wndResultCtr).kendoGrid({
          messages: {
            commands: {
              excel: 'Xuất Excel'
            }
          },
          toolbar: ["excel"],
          excel: {
            allPages: true,
            fileName: "Kendo UI Grid Export.xlsx",
            proxyURL: "https://demos.telerik.com/kendo-ui/service/export",
            filterable: true
          },
          columnMenu: {
            messages: {
              sortAscending: "Tăng dần",
              sortDescending: "Giảm dần",
              filter: "Lọc",
              columns: "Cột"
            }
          },
          groupable: {
            messages: {
              empty: "Kéo cột lên vị trí này"
            }
          },
          sortable: true,
          pageable: {
  
            pageSizes: true,
            messages: {
              display: "{0} - {1} của {2}",
              empty: "Không có dữ liệu",
              page: "Trang",
              allPages: "Tất cả",
              of: "của {0}",
              itemsPerPage: "",
              first: "Chuyển đến trang đầu",
              previous: "Chuyển đến trang cuối",
              next: "Tiếp theo",
              last: "Về trước",
              refresh: "Tải lại"
            }
          },
          dataSource: dataSource,
          columns: columns,
          pageable: {
            pageSize: 10
          },
          selectable: true,
          change: change
        }).data("kendoGrid");
      }
      open(){
        this.wndResult.open();
      }
    }
  });