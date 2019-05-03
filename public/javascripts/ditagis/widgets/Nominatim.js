define([

], function () {

    'use strict';
    return class {
        constructor(view, options = {}) {
            this.view = view;
            this.options = {
                position: "top-right",
                distanceBuffer: 50,
                icon: "esri-icon-map-pin",
                title: 'Đo khoảng cách'
            };
            this.DOM = {
                container: null,
                table: null
            }
            if (options && typeof options === 'object') {
                for (let index in options) {
                    this.options[index] = options[index] || this.options[index];
                }
            }
            this.DOM.container = $('<div/>', {
                id: 'nominatim',
                class: 'nominatim-window'
            }).appendTo(document.body);
            this.DOM.table = $('<div/>', {
                class: 'grid'
            }).appendTo(this.DOM.container);
            this.nominatim = this.DOM.container.kendoWindow({
                width: "300px",
                position: {
                    top: 280,
                    left: 0
                },
                title: "Kết quả tìm kiếm",
                visible: false,
                actions: [
                    "Close"
                ],

            }).data("kendoWindow");
            this.nominatimGrid = this.DOM.table.kendoGrid({
                height: 500,
                columns: [{
                    field: 'display_name',
                    title: 'Tên đường'
                }, {
                    field: 'lon',
                    hidden: true
                }, {
                    field: 'lat',
                    hidden: true
                }],
                selectable: true,
                change: (e) => {
                    let selectedRows = e.sender.select(),
                        dataItem = e.sender.dataItem(selectedRows),
                        lon = parseFloat(dataItem['lon']),
                        lat = parseFloat(dataItem['lat']);
                    // let plg = new Polygon({
                    //   spatialReference:view.spatialReference,
                    //   rings:[
                    //     dataItem['polygonpoints'].map(function(m){
                    //       return [parseFloat(m[0]),parseFloat(m[1])]
                    //     })
                    //   ]
                    // })
                    this.view.center = [lon, lat];
                    this.view.zoom = 17
                    // view.goTo(plg);
                }
            }).data("kendoGrid")
            this.initWidget();

        }
        initWidget() {
            var searchbox = $('<input/>', {
                class: 'nominatim-widget',
                type: 'text',
                name: 'search',
                placeholder: "Tìm kiếm..."
            });
            searchbox.on('keyup', ((e) => {
                if (e.key === 'Enter') {
                    this.nominatim.open();
                    kendo.ui.progress($('#nominatim .grid'), true)
                    let address = searchbox.val().replace(/[ ]/g, '+');
                    $.get(`https://nominatim.openstreetmap.org/search?q=${address}&format=json&polygon=1&addressdetails=1`).done((results) => {
                        this.nominatimGrid.setDataSource(new kendo.data.DataSource({
                            data: results.filter(function (f) {
                                return f.address.state === 'Bình Định Province'
                            })
                        }))
                        kendo.ui.progress($('#nominatim .grid'), false)
                    })
                }
            }))
            this.view.ui.add(searchbox[0], 'top-right')
        }
    }
});