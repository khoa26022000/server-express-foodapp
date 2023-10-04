module.exports.ValidateRegisterInput = (
  phoneNumber,
  password,
  confirmPassword,
  fullName
) => {
  const vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
  if (fullName.trim() === "") {
    errors.fullName = "Vui lòng nhập họ tên";
  } else if (fullName.length < 4) {
    errors.fullName = "Họ tên không được nhỏ hơn 4 ký tự";
  }

  if (phoneNumber.trim() === "") {
    errors.phoneNumber = "Vui lòng nhập số điện thoại";
  } else if (!phoneNumber.match(vnf_regex)) {
    errors.phoneNumber = "Số điện thoại phải là số điện thoại hợp lệ";
  } else if (isPhone) {
    errors.phoneNumber = "Số điện thoại này đã tồn tại";
  }

  if (password.trim() === "") {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (password.length < 5) {
    errors.password = "Mật khẩu không được nhỏ hơn 5 ký tự";
  } else if (password.trim() !== confirmPassword.trim()) {
    errors.confirmPassword = "mật khẩu phải trùng khớp";
  }
};
