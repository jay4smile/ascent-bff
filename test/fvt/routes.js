/**
 * Copyright 2016, 2017,2018 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var assert = require('chai').assert,
    superagent = require('superagent'),
    app = require('../../server/server');

var expected = require('../../dashclinic.json');
describe('Memory DB', function()  {
	var server;
	beforeEach(function(done) {
		server = app.listen(done);
	});

	afterEach(function(done) {
		server.close(done);
	});

	it('should return a list of users', function(done) {
		var url = 'http://localhost:3000/api/users',
			headers;
		superagent
			.get(url)
			.end(function (err, res){
				if(err){
					console.log(err.status);
					done(err);
				} else {
						headers = res.headers;

						assert.equal(res.statusCode, 200);
						//assert.equal(JSON.stringify(res.body.length), JSON.stringify(expected.docs.length));
						done();
					}
			});
    });
});


