const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const util = require('../../util');
const mkdirp = require('mkdirp');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });

    this.option('test-framework', {
      desc: 'Test framework to be invoked',
      type: String,
      defaults: 'mocha'
    });
    this.option('base-directory', {
      desc: 'Where to install the files',
      type: String,
      defaults: '.'
    });
    this.option('babel', {
      desc: 'Use Babel',
      type: Boolean,
      defaults: true
    });
  }

  prompting() {
    const prompts = [{
      type    : 'input',
      name    : 'name',
      message : 'Component Name',
      default : 'SampleWidget' // Default to current folder name
    }];

    return this.prompt(prompts).then(answers => {
      this.name = answers.name;
    });
  }

  writing() {
    mkdirp(`${this.options['base-directory']}/src/widgets/${this.name}`);
    this.fs.copyTpl(
      this.templatePath('WidgetTemplate.js'),
      this.destinationPath(`${this.options['base-directory']}/src/widgets/${this.name}/index.js`),
      { widgetName: this.name }
    );
    const renderConfig = {
      file: this.destinationPath(`${this.options['base-directory']}/src/main.js`),
      needle: '// yo-insert-above',
      splicable: [
        `    new Module('${this.name}', props => <${this.name} {...props}/>, true),`,
      ]
    };

    util.rewriteFile(renderConfig);
    const importConfig = {
      file: this.destinationPath(`${this.options['base-directory']}/src/main.js`),
      needle: "import React from 'react'",
      splicable: [
        `import ${this.name} from './widgets/${this.name}'`
      ]
    };

    util.rewriteFile(importConfig);
  }

};
