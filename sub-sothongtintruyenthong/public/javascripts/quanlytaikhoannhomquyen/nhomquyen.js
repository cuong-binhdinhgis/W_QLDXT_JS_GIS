var first = false,
    wnd, grid;
$(document).ready(function () {

    grid = $('#table').kendoGrid({
        dataSource: {
            group: [{
                field: 'GroupRoleName'
            }],
            transport: {
                destroy: {
                    type: 'delete',
                    url: '/rest/sys_role',
                    dataType: 'json'
                },
                update: {
                    type: 'put',
                    url: '/rest/sys_role',
                    dataType: 'json'
                },
                read: {
                    url: location.href +'&t=danhsach',
                    dataType: "json"
                },
            },
            schema: {
                model: {
                    id: 'ID',
                    fields: {
                        ID: {
                            editable: false
                        },
                        GroupRoleName: {
                            editable: false
                        },
                        Name: {
                            validation: {
                                required: true
                            }
                        }
                    }
                }
            }
        },
        dataBound: function (e) {

            if (!first) {
                // var grid = $("#table").data("kendoGrid");
                for (const item of this.tbody.find(">tr.k-grouping-row")) {
                    this.collapseGroup(item);
                }

                $('#table tbody .k-grouping-row .group-add').on('click', function (e1) {
                    let dataItem = grid.dataItem($(e1.currentTarget).closest('.k-grouping-row'));
                    if (dataItem && dataItem['GroupRole']) {
                        let html = `
                    <div class="k-popup-edit-form k-window-content k-content">
                        <div class="k-edit-form-container">
                            <div class="k-edit-label">
                                <label for="ID">ID</label>
                            </div>
                            <div data-container-for="ID" class="k-edit-field">
                                <input type="text" class="k-input k-textbox" name="ID" data-bind="value:ID">
                            </div>
                            <div class="k-edit-label">
                                <label for="Tên">Tên</label>
                            </div>
                            <div data-container-for="Name" class="k-edit-field">
                                <input type="text" class="k-input k-textbox" name="Name" data-bind="value:Name"">
                            </div>
                            <div class="k-edit-buttons k-state-default">
                                <a role="button" class="k-button k-button-icontext k-primary k-grid-update" href="javascript:void(0)">
                                    <span class="k-icon k-i-check"></span>Thêm</a>
                                <a role="button" class="k-button k-button-icontext k-grid-cancel" href="javascript:void(0)">
                                    <span class="k-icon k-i-cancel"></span>Hủy</a>
                            </div>
                        </div>
                    </div>`

                        wnd.content(html);
                        wnd.center().open();
                        var viewModel = kendo.observable({
                            ID: null,
                            Name: null
                        })
                        kendo.bind($('.k-content'), viewModel);
                        $('.k-content .k-grid-cancel').click(function () {
                            wnd.close();
                        })
                        $('.k-content .k-grid-update').click(function () {
                            if (viewModel.ID && viewModel.Name) {
                                kendo.ui.progress($('k-window'), true);
                                $.post('/rest/sys_role', {
                                    ID: viewModel.ID,
                                    Name: viewModel.Name,
                                    GroupRole: dataItem['GroupRole']
                                }).done(function (results) {
                                    kendo.ui.progress($('.k-window'), false);
                                    wnd.close();
                                    grid.dataSource.read();
                                    
                                    grid.refresh();
                                    
                                }).fail(function (err) {
                                    kendo.ui.progress($('.k-window'), false);
                                    alert('Có lỗi xảy ra trong tiến trình, vui lòng thử lại')
                                })
                            } else
                                alert('Vui lòng nhập đầy đủ thông tin.')
                        })
                    }
                })
                first = true;
            }
        },
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
        }, {
            field: 'Name',
            title: 'Tên'
        }, {
            hidden: true,
            field: 'GroupRoleName',
            title: 'Nhóm quyền',
            groupHeaderTemplate: "Nhóm quyền : #=value# <a href='javascript:void(0)' class='k-button group-add k-grid-add'><span class='k-icon k-i-plus'></span>Thêm</a>"
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
            }, {
                name: 'addUserToRole',
                text: 'Thêm tài khoản',
                click: addUserToRole

            }, {
                name: 'destroy',
                iconClass: '',
                text: 'Xóa'
            }]
        }]
    }).data('kendoGrid');
    Loader.hide()
    wnd = $("#window")
        .kendoWindow({
            title: "Chỉnh sửa",
            visible: false,
            resizable: false,
        }).data("kendoWindow");
})

function addUserToRole(e) {
    e.preventDefault();
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    let html = `
<div id="addUserToRole" class="k-popup-edit-form k-window-content k-content">
    <div class="k-edit-form-container">
        <div class="k-edit-label">
            <label for="DisplayName">Tên hiển thị</label>
        </div>
        <div data-container-for="DisplayName" class="k-edit-field">
            <input type="text" class="k-input k-textbox" name="DisplayName" data-bind="value:DisplayName">
        </div>
        <div class="k-edit-label">
            <label for="UserName">Tên tài khoản</label>
        </div>
        <div data-container-for="UserName" class="k-edit-field">
            <input type="text" class="k-input k-textbox" name="UserName" data-bind="value:UserName" autocomplete="off" style="background-image: url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAASCAYAAABSO15qAAAAAXNSR0IArs4c6QAAAUBJREFUOBGVVE2ORUAQLvIS4gwzEysHkHgnkMiEc4zEJXCMNwtWTmDh3UGcYoaFhZUFCzFVnu4wIaiE+vvq6+6qTgthGH6O4/jA7x1OiCAIPwj7CoLgSXDxSjEVzAt9k01CBKdWfsFf/2WNuEwc2YqigKZpK9glAlVVwTTNbQJZlnlCkiTAZnF/mePB2biRdhwHdF2HJEmgaRrwPA+qqoI4jle5/8XkXzrCFoHg+/5ICdpm13UTho7Q9/0WnsfwiL/ouHwHrJgQR8WEwVG+oXpMPaDAkdzvd7AsC8qyhCiKJjiRnCKwbRsMw9hcQ5zv9maSBeu6hjRNYRgGFuKaCNwjkjzPoSiK1d1gDDecQobOBwswzabD/D3Np7AHOIrvNpHmPI+Kc2RZBm3bcp8wuwSIot7QQ0PznoR6wYSK0Xb/AGVLcWwc7Ng3AAAAAElFTkSuQmCC&quot;); background-repeat: no-repeat; background-attachment: scroll; background-size: 16px 18px; background-position: 98% 50%;">
        </div>
        
        <div class="k-edit-label">
            <label for="Password">Mật khẩu</label>
        </div>
        <div data-container-for="Password" class="k-edit-field">
            <input type="password" class="k-input k-textbox" name="Password" data-bind="value:Password">
        </div>
        <div class="k-edit-buttons k-state-default">
            <a role="button" class="k-button k-button-icontext k-primary k-grid-update" href="javascript:void(0)">
                <span class="k-icon k-i-check"></span>Cập nhật</a>
            <a role="button" class="k-button k-button-icontext k-grid-cancel" href="javascript:void(0)">
                <span class="k-icon k-i-cancel"></span>Hủy</a>
        </div>
    </div>
</div>`
    wnd.content(html);
    wnd.center().open();
    var model = kendo.observable({
        UserName: null,
        DisplayName: null,
        Password: null
    });
    kendo.bind($('#addUserToRole'), model);
    $('#addUserToRole .k-primary').click(function () {
        kendo.ui.progress($('#addUserToRole'), true);
        $.post('', {
            UserName: model.UserName,
            DisplayName: model.DisplayName,
            Password: model.Password,
            Role: dataItem['id']
        }).done(function (results) {
            wnd.close();
        }).fail(function (err) {
            console.log(err);
        })
    })
    $('#addUserToRole .k-grid-cancel').click(function () {
        wnd.close();
    })
}