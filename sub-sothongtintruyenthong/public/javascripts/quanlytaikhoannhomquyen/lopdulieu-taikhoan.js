var grid, listbox;
$(document).ready(function () {
    listbox = $('#listbox').kendoListBox({
        dataTextField: 'DisplayName',
        dataValueField: 'ID',
        dataSource: new kendo.data.DataSource({
            sort: { field: "DisplayName", dir: "asc" },
            transport: {
                read: {
                    url: "/rest/sys_account",
                    dataType: "json"
                }
            }
        }),
        change: function (e) {
            let dataItem = listbox.dataItem(listbox.select());
            grid.setDataSource(new kendo.data.DataSource({
                group: [{
                    field: 'LayerGroup',
                }],
                sort: { field: "LayerName", dir: "asc" },
                transport: {
                    destroy: {
                        type: 'delete',
                        url: '/rest/sys_layer_account',
                        dataType: 'json'
                    },
                    update: {
                        type: 'put',
                        url: '/rest/sys_layer_account',
                        dataType: 'json'
                    },
                    read: {
                        url: location.href + `&t=danhsach&account=${dataItem.ID}`,
                        dataType: "json"
                    },
                },
                pageSize: 10,
                schema: {
                    model: {
                        id: 'ID',
                        fields: {
                            ID: {
                                editable: false
                            },
                            LayerName: {
                                editable: false
                            },
                            IsEdit: {
                                type: 'boolean'
                            },
                            IsView: {
                                type: 'boolean'
                            },
                            IsCreate: {
                                type: 'boolean'
                            },
                            IsDelete: {
                                type: 'boolean'
                            }
                        }
                    }
                }
            }));
        }
    }).data('kendoListBox');
    grid = $('#table').kendoGrid({
        toolbar: [{
            template: '<a class="k-button" id="btnToolbar" href="javascript:void(0)" >Cập nhật</a>'
        }],
        editable: 'inline',
        pageable: true,
        pageable: {
            pageSizes: true,
            messages: {
                display: "Số dòng: {2}",
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
        columns: [{
            field: 'ID',
            hidden: true
        }, {
            field: 'LayerGroup',
            title: 'Nhóm dữ liệu',
            hidden: true
        }, {
            field: 'LayerName',
            title: 'Tên'
        }, {
            field: 'IsCreate',
            title: 'Tạo',
            width: 80
        }, {
            field: 'IsView',
            title: 'Xem',
            width: 80
        }, {
            field: 'IsDelete',
            title: 'Xóa',
            width: 80
        }, {
            field: 'IsEdit',
            title: 'Sửa',
            width: 80
        }, {
            field: 'action',
            title: 'Tác vụ',
            command: [{
                name: 'edit',
                iconClass: '',
                text: {
                    edit: "Chỉnh sửa",
                    cancel: "Hủy",
                    update: "Cập nhật"
                }
            }, ]
        }]
    }).data('kendoGrid');
    Loader.hide()
    $('#btnToolbar').click(function (e) {
        kendo.ui.progress($('#table'), true)
        let id = listbox.dataItem(listbox.select())['ID'];
        $.post('', {
            Account: id
        }).done(function (e) {
            if (e === 'no-update') {

            } else {
                grid.dataSource.read();
                grid.refresh();
                kendo.ui.progress($('#table'), false)
            }
        }).fail(function (err) {
            kendo.ui.progress($('#table'), false)
        })
    })
})