
// Default web refresh interval (may be changed with web_refresh config option)
var refresh = 5000;

// Default hashrate tolerance (+/- to target hashrate)
var tolerance = 0.05;

// GPU temperature monitoring threshold (zero disables monitoring)
var temperature = 0;

// DOM Ready =============================================================

$(document).ready(function() {
    worker();
});

// Functions =============================================================

function worker() {
    var eth = [ 0, 0, 0 ];
    var dcr = [ 0, 0, 0 ];

    function format_stats(stats, currency, target, splitter, skip) {
        if (!skip && stats) {
            if (!splitter) {
                splitter = '';
            }

            var s = stats.split(';');

            // Update totals
            if (currency != null) {
                currency[0] += Number(s[0]);
                currency[1] += Number(s[1]);
                currency[2] += Number(s[2]);
            }

            // Format fields
            var hashrate = Number(s[0] / 1000).toFixed(2) + ' MH/s';
            var shares = s[1] + '/' + s[2];
            var rejects = (s[1] > 0) ? (' (' + Number(s[2] / s[1] * 100).toFixed(2) + '%)') : '';

            // Check tolerance
            if ((target !== null) && tolerance) {
                if (s[0] / 1000 < target * (1 - tolerance)) {
                    hashrate = '<span class="error">' + hashrate + '</span>';
                } else if (s[0] / 1000 > target * (1 + tolerance)) {
                    hashrate = '<span class="warning">' + hashrate + '</span>';
                }
            }

            return hashrate + splitter + shares + rejects;
        }
        return '';
    }

    function format_temps(temps, splitter) {
        if (!splitter) {
            splitter = ' ';
        }
        var tf = '';
        if (temps) {
            var t = temps.split(';');
            for (var i = 0; i < t.length; i += 2) {
                var temp = t[i] + 'C';
                var fan = t[i+1] + '%';
                if (temperature && (t[i] > temperature)) {
                    temp = '<span class="error">' + temp + '</span>';
                }
                tf += ((i > 0) ? splitter : '') + temp + ':' + fan;
            }
        }
        return tf;
    }

    function format_pools(pools, splitter) {
        if (!splitter) {
            splitter = '; ';
        }
        return pools.split(';').join(splitter);
    }

    $.ajax({
        url: '/miners',

        success: function(data) {
            // Target hashrate tolerance
            if (data.tolerance !== undefined) {
                tolerance = data.tolerance / 100;
            }

            // GPU temperature monitoring threshold
            if (data.temperature !== undefined) {
                temperature = data.temperature;
            }

            // For each item in JSON, add a table row and cells to the content string
            var tableContent = '';
            $.each(data.miners, function() {

                var error = (this.error == null) ? '' : ' class=error';

                tableContent += '<tr' + error + '>';
                tableContent += '<td>' + this.name + '</td>';
                tableContent += '<td>' + this.host + '</td>';
                if (this.error == null) {
                    tableContent += '<td>' + this.uptime + '</td>';
                    tableContent += '<td>' + format_stats(this.eth, eth, this.target_eth, '<br>') + '</td>';
                    tableContent += '<td>' + format_stats(this.dcr, dcr, this.target_dcr, '<br>', !this.pools.split(';')[1]) + '</td>';
                    tableContent += '<td>' + format_temps(this.temps, '<br>') + '</td>';
                    tableContent += '<td>' + format_pools(this.pools, '<br>') + '</td>';
                    tableContent += '<td>' + this.ver + '</td>';
                } else {
                    tableContent += '<td colspan="6">' + this.error + '</td>';
                }
                tableContent += '<td>' + this.comments + '</td>';
                tableContent += '</tr>';

            });

            // Inject the whole content string into existing HTML table
            $('#minerInfo table tbody').html(tableContent);

            var summaryContent = '';
            summaryContent += 'Total ETH hashrate: ' + format_stats(eth.join(';'), null, null, ', ') + '<br>';
            summaryContent += 'Total DCR hashrate: ' + format_stats(dcr.join(';'), null, null, ', ');
            $('#minerSummary').html(summaryContent);

            // Display last update date/time
            var lastUpdated = 'Last updated: ' + data.updated;
            $('#lastUpdated').html(lastUpdated).removeClass("error");

            // Update refresh interval if defined
            if (data.refresh !== undefined) {
                refresh = data.refresh;
            }
        },

        error: function() {
            // Mark last update time with error flag
            $('#lastUpdated').addClass("error");
        },

        complete: function() {
            // Schedule the next request when the current one's complete
            setTimeout(worker, refresh);
        }

    });
}
