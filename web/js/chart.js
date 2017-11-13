/**
 * Created by gabriel on 2017-10-19.
 */

var charts = [], temp = [], carbon = [],  humidity = [];
var options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        yAxes: [{
            ticks: {
                beginAtZero:true
            }
        }]
    }
};

function createChart(name, dataPoints, color) {
    console.log(name, dataPoints, color);

    var dt = {
        labels: [], datasets: [{label: name, backgroundColor: color, borderColor: color, data: dataPoints}]
    };

    var chart = new Chart(document.getElementById(name), {
        type: 'line',
        data: dt,
        options: options
    });
    charts.push(chart);
    return chart;
}

var chart_temp = createChart("chart_temp", temp, 'rgb(255, 163, 102)');
var chart_carbon = createChart("chart_carbon", carbon, 'rgb(153, 153, 153)');
var chart_humidity = createChart("chart_humidity", humidity, 'rgb(102, 204, 255)');

var i = 0;
function updateCharts() {
    i++;
    charts.forEach(function(cha) {
        cha.config.data.labels.push(i);
        cha.update();
    });
}

function addPoint(payload) {
    mapPoints.push(new google.maps.LatLng(payload.long, payload.lat));
    console.log(payload);

    temp.push(payload.temp);
    carbon.push(payload.carbon);
    humidity.push(payload.humidity);

    updateCharts();

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

var testTemp = 10, testCarbon = 200, testHumitidy = 50;
function testAdd() {
    testTemp += Math.random() - 0.5;
    testCarbon += 100*(Math.random() - 0.5);
    testHumitidy += 50*(Math.random() - 0.5);

    var dummy = {
        temp: testTemp,
        carbon: testCarbon,
        humidity: testHumitidy,
        id: 1,
        long: 52.006504 + Math.random() / 10,
        lat: 4.362238 + Math.random() / 10,
        timestamp: 201709282218
    };
    addPoint(dummy)
}




