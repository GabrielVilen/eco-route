/**
 * Created by gabriel on 2017-10-19.
 */

var charts = [], tempArray = [], carbonArray = [],  humidityArray = [];
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

var chart_temp = createChart("chart_temp", tempArray, 'rgb(255, 163, 102)');
var chart_carbon = createChart("chart_carbon", carbonArray, 'rgb(153, 153, 153)');
var chart_humidity = createChart("chart_humidity", humidityArray, 'rgb(102, 204, 255)');

function updateCharts() {
    charts.forEach(function(cha) {
        cha.config.data.labels.push("");
        cha.update();
    });
}

function addPoint(payload) {
    addToMap(payload);
    tempArray.push(payload.temp);
    carbonArray.push(payload.carbon);
    humidityArray.push(payload.humidity);
    updateCharts();
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

scanItemsFromDB();
//setInterval(scanItemsFromDB, 3000);
//setInterval(testAdd, 3000);

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
        lat: 52.006504 + Math.random() / 10,
        long: 4.362238 + Math.random() / 10,
        timestamp: 201709282218
    };
    addPoint(dummy)
}




