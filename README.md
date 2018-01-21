# ethmon
Claymore's Dual Ethereum+Decred GPU Miner nodejs-based web monitoring utility

## WARNING: this project is not being developed anymore. Do not expect any updates.

Simple web application for Claymore's Dual Ethereum+Decred GPU Miner monitoring. It provides the same functions as an embedded into EthMan application web server, but is cross-platform and open-source.

More info: https://bitcointalk.org/index.php?topic=1433925

Origin: https://github.com/osnwt/ethmon

## Installation
* Install nodejs and npm (http://nodejs.org) for your system (tested on MacOSX, Ubuntu and Windows)
* Clone this repository or download and extract files
* Change to the top directory of the package
* Install dependencies (npm install)
* Copy config.json.sample to config.json and edit where necessary (see CONFIG.md for detailed comments and optional parameters)
* Start the application (npm start)
* Open web browser to localhost:3000 (or your IP:3000)
* Enjoy

## Known issues
* On some Ubuntu releases after 'apt-get install npm' the node interpreter is called nodejs due to conflict with some other package. In that case you may need to replace "node ./bin/www" by "nodejs ./bin/www" in package.json file or better create a link from /usr/local/node to the nodejs binary 

## TODO
* Add email notifications of failures such like no response from miner or low hashrate
* Add a feature of restarting the miner in case of failures such like high number of rejects
* Style the web page for small screens of mobile devices (anybody?)
* Publish a release version 1.0.0
* ... please send your suggestions. Donations increase the probability of quick implementation

## Donations
If you find this utility useful, here are donation addresses:
* BTC: removed as non-actual
* ETH: removed as non-actual
