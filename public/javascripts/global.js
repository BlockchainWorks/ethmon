
// Default web refresh interval (may be changed with web_refresh config option)
var refresh = 5000;

// Default hashrate tolerance (+/- to target hashrate)
var tolerance = 0.05;

// GPU temperature monitoring threshold (zero disables monitoring)
var temperature = 0;

// Title animation index
var animation_index = 0;

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
            var hashrate = Number(s[0] / 1000).toFixed(2) + '&nbsp;MH/s';
            var shares = s[1] + '/' + s[2];
            var rejects = (s[1] > 0) ? ('&nbsp;(' + Number(s[2] / s[1] * 100).toFixed(2) + '%)') : '';

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

    function format_temps(temps, splitter, ti) {
        if (!splitter) {
            splitter = ' ';
        }
        var tf = '';
        if (temps) {
            var t = temps.split(';');
            var tnum = ti ? ti.length : (t.length / 2);
            for (var i = 0; i < tnum; ++i) {
                var j = (ti ? ti[i] : i) * 2;
                var temp = t[j] + 'C';
                var fan = t[j + 1] + '%';
                if (temperature && (t[j] > temperature)) {
                    temp = '<span class="error">' + temp + '</span>';
                }
                tf += ((i > 0) ? splitter : '') + temp + ':' + fan;
            }
        }
        return tf;
    }

    function format_hashrates(hr, splitter, skip) {
        if (!splitter) {
            splitter = ' ';
        }
        var hashrates = '';
        if (!skip && hr) {
            var h = hr.split(';');
            for (var i = 0; i < h.length; ++i) {
                hashrates += ((i > 0) ? splitter : '') + (Number(h[i] / 1000).toFixed(2) + '&nbsp;MH/s');
            }
        }
        return hashrates;
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
            var warning = { msg: null, last_good: null };
            var error = { msg: null };

            var tableContent = '';
            $.each(data.miners, function(index, miner) {
                if (miner !== null) {
                    var error_class = (miner.error == null) ? '' : ' class=error';
                    var span = (data.hashrates) ? 8 : 6;

                    tableContent += '<tr' + error_class + '>';
                    tableContent += '<td>' + miner.name + '</td>';
                    tableContent += '<td>' + miner.host + '</td>';

                    if (miner.warning) {
                        // Only single last good time is reported for now
                        warning.msg = miner.warning;
                        warning.last_good = miner.last_good;
                    }

                    if (miner.error) {
                        error.msg = miner.error;
                        last_seen = '<br>Last seen: ' + miner.last_seen;
                        tableContent += '<td colspan="' + span + '">' + miner.error + last_seen + '</td>';
                    } else if (miner.offline) {
                        tableContent += '<td colspan="' + span + '">' + miner.offline + '</td>';
                    } else {
                        tableContent += '<td>' + miner.uptime + '</td>';
                        tableContent += '<td>' + format_stats(miner.eth, eth, miner.target_eth, '<br>') + '</td>';
                        tableContent += '<td>' + format_stats(miner.dcr, dcr, miner.target_dcr, '<br>', !miner.pools.split(';')[1]) + '</td>';
                        if (data.hashrates) {
                            tableContent += '<td>' + format_hashrates(miner.eth_hr, '<br>') + '</td>';
                            tableContent += '<td>' + format_hashrates(miner.dcr_hr, '<br>', !miner.pools.split(';')[1]) + '</td>';
                        }
                        tableContent += '<td>' + format_temps(miner.temps, '<br>', miner.ti) + '</td>';
                        tableContent += '<td>' + format_pools(miner.pools, '<br>') + '</td>';
                        tableContent += '<td>' + miner.ver + '</td>';
                    }
                    tableContent += '<td>' + miner.comments + '</td>';
                    tableContent += '</tr>';
                }
            });

            // Inject the whole content string into existing HTML table
            $('#minerInfo table tbody').html(tableContent);

            // Update window title and header with hashrate substitution
            var title = data.title.replace('%HR%', Number(eth[0] / 1000).toFixed(0));
            if (error.msg !== null) {
                title = 'Error: ' + title;
            } else if (warning.msg !== null) {
                title = 'Warning: ' + title;
            }
            if (data.animation) {
                var c = data.animation[animation_index];
                animation_index = (animation_index + 1) % data.animation.length;
                title = title.replace('%ANI%', c);
            }
            if ($('title').html() !== title) {
                $('title').html(title);
            }

            var header = data.header.replace('%HR%', Number(eth[0] / 1000).toFixed(0));
            if ($('#minerInfo h2').html() !== header) {
                $('#minerInfo h2').html(header);
            }

            // Update summary
            var summaryContent = '';
            summaryContent += 'Total ETH/ETC hashrate: ' + format_stats(eth.join(';'), null, null, ', ') + '<br>';
            summaryContent += 'Total DCR/SIA hashrate: ' + format_stats(dcr.join(';'), null, null, ', ');
            $('#minerSummary').html(summaryContent);

            // Display last update date/time and warning message
            var lastUpdated = 'Last updated: ' + data.updated +
                ((warning.msg !== null) ? ('<br><span class="error">' + warning.msg + ', last seen good: ' + warning.last_good + '</span>') : '');
            $('#lastUpdated').html(lastUpdated).removeClass("error");

            // Update refresh interval if defined
            if (data.refresh !== undefined) {
                refresh = data.refresh;
            }
        },

        error: function() {
            // Mark last update time with error flag
            $('#lastUpdated').addClass("error");
            $('title').html('FATAL: No response from server');
        },

        complete: function() {
            // Schedule the next request when the current one's complete
            setTimeout(worker, refresh);
        }

    });
}
