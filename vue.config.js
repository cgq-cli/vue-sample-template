const CompressionPlugin = require('compression-webpack-plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const HtmlWebpackPlugin = require('html-webpack-plugin')

const externals = {
    'vue': 'Vue',    
    'vue-router': 'VueRouter',
    'vuex': 'Vuex',
    'axios': 'axios',
    'nprogress': 'NProgress',
    'vconsole': 'VConsole',
    'element-ui': 'ELEMENT',
}

module.exports = {
    publicPath: './',
    outputDir: './dockerfiles/dist',
    // outputDir: './dockerfiles/dist/hljpt', // 为了解决小程序缓存导致的问题，所以单独建个目录，改变路由达到清缓存的目的（目前仅黑龙江平台用到）
    // pluginOptions: {
    //     autoRouting: {
    //         chunkNamePrefix: 'page-'
    //     }
    // },

    configureWebpack: () => {
        if (process.env.NODE_ENV === 'production') {
            return {
                externals: externals,
                plugins: [
                    // new BundleAnalyzerPlugin(),
                    new CompressionPlugin({
                        test: /\.js$|\.html$|.\css/,
                        threshold: 10240, //对超过10k的数据压缩
                        deleteOriginalAssets: false //删除源文件
                    })
                ]
            }
        } 
        else {
            return {
                externals: {
                    ...externals,
                    // 'vconsole': 'VConsole'
                }
            }
        }
    },
    pages: {
        h5: {          
            entry: 'src/views/h5/main.js',          
            template: 'public/h5.html',
            chunks: ['chunk-vendors', 'chunk-common', 'h5'],
            title: '加载中'
        },        
        admin: {          
            entry: 'src/views/admin/main.js',          
            template: 'public/admin.html',        
            chunks: ['chunk-vendors', 'chunk-common', 'admin'],
            title: '加载中'
        },
    },
    css: {
        loaderOptions: {
            less: {
                modifyVars: {
                    '@color-primary': '#1c97fc',
                    '@color-success': '#1c97fc',
                    '@color-info': '#32ae57'
                }
            },
            sass: {
                prependData: `@import "@/assets/sass/main.scss";`
            }
        }
    },
    chainWebpack: config => {
        /**
         * 添加CDN参数到htmlWebpackPlugin配置中， 详见public/index.html 修改
         */
        // config.plugin('html').tap(args => {
        //     console.log(args, '33333')
        //     if (process.env.NODE_ENV === 'production') {
        //         args[0].cdn = cdn.build
        //     }
        //     // if (process.env.NODE_ENV === 'development') {
        //     // args[0].cdn = cdn.dev
        //     // }
        //     return args
        // })
        let arr = ['vue-modules', 'vue', 'normal-modules', 'normal']
        arr.forEach(match => {
            config.module
                .rule('scss')
                .oneOf(match)
                .use('sass-loader')
                .tap(opt =>
                    Object.assign(
                        opt,
                        { data: `@import '~@/assets/sass/main.scss';` },
                    )
                )
        })
    },
    productionSourceMap: process.env.NODE_ENV !== 'production',
    lintOnSave: process.env.NODE_ENV !== 'production',
    devServer: {
        disableHostCheck: true,
        port: 8090,
        proxy: {
            '^/api': {
                target: 'http://unip-test.zwjk.com',
                ws: true,
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '/'
                }
            }
        },
        overlay: {
            warnings: true,
            errors: true
        }
    }
}