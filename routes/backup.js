var router = require("express").Router();
var Database = require('../modules/Database');
var db = Database.create();
const DISK_URL = 'C:\\Program Files\\Microsoft SQL Server\\MSSQL11.MSSQLSERVER\\MSSQL\\Backup\\';
router.post('/', function (req, res) {
  let date = new Date();
  let fileName = `${Database.config.database}_${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getDate()}${date.getMonth() + 1}${date.getFullYear()}.Bak`
  let backupSQL = `BACKUP DATABASE ${Database.config.database} TO DISK = '${DISK_URL}${fileName}'`
  console.log(backupSQL);
  db.query(backupSQL).then(_ => {
    db.query(`INSERT INTO SYS_BACKUPEVENT(NGUOISAOLUU,DUONGDAN) VALUES('${req.session.passport.user.Username}','${fileName}')`)
    res.status(200).send()
  }).catch(e => {
    console.log(e);
    res.status(400).send(e);
  })
})
module.exports = router;