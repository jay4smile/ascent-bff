#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const execSync = require('child_process').execSync;

function filewalker(dir, done) {
    let results = [];

    fs.readdir(dir, function(err, list) {
        if (err) return done(err);

        var pending = list.length;

        if (!pending) return done(null, results);

        list.forEach(function(file){
            file = path.resolve(dir, file);

            fs.stat(file, function(err, stat){
                // If directory, execute a recursive call
                if (stat && stat.isDirectory()) {
                    // Add directory to array [comment if you need to remove the directories from the array]
                    results.push(file);

                    filewalker(file, function(err, res){
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);

                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

const ext = ['.csv', '.json', '.xlsx', '.xls', '.ipynb', 'txt']
filewalker(`${__dirname}/../data`, function(err, data){
    if(err){
        throw err;
    }
    const toReplace = __dirname.split('/').slice(0,-1).join('/');
    data = data.map(filename => filename.replace(`${toReplace}/`, ''))
    console.log(data);
    data.forEach((filename) => {
        if (ext.includes(path.extname(filename))) {
            const output = execSync(`git filter-repo --path "${filename}" --invert-paths --force`, { encoding: 'utf-8' });
            console.log('Output was:\n', output);
        }
    });
});