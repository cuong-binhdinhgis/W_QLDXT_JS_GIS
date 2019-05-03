$(document).ready(function () {
  const btnSubmit = $('#submit');
  btnSubmit.click(onClick);
  let donVi = $("#donvi");
  loadDonVi();
  function loadDonVi(){
    $.get('/signup/donvi').done(r=>{
      if(r && r.length>0){
        r.forEach(f=>{
          let option = $("<option/>",{
            value:f.ID,text:f.Name
          }).appendTo(donVi)
        })
      }
      
    })
  }

  function onClick() {
    const gCaptcha = $("#g-recaptcha-response"),
      username = $("#username"),
      name = $("#name"),
      email = $("#email"),
      donvi = $("#donvi"),
      password = $("#password"),
      repeat_password = $("#repeat_password");
    if (!username.val() || !password.val() || !name.val() ||
      !gCaptcha.val() || !email.val() ||
      !donvi.val() || !password.val() ||
      !repeat_password.val()) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password.val() !== repeat_password.val()) {
      alert("Mật khẩu không trùng nhau");
      return;
    }
    $.post("/signup", {
      username: username.val(),
      name: name.val(),
      email: email.val(),
      role: donvi.val(),
      password: password.val(),
      'g-recaptcha-response':gCaptcha.val()
    }).done(r => {
      alert("Đăng ký tài khoản thành công, quản trị viên đã xử lý yêu cầu.")
      location.href = "/";
    }).fail(f => {
      alert("Có lỗi xảy ra trong quá trình thực hiện, vui lòng kiểm tra lại.")
    })

  }
})