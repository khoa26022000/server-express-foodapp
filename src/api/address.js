const axios = require("axios");

const getGeoLocation = async (location) => {
  const res = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
    params: {
      q: location,
      key: "e50cdcc8921f46e8ade4bea172f062f7",
    },
  });
  return res;
};

module.exports = getGeoLocation;
