# config.json options
Please notice that this sample will not work since contains comments not permitted in json files. Copy config.json.sample to config.json and modify to suit your needs.

```javascript
{
    // The title of web app window and table header
    "title": "Miner Monitor",

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

    // Miners configuration. Use one {} block per miner
    "miners": [
        {
            // Miner name
            "name": "rig01",

            // Miner host and port. IP address or domain name can be used
            "host": "10.0.0.15",
            "port": 3333,

            // Optional target hashrates in MH/s
            "target_eth": 118,
            "target_dcr": 2700,

            // Miner comments. Use '<br>' for line breaks
            "comments": "ASUS 7950<br>Sapphire 390X<br>Sapphire 390X<br>Sapphire 390",

            // Optional setting to declare a miner as temporary offline.
            // This miner will be shown in a table but no polls will be performed.
            "offline": true,

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
