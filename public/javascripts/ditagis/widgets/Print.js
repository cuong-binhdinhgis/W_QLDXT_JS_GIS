define(["require", "exports", "../core/Base", "esri/widgets/Print"], function (require, exports, Base, PrintWidget) {
    "use strict";
    class Print extends Base {
        constructor(view, options) {
            super();
            this.view = view;
            this.options = {
                position: "top-right",
                icon: "esri-icon-printer",
                title: 'In bản đồ'
            };
            this.DOM = {
                container: null,
            };
            this.setOptions(options);
            this.pane = $("<div/>");
            this.initWidget();
            this.initWindow();
        }
        initWindow() {
            var print = new PrintWidget({
                view: this.view,
                container: this.pane[0],
                printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
            });
        }
        initWidget() {
            this.container = $('<div/>', {
                class: "esri-widget esri-widget-button",
                title: this.options.title,
                id:'print-tools',
                html: `<span class='${this.options.icon}'></span>`
            })
            this.container.click(e => {
                this.fire("click",this.pane);
            });
        }
    }
    return Print;
});
//# sourceMappingURL=Print.js.map