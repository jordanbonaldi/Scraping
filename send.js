const rabbit = require('amqplib/callback_api');

rabbit.connect('amqp://localhost', (err, conn) => {

	conn.createChannel((err, ch) => {

		let obj = {
			name: 'Negresco',
			city: 'Nice',
			classement: '5',
		}
		ch.sendToQueue('scraping', Buffer.from(JSON.stringify(obj)));
	});
});
