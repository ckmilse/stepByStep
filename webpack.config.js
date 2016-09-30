var fs = require('fs');
var path = require('path');
var filePaths = require('filepaths');
var json = require('comment-json');
var apiConfigStr = fs.readFileSync('./app/api.json').toString();
var apiConfig = json.parse(apiConfigStr, null, true);

var webpack = require('webpack');
//提取公共模块插件
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

//
var ExtractTextPlugin = require("extract-text-webpack-plugin");
//new ExtractTextPlugin("styles.css"),
var extractCSS = new ExtractTextPlugin('./css/[name].css')

//复制文档目录插件
var TransferWebpackPlugin = require('transfer-webpack-plugin');


//替换 插件
var StringReplacePlugin = require("string-replace-webpack-plugin");

// demoPlugin
var demoPlugin = require('./demoPlugin.js');


var transferOpt = [{
    from: 'app/views',
    to: 'views'
}, {
    from: 'app/images',
    to: 'images'
}, {
    from: 'app/data',
    to: 'data'
}, {
    from: 'app/core',
    to: 'core'
}]

//获取所有样式文件
var paths = filePaths.getSync('app/styles/');
var styleFileArr = [];
paths.forEach(function(item) {
    //console.log(item);
        //console.log(item);
        //./app/styles/collectionList.scss
        //item = item.replace('./app', './..');
        styleFileArr.push(item);
});

module.exports = {
    //插件项

    //页面入口文件配置
    //  entry:  __dirname + "/app/main.js",
    //  entry为多个obj时，键名为 output 的 [name],由此可以设置单个文件的产出目录
    entry: {
         'main':styleFileArr,
        //'index': ['./app/scripts/app.js','webpack/hot/dev-server','webpack-dev-server/client?http://localhost:8080/']
       // 'index': ['./app/scripts/app.js', 'webpack/hot/dev-server', 'webpack-dev-server/client?http://localhost:8080/']
         'bundle.js': ['webpack-dev-server/client?http://localhost:8080/','./app/scripts/app.js']

    },
    //entry: ['./app/scripts/app.js', 'webpack/hot/dev-server'],
    //入口文件输出配置
    //path 配置产出目标的基本目录
    output: {
        path: path.resolve(__dirname, 'dist'),
       // publicPath: "/assets/",
        filename: '[name]'
    },
    module: {
        //加载器配置
        loaders: [{
            test: /\.css$/,
            inexclue: '',
            loader: 'ckDemo!style-loader!css-loader'
        }, {
            test: /\.js$/,
            loader: 'jsx-loader?harmony'
        }, {
            test: /\.scss$/,
           // loader:  'style!css!sass'
           loader: extractCSS.extract('style', 'css!sass')
        },{
            test: /\.(png|jpg)$/,
            loader: 'url?limit=8192'
        },{
            test: /\.(gif)$/,
            loader: 'file-loader'
        },{
            test: /\.js$/,
            loader: StringReplacePlugin.replace({
                replacements: [{
                    pattern: /{{(.+Api)}}/g,
                    replacement: function(match, p1, offset, string) {

                        //console.log(arguments);
                        if (apiConfig[p1] && apiConfig[p1]['serve']) {
                            return apiConfig[p1]['serve'];
                        } else {
                            return ''
                        }

                    }
                }]
            })
        }]
    },
    //其它解决方案配置
    resolve: {
       // root: 'E:/github/flux-example/src', //绝对路径
        extensions: ['', '.js', '.json', '.scss'],
        alias: {
            AppStore: 'js/stores/AppStores.js',
            ActionType: 'js/actions/ActionType.js',
            AppAction: 'js/actions/AppAction.js',
            createjs: './../lib/easeljs-0.8.2.min',
            allScss: './../styles/about.scss'
        }
    },
     devServer: {
        contentBase: "./dist",
        inline: true,
        hot: true
    },
    devtool: 'inline-source-map',
    plugins: [
            // new ExtractTextPlugin("styles.css"),
            new webpack.HotModuleReplacementPlugin(),
            new StringReplacePlugin(),
            extractCSS,
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            }),
             new demoPlugin({options: 'nada'}),
            new TransferWebpackPlugin(transferOpt)

        ]
        //target: 'node'
};


/*var config = require("./webpack.config.js");
config.entry.app.unshift("webpack-dev-server/client?http://localhost:8080/");
var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {...});
server.listen(8080);*/

/*Node.js API方式需要做三个配置：
1) 把webpack/hot/dev-server加入到webpack配置文件的entry项；
2) 把new webpack.HotModuleReplacementPlugin()加入到webpack配置文件的plugins项；
3) 把hot:true加入到webpack-dev-server的配置项里面。

文／tsyeyuanfeng（简书作者）
原文链接：http://www.jianshu.com/p/941bfaf13be1
著作权归作者所有，转载请联系作者获得授权，并标注“简书作者”。*/
/*var config = require("./webpack.config.js");
config.entry.index.unshift("webpack-dev-server/client?http://localhost:8080/");
config.entry.index.unshift("webpack-dev-server/client?http://localhost:8080/");
var WebpackDevServer = require("webpack-dev-server");
var compiler = webpack(config);
var server = new WebpackDevServer(compiler,{ contentBase: "./dist", hot: true });
server.listen(8080);*/


/*ERROR in ./app/images/common/loading.gif
    Module parse failed: /Users/chenke/Project/personal/webpack/webpack_0830/app/images/common/loading.gif Unexpected character '' (1:7)
    You may need an appropriate loader to handle this file type.*/


/*gulp.task('default', function() {
  return gulp.src('src/entry.js')
    .pipe(webpack())
    .pipe(gulp.dest('dist/'));
});
*/
