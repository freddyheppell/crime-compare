const purgecss = require('@fullhuman/postcss-purgecss')({

  // Specify the paths to all of the template files in your project 
  content: [
    './src/**/*.html',
    './src/**/*.vue'
  ]
})



module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer')
  ]
}