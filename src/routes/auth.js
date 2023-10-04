const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");
const getGeoLocation = require("../api/address");
const client = require("twilio")(
  "ACc31193cb55b4b980afc7b19b7c4cb5ff",
  "05c4c933979a366791097eef793cc871"
);

// import { ValidateRegisterInput } from "../utils/validators";

const sendOTP = async (data) => {
  const { phoneNumber } = data;
  console.log(phoneNumber);
  const token = jwt.sign(data, process.env.SECRET_KEY, { expiresIn: 30 * 60 });
  let result = phoneNumber.replace(/[0]/i, "84");
  console.log(result);
  client.verify
    .services("VA529c4c0313a5bd3e39d70a3d403ad849")
    .verifications.create({
      to: `+${result}`,
      channel: "sms",
    })
    .then((data) => {
      res.status(200).send({
        message: "Mã xác thực đã gữi !!",
        phoneNumber,
        data,
      });
    })
    .catch((error) => {
      return error;
    });
  return token;
};

// @route POST api/auth/register
// @desc Resgister user
// @access Public

router.post("/register", async (req, res) => {
  const {
    phoneNumber,
    password,
    fullName,
    avatar,
    dateOfBirth,
    male,
    address,
    lat,
    lng,
  } = req.body;

  if (!phoneNumber || !password)
    return res
      .status(400)
      .json({ success: false, message: "Thiếu số điện thoại hoặc password" });
  if (!fullName)
    return res
      .status(400)
      .json({ success: false, message: "Họ và tên không được để trống" });

  if (password.length < 6)
    return res
      .status(400)
      .json({ success: false, message: "password ít nhất phải có 6 ký tự" });

  const vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
  if (!phoneNumber.match(vnf_regex))
    return res
      .status(400)
      .json({ success: false, message: "Số điện thoại không hợp lệ" });

  try {
    // Check có sđt trùng hay k
    const phone = await User.findOne({ phoneNumber });
    if (phone)
      return res
        .status(400)
        .json({ success: false, message: "Số điện thoại đã có người sử dụng" });

    // const geo = await getGeoLocation(address);
    // const { lat, lng } = geo.data.results[0].geometry;
    // console.log("toa do", geo.data.results[0].geometry);
    const hashedPassword = await argon2.hash(password);
    const token = await sendOTP({
      password: hashedPassword,
      phoneNumber,
      fullName,
      avatar: avatar || "D:/BaiTap/khoaluantotnghiep/image/avt.png",
      dateOfBirth: dateOfBirth || "",
      male: male || true,
      address,
      lat,
      lng,
    });
    res.json({ success: true, message: "Mã xác thực đã gữi", token });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: `Đăng nhập thất bại${error}` });
  }
});

// @route POST api/auth/login
// @desc login user
// @access Public

router.post("/login", async (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password)
    return res.status(400).json({
      success: false,
      message: "Số điện thoại hoặc password không chính xác !!!",
    });

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "Số điện thoại hoặc password không chính xác !!!",
      });

    // sai
    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid)
      return res.status(400).json({
        success: false,
        message: "Số điện thoại hoặc password không chính xác !!!",
      });

    // đúng
    const accessToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.json({
      success: true,
      message: "Đăng nhập thành công",
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: `Đăng nhập thất bại${error}` });
  }
});

// @route GET api/auth/profile
// @desc profile user
// @access privte

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    return res.json({
      success: true,
      message: "Thông tin cá nhân",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại` });
  }
});

// @route PUT api/auth/update
// @desc update user
// @access privte

router.patch("/", verifyToken, async (req, res) => {
  const {
    phoneNumber,
    // password,
    // oldPassword,
    profile: { fullName, avatar, dateOfBirth, male, address, lat, lng },
  } = req.body;

  if (!phoneNumber)
    return res
      .status(400)
      .json({ success: false, message: "PhoneNumber is required" });

  // const user = await User.findOne({ phoneNumber });

  // const passwordValid = await argon2.verify(user.password, oldPassword);
  // if (!passwordValid)
  //   return res.status(400).json({
  //     success: false,
  //     message: "Password không chính xác !!!",
  //   });
  try {
    // const hashedPassword = await argon2.hash(password);
    let updatedProfile = {
      phoneNumber,
      // password: hashedPassword,
      profile: {
        fullName: fullName || "",
        avatar: avatar || "",
        dateOfBirth: dateOfBirth || "",
        male: male || true,
        address,
        lat,
        lng,
      },
    };

    const userUpdateCondition = { _id: req.userId };

    updatedProfile = await User.findOneAndUpdate(
      userUpdateCondition,
      updatedProfile,
      { new: true }
    ).select("-password");

    // nếu kh đúng user
    if (!updatedProfile)
      return res
        .status(401)
        .json({ success: false, message: "update thất bại" });

    res.json({
      success: true,
      message: "Update thành công !!!",
      user: updatedProfile,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.patch("/password", verifyToken, async (req, res) => {
  const { password, oldPassword } = req.body;
  const user = await User.findOne({ _id: req.userId });

  const passwordValid = await argon2.verify(user.password, oldPassword);
  if (!passwordValid)
    return res.status(400).json({
      success: false,
      message: "Password không chính xác !!!",
    });
  try {
    const hashedPassword = await argon2.hash(password);
    let updatedProfile = {
      password: hashedPassword,
    };

    const userUpdateCondition = { _id: req.userId };

    updatedProfile = await User.findOneAndUpdate(
      userUpdateCondition,
      updatedProfile,
      { new: true }
    ).select("-password");

    // nếu kh đúng user
    if (!updatedProfile)
      return res
        .status(401)
        .json({ success: false, message: "update thất bại" });

    res.json({
      success: true,
      message: "Update thành công !!!",
      user: updatedProfile,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/sendOTP", (req, res) => {
  if (req.query.phonenumber) {
    let result = req.query.phonenumber.replace(/[0]/i, "84");
    console.log(result);
    client.verify
      .services("VA529c4c0313a5bd3e39d70a3d403ad849")
      .verifications.create({
        to: `+${result}`,
        channel: req.query.channel === "call" ? "call" : "sms",
      })
      .then((data) => {
        res.status(200).send({
          message: "Verification is sent!!",
          phonenumber: req.query.phonenumber,
          data,
        });
      });
  } else {
    res.status(400).send({
      message: "Wrong phone number :(",
      phonenumber: req.query.phonenumber,
      data,
    });
  }
});

// Verify Endpoint
router.get("/verify", async (req, res) => {
  const { token, code } = req.query;
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  const {
    phoneNumber,
    password,
    fullName,
    avatar,
    dateOfBirth,
    male,
    address,
    lat,
    lng,
  } = decoded;
  console.log("okokok", decoded);
  if (phoneNumber && code.length === 6) {
    let result = phoneNumber.replace(/[0]/i, "84");
    console.log("re", result);
    client.verify
      .services("VA529c4c0313a5bd3e39d70a3d403ad849")
      .verificationChecks.create({
        to: `+${result}`,
        code: code,
      })
      .then(async (data) => {
        if (data.status === "approved") {
          const newUser = new User({
            password,
            phoneNumber,
            profile: {
              fullName,
              avatar,
              dateOfBirth,
              male,
              address,
              lat,
              lng,
            },
          });
          console.log("kh ok");
          await newUser.save();
          console.log("ok");
          const accessToken = jwt.sign(
            { userId: newUser._id },
            process.env.ACCESS_TOKEN_SECRET
          );
          res.status(200).send({
            success: true,
            message: "Đúng mã xác thực đăng ký thành công !!!",
            accessToken,
          });
        }
      })
      .catch((error) => {
        res.status(200).send({
          success: false,
          message: "Đăng ký thất bại catch !!!",
          error,
        });
      });
  } else {
    res.status(400).send({
      success: false,
      message: "Đăng ký thất bại !!!",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { phoneNumber, newPassword } = req.body;

  if (!phoneNumber || !newPassword)
    return res
      .status(400)
      .json({ success: false, message: "Thiếu số điện thoại hoặc password" });

  if (newPassword.length < 6)
    return res
      .status(400)
      .json({ success: false, message: "password ít nhất phải có 6 ký tự" });

  const vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
  if (!phoneNumber.match(vnf_regex))
    return res
      .status(400)
      .json({ success: false, message: "Số điện thoại không hợp lệ" });

  try {
    // Check có sđt trùng hay k
    const phone = await User.findOne({ phoneNumber });
    if (!phone)
      return res
        .status(400)
        .json({ success: false, message: "Số điện thoại chưa được đăng ký" });

    const hashedPassword = await argon2.hash(newPassword);
    const token = await sendOTP({
      password: hashedPassword,
      phoneNumber,
    });
    res.json({ success: true, message: "Mã xác thực đã gữi", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Thất bại${error}` });
  }
});

router.get("/verify-newPassword", async (req, res) => {
  const { token, code } = req.query;
  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  const { phoneNumber, password } = decoded;
  if (phoneNumber && code.length === 6) {
    let result = phoneNumber.replace(/[0]/i, "84");
    client.verify
      .services("VA529c4c0313a5bd3e39d70a3d403ad849")
      .verificationChecks.create({
        to: `+${result}`,
        code: code,
      })
      .then(async (data) => {
        if (data.status === "approved") {
          const userUpdateCondition = { phoneNumber: phoneNumber };

          updatedProfile = await User.findOneAndUpdate(
            userUpdateCondition,
            { password },
            { new: true }
          ).select("-password");

          // nếu kh đúng user
          if (!updatedProfile)
            return res
              .status(401)
              .json({ success: false, message: "Đổi mật khẩu thất bại" });

          res.json({
            success: true,
            message: "Đúng mã xác thực đổi thành công !!!",
            user: updatedProfile,
          });
        }
      })
      .catch((error) => {
        res.status(200).send({
          success: false,
          message: "Đổi mật khẩu thất bại !!!",
          error,
        });
      });
  } else {
    res.status(400).send({
      success: false,
      message: "Đổi mật khẩu thất bại !!!",
    });
  }
});

router.put("/changeAddress", verifyToken, async (req, res) => {
  const { address, lat, lng } = req.body;

  try {
    const userUpdateCondition = { _id: req.userId };
    userProfile = await User.findOne(userUpdateCondition);

    let updatedProfile = {
      profile: {
        fullName: userProfile.profile.fullName,
        avatar: userProfile.profile.avatar,
        dateOfBirth: userProfile.profile.dateOfBirth,
        male: userProfile.profile.male,
        address,
        lat,
        lng,
      },
    };
    updatedProfile = await User.findOneAndUpdate(
      userUpdateCondition,
      updatedProfile,
      { new: true }
    ).select("-password");

    // nếu kh đúng user
    if (!updatedProfile)
      return res
        .status(401)
        .json({ success: false, message: "update thất bại" });

    res.json({
      success: true,
      message: "Update thành công !!!",
      user: updatedProfile,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
