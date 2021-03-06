exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'frontend/**/*.e2e.js'
  ],

  capabilities: {
    'browserName': 'chrome'
  },

  baseUrl: 'http://localhost:8004/app/',

  framework: 'jasmine',

  rootElement: '[ng-app]',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
