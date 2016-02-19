describe('cstTooltipHelpFct', function () {
  var helper;

  beforeEach(module('cst.tooltip'));

  beforeEach(inject(function (cstTooltipHelpFct) {
    helper = cstTooltipHelpFct;
  }));

  describe('.placeInBoard', function () {

    it('is function' , function () {
      expect(typeof helper.placeInBoard).toBe('function');
    })

  })
});
