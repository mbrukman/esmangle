/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

module.exports = function (grunt) {
    'use strict';

    var path = require('path');


    grunt.extendConfig = function(update) {
        function extend(target, update) {
            return Object.getOwnPropertyNames(update).reduce(function (result, key) {
                if (key in result) {
                    result[key] = extend(result[key], update[key]);
                } else {
                    result[key] = update[key];
                }
                return result;
            }, target);
        }

        grunt.initConfig(extend(grunt.config(), update));
    };


    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'lib/**/*.js',
                '*.js',
                'test/regression/*.js'
            ],
            options: {
                jshintrc: '.jshintrc',
                force: false
            }
        },
        mochaTest: {
            files: ['test/*.js']
        },
        mochaTestConfig: {
            options: {
                reporter: 'spec'
            }
        },
        shell: {
            browserify: {
                command: 'node_modules/.bin/browserify tools/entry.js -o build/esmangle.js',
                stdout: true,
                stderr: true
            },
            esmangle: {
                command: 'bin/esmangle.js build/esmangle.js -o build/esmangle.min.js',
                stdout: true,
                stderr: true
            }
        }
    });

    // load regression tests config
    grunt.loadTasks(path.join('test', 'regression'));

    grunt.registerMultiTask('git_reset_hard', function () {
        var options = this.options(),
            done = this.async(),
            cwd = this.data.cwd;
        grunt.verbose.writeln('Resetting ' + cwd + ' ...');
        grunt.util.spawn({
            cmd: 'git',
            args: ['reset', '--hard'],
            opts: {
                cwd: cwd
            }
        }, function (error) {
            if (error) {
                grunt.verbose.error(error);
                done(error);
                return;
            }
            done();
        });
    });

    grunt.registerTask('directory:build', 'create build directory', function () {
        grunt.file.mkdir('build');
    });

    grunt.registerTask('browserify', ['directory:build', 'shell:browserify']);

    // load tasks
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-update-submodules');
    grunt.loadNpmTasks('grunt-shell');

    // alias
    grunt.registerTask('test:regression', [
        'test:regression:esmangle',
        'test:regression:q'
    ]);
    grunt.registerTask('test', 'mochaTest');
    grunt.registerTask('lint', 'jshint');
    grunt.registerTask('build', ['browserify', 'shell:esmangle']);
    grunt.registerTask('travis', ['lint', 'test', 'test:regression']);
    grunt.registerTask('default','travis');
};
/* vim: set sw=4 ts=4 et tw=80 : */
