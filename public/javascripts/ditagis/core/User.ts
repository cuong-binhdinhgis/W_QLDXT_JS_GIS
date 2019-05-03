import Base = require('./Base');
import s = require('esri/layers/FeatureLayer')
import ServerInfo = require('esri/identity/ServerInfo');
interface LayerInfo {
  url: string;
  outFields: Array<string>;
  id: string;
  title: string;
  groupLayer: string;
}
class User extends Base {
  Username: string;
  Role: string;
  GroupRole: string;
  Layers: Array<LayerInfo>;
  DisplayName: string
  ID: number;
  serverInfos: ServerInfo

}
export = User;