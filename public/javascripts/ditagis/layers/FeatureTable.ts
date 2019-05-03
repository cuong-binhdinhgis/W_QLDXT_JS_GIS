import QueryTask = require("esri/tasks/QueryTask");
import esriRequest = require("esri/request");
import Base = require('../core/Base');

interface FeatureTableProperties {
  id?: string;
  url: string;
  fieldID?: string;
}
interface Attachment {
  id: string;
  src: string;
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
interface ApplyEditProperties {
  addFeatures?: __esri.Graphic[],
  updateFeatures?: __esri.Graphic[],
  deleteFeatures?: number[]
}
interface ApplyEditResults {
  addResults: __esri.FeatureEditResult[]
  deleteResults: __esri.FeatureEditResult[]
  updateResults: __esri.FeatureEditResult[]
}
class FeatureTable extends Base {
  public id = "SuCo";
  public url;
  public fieldID;
  private queryTask;
  public fields;
  public typeIdField;
  public types;
  public layerId;
  public readonly type: string;
  constructor(params = <FeatureTableProperties>{}) {
    super();
    this.url = params.url;
    this.id = params.id;
    this.fieldID = params.fieldID || 'OBJECTID';
    this.queryTask = new QueryTask(this.url);
    this.type = "table";
    esriRequest(this.url + '?f=json', { method: 'get', responseType: 'json' }).then((res) => {
      for (const key in res.data) {
        if (!this[key])
          this[key] = res.data[key]
      }
    })
  }
  public getFieldDomain(field: string) {
    return this.fields.find(function (f) {
      return f.name === field;
    }).domain;
  }
  public applyEdits(options: ApplyEditProperties = {
    addFeatures: [],
    updateFeatures: [],
    deleteFeatures: []
  }): Promise<ApplyEditResults> {
    return new Promise((resolve, reject) => {
      let form = document.createElement('form');
      form.method = 'post';
      if (options.addFeatures && options.addFeatures.length > 0) {
        let adds = document.createElement('input');
        adds.name = 'adds'
        adds.type = 'text';
        adds.value = JSON.stringify(options.addFeatures);
        form.appendChild(adds);
      }
      if (options.deleteFeatures && options.deleteFeatures.length > 0) {
        let deletes = document.createElement('input');
        deletes.name = 'deletes'
        deletes.type = 'text';
        deletes.value = options.deleteFeatures.join(',');
        form.appendChild(deletes);
      }
      if (options.updateFeatures && options.updateFeatures.length > 0) {
        let updates = document.createElement('input');
        updates.name = 'updates'
        updates.type = 'text';
        updates.value = JSON.stringify(options.updateFeatures);
        form.appendChild(updates);
      }
      let format = document.createElement('input');
      format.name = 'f';
      format.type = 'text';
      format.value = 'json';
      form.appendChild(format);
      esriRequest(this.url + '/applyEdits?f=json', {
        method: 'post',
        body: form
      }).then(r => {
        let tmpOptions: any = options;
        tmpOptions.layer = {
          layerID: this.id, type: this.type
        }
        esriRequest("/applyEdits", {
          method: 'post',
          query: { data: JSON.stringify(tmpOptions) }
        })
        resolve(r.data)
      }).catch(e => reject(e))

    });
  }
  public queryFeatures(query: __esri.Query): IPromise<__esri.FeatureSet> {
    return this.queryTask.execute(query);
  }
  public addAttachments(id, attachmentForm): Promise<AddAttachmentResult> {
    return new Promise((resolve, reject) => {
      let url = this.url + "/" + id + "/addAttachment";
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
      var url = this.url + "/" + id;
      esriRequest(url + "/attachments?f=json", {
        responseType: 'json',
        method: 'get'
      }).then(result => {
        let data: Attachments = result.data;
        data.attachmentInfos.forEach(f => {
          f.src = `${url}/attachments/${f.id}`
        });
        resolve(data);
      });
    });
  }
  /**
 * deleteAttachments
 */
  public deleteAttachments(attributes): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!attributes.objectId)
        reject("objectId")
      let url = this.url + "/" + attributes.objectId + "/addAttachment";
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
}
export = FeatureTable;