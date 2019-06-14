## **ScrapingEngine**

 - **Scraping System**
	- 

	You can enable the scraping with the following options:

	 1. With RabbitMQ message on the Scraping Exchange and Scraping Queue :
		 
			 {
				name: 'Negresco',
				city: 'Nice',
				rate: 5,
			 }
	2. With a command :
				
		- `npm run hotelscom <checkin> <checkout> <adults> <children> <country> <city>`
		- `npm run trip <checkin> <checkout> <adults> <children> <country> <city>`
		
	Date Format: YYYY-MM-DD

 - **Express API**
	 - 

	
	Access Hotels datas with the following route:
	
		http://localhost:8181/hotels/:city
	
	Three possible responses:
	
	1. City doesn't exists:
	 
			{
				"status": -1
			}
	2. Process is running (City scraping running):
	 
			{
			    "current": 18,
			    "max": 2614,
			    "percent": 1,
			    "eta": 78,
			    "chunk": 8,
			    "perChunk": 0.6,
			    "running": [
					 {
			            "offsets": [
			                7,
			                9
			            ],
			            "freq": [
			                0.704,
			                0.6
			            ],
			            "_id": "5cead8b43ba5837c3d8747ae",
			            "name": "hotels.com",
			            "max": 2614,
			            "current": 18,
			            "chunk": 8,
			            "perChunk": 0.6,
			            "index": 1,
			            "city": "5c928f651619cbfa5153e3ab",
			            "eta": -1,
			            "running": true,
			            "createdAt": "2019-05-26T18:19:32.419Z",
			            "updatedAt": "2019-05-26T18:19:34.158Z",
			            "__v": 0
			        }
			    ],
			    "status": 1
			}
	3. Process finished, all hotels:
		
			{
			    "data": [
			        {
			            "engines": [
			                {
			                    "name": "Hotels.com",
			                    "id": 216329,
			                    "price": "252 €",
			                    "rate": "8,2",
			                    "reviews": 266
			                }
			            ],
			            "_id": "5cead8b33ba5837c3d8747a7",
			            "name": "Villa Bougainville by Happyculture",
			            "address": "29 Avenue Thiers Nice 06000 Alpes-Maritimes France",
					     "city": "5c928f651619cbfa5153e3ab",
			            "rate": 4,
			            "createdAt": "2019-05-26T18:19:31.916Z",
			            "updatedAt": "2019-05-26T18:19:31.916Z",
			            "__v": 0
			        },
			        {
			            "engines": [
			                {
			                    "name": "Hotels.com",
			                    "id": 347211,
			                    "price": "100 €",
			                    "rate": "8,8",
			                    "reviews": 88
			                }
			            ],
			            "_id": "5cead8b43ba5837c3d8747a8",
			            "name": "Hotel Du Centre",
			            "address": "2 Rue De Suisse Nice 06000 Alpes-Maritimes France",
			            "city": "5c928f651619cbfa5153e3ab",
			            "rate": 2,
			            "createdAt": "2019-05-26T18:19:32.068Z",
			            "updatedAt": "2019-05-26T18:19:32.068Z",
				        "__v": 0
			       },
			   ]
			}
