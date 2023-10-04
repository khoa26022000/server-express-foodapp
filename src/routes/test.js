const express = require("express");
const router = express.Router();
const Test = require("../models/Test");
// const haversine = require("haversine");
const haversine = require("haversine");

router.post("/", async (req, res) => {
  const { name, details, nameDetail, toppings, nameTopping, priceTopping } =
    req.body;
  try {
    const newTest = new Test({
      name,
      details,
      nameDetail,
      toppings,
      nameTopping,
      priceTopping,
    });
    await newTest.save();

    res.json({ success: true, message: "Tạo thành công", newTest });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: `Tạo thất bại ${error}` });
  }
});

router.get("/", async (req, res) => {
  const start = {
    latitude: 10.77986944541645,
    longitude: 106.60698414094388,
  };
  //10.77986944541645, 106.60698414094388
  // 10.805113892660701, 106.62225393413311

  const end = {
    latitude: 10.806648228283235,
    longitude: 106.62888004649011,
  };

  // 10.768521579380778, 106.60216955335217
  return res.json({
    km: haversine(start, end, { unit: "km" }),
    meter: haversine(start, end, { unit: "meter" }),
  });
});

const ktTrung = async () => {
  // const start = {
  //   latitude: 10.798516863689928,
  //   longitude: 106.64310973909551,
  // };

  // const end = {
  //   latitude: 10.806648228283235,
  //   longitude: 106.62888004649011,
  // };

  // console.log("1", haversine(start, end));
  // console.log("2", haversine(start, end, { unit: "mile" }));
  // console.log("3", haversine(start, end, { unit: "meter" }));
  // console.log("4", haversine(start, end, { threshold: 1 }));
  // console.log("5", haversine(start, end, { threshold: 1, unit: "mile" }));
  // console.log("6", haversine(start, end, { threshold: 1, unit: "meter" }));

  const start = {
    latitude: 10.805113892660701,
    longitude: 106.62225393413311,
  };

  // 10.805113892660701, 106.62225393413311

  const end = {
    latitude: 10.768521579380778,
    longitude: 106.60216955335217,
  };

  // 10.768521579380778, 106.60216955335217
  res.json({
    km: haversine(start, end, { unit: "km" }),
    meter: haversine(start, end, { unit: "meter" }),
  });
};

// const ktTrung = async () => {
//   var start = {
//     latitude: 10.798516863689928,
//     longitude: 106.64310973909551,
//   };
//   var startLatLon = [10.798516863689928, 106.64310973909551];
//   var startLonLat = [106.64310973909551, 10.798516863689928];
//   var startLatLonObject = {
//     lat: 10.798516863689928,
//     lon: 106.64310973909551,
//   };
//   var startLatLngObject = {
//     lat: 10.798516863689928,
//     lng: 106.64310973909551,
//   };
//   var startGeoJson = {
//     geometry: {
//       coordinates: [106.64310973909551, 10.798516863689928],
//     },
//   };

//   var end = {
//     latitude: 10.806648228283235,
//     longitude: 106.62888004649011,
//   };
//   var endLatLon = [10.806648228283235, 106.62888004649011];
//   var endLonLat = [106.62888004649011, 10.806648228283235];
//   var endLatLonObject = {
//     lat: 10.806648228283235,
//     lon: 106.62888004649011,
//   };
//   var endLatLngObject = {
//     lat: 10.806648228283235,
//     lng: 106.62888004649011,
//   };
//   var endGeoJson = {
//     geometry: {
//       coordinates: [106.62888004649011, 10.806648228283235],
//     },
//   };

//   // All tests are rounded for sanity.

//   var tests = [
//     [start, end, 0.341],
//     [start, end, 0.549],
//     [startLatLon, endLatLon, 0.341, { format: "[lat,lon]" }],
//     [startLatLon, endLatLon, 0.549, { format: "[lat,lon]" }],
//     [startLonLat, endLonLat, 0.341, { format: "[lon,lat]" }],
//     [startLonLat, endLonLat, 0.549, { format: "[lon,lat]" }],
//     [startLatLonObject, endLatLonObject, 0.341, { format: "{lon,lat}" }],
//     [startLatLonObject, endLatLonObject, 0.549, { format: "{lon,lat}" }],
//     [startLatLngObject, endLatLngObject, 0.341, { format: "{lat,lng}" }],
//     [startLatLngObject, endLatLngObject, 0.549, { format: "{lat,lng}" }],
//     [startGeoJson, endGeoJson, 0.341, { format: "geojson" }],
//     [startGeoJson, endGeoJson, 0.549, { format: "geojson" }],
//   ];

//   tests.forEach(function (t, i) {
//     if (i % 2 === 0) {
//       test(`it should return " + ${t[2]} + " mi for " + ${t[0]} + " .. " + ${t[1]}`, function () {
//         assert.equal(
//           Math.abs(
//             (haversine(t[0], t[1], Object.assign({ unit: "mile" }, t[3])) -
//               t[2]) /
//               t[2]
//           ).toFixed(2),
//           "0.00"
//         );
//       });
//     } else {
//       test(
//         "it should return " + t[2] + " km for " + t[0] + " .. " + t[1],
//         function () {
//           assert.equal(
//             Math.abs(
//               (haversine(t[0], t[1], Object.assign({}, t[3])) - t[2]) / t[2]
//             ).toFixed(2),
//             "0.00"
//           );
//         }
//       );
//     }
//   });

//   test("it should return false that distance is within 1 mi threshold", function () {
//     assert.equal(false, haversine(tests[0], tests[0], { threshold: 1 }));
//   });

//   test("it should return false that distance is within 1 km threshold", function () {
//     assert.equal(
//       false,
//       haversine(tests[1], tests[1], { threshold: 1, unit: "km" })
//     );
//   });
// };

module.exports = router;
