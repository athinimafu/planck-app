//require('load-grunt-tasks')(); // npm install --save-dev load-grunt-tasks
module.exports = grunt => { 
    grunt.initConfig({
        pkg:grunt.file.readJSON("package.json"),
        'babel': {
            options: {
              sourceMap: true,
              presets: ['@babel/preset-env']
            },
            dist: {
              files: {
                'main.js':'src/main.js',
                'dist/app.js': 'src/app.js',
                "dist/directoryActions.js":"src/directoryActions.js",
                "dist/languages/index.js":"src/languages/index.js",
                "dist/languages/base.js":"src/languages/base.js",
                "dist/languages/regex.js":"src/languages/regex.js",
                "dist/languages/html/index.js":"src/languages/html/index.js",
                "dist/languages/js/index.js":"src/languages/js/index.js",
                "dist/languages/js/JsCompiler.js":"src/languages/js/JsCompiler.js",
                "dist/languages/js/ReactHandling.js":"src/languages/js/ReactHandling.js",
                "dist/ChildProcessUpdater.js":"src/ChildProcessUpdater.js",
                'dist/components/index.js':'src/components/index.js',
                'dist/components/WelcomeComponent.js':'src/components/WelcomeComponent.js',
                'dist/db/db.js':'src/db/db.js',
                'dist/db/index.js':'src/db/index.js',
                'dist/db/sessionState.js':'src/db/sessionState.js',
                "dist/db/directory.js":"src/db/directory.js",
                'dist/directory.js':'src/directory.js',
                'dist/events.js':'src/events.js',
                'dist/renderer.js':'src/renderer.js',
                'dist/icons/angryMoon.jsx':'dist/icons/angryMoon.jsx',
                "dist/icons/openDir.jsx":"dist/icons/openDir.jsx",
                "dist/icons/closedFolder.jsx":"dist/icons/closedFolder.jsx",
                "dist/icons/Infinity.jsx":"dist/icons/Infinity.jsx",
                "dist/icons/flower.jsx":"dist/icons/flower.jsx",
                "dist/icons/javascript.jsx":"dist/icons/javascript.jsx",
                "dist/icons/edit.jsx":"dist/icons/edit.jsx",
                "dist/components/Directory.view.js":"src/components/Directory.view.js",
                "dist/components/TextEditorComponent.js":"src/components/TextEditorComponent.js",
                "dist/icons/CssIcon.jsx":"dist/icons/CssIcon.jsx",
                "dist/icons/HtmlIcon.jsx":"dist/icons/HtmlIcon.jsx",
                "dist/icons/JsonIcon.jsx":"dist/icons/JsonIcon.jsx",
                "dist/icons/CancelIcon.jsx":"dist/icons/CancelIcon.jsx",
                "dist/icons/Saved.jsx":"dist/icons/Saved.jsx",
                "dist/icons/UnSaved.jsx":"dist/icons/UnSaved.jsx",
                "dist/icons/JsIcon.jsx":"dist/icons/JsIcon.jsx",
                "dist/icons/runFile.jsx":"dist/icons/runFile.jsx",
                "html-renderer.js/renderer.js":"src/html-renderer.js/renderer.js",
                "js-renderer.js/renderer.js":"src/js-renderer.js/renderer.js",
                "dist/components/Model.view.js":"src/components/Model.view.js",
                //'dist/icons.':'src/'
                'dist/index.js':'src/index.js',
                'preload.js':"src/preload.js"
              }
            }
        }
    });

    grunt.loadNpmTasks("grunt-babel")
 
    grunt.registerTask('default', ['babel']);
}