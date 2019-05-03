const Database = require('./Database');
class AccountManager extends Database {
  constructor(params) {
    super(params);
  }
  static create(params) {
    return new AccountManager(params);
  }
  getAllGroupRole() {
    return this.select('SELECT * FROM SYS_GroupRole');
  }
  getAll() {
    return this.select("SELECT SYS_ACCOUNT.ID, SYS_ACCOUNT.Status,DisplayName,Username,Password,Role,SYS_ROLE.NAME AS RoleName, SYS_Role.GroupRole as GroupRole FROM SYS_ACCOUNT INNER JOIN SYS_ROLE ON SYS_ROLE.ID = SYS_ACCOUNT.ROLE");
  }
  getRoleByUsername(username) {
    return new Promise((resolve, reject) => {
      this.getByUsername(username).then(res => {
        if (res)
          resolve(res.role)
        else
          resolve(null);
      }).catch(err => reject(err));
    });
  }
  getByUsername(username) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT ACCOUNT.*,SYS_ROLE.NAME AS RoleName, SYS_ROLE.GROUPROLE as GroupRole FROM SYS_ACCOUNT as ACCOUNT, SYS_ROLE  WHERE  ACCOUNT.ROLE = SYS_ROLE.ID AND USERNAME = '${username}'`;
      this.select(sql).then(recordset => {
        let account = recordset[0];
        if (account) {
          resolve(account)
          //this.close();
        } else {
          //this.close();
          resolve(null);
        }

      }).catch(err => {
        reject(err);
        //this.close();
      })

    });
  }
  isUser(username, password) {
    return new Promise((resolve, reject) => {
      this.select(`SELECT ACCOUNT.*,SYS_ROLE.NAME AS RoleName, SYS_ROLE.GROUPROLE as GroupRole FROM SYS_ACCOUNT as ACCOUNT, SYS_ROLE  WHERE  ACCOUNT.ROLE = SYS_ROLE.ID AND USERNAME = '${username.replace(/[^a-zA-Z0-9-. ]/g, "")}' AND PASSWORD = '${password.replace(/[^a-zA-Z0-9-. ]/g, "")}'`).then(recordset => {
        if (recordset.length > 0) {
          let user = recordset[0];
          let promises = [];
          promises.push(this.select(`SELECT SYS_LAYER_ACCOUNT.*,SYS_Layer.Title as LayerTitle,SYS_Layer.OutFields as OutFields,SYS_Layer.QueryFields as QueryFields, SYS_Layer.GroupID as GroupLayer, SYS_LAYER.Url from sys_layer_account inner join SYS_Layer on SYS_Layer.ID = sys_layer_account.Layer WHERE ACCOUNT=${user.ID}`))
          promises.push(this.select(`SELECT Capability,IsPrimary FROM SYS_ACCOUNT_CAPABILITY WHERE ACCOUNT = ${user.ID}`))
          Promise.all(promises).then(function (results) {
            let layerPermission = results[0],
              capabilities = results[1];
            user.Layers = layerPermission.map(function (m) {
              console.log(m);
              var queryFields = '';
              if (m['QueryFields']) {
                queryFields = m['QueryFields'].split(',');
              }
              return {
                url: m['Url'],
                id: m['Layer'],
                title: m['LayerTitle'],
                outFields: m['OutFields'].split(','),
                queryFields: queryFields,
                groupLayer: m['GroupLayer'],
                permission: {
                  view: m['IsView'],
                  create: m['IsCreate'],
                  edit: m['IsEdit'],
                  delete: m['IsDelete']
                }
              }
            });
            user.PrimaryCapability = null;
            user.Capabilities = [];
            for (const m of capabilities) {
              if (m['IsPrimary'])
                user.PrimaryCapability = m['Capability']
              user.Capabilities.push(m['Capability'])
            }
            resolve(user)
          })
        } else {
          resolve(null);
        }

      }).catch(err => {
        reject(err);
      })
    });
  }
  changePassword(id, newPassword) {
    return this.query(`UPDATE SYS_ACCOUNT SET PASSWORD='${newPassword}' WHERE ID = ${id}`);
  }
  update(account) {
    let updates = [];
    if (account['displayName']) updates.push(`displayName = N'${account['displayName']}'`)
    if (account['role']) updates.push(`role = '${account['role']}'`)
    return this.query(`UPDATE SYS_ACCOUNT SET ${updates.join(',')} WHERE ID='${account.id}'`);
  }
  getById(id) {
    return this.select(`SELECT displayName,username,password,role FROM SYS_ACCOUNT WHERE id=${id} `)
  }
  getRoleById(id) {
    return this.select(`SELECT id,name FROM SYS_ROLE  WHERE id='${id}'`)
  }
  getAllRole() {
    return this.select('SELECT SYS_Role.ID,SYS_Role.Name,GroupRole,SYS_GroupRole.Name as GroupRoleName FROM SYS_ROLE  INNER JOIN SYS_GroupRole ON SYS_GroupRole.ID = SYS_ROLE.GROUPROLE');
  }
  add(account) {
    return this.query(`INSERT INTO SYS_ACCOUNT(USERNAME,PASSWORD,ROLE) VALUES('${account.username}','${account.password}','${account.role}')`);
  }
  delete(id) {
    return this.query(`DELETE FROM SYS_ACCOUNT WHERE ID=${id}`);
  }
}
module.exports = AccountManager