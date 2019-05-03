import EventListener = require('./EventListener');

class Base {
  eventListener: EventListener;
  protected options;
  constructor() {
    this.eventListener = new EventListener(this);
  }
  public fire(type: string, evt: any) {
    this.eventListener.fire(type, evt);
  }
  public on(type: string, listener: Function) {
    this.eventListener.on(type, listener);
  }
  protected setOptions(options, main = this.options) {
    if (options) {
      for (var i in options) {
        main[i] = options[i];
      }
      return main;
    }
  }
};
export = Base;