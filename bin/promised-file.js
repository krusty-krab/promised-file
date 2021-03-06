#!/usr/bin/env node
'use strict';

var fs = require('fs');
var Promise = require('promise');
var globThen = Promise.denodeify(require('glob'));
var f = require('funky');

module.exports = {
  getFile: getFile
};

if (require.main === module) {

  var fileArg = process.argv[2];

  var getFileRunner = runIf(getFile.bind(null, fileArg));

  var pred = f.truthy.bind(null, fileArg);

  getFileRunner(pred)
    .then(logReponse)
    .catch(handleError)
    .done();

}

/**
 * Gets the file specified on process.argv[2].
 * The returned promise rejects on an empty file.
 * @param {String} filePath Path to the file.
 * @returns {Promise}
 */
function getFile(filePath) {
  return globThen(filePath)
    .then(readFile)
    .then(function returnPromise (file) {
      return file;
    });
}

/**
 * Gets the contents of a file using a promise that wraps fs.readFile().
 * @param {Object|Array} file
 * @returns {Promise}
 */
function readFile(file) {

  return new Promise(function (resolve, reject) {
    fs.readFile(file.path || file[0], 'utf8', function (err, res) {
      if (err) reject(err);
      if (res === "") reject("File empty: " + file);
      else resolve(res);
    });
  });

}

/**
 * Higher order function (HOF) that takes a function, and runs the function if
 * the predicate is true.
 * @param {Function} f
 * @returns {Function}
 */
function runIf (f) {

  return function runFuncIf (predicate) {

    if (predicate()) return f();

  }

}

function handleError (err) {
  console.log('### Error: \n\t%s', err);
}

function logReponse (response) {
  console.log('### File [%s]: \n\t%s', fileArg, response);
}
