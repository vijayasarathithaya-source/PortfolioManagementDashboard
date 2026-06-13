module.exports = {
  default: {
    paths: ['requirements/**/*.feature'],
    requireModule: ['ts-node/register'],
    require: ['support/**/*.ts', 'step_definitions/**/*.ts'],
    format: ['summary', 'progress-bar'],
    publishQuiet: true
  }
};
