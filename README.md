## Base project for angular

[![Build Status](https://travis-ci.org/EAndreyF/angular-stub.svg?branch=master)](https://travis-ci.org/EAndreyF/angular-stub)
[![Dependencies](https://david-dm.org/EAndreyF/angular-stub.png)](https://david-dm.org/EAndreyF/angular-stub)
[![Heroku](https://heroku-badge.herokuapp.com/?app=ea-angular-stub)](http://ea-angular-stub.herokuapp.com/)

### Install
- `npm i`
- `bower i`
- `gem install slim --no-ri --no-rdoc`
For e2e tests
- `brew install selenium-server-standalone`
 - check java version, try to run `selenium-server -port 4444`
 - update webdriver `./node_modules/.bin/webdriver-manager update`

### Run
- dev: `npm run dev`
- prod: `npm run prod`
- unit tests: `npm test`
- debug unit tests: `npm test_debug`
- e2e tests: `npm test_e2e` should run `selenium-server -port 4444`

Open page on http://localhost:8003

### Deploy on heroku
-  heroku buildpacks:set https://github.com/heroku/heroku-buildpack-multi.git
