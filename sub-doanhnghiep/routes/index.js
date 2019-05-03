var express = require('express');
var router = express.Router();

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
module.exports = router;