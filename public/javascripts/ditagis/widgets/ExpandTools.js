define([
    "../core/Base"
  ],
  function (Base) {
    "use strict";
    class expandTools extends Base {
      constructor(view, options) {
        super();
        this.view = view;
        this.options = {
          position: "top-right",
          icon: "esri-icon-layer-list",
          title: 'Công cụ'
        };

        this.setOptions(options);
        this.initWidget();
      }
      initWidget() {
        this.container = $('<ul/>', {
          class: 'expand-tool-widget'
        });
        this.view.ui.add(this.container[0], "top-right");
        $(this.container[0]).kendoMenu({
          select: function (e) {}
        });
        this.menu = $(this.container[0]).data("kendoMenu");
        this.container.css("style", "display: inline-block;");
      }
      append(element) {
        this.countappend++;
        this.menu.append(element);
      }
      add(element) {
        this.countadd++;
        var li = $('<li/>', {});
        li.css("float", 'left');
        if (element[0].tagName == 'UL') {
          var span = $('<span/>', {
            text: element[0].title,
            for: element[0].id,
            class: 'span-title',
          });
          li.append(span);
        }
        li.append(element);
        this.menu.append(li);
      }
    }

    return expandTools;
  });
//# sourceMappingURL=QueryLayer.js.map