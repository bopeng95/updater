const chalk = require('chalk');
const readPkg = require('read-pkg');
const logSymbols = require('log-symbols');
const { execSync } = require('child_process');
const execa = require('execa');
const Listr = require('listr');
const ipt = require('ipt');
const log = console.log;

module.exports = {
    error: function(msg, type = 'error') {
        return (`\n${logSymbols[type]} ${chalk.bold.red(msg)}\n`);
    },
    out: function(msg) {
        return (`\n${chalk.bold.magenta(msg)}`);
    },
    version: function() {
        return (`\n${logSymbols.info} ${chalk.bold.green('version:')} ${readPkg.sync().version}\n`);
    },
    retrievePackageInfo: function(loc) {
        try { return readPkg.sync({ cwd: loc }); }
        catch(e) { log(this.error(e.message)); process.exit(1); }
    },
    processUserRequest: function(req, input, pkg, loc) {
        let stableDev;
        let stableDep;
        switch (req) {
            case input[0]:
                pkg.concatPackages(input[0]);
                stableDev = pkg.stable[0];
                stableDep = pkg.stable[1];
                confirm(stableDev, stableDep, input[0], loc);
                break;
            case input[1]:
                pkg.concatPackages(input[1]);
                recentDev = pkg.recent[0];
                recentDep = pkg.recent[1];
                confirm(recentDev, recentDep, input[1], loc);
                break;
            default:
                log(`\n${logSymbols.success} ${chalk.bold('Goodbye!')}\n`);
                process.exit(0);
        }
    }
}

function confirm(dev, dep, type, loc) {
    const devd = (dev.length > 9) ? `${dev}` : '';
    const depd = (dep.length > 9) ? `${dep}` : '';
    if(devd === '' && depd === '') {
        log(`\n${logSymbols.success} ${chalk.bold('Already up to date, byebye')}\n`);
        process.exit(0);
    } 
    log(`\n${devd}\n${depd}\n`);
    const input = ['yes', 'no'];
    ipt(input, { message: `Confirm ${type} update commands` })
    .then(options => { endProcess(options[0], type, loc, devd, depd) })
    .catch(err => { throw err.message; });
}

function endProcess(input, type, loc, dev, dep) {
    if(input === 'yes') {
        const list = [];
        const devd = dev.split(' ').slice(3);
        const depd = dep.split(' ').slice(3);
        if(dev.length > 9) list.push({
            title: 'Installing devDependencies...',
            task: () => {
                const arr = [];
                for(let i = 0; i < devd.length-1; i++) {
                    arr.push({
                        title: devd[i],
                        task: () => execa('npm', ['i', '-D', devd[i]], { cwd: loc })
                                    .catch(err => { throw err.message; })
                    })
                } return new Listr(arr);
            }
        });
        if(dep.length > 9) list.push({
            title: 'Installing dependencies...',
            task: () => {
                const arr = [];
                for(let i = 0; i < depd.length-1; i++) {
                    arr.push({
                        title: depd[i],
                        task: () => execa('npm', ['i', '-D', depd[i]], { cwd: loc })
                                    .catch(err => { throw err.message; })
                    })
                } return new Listr(arr);
            }
        }); log();
        new Listr(list).run()
        .then(() => { log(`\n${logSymbols.success} ${chalk.bold(`Finished installing ${type} package versions`)}\n`); })
        .catch(err => { throw err.message; })
    } else { log(`\n${logSymbols.success} Not running the installs, byebye\n`) }
}