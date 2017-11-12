/**
 * Created by gabriel on 2017-10-19.
 */
/*
 chart code below
 */
var chartPoints = [];

var config =  {
        type: 'line',

        // The data for our dataset
        data: {
        labels: ["January", "February", "March", "April", "May", "June", "July"],
            datasets: [{
            label: "My First dataset",
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: chartPoints
        }]
    },

    // Configuration options go here
    options: {}
};

var ctx = document.getElementById('chart').getContext('2d');
var chart = new Chart(ctx, config);


function addPoint(payload) {
   // data.push(payload);
    mapPoints.push(new google.maps.LatLng(payload.long, payload.lat));
    chartPoints.push(payload.temp);


    window.chart.update();
    config.data.labels.push("");


    console.log("added " + payload.temp);
    console.log("Added " + payload.long + "," + payload.lat);
}

/*
 AWS code below
 */
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "eu-central-1:dfa2f1f4-f7ec-44f6-8fe4-fd23039967a8"
});
AWS.config.region = 'eu-central-1';

var docClient = new AWS.DynamoDB.DocumentClient();
var dataDict = {};

function key(payload) {
    return payload.id + payload.lat + payload.long;
}


function scanItemsFromDB() {
    var params = {
        TableName: 'EcoRouteTable'
    };

    docClient.scan(params, function(err, data) {
        console.log("Scanning items from DB");
        if (err) console.log(err);
        else {
            console.log(data);
            data.Items.forEach(function (item) {
                //console.log(dataDict[item]);
                var payload = item.payload;
                if(dataDict[key(payload)] === undefined) {
                    addPoint(payload);
                    dataDict[key(payload)] = item;
                }
            })
        }
    });
}
//scanItemsFromDB();
//setInterval(scanItemsFromDB, 10000);

setInterval(testAdd, 3000);

var tmp = 10;
function testAdd() {
    tmp += Math.random() - 0.5;
    var dummy = {
        temp: tmp,
        id: 1,
        long: 52.006504 + Math.random() / 10,
        lat: 4.362238 + Math.random() / 10,
        timestamp: 201709282218
    };
    addPoint(dummy)

}