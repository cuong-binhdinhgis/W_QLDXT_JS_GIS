import esriFeatureLayer = require("esri/layers/FeatureLayer");
import esriRequest = require("esri/request");
interface Attachment {
    src: string;
    id: number;
    "contentType": string;
    "size": number,
    "name": string;
}
interface Attachments {
    attachmentInfos: Attachment[]
}
interface AddAttachmentResult {
    addAttachmentResult: {
        objectId: number,
        globalId: number,
        success: boolean,
        error: { //only if success is false
            code: number,
            description: string,
        }
    }
}
class FeatureLayer extends esriFeatureLayer {
    public permission: { view: boolean, edit: boolean, create: boolean, delete: boolean }
    constructor(options) {
        super(options);
    }
    getQueryFields(queryFields) {
        let fields;
        if (queryFields && queryFields.length > 0) {
            if (queryFields[0] === '*') {
                fields = this.fields;
            }
            else {
                fields = this.fields.filter(f => {
                    return queryFields.indexOf(f.name) !== -1;
                });
            }
        }
        else {
            fields = this.fields;
        }
        return fields;
    }
    getFields() {
        let fields;
        if (this.outFields && this.outFields.length > 0) {
            if (this.outFields[0] === '*') {
                fields = this.fields;
            }
            else {
                fields = this.fields.filter(f => {
                    return this.outFields.indexOf(f.name) !== -1;
                });
            }
        }
        else {
            fields = this.fields;
        }
        return fields;
    }
    /**
     * deleteAttachments
     */
    public deleteAttachments(attributes): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!attributes.objectId)
                reject("objectId")
            let url = this.url + "/" + this.layerId + "/" + attributes.objectId + "/deleteAttachments";
            let form = document.createElement('form');
            form.method = 'post';
            let adds = document.createElement('input');
            adds.name = 'attachmentIds'
            adds.type = 'text';
            adds.value = attributes.deletes.join(", ");
            form.appendChild(adds);
            let format = document.createElement('input');
            format.name = 'f';
            format.type = 'text';
            format.value = 'json';
            form.appendChild(format);
            esriRequest(url, {
                responseType: 'json',
                body: form
            }).then(r => resolve(r.data)).catch(e => reject(e))
        });
    }
    public addAttachments(id: number, attachmentForm: HTMLFormElement | FormData): Promise<AddAttachmentResult> {
        return new Promise((resolve, reject) => {
            let url = this.url + "/" + this.layerId + "/" + id + "/addAttachment";
            if (attachmentForm) {
                esriRequest(url, {
                    responseType: 'json',
                    body: attachmentForm
                }).then(r => resolve(r.data)).catch(e => reject(e))
            }
        });
    }
    public getAttachments(id: number): Promise<Attachments> {
        return new Promise((resolve, reject) => {
            var url = this.url + "/" + this.layerId + "/" + id;
            esriRequest(url + "/attachments?f=json", {
                responseType: 'json',
                method: 'get'
            }).then(result => {
                let data: Attachments = result.data;
                const url = `${this.url}/${this.layerId}/${id}`;
                data.attachmentInfos.forEach(f => {
                    f.src = `${url}/attachments/${f.id}`
                });
                resolve(data);
            });
        });

    }
}
export = FeatureLayer;