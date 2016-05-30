
// Default web refresh interval (may be changed with web_refresh config option)
var refresh = 5000;

// DOM Ready =============================================================

$(document).ready(function() {
    worker();
});

// Functions =============================================================

function worker() {
    var eth = [ 0, 0, 0 ];
    var dcr = [ 0, 0, 0 ];

    function format_stats(stats, currency, splitter, skip) {
        if (!skip && stats) {
            if (!splitter) {
                splitter = '';
            }
            var s = stats.split(';');
            var stats = Number(s[0]/1000).toFixed(2) + ' MH/s' + splitter + s[1] + '/' + s[2];
            var rate = (s[1] > 0) ? (' (' + Number(s[2] / s[1] * 100).toFixed(2) + '%)') : '';
            if (currency != null) {
                currency[0] += Number(s[0]);
                currency[1] += Number(s[1]);
                currency[2] += Number(s[2]);
            }
            return stats + rate;
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
                tf += ((i > 0) ? splitter : '') + t[i] + 'C:' + t[i+1] + '%';
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
            var tableContent = '';

            // For each item in JSON, add a table row and cells to the content string
            $.each(data.miners, function() {

                var error = (this.error == null) ? '' : ' class=error';

                tableContent += '<tr' + error + '>';
                tableContent += '<td>' + this.name + '</td>';
                tableContent += '<td>' + this.host + '</td>';
                if (this.error == null) {
                    tableContent += '<td>' + this.uptime + '</td>';
                    tableContent += '<td>' + format_stats(this.eth, eth, '<br>') + '</td>';
                    tableContent += '<td>' + format_stats(this.dcr, dcr, '<br>', !this.pools.split(';')[1]) + '</td>';
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
            summaryContent += 'Total ETH hashrate: ' + format_stats(eth.join(';'), null, ', ') + '<br>';
            summaryContent += 'Total DCR hashrate: ' + format_stats(dcr.join(';'), null, ', ');

            // Inject totals into HTML
            $('#minerSummary').html(summaryContent);

            // Update refresh interval if defined
            if (data.refresh !== undefined) {
                refresh = data.refresh;
            }
        },

        complete: function() {
            // Schedule the next request when the current one's complete
            setTimeout(worker, refresh);
        }

    });
}
