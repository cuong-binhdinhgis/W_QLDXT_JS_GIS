define([

], function () {
    'use strict';
    return {
        basemap: {
            title: 'Dữ liệu nền Bình Định',
            url: 'http://117.3.71.234/arcgisadaptor/rest/services/BinhDinh/DuLieuNen/MapServer',
            visible: true,
            // visible: false,
            copyright: 'Bản đồ biên tập bởi Trung tâm DITAGIS',
            sublayers: [{
                    id: 7,
                    title: 'Hành chính huyện',visible: false
                }, {
                    id: 6,
                    title: 'Hành chính huyện',
                    visible: true
                }, {
                    id: 5,
                    title: 'Ranh giới hành chính huyên',
                    visible: false
                },
                {
                    id: 4,
                    title: 'Hành chính xã',
                    visible: false
                }, {
                    id: 3,
                    title: 'Giao thông huyện',
                    visible: false
                },
                {
                    id: 2,
                    title: 'Mặt đường bộ',
                    visible: false
                }, {
                    id: 1,
                    title: 'Tim đường',
                    visible: false
                }, {
                    id: 0,
                    visible: false,
                    title: 'Địa vật đặc trưng'
                }
            ]
        },
        zoom: 16,
        center: [109.224233,13.771973]
    }
});