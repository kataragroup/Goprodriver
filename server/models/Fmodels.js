const Admin = require('./Driver/Admin');
const CarOwner = require('./Driver/CarOwner');
const Driver = require('./Driver/Driver');
const Otp = require('./Driver/Otp');
const Payment = require('./Driver/Payment');
const Ride = require('./Driver/Ride');
const User = require('./Driver/User');
const Vehicle = require('./Vehicle'); // ✅ Updated: Location field wala model

module.exports = {
    Admin,
    CarOwner,
    Driver,
    Otp,
    Payment,
    Ride,
    User,
    Vehicle
};