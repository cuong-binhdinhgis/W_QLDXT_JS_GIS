var router = require("express").Router();
var appSoThongTinTruyenThong = require('../sub-sothongtintruyenthong/app');
var appDoanhNghiep = require('../sub-doanhnghiep/app');
router.get('/', function (req, res) {
  res.render('welcome');
})
router.use('/doanh-nghiep', function (req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.redirectTo = '/doanh-nghiep' + req.url || '';
    res.redirect('/login');
  } else {
    if (req.session.passport.user.GroupRole === 'DN')
      next();
    else {
      req.session.redirectTo = '/doanh-nghiep' + req.url || '';
      res.redirect('/login');
    }
  }
}, appDoanhNghiep);
router.use('/so-tttt', function (req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.redirectTo = '/so-tttt' + req.url || '';
    res.redirect('/login');
  } else {
    if (req.session.passport.user.GroupRole === 'STTTT')
      next();
    else
      res.redirect('/login');

  }
}, appSoThongTinTruyenThong);
module.exports = router;