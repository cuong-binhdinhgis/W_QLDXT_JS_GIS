define([], function () {
  'use strict';
  class PaneManager {
    constructor(options) {
      this.element = $(options.element);
      this.array = [];
    }
    add(element) {
      let _element = this.element.find("div.pane-item").not(".hidden");
      this.element.find("div.pane-item").addClass("hidden")
      if (_element[0] === element[0]) {
        return;
      }
      if (this.element.has(element).length) {
        element.removeClass("hidden");
      } else {
        element.addClass("pane-item");
        this.element.append(element);
      }
    }
  }
  return PaneManager;
});