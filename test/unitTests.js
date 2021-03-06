const { expect } = require('chai');
const path = require('path');
const Packages = require('./../packages');
const Helpers = require('./../helper');

describe('Unit Tests', () => {
  	describe('Helper functions...', () => {
		describe('retrievePackageInfo(location)', () => {
			it('should not throw error with a path if there is a package.json', () => {
				const loc = path.join(process.cwd());
				const result = Helpers.retrievePackageInfo(loc);
				expect(result).not.to.be.instanceOf(Error);
				expect(result).not.equal(undefined);
			});
			it('should throw error with a path if there is not a package.json', () => {
				const loc = path.join(process.cwd(), '/../');
				expect(Helpers.retrievePackageInfo.bind(loc)).to.throw(Error);
			});
		});
	});
	describe('Packages class functions...', () => {
		let pkg;
		beforeEach(() => {
			pkg = new Packages;
		});
		describe('getMax()', () => {
			it('this.longest should be the max key length in an object if some keys are > 12 (default)', () => {
				const obj = { testtttesttttesttt: true };
				pkg.getMax(obj);
				expect(pkg.longest).to.equal(18);
			});
			it('this.longest should be 12 (default) if none of the key lengths in obj > 12', () => {
				const obj = { testtesttt: true };
				pkg.getMax(obj);
				expect(pkg.longest).to.equal(12);
			});
		});
	});
});