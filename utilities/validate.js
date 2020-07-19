
const validator = require('validator')

const getMsg = err => {
    const errKeys = Object.keys(err)
    let msg = ''
    if(errKeys.length > 1)
        for(let i = 0; i < errKeys.length - 1; i++) {
            let key = errKeys[i]
            if(i === 0) msg = `Check ${key}`
            else msg += `, ${key}`
            if(i === errKeys.length - 2) msg += ` and ${errKeys[i+1]}.`
        }
    else msg = err[errKeys[0]]

    return msg
}

const isEmpty = val =>
    (val.constructor === String || val.constructor === Array)
        ? val.length === 0
    : val.constructor === Number ? isEmpty(val.toString())
    : val.constructor === Object ? isEmpty(Object.keys(val))
    : true

const validateName = name => {
    let err = false
    if(isEmpty(name))
        err = 'Enter your name.'
    else if(name.match(/[0-9]/g))
        err = 'Name with numbers in it?'

    return err
}

const validateEmail = email => {
    let err = false
    if(isEmpty(email))
        err = 'Enter your email.'
    else if(!validator.isEmail(email))
        err = 'Enter a valid e-mail address.'

    return err
}

const validateAadhar = aadhar => {
    let err = false
    if(isEmpty(aadhar))
        err = 'Enter your aadhar number.'
    else if(!aadhar.match(/[0-9]{16}/))
        err = 'Enter valid aadhar number.'

    return err
}

const validatePassword = pass => {
    let err = false
    if(isEmpty(pass))
        err = 'Enter a password.'
    else if(!validator.isLength(pass.toString(), {min: 6}))
        err = 'Password must be atleast 6 characters.'

    return err
}

const validateLogin = payload => {

    const {email, password} = payload
    const err = {}

    let _err = validateEmail(email)
    if(_err) err.email = _err

    _err = validatePassword(password)
    if(_err) err.password = _err

    return {
        isLegit: isEmpty(err),
        err,
        msg: getMsg(err)
    }
}

const validateSignUp = payload => {

    const {email, password, name} = payload
    const err = {}

    let _err = validateEmail(email)
    if(_err) err.email = _err

    _err = validatePassword(password)
    if(_err) err.password = _err

    _err = validateName(name)
    if(_err) err.name = _err

    return {
        isLegit: isEmpty(err),
        err,
        msg: getMsg(err)
    }
}

const validateDetails = payload => {

    const {aadhar, location, interval, surveyNo, coverage, name} = payload
    const err = {}

    let _err = validateAadhar(aadhar)
    if(_err) err.aadhar = _err

    if(!(validator.isNumeric(location.lat.toString()) || validator.isNumeric(location.lon.toString())))
        err.location = 'Enter valid location.'

    _err = validateName(name)
    if(_err) err.name = _err

    return {
        isLegit: isEmpty(err),
        err,
        msg: getMsg(err)
    }
}

// isEthereumAddress

module.exports = {
    validateLogin,
    validateSignUp,
    validateDetails
}
