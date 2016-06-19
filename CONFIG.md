# config.json options
Please notice that this sample will not work since contains comments not permitted in json files. Copy config.json.sample to config.json and modify to suit your needs.

```javascript
{
    // Optional console log level (FATAL, ERROR, WARN, INFO, TRACE). Default is INFO
    "log_level": "WARN",

    // The title of web app window. %HR% if found will be replaced by total ETH hashrate in MH/s.
    // %ANI% will be replaced by animation string (see below for details)
    "title": "%HR% MH/s - Miner Monitor",

    // Animation string array with any number of strings. Each string will be used in an animation
    // sequence and change on every web_refresh interval. The value of string will replace the
    // %ANI% placeholder in the window title string, if found
    "animation": [ "/", "-", "\\", "|" ],

    // The header of the page. If missing, title option will be used. %HR% will be replaced too
    "header": "Miner Monitor",

    // Default miner poll interval in ms
    "miner_poll": 5000,

    // Default miner poll timeout in ms
    "miner_timeout": 1000,

    // Web page refresh interval in ms
    "web_refresh": 5000,

    // Optional hashrate tolerance to target hashrates in %.
    // Actual hashrate will be painted if out of bounds (target +/- tolerance)
    // Missing or zero value disables hashrate check.
    "tolerance": 5,

    // Optional temperature monitor threshold (no checks if unset or zero)
    "temperature": 70,

    // Display detailed GPU hashrates if true
    "hashrates": false,

    // Miners configuration. Use one {} block per miner
    "miners": [
        {
            // Miner name
            "name": "rig01",

            // Miner host and port. IP address or domain name can be used
            "host": "10.0.0.15",
            "port": 3333,

            // If defined and not empty, report this as a host name instead of IP:port
            "hostname": "private:3333",

            // Optional target hashrates in MH/s
            "target_eth": 118,
            "target_dcr": 2700,

            // Miner comments. Use '<br>' for line breaks
            "comments": "ASUS 7950<br>Sapphire 390X<br>Sapphire 390X<br>Sapphire 390",

            // Optional setting to declare a miner as temporary offline.
            // This miner will be shown in a table but no polls will be performed.
            // Can be false or empty string if online, or "some message" if offline (will be shown).
            "offline": false,

            // Optional miner-specific overrides for default miner_poll and miner_timeout values
            "poll": 3000,
            "timeout": 500
        },
        {
            // Similar setting for other miners
            "name": "rig02",
            // ...
        }
    ]
}
```
