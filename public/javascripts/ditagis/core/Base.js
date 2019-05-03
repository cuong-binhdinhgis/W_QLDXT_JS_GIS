define(["require", "exports", "./EventListener"], function (require, exports, EventListener) {
    "use strict";
    class Base {
        constructor() {
            this.eventListener = new EventListener(this);
        }
        fire(type, evt) {
            this.eventListener.fire(type, evt);
        }
        on(type, listener) {
            this.eventListener.on(type, listener);
        }
        setOptions(options, main = this.options) {
            if (options) {
                for (var i in options) {
                    main[i] = options[i];
                }
                return main;
            }
        }
    }
    ;
    return Base;
});
