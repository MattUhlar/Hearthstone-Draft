const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      },
			{ 
				test: /\.hbs$/, 
				loader: "handlebars-loader" 
			},
      {
       test: /\.(png|svg|jpg|gif)$/,
       use: [
         'file-loader'
       ]
      }
    ]
  }
}
