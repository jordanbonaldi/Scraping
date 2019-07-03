const rabbit = require('amqplib/callback_api');


rabbit.connect('amqp://localhost', (err, conn) => {

	conn.createChannel((err, ch) => {

		let obj = {
			city: 'lille',
			country: 'France',
			from: '2019-07-03',
			to: '2019-07-04',
			adults: '1',
			children: '0',
		}
		ch.sendToQueue('scraping', Buffer.from(JSON.stringify(obj)));
	});
	console.log("end");
});
