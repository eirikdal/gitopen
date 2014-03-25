angular.module('gitopen.factories')
    .factory('chartFactory', function() {
    var chart =
    {
        options: {
            chart: {
                type: 'bubble'
            },
            tooltip: {
                crosshairs: [false,false]
            }
        },
        title: {
            text: 'Commits'
        },

        yAxis: {
            min: 0,
            max: 400
        },
        xAxis: {
            type: "number",
            min: 1,
            max: 12
        }
    };
    return chart;
})