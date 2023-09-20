const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

module.exports = {
    entry: {
        index: "./src/index.tsx",
        // welcome: "./src/components/WelcomePage.tsx",
        // facebook: "./src/components/Facebook.tsx",
        // youtube: "./src/components/Youtube.tsx",
        // navbar: "./src/components/Navbar.tsx",
        // reddit: "./src/components/Reddit.tsx",
        // twitter: "./src/components/Twitter.tsx",
        // explicit: "./src/components/Explicit.tsx",
        // settings: "./src/components/Settings.tsx",
        // background: "./src/background/background.ts",
        // contentScript: "./src/contentScript/contentScript.ts",
    },

    mode: "production",
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: { noEmit: false },
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                ident: "postcss",
                                plugins: [tailwindcss, autoprefixer],
                            },
                        },
                    },
                ],
                test: /\.css$/i,
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: "file-loader",
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.json$/,
                use: "json-loader",
                type: "javascript/auto",
            },
        ],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "manifest.json", to: path.resolve("dist") },
                { from: "icon.png", to: path.resolve("dist") },
            ],
        }),
        ...getHtmlPlugins([
            "index",
            // "welcome",
            // "facebook",
            // "youtube",
            // "navbar",
            // "reddit",
            // "twitter",
            // "explicit",
            // "settings",
        ]),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js",
    },
    optimization: {
        splitChunks: {
            chunks: "all",
        },
    },
};

function getHtmlPlugins(chunks) {
    return chunks.map(
        (chunk) =>
            new HTMLPlugin({
                title: "React extension",
                filename: `${chunk}.html`,
                chunks: [chunk],
            })
    );
}
