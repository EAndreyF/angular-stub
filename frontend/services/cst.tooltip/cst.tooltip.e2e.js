var config = require('config');
var page = config.get('host');

console.log(page);

describe('angular-stub page', function() {
  beforeEach(function () {
    browser.get(page);
  });

  it('shouldn\'t be empty', function() {
    var completedAmount = element.all(by.css('.cst-tooltips'));
    expect(completedAmount.count()).toEqual(1);
  });

  it('tooltip should appear after click on first cell', function () {
    element.all(by.css('.table-cell')).get(2).click();
    var completedAmount = element.all(by.css('.cst-tooltip'));
    expect(completedAmount.count()).toEqual(1);
  });
});
