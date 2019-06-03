const request = require('request-promise');
const fs = require('fs'), path = require('path');

const filePath = path.join(__dirname, 'cookie');

fs.readFile(filePath, {encoding: 'utf-8'}, (err, data) => {
	if (!err) {

		data = data.replace(/(\r\n|\n|\r)/gm, "");

		let opt = {
			uri: 'https://fr.hotels.com/search/listings.json?sort-order=BEST_SELLER&f-price-currency-code=EUR&q-check-in=2019-06-03&q-check-out=2019-06-04&q-room-0-adults=1&q-room-0-children=0&q-rooms=1&q-destination=nice&pn=250&start-index=100',
			headers: {
				'cookie': `${data}`,
				'cache-control': 'no-cache',
				'User-Agent': 'PostmanRuntime/7.6.0', /** Magic Key **/
				'Accept': '*/*',
				'Connection': 'close'
			},
			json: true
		};

		console.log(opt);

		request(opt)
			.then((data) => {
				console.log(data.data.body.searchResults.tripPlannerSaveUrl);
				console.log(data.data.body.searchResults.results[0].id);
			});
	}
});
