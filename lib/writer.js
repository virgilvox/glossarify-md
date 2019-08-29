const fs = require("fs-extra");
const path = require("path");
const proc = require("process");

const CWD = proc.cwd();
const api = {};
api.writeOutput = function(context) {
    const {opts, vFiles} = context;
    const {outDir} = opts;
    return Promise.all(
        vFiles.map((vFile) => new Promise((resolve, reject) => {
            const p = path.resolve(outDir, vFile.path);
            fs.outputFile(p, vFile.toString(), (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(context);
                }
            })})
        )
    ).then(() => context);
}

/**
 * Writes some additional files in test mode.
 * @param {} context
 */
api.writeTestOutput = function (context) {
    const {outDir, test} = context.opts;
    if (! test)
        return;

    const termsFile = path.resolve(outDir, "terms.json");
    Object.values(context.glossaries).forEach(gloss => {
        gloss.basePath = `/{redacted}/${path.relative(CWD, gloss.basePath)}`;
        gloss.outPath  = `/{redacted}/${path.relative(CWD, gloss.outPath )}`;
    });
    return new Promise((resolve, reject) => {
        fs.outputFile(termsFile, JSON.stringify(context.terms, null, 2)+ "\n", (err) => {
            err ? reject(err) : resolve(context);
        });
    });
}

module.exports = api;