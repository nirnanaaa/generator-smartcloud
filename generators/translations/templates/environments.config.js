module.exports = {
  development: (config) => ({
    compiler_public_path: '<%= serviceUri %>'
  }),

  production: (config) => ({
    compiler_public_path: '<%= serviceUri %>',
    compiler_fail_on_warning: false,
    compiler_hash_type: 'hash',
    compiler_devtool: null,
    compiler_stats: {
      chunks: true,
      chunkModules: true,
      colors: true
    }
  })
}
