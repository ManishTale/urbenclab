const config = {
    production: {
        SECRET: process.env.SECRET,
        DATABASE: process.env.MONGODB_URI
    },
    default: {
        SECRET: 'SUPER_SECRET-PASSWORD!123?',
        DATABASE: 'mongodb://localhost:27017/serviceapi'
    }
}

exports.get = function get(env) {
    return config[env] || config.default
}