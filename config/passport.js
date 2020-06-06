
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const User = require('../models/User')

const secretOrKey = require('./keys').SECRET_KEY
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = secretOrKey

module.exports = passport => {

  passport.use(new JwtStrategy(opts, (jwtPayload, done) => {

    const {user} = jwtPayload

    User.findById(user)
        .then(user => {
            if(user) done(null, jwtPayload)
            else done(null, false)
        })
        .catch(dbErr => console.log(dbErr))
    }))
}
