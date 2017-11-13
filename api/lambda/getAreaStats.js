/**
 * Created by gabriel on 2017-11-12.
 */
const AWS = require('aws-sdk');

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "eu-central-1:dfa2f1f4-f7ec-44f6-8fe4-fd23039967a8"
});

AWS.config.region = 'eu-central-1';

const docClient = new AWS.DynamoDB.DocumentClient();
let points;

// range given as parameter to API
function calculateAvg(callback) {
    let totTemp = 0.0;
    let totHumidity = 0;
    let totCarbon = 0;

    for(let i = 0; i < points.length; i++) {
        const item = points[i];
        totTemp += item.temp;
        totHumidity += item.humidity;
        totCarbon += item.carbon;
    }
    const result = JSON.stringify({
        avgCarbon: totCarbon / points.length,
        avgHumidity: totHumidity / points.length,
        avgTemp: totTemp / points.length,
    });

    console.log("size = " + points.length + " res = " + result);

    callback(null, result);
}

function distance(lat1, lon1, lat2, lon2) {
    let p = 0.017453292519943295;    // Math.PI / 180
    let c = Math.cos;
    let a = 0.5 - c((lat2 - lat1) * p)/2 +
        c(lat1 * p) * c(lat2 * p) *
        (1 - c((lon2 - lon1) * p))/2;

    const res = 1000 * (12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km, convert to meter
    console.log("distance = " + res);

    return res;
}

exports.handler = (event, context, callback) => {
    let lat = event.lat;
    let long = event.long;
    let meters = event.meters;

    if(lat === undefined || long === undefined || meters === undefined) {
        callback("Querystring parameter is UNDEFINED ", null);
    }

    let params = {
        TableName: 'EcoRouteTable'
    };

    points = [];
    docClient.scan(params, function(err, data) {
        console.log("Scanning items from DB");
        if (err) {
            console.log(err);
            callback(err, null);
        }
        else {
            console.log(data);
            data.Items.forEach(function (item) {
                const payload = item.payload;
                if(distance(lat, long, payload.lat, payload.long) < meters) {
                    points.push(payload);
                    console.log("pushed item: " + payload);
                }
            });
            calculateAvg(callback);
        }
    });
};
