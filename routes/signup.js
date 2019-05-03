var router = require("express").Router();
var request = require("request");
var db = require('../modules/Database').create();

//signup
router.get('/', (req, res) => {
  res.render('signup', {
    title: 'Đăng kí tài khoản'
  });
})

router.post('/', function (req, res) {
  const secret = "6LfJDUwUAAAAAG3d0y8dH23XEaBac3ngUYyFp_Ai";
  // console.log(req.body);
  var newAccount = req.body;
  request.post('https://www.google.com/recaptcha/api/siteverify', {
    body: JSON.stringify({
      secret: secret,
      response: newAccount['g-recaptcha-response']
    })
  }, function (err, httpResponse, body) {
    if (err) {
      res.status(400).send(err);
    } else {
      var query = `INSERT INTO SYS_Account (Username, Password, DisplayName, Status, Email,Role)
  VALUES ('${newAccount.username}','${newAccount.password}',N'${newAccount.name}',0,'${newAccount.email}','${newAccount.role}')`;
      db.query(query).then(_ => {
        res.status(200).send("success");
        res.end();
      }).catch(_ => {
        res.status(400).send("error");
        res.end();
      })
    }
  })
})
router.get('/donvi', function (req, res) {
  let sql = `SELECT * FROM SYS_ROLE WHERE GROUPROLE = 'DN'`;
  db.select(sql).then(rows => {
    res.status(200).send(rows)
  }).catch(_ => res.status(400).send());
})

module.exports = router;