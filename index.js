#!/usr/bin/env node
const path = require('path');
const Packages = require('./packages');
const { argv } = require('yargs');
const { cwd } = process;
const Aid = require('./helper');
const { execSync } = require('child_process');
const semver = require('semver');
const pkg = new Packages();

process.stdin.on('keypress', (ch, key) => {
    if(key && key.name === 'escape') { Aid.out('goodbye (◕‿◕✿)'); }
});

if(argv.v || argv.version) { Aid.version(); }

const location = (argv._[0]) ? path.join(cwd(), argv._[0]) : cwd();
const { devDependencies, dependencies } = Aid.retrievePackageInfo(location);

if(devDependencies === undefined && dependencies === undefined) Aid.error('No dependencies in this package.json');
pkg.storeData(devDependencies, dependencies);
pkg.getLongestLength();
pkg.printAll();

// const x = semver.valid(semver.coerce('7.0.0-bridge.0'));
// const y = execSync(`npm v babel-core@7 version`, {encoding: 'utf-8'});
// console.log(y);

