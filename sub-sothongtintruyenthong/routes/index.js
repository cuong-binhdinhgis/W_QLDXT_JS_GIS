var express = require('express');
var router = express.Router();
var accDB = require('../../modules/AccountDB').create();
var db = require('../../modules/Database').create();

function render(req, res, path, options = {}) {
  options.path = req.baseUrl + req.path;
  options.role = req.session.passport.user.Role;
  options.capabilities = req.session.passport.user.Capabilities;
  options.User = req.session.passport.user;
  res.render(path, options);
}
router.get('/', function (req, res, next) {
  render(req, res, 'index', {
    title: 'Trang chính'
  });
})
router.get('/quan-ly-su-co', function (req, res, next) {
  render(req, res, 'quanlysuco', {
    title: 'Quản lý sự cố'
  })
});
router.get('/quan-ly-quy-hoach', function (req, res, next) {
  render(req, res, "dangphattrien")
})
router.get('/quan-ly-su-co', function (req, res, next) {
  render(req, res, "dangphattrien")
})
router.get('/quan-ly-tai-khoan-nhom-quyen', function (req, res) {
  if (!req.session.passport.user.Capabilities.some(s => s.startsWith('QLTKNQ'))) noAccess(res);
  let m = req.query['m'],
    t = req.query['t'];
  switch (m) {
    case 'tai-khoan':
      var isAccess = req.session.passport.user.Capabilities.some(s => s === "QLTKNQ-QLTK");
      if (!isAccess) noAccess();
      if (t === 'danhsach') {
        accDB.getAll().then(rows => {
          res.status(200).send(rows);
        })
      } else
        render(req, res, 'quanlytaikhoannhomquyen/quanlytaikhoan', {
          title: 'Quản lý tài khoản'
        });
      break;
    case 'chuc-nang-quyen':
      var isAccess = req.session.passport.user.Capabilities.some(s => s === "QLTKNQ-QLKNTC-CN-Q");
      if (!isAccess) noAccess();
      if (t === 'danhsach') {
        var table = req.query['table'];
        let role = req.query['role'];
        switch (table) {
          case 'capability':

            let promises = [];
            promises.push(db.select(`SELECT * FROM SYS_CAPABILITY`))
            promises.push(db.select(`SELECT * FROM SYS_ROLE_CAPABILITY WHERE ROLE = '${role}'`));
            Promise.all(promises).then(function (results) {
              let capabilities = results[0],
                roleCapability = results[1];
              let returns = [];
              for (const capability of capabilities) {
                let isSome = roleCapability.some(function (s) {
                  return s['Capability'] === capability['ID']
                });
                if (!isSome)
                  returns.push(capability);
              }
              res.status(200).send(returns)

            }).catch(function (err) {
              res.status(400).send();
            })
            break;
          case 'role_capability':
            db.select(`SELECT RC.*,C.NAME AS Capability_Name FROM SYS_ROLE_CAPABILITY AS RC INNER JOIN SYS_CAPABILITY AS C ON RC.CAPABILITY = C.ID WHERE RC.ROLE = '${role}'`).then(function (rows) {
              let results = {
                Role: role,
                Capabilities: []
              };
              for (const item of rows) {
                let capability = {
                  ID: item['Capability'],
                  Name: item['Capability_Name']
                };
                results.Capabilities.push(capability);
              }
              res.status(200).send(results);
            }).catch(function (err) {
              console.log(err);
              res.status(400).send();
            })
        }
      } else
        render(req, res, 'quanlytaikhoannhomquyen/chucnang', {
          title: 'Quản lý quyền',
          m: 'quyen'
        });
      break;
    case 'chuc-nang-tai-khoan':
      var isAccess = req.session.passport.user.Capabilities.some(s => s === "QLTKNQ-QLKNTC-CN-TK");
      if (!isAccess) noAccess();
      if (t === 'danhsach') {
        var table = req.query['table'];
        let account = req.query['account'];
        switch (table) {
          case 'capability':
            let promises = [];
            promises.push(db.select(`SELECT * FROM SYS_CAPABILITY`))
            promises.push(db.select(`SELECT * FROM SYS_ACCOUNT_CAPABILITY WHERE ACCOUNT = '${account}'`));
            Promise.all(promises).then(function (results) {
              let capabilities = results[0],
                roleCapability = results[1];
              let returns = [];
              for (const capability of capabilities) {
                let isSome = roleCapability.some(function (s) {
                  return s['Capability'] === capability['ID']
                });
                if (!isSome)
                  returns.push(capability);
              }
              console.log(returns);
              res.status(200).send(returns)

            }).catch(function (err) {
              console.log(err);
              res.status(400).send();
            })
            break;
          case 'account_capability':
            db.select(`SELECT RC.*,C.NAME AS Capability_Name FROM SYS_ACCOUNT_CAPABILITY AS RC INNER JOIN SYS_CAPABILITY AS C ON RC.CAPABILITY = C.ID WHERE RC.ACCOUNT = ${account}`).then(function (rows) {
              let results = {
                Account: account,
                Capabilities: []
              };
              for (const item of rows) {
                let capability = {
                  ID: item['Capability'],
                  Name: item['Capability_Name']
                };
                results.Capabilities.push(capability);
              }
              res.status(200).send(results);
            }).catch(function (err) {
              console.log(err);
              res.status(400).send();
            })
            break;

          default:
            break;
        }
      } else
        render(req, res, 'quanlytaikhoannhomquyen/chucnang', {
          title: 'Quản lý quyền',
          m: 'taikhoan'
        });
      break;
    case 'nhom-quyen':
      var isAccess = req.session.passport.user.Capabilities.some(s => s === "QLTKNQ-QLNQ");
      if (!isAccess) noAccess();
      if (t === 'danhsach') {
        accDB.getAllRole().then(rows => {
          res.status(200).send(rows)
        })
      } else render(req, res, 'quanlytaikhoannhomquyen/nhomquyen', {
        title: 'Quản lý nhóm quyền'
      });
      break;
    case 'lop-du-lieu-quyen':
      var isAccess = req.session.passport.user.Capabilities.some(s => s === "QLTKNQ-QLKNTC-LDL-Q");
      if (!isAccess) noAccess();
      if (t === 'danhsach') {
        var role = req.query['role'];
        db.select(`SELECT SYS_LAYER_ROLE.*, SYS_LAYER.TITLE AS LayerName,SYS_GroupLayer.Name AS LayerGroup FROM SYS_LAYER_ROLE 
          INNER JOIN SYS_LAYER ON SYS_LAYER.ID = SYS_LAYER_ROLE.LAYER
          INNER JOIN SYS_GroupLayer ON SYS_GroupLayer.Id = SYS_LAYER.GroupID
          WHERE ROLE = '${role}'`).then(function (rows) {
          res.status(200).send(rows);
        })
      } else
        render(req, res, 'quanlytaikhoannhomquyen/lopdulieu-quyen', {
          title: 'Quản lý lớp dữ liệu'
        })
      break;
    case 'lop-du-lieu-tai-khoan':
      var isAccess = req.session.passport.user.Capabilities.some(s => s === "QLTKNQ-QLKNTC-LDL-TK");
      if (!isAccess) noAccess();
      if (t === 'danhsach') {
        var account = req.query['account'];
        db.select(`SELECT SYS_LAYER_ACCOUNT.*, SYS_LAYER.TITLE AS LayerName, SYS_GroupLayer.Name AS LayerGroup FROM SYS_LAYER_ACCOUNT 
        INNER JOIN SYS_LAYER ON SYS_LAYER.ID = SYS_LAYER_ACCOUNT.LAYER
        INNER JOIN SYS_GroupLayer ON SYS_GroupLayer.Id = SYS_LAYER.GroupID
        WHERE ACCOUNT = ${account}`).then(function (rows) {
          res.status(200).send(rows);
        })
      } else
        render(req, res, 'quanlytaikhoannhomquyen/lopdulieu-taikhoan', {
          title: 'Quản lý lớp dữ liệu'
        })
      break;
    default:
      res.status(400).send('Không xác định địa chỉ');
      break;
  }
})

function noAccess(res) {
  res.write('Không có quyền truy cập');
  res.end();
}
router.post('/quan-ly-tai-khoan-nhom-quyen', function (req, res) {
  if (req.session.passport.user.Capabilities.some(function (s) {
      return s.startsWith('QLTKNQ')
    })) {
    let m = req.query['m'];
    switch (m) {
      case 'tai-khoan':
      case 'nhom-quyen':
        let
          UserName = req.body['Username'],
          DisplayName = req.body['DisplayName'],
          Password = req.body['Password'],
          Role = req.body['Role'];
        db.query(`INSERT INTO SYS_ACCOUNT (USERNAME,DISPLAYNAME,PASSWORD,ROLE) VALUES('${UserName}',N'${DisplayName}','${Password}','${Role}')`).then(function (result) {
          console.log(result);
          res.status(200).send(req.body);
        }).catch(function () {
          res.status(400).send();
        })
        break;
      case 'lop-du-lieu-tai-khoan':
      case 'lop-du-lieu-quyen':
        let table, tableId, where;
        if (m === 'lop-du-lieu-tai-khoan') {
          table = 'ACCOUNT'
          tableId = req.body['Account'];
          where = `${table}=${tableId}`
        } else {
          table = 'ROLE'
          tableId = req.body['Role'];
          where = `${table}='${tableId}'`
        }
        let promises = [];
        promises.push(db.select('SELECT ID FROM SYS_LAYER'));
        promises.push(db.select(`SELECT Layer FROM SYS_LAYER_${table} WHERE ${where}`))
        Promise.all(promises).then(function (results) {
          const layers = results[0],
            layerAccounts = results[1];
          if (layers.length === layerAccounts.length)
            res.status(200).send('no-update');
          else {
            let inserts = [];
            for (const item of layers) {
              if (!layerAccounts.some(function (s) {
                  return s['Layer'] === item['ID']
                })) {
                inserts.push(`INSERT INTO SYS_LAYER_${table}(LAYER,${table}) VALUES('${item['ID']}',${m==='lop-du-lieu-tai-khoan'?tableId:"'"+tableId+"'"})`)
              }
            }
            if (inserts.length > 0) {
              db.query(inserts.join(';')).then(function () {
                res.status(200).send();
              })
            }
          }

        })
        break;
        // case 'lop-du-lieu-tai-khoan':
      default:
        break;
        // case 'quyen':
    }
  }
})
module.exports = router;