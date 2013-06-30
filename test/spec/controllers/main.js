'use strict';

describe('Controller: MainCtrl', function () {

    // load the controller's module
    beforeEach(module('gitopen'));

    var IndexCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        IndexCtrl = $controller('IndexCtrl', {
            $scope: scope,
            socket: socket,
            flash: { emit: jasmine.createSpy() }
        });
    }));

    it('should foo when bar', function() {
        expect(true).toBe(false);
    });
});
