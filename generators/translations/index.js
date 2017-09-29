'use strict';
const Generator = require('yeoman-generator');
const util = require('../../util');
const mkdirp = require('mkdirp');
const fs = require('fs');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('base-directory', {
      desc: 'Where to install the files',
      type: String,
      defaults: '.'
    });
    this.option('locales', {
      desc: 'available locales',
      type: Array
    });
  }

  prompting() {
    const prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'Translation Keyspace Name',
        default: this.appname.replace(/\s+/g, '-') // Default to current folder name
      },
      {
        type: 'input',
        name: 'serviceUri',
        message: 'Service-Widget URI',
        default: '/service/widget/' // Default to current folder name
      }
    ];

    return this.prompt(prompts).then(answers => {
      this.name = answers.name;
      this.serviceUri = answers.serviceUri;
    });
  }

  writing() {
    mkdirp(`${this.options['base-directory']}/src/locales`);
    this.fs.copy(
      this.templatePath('registerTranslations.js'),
      this.destinationPath(
        `${this.options['base-directory']}/src/registerTranslations.js`
      )
    );
    const locales = this.options.locales || ['de', 'en'];
    locales.map(locale => {
      return this.fs.copyTpl(
        this.templatePath('translation.json'),
        this.destinationPath(
          `${this.options['base-directory']}/src/locales/${locale}.json`
        ),
        {
          name: this.name
        }
      );
    });
    this._mergeMainFile();
    this._addJsonLoader();
    this._adjustLoaderConf();
  }
  _mergeMainFile() {
    const renderConfig = {
      file: this.destinationPath(`${this.options['base-directory']}/src/main.js`),
      needle: "window.moduleLoader.onLoad('store')",
      splicable: [
        "import counterpart from 'counterpart'",
        "import registerTranslations from './registerTranslations'",
        `registerTranslations('${this.name}')`,
        'Object.assign(counterpart, window.counterpart)'
      ]
    };

    util.rewriteFile(renderConfig);
  }
  _addJsonLoader() {
    const pathfs = this.destinationPath(
      `${this.options['base-directory']}/config/webpack.config.js`
    );
    if (!fs.existsSync(pathfs)) {
      return;
    }
    const renderConfig = {
      file: pathfs,
      needle: 'module.exports = webpackConfig',
      splicable: [
        'webpackConfig.modules.loaders.push({',
        '    test: /\\.json$/',
        '    exclude: /node_modules/,',
        "    loader: 'json-loader',",
        '})'
      ]
    };

    util.rewriteFile(renderConfig);
  }
  _adjustLoaderConf() {
    mkdirp(`${this.options['base-directory']}/config`);

    this.fs.copyTpl(
      this.templatePath('environments.config.js'),
      this.destinationPath(
        `${this.options['base-directory']}/config/environments.config.js`
      ),
      {
        serviceUri: this.serviceUri
      }
    );
  }
  install() {
    this.yarnInstall(['json-loader'], { dev: true });
    this.installDependencies({
      yarn: true,
      npm: false,
      bower: false
    });
  }
};
