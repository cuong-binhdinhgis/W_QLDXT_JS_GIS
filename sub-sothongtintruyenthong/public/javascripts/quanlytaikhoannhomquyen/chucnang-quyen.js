$(document).ready(function () {
    var listbox0, listbox1, listbox2;
    let currentListBox2, currentListBox1;
    var dataItemsListBox = {
        add: [],
        remove: []
    };
    var listbox0 = $('#listbox0').kendoListBox({
        dataTextField: 'Name',
        dataValueField: 'ID',
        dataSource: new kendo.data.DataSource({
            sort: {
                field: "Name",
                dir: "asc"
            },
            transport: {
                read: {
                    url: "/rest/sys_role",
                    dataType: "json"
                }
            }
        }),
        change: function (e) {
            let dataItem = listbox0.dataItem(listbox0.select());
            kendo.ui.progress($('#listbox1'), true)
            $.get(location.href + `&t=danhsach&table=capability&role=${dataItem.ID}`)
                .done(function (rows) {
                    listbox1.setDataSource(new kendo.data.DataSource({
                        sort: {
                            field: "Name",
                            dir: "asc"
                        },
                        data: rows
                    }));
                    currentListBox1 = rows;
                    kendo.ui.progress($('#listbox1'), false)
                })
            kendo.ui.progress($('#listbox2'), true)
            $.get(location.href + `&t=danhsach&table=role_capability&role=${dataItem.ID}`)
                .done(function (rows) {
                    listbox2.setDataSource(new kendo.data.DataSource({
                        sort: {
                            field: "Name",
                            dir: "asc"
                        },
                        data: rows.Capabilities
                    }));
                    currentListBox2 = rows.Capabilities;
                    kendo.ui.progress($('#listbox2'), false)
                })
        }
    }).data('kendoListBox');
    var listbox1 = $('#listbox1').kendoListBox({
        toolbar: {
            tools: ["transferTo", "transferFrom", "transferAllTo", "transferAllFrom"]
        },
        dataTextField: 'Name',
        dataValueField: 'ID',
        connectWith: 'listbox2',
    }).data('kendoListBox');
    var listbox2 = $('#listbox2').kendoListBox({
        dataTextField: 'Name',
        dataValueField: 'ID',
        add: function (e) {
            dataItemsListBox.add = e.dataItems;
            console.log(e);
        },
        remove: function (e) {
            dataItemsListBox.remove = e.dataItems;
        }
    }).data('kendoListBox');
    var viewModel = kendo.observable({
        btnUpdateClick: function (e) {
            let adds = [],
                removes = [];
            let role = listbox0.dataItem(listbox0.select()).ID;
            let dataItemListBox1 = listbox1.dataSource.data(),
                dataItemListBox2 = listbox2.dataSource.data();
            for (const item of dataItemListBox1) {
                let isValid = currentListBox1.some(function (s) {
                    return s.ID === item.ID
                })
                if (!isValid)
                    removes.push({
                        Capability: item.ID,
                        Role: role
                    });
            }
            for (const item of dataItemListBox2) {
                let isValid = currentListBox2.some(function (s) {
                    return s.ID === item.ID
                })
                if (!isValid)
                    adds.push({
                        Capability: item.ID,
                        Role: role
                    });
            }
            for (const item of adds) {
                $.post('/rest/sys_role_capability', item);
            }
            for (const item of removes) {
                $.ajax({
                    url: '/rest/sys_role_capability',
                    type: 'delete',
                    data: {
                        where: `ROLE = '${item['Role']}' AND CAPABILITY = '${item['Capability']}'`
                    }
                });
            }
        },
        change: function (e) {
            console.log("event: change");
        },
        dataBound: function (e) {
            console.log("event: dataBound");
        },
        reorder: function (e) {
            console.log("event: reorder");
        },
        remove: function (e) {
            console.log("event: remove");
        },
        roles: new kendo.data.DataSource({
            transport: {
                read: {
                    url: "/rest/sys_role",
                    dataType: "json"
                }
            }
        })
    });
    kendo.bind($("#listbox"), viewModel);
    $("#context-menu").kendoContextMenu({
        target: "#listbox2-container",
        filter: ".k-item.k-state-selected[role='option']",
        select: function (e) {
            try {
                let action = $(e.item).children(".k-link").text();
                let role = listbox0.dataItem(listbox0.select()).ID;
                switch (action) {
                    case 'Chọn là chức năng chính':
                        let primaryCapability = listbox2.dataItem(listbox2.select()).ID;
                        $.ajax({
                            url: '/rest/sys_role_capability',
                            dataType: 'json',
                            type: 'PUT',
                            data: {
                                IsPrimary: true,
                                where: `ROLE = '${role}' AND Capability = '${primaryCapability}'`
                            },
                            success: function (result) {
                                kendo.alert('Cập nhật thành công');
                            }
                        });
                        break;
                    case 'Xem chức năng chính':
                        $.ajax({
                            url: `/rest/sys_role_capability?where=ROLE = '${role}' AND ISPRIMARY = 1`,
                            dataType: 'json',
                            type: 'GET',
                            success: function (result) {
                                let id = result[0].Capability,
                                    selectItem;
                                for (const item of listbox2.items()) {
                                    let dataItem = listbox2.dataItem(item);
                                    if (dataItem.ID === id) {
                                        listbox2.select(item);
                                        break;
                                    }
                                }
                            }
                        })
                        break;

                    default:
                        break;
                }
            } catch (error) {
                throw error
            }

        }
    });
    Loader.hide()
})