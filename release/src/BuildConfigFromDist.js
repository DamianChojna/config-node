'use strict';
const fs = require("fs");
const p = require("path");
const _ = require("lodash");
const ini = require("ini-config-parser");
const yml = require("js-yaml");
class BuildConfigFromDist {
    merge(inputFile) {
        if (!fs.existsSync(inputFile)) {
            throw Error(BuildConfigFromDist.errorMessages.fileNotExist + inputFile);
        }
        var inputObject = this.parseFile(inputFile);
        let outputFileName = p.basename(inputFile);
        var outputFile = p.join(p.dirname(inputFile), this.resolveOutputFileName(outputFileName));
        if (fs.existsSync(outputFile)) {
            var outputObject = this.parseFile(outputFile);
        }
        var merged = _.merge(inputObject, outputObject);
        fs.writeFileSync(outputFile, JSON.stringify(merged));
    }
    parseFile(path) {
        const ext = p.extname(path);
        if (!(ext in BuildConfigFromDist.parsers)) {
            throw new Error(`Not support ${ext} format files please use some of ${Object.keys(BuildConfigFromDist.parsers).join(',')}`);
        }
        try {
            const content = fs.readFileSync(path, 'utf8');
            return BuildConfigFromDist.parsers[ext](content);
        }
        catch (e) {
            throw new Error(BuildConfigFromDist.errorMessages.problemWithFile + path);
        }
    }
    resolveOutputFileName(filename) {
        let splited = filename.split('.');
        if (splited.indexOf("dist") === -1) {
            throw new Error(BuildConfigFromDist.errorMessages.notValidDistFileName + filename);
        }
        splited.splice(splited.indexOf('dist'), 1);
        return splited.join('.');
    }
    isDist(path) {
        let splited = p.basename(path).split('.');
        if (splited.indexOf("dist") === -1) {
            return false;
        }
        return true;
    }
}
BuildConfigFromDist.errorMessages = {
    fileNotExist: 'Given file does not exist: ',
    problemWithFile: 'Problem with read or parse, check file path or check the syntax of the file',
    notValidDistFileName: 'Given file name does not contain the "dist" word: '
};
BuildConfigFromDist.parsers = {
    '.ini': ini.parse,
    '.yml': yml.safeLoad,
    '.yaml': yml.safeLoad,
    '.json': JSON.parse
};
exports.BuildConfigFromDist = BuildConfigFromDist;
//# sourceMappingURL=BuildConfigFromDist.js.map