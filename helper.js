const chalk = require('chalk');
const readPkg = require('read-pkg');
const log = console.log;

module.exports = {
    error: function(msg) {
        log(`\n${chalk.black.bgRed(msg)}\n`);
        process.exit(1);
    },
    out: function(msg) {
        log(`\n${chalk.black.bgCyan(msg)}\n`);
        process.exit(0);
    },
    version: function() {
        log(`\n${chalk.black.bgGreen('version:')}  ${readPkg.sync().version}\n`);
        process.exit(0);
    },
    retrievePackageInfo: function(loc) {
        try { return readPkg.sync({ cwd: loc }); }
        catch(e) { 
            this.error(e.message); 
            process.exit(1);
        }
    },
}