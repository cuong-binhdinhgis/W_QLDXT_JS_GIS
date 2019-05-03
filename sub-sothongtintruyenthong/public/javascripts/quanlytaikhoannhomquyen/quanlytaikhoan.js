kendo.ui.progress($(".tab-content"), true);
let first = true;
$(document).ready(function () {
    $("#tabstrip").kendoTabStrip();
    var grid = $('#table').kendoGrid({
        toolbar: [{
            name: "create",
            text: 'Thêm tài khoản'
        }, {
            name: "option",
            text: "Chọn",
            template: kendo.template($("#template").html())
        }],
        dataBound: function () {
            if (first) {
                var _grid = grid.data("kendoGrid");
                _grid.table.find(".k-grouping-row").each(function () {
                    _grid.collapseGroup(this);
                });
                first = false;
            }
        },
        dataSource: {
            group: [{
                field: 'RoleName'
            }],
            transport: {
                destroy: {
                    url: '/rest/sys_account',
                    dataType: 'json',
                    type: 'delete'
                },
                update: {
                    url: '/rest/sys_account',
                    dataType: 'json',
                    type: 'put'
                },
                create: {
                    url: "/so-tttt/quan-ly-tai-khoan-nhom-quyen?m=tai-khoan",
                    dataType: "json",
                    type: 'post'
                },
                read: {
                    url: '/so-tttt/quan-ly-tai-khoan-nhom-quyen?m=tai-khoan&t=danhsach',
                    dataType: "json"
                },
                parameterMap: function (data, type) {
                    if (type == "create") {
                        // send the created data items as the "models" service parameter encoded in JSON
                        return {
                            Username: data.Username,
                            DisplayName: data.DisplayName,
                            Password: data.Password,
                            Role: data.Role.ID
                        }
                    }
                    return data;
                }
            },
            schema: {
                model: {
                    id: "ID",
                    fields: {
                        ID: {
                            editable: false
                        },
                        Username: {
                            validation: {
                                required: true
                            }
                        },
                        Password: {
                            validation: {
                                required: true
                            }
                        },
                        Status: {
                            type: 'boolean'
                        }
                    }
                }
            },
            pageSize: 10
        },
        pageable: true,
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
        editable: "inline",
        columns: [{
            field: 'ID',
        }, {
            field: 'Username',
            title: 'Tên tài khoản',
        }, {
            field: 'DisplayName',
            title: 'Tên hiển thị'
        }, {
            field: 'Password',
            title: 'Mật khẩu',
            template: "&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;",
            editor: function (container, options) {
                $('<input data-text-field="' + options.field + '" ' +
                        'class="k-input k-textbox" ' +
                        'type="password" ' +
                        'data-value-field="' + options.field + '" ' +
                        'data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
            }
        }, {
            field: 'Role',
            title: 'Quyền',
            editor: categoryDropDownEditor
        }, {
            field: "Status",
            title: "Được phép đăng nhập",
            template: "#= Status ? 'Được phép' : 'Không được phép' #",
            editor: function (container, options) {
                $('<input required data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "Name",
                        dataValueField: "ID",
                        dataSource: [{
                            Name: "Được phép",
                            ID: 1
                        }, {
                            Name: "Không được phép",
                            ID: 0
                        }]
                    });
            }
        }, {
            hidden: true,
            field: 'RoleName',
            title: 'Quyền'
        }, {
            hidden: true,
            field: 'GroupRole',
        }, {
            field: 'action',
            title: 'Tác vụ',
            width: 160,
            command: [{
                name: 'edit',
                iconClass: '',
                text: {
                    edit: "Chỉnh sửa",
                    cancel: "Hủy",
                    update: "Cập nhật"
                }
            }, {
                name: 'destroy',
                iconClass: '',
                text: 'Xóa'
            }],

        }]
    });
    grid.find("#category").kendoDropDownList({
        dataTextField: "name",
        dataValueField: "id",
        dataSource: [{
            name: "Tất cả",
            id: ""
        }, {
            name: "Sở",
            id: "STTTT"
        }, {
            name: "Doanh nghiệp",
            id: "DN"
        }, {
            name: "Mới đăng ký",
            id: "MDK"
        }],
        change: function () {
            var value = this.value();
            if (value) {
                if (value == "MDK") {
                    grid.data("kendoGrid").dataSource.filter({
                        field: "Status",
                        operator: "eq",
                        value: 0
                    });
                } else
                    grid.data("kendoGrid").dataSource.filter({
                        field: "GroupRole",
                        operator: "eq",
                        value: value
                    });
            } else {
                grid.data("kendoGrid").dataSource.filter({});
            }
        }
    })
    $('#table_backup').kendoGrid({
        height: 500,
        toolbar: [{
            template: kendo.template($("#template_1").html())
        }],
        dataSource: {
            transport: {
                read: {
                    url: "/rest/sys_backupevent",
                    dataType: "json"
                }
            },
            pageable: true,
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
            columns: [{
                field: 'ID',
            }, {
                field: 'NguoiSaoLuu',
                title: 'Người sao lưu',
            }, {
                field: 'ThoiGian',
                title: 'Thời gian'
            }, {
                field: 'DuongDan',
                title: 'Đường dẫn',
            }]
        }
    });
    kendo.ui.progress($(".tab-content"), false);
})

function categoryDropDownEditor(container, options) {
    $('<input required data-bind="value:' + options.field + '"/>')
        .appendTo(container)
        .kendoDropDownList({
            dataTextField: "Name",
            dataValueField: "ID",
            dataSource: {
                transport: {
                    read: {
                        url: "/rest/sys_role",
                        dataType: "json"
                    }
                },
            }
        });
}

function onBackupClick() {
    kendo.ui.progress($('#table_backup'), true);
    $.post("/backup").done(function () {
        kendo.alert("Sao lưu thành công")
        kendo.ui.progress($('#table_backup'), false);
        $('#table_backup').data("kendoGrid").dataSource.read();
        $('#table_backup').data("kendoGrid").refresh();
    }).fail(function () {
        kendo.alert("Sao lưu thất bại");
        kendo.ui.progress($('#table_backup'), false);
    })
}