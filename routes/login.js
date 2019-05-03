const LocalStrategy = require('passport-local');
var accountManager = require('../modules/AccountDB').create();
module.exports = function (passport) {
	passport.serializeUser((user, done) => {
		done(null, user);
	})
	passport.deserializeUser((username, done) => {
		done(null, username);
	})
	passport.use(new LocalStrategy(
		function (username, password, done) {
			accountManager.isUser(username, password)
				.then(function (user) {
					if (!user) {
						return done(null, false, {
							message: 'Incorrect username and password'
						});
					}
					return done(null, user);
					// })
				}).catch(function (err) {
					return done(err);
				})
		}
	))
	var router = require("express").Router();
	router.get('/', function (req, res) {
		if (req.session.passport && req.session.passport.user) {
			let redirectTo = redirect(req);
			if (redirectTo) {
				res.redirect(redirectTo);
				res.end();
			}
		}
		res.render('login', {
			title: 'Đăng nhập'
		});
	});

	router.post('/', function (req, res, next) {
		passport.authenticate('local', function (err, user, info) {
			if (err) { return next(err); }
			if (!user) { return res.render('login', { message: 'Tài khoản hoặc mật khẩu không đúng' }); }
			req.logIn(user, function (err) {
				if (err) { return next(err); }
				if (user.Status === false) {
					res.clearCookie('passport');
					req.session.destroy();
					return res.render('login', { message: 'Tài khoản của bạn chưa được kích hoạt hoặc đã khóa, bạn hãy liên lạc với người quản trị của hệ thống để cấp phép cho bạn.' });
				}
				res.redirect("/so-tttt");
				let redirectTo = redirect(req);
				if (redirectTo)
					return res.redirect(redirectTo);
				else return res.send("Không tìm thấy đường dẫn")
			});
		})(req, res, next);
		// passport.authenticate('local', function (err, user) {
		// 	if (!user) {
		// 		res.render('login', {
		// 			title: 'Đăng nhập', message: "Tài khoản hoặc mật khẩu không đúng"
		// 		});
		// 	}else{
		// 		res.redirect("/so-tttt");
		// 	}
		// 	// if (user) {
		// 	// 	if (user.Status === false) {
		// 	// 		res.clearCookie('passport');
		// 	// 		req.session.destroy();
		// 	// 		res.render("khoataikhoan");
		// 	// 		return;
		// 	// 	}
		// 	// 	res.redirect("/so-tttt");
		// 	// 	let redirectTo = redirect(req);
		// 	// 	if (redirectTo)
		// 	// 		res.redirect(redirectTo);
		// 	// 	else res.send("Không tìm thấy đường dẫn")
		// 	// }
		// })(req, res, next);
	});
	router.post('/', passport.authenticate('local', {
		failureRedirect: '/login',
		failureFlash: true
	}), function (req, res, next) {
		res.redirect("/so-tttt")
	})
	function redirect(req) {
		var redirectTo;
		if (req.session.redirectTo) {
			redirectTo = req.session.redirectTo;
			delete req.session.redirectTo;
		} else {
			switch (req.session.passport.user.GroupRole) {
				case 'STTTT':
					redirectTo = '/so-tttt'
					break;
				case 'DN':
					redirectTo = '/doanh-nghiep'
					break;
				default:
					break;
			}
		}
		return redirectTo;
	}
	return router;
};