const Query = require('./Query');
const SearchData = require('./SearchData');
const Generator = require('./Generator');
const request = require('request-promise');

class Engine {
    /**
     *
     * @param url
     * @param defaultUrl
     * @param queries
     */
    constructor(url, defaultUrl, ...queries) {
        this._url = url;
        this._defaultUrl = defaultUrl;
        this._query = new Query(...queries);
    }

    /**
     *
     * @param data
     */
    parseSite(data = null) {
        return false
    };

    /**
     *
     * @param data
     */
    getBasicInformation(data = null) {
        return {offset: 0, max: 0}
    }

    _getCookie() {
        let opt = {
            uri: this._defaultUrl,
            headers: {
              'cache-control': 'no-cache',
              'User-Agent': 'PostmanRuntime/7.6.0', /** Magic Key **/
              'Accept': '*/*',
              'Host': 'fr.hotels.com',
              'Connection': 'close'
            },
            resolveWithFullResponse: true
        };

        /**
         * NOT GENERIC (GUID AND SESSID)
         */

        return request(opt)
            .then(response => {
                return response.caseless.dict['set-cookie']
            }).then((array) => {
                return array.map((e) =>
                    e.split(';')[0]
                )
            }).then((a) => {
                return a.join(';');
            })
    }

    /**
     *
     * @param url
     * @returns {Promise|*|PromiseLike<any | never>|Promise<any | never>}
     * @private
     */
    _request(url) {
        return this._getCookie().then((cookies) => {
            console.log(cookies);
            let opt = (_url) => {
                return {
                    uri: _url,
                    headers: {
                        'cookie': `${cookies}`,
                        'cache-control': 'no-cache',
                        'User-Agent': 'PostmanRuntime/7.6.0', /** Magic Key **/
                        'Accept': '*/*',
                        'Host': 'fr.hotels.com',
                        'Connection': 'close'
                    },
                    json: true
                }
            };

            return request(opt(url)).then((data) => {
                let urls = [];
                console.log(data);
                let {offset, max} = this.getBasicInformation(data);


                for (let i = 0; i < max; i ++)
                    urls.push(this._generator.addOffSet(i * offset));

                let promises = urls.map(url => request(opt(url)));

                Promise.all(promises).then(data => {
                    data.forEach(e => {
                        this.parseSite(e)
                    })
                })
            })
        })
    }

    /**
     *
     * @param city {String}
     * @param checkin {Date}
     * @param checkout {Date}
     * @param adults {Number}
     * @param children {Number}
     * @param rooms {Number}
     * @param callback {CallableFunction}
     */
    search(
        city,
        checkin = null,
        checkout = null,
        adults = 1,
        children = 0,
        rooms = 1,
        callback = null
    ) {
        if (checkin === null)
            checkin = new Date();

        if (checkout === null) {
            checkout = new Date();
            checkout.setDate(checkin.getDate() + 1)
        }

        this._searchData = new SearchData(
            checkin,
            checkout,
            adults,
            children,
            rooms,
            city
        );

        this._generator = new Generator(this._url, this._searchData, this._query);

        this._generator.generateUrl(callback);

        return this._request(this._generator.baseUrl);
    }

}

/**
 *
 * @type {Engine}
 */
module.exports = Engine;
