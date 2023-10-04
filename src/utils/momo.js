const axios = require("axios");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
// import axios from "axios";

const generateToken = (data) => {
  return jwt.sign(data, process.env.SECRET_KEY, { expiresIn: 30 * 60 });
};

const momoSend = async (data) => {
  console.log("data", data);
  const tokenOrder = generateToken(data);
  console.log("token", tokenOrder);
  let info = "Thanh toán đơn hàng của bạn";

  var partnerCode = process.env.MOMO_PARTNER_CODE;
  var accessKey = process.env.MOMO_ACCESS_KEY;
  var secretkey = process.env.MOMO_SECRET_KEY;
  var requestId = partnerCode + new Date().getTime();
  var orderId = requestId;
  var orderInfo = info;
  var redirectUrl = `https://server-express-foodapp.herokuapp.com/api/order/success-payment?token=${tokenOrder}`;
  var ipnUrl = "https://callback.url/notify";
  var amount = data.total;
  var requestType = "captureWallet";
  var extraData = ""; //pass empty value if your merchant does not have stores
  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  //puts raw signature
  //signature
  console.log("$$$", requestId);
  var signature = crypto
    .createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "vi",
  };
  const response = await axios.post(
    "https://test-payment.momo.vn/v2/gateway/api/create",
    requestBody
  );
  // const data = response.write(requestBody);
  // response.end();
  console.log("res", response);
  return response.data;
};

const checkMomoSuccess = async (orderId, requestId) => {
  var partnerCode = process.env.MOMO_PARTNER_CODE;
  var accessKey = process.env.MOMO_ACCESS_KEY;
  var secretkey = process.env.MOMO_SECRET_KEY;
  var rawSignature =
    "accessKey=" +
    accessKey +
    "&orderId=" +
    orderId +
    "&partnerCode=" +
    partnerCode +
    "&requestId=" +
    requestId;

  //puts raw signature
  //signature
  const crypto = require("crypto");
  var signature = crypto
    .createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = {
    partnerCode: partnerCode,
    requestId: requestId,
    orderId: orderId,
    signature: signature,
    lang: "vi",
  };
  console.log(requestBody);
  const response = await axios.post(
    "https://test-payment.momo.vn/v2/gateway/api/query",
    requestBody
  );
  console.log(response.data);
  if (response.data.resultCode == 0) {
    return true;
  }
  return false;
};

module.exports = momoSend;
// module.exports = checkMomoSuccess;
