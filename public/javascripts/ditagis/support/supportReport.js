define([
], function () {
    'use strict';
    return class {
        constructor(layer, name) {
            this.layer = layer;
            for (let field of this.layer.fields) {
                if (field.name === name) {
                    this.domain = field.domain;
                    break;
                }
            }
        }
        getCodedValues(code) {
            var codedValues = this.domain.codedValues;
            for (let codedValue of codedValues) {
                if (codedValue.code === code) {
                    return codedValue.name;
                }
            }
        }
    }

});