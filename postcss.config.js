export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
      'postcss-rename': {
        strategy: 'minimal', // or 'hex' or 'crypto'
        prefix: '_', // optional prefix for generated class names
        // Exclude certain patterns from renaming
        exclude: [
          /^(html|body)$/,
          // Add any other selectors you don't want to rename
        ]
      },
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
        }],
      }
    } : {})
  },
}
