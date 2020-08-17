// var { RateLimiterMemory, RateLimiterRes } = require('rate-limiter-flexible')

// const maxWrongAttemptsFromIPperDay = 100;
// const maxConsecutiveFailsByUsernameAndIP = 10;

// const limiterSlowBruteByIP = new RateLimiterMemory({
//     keyPrefix: 'login_fail_ip_per_day',
//     points: maxWrongAttemptsFromIPperDay,
//     duration: 60 * 60 * 24,
//     blockDuration: 60 * 60 * 3,  // block for 3 hours if 100 wrong attempts per day
// });

// const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterMemory({
//     keyPrefix: 'login_fail_consecutive_username_and_ip',
//     points: maxConsecutiveFailsByUsernameAndIP,
//     duration: 60 * 60 * 24 * 14,  // store number for 14 days since first fail
//     blockDuration: 60 * 60,  // block for 1 hour
// });

// const getUsernameIpKey = (username, ip) => `${username}_${ip}`

// module.exports.checkUsernameRate = async (req, res, next) => {
//     const usernameIPkey = getUsernameIpKey(req.body.usernameOrEmail, req.ip)
//     const resGet = await Promise.all([
//       limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
//       limiterSlowBruteByIP.get(req.ip),
//     ]);
//     const resUsernameAndIP = resGet[0];
//     const resSlowByIP = resGet[1];
//     var retrySecs = 0
//     // check if IP or username and IP is already blocked
//     if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsFromIPperDay) {
//       retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
//     } else if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP) {
//       retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
//     }
//     if (retrySecs > 0) throw new TooManyRequestsError(retrySecs)
//     next()
// }

// module.exports.checkFailedLogin = (usernameOrEmail, ip) => {
//   const usernameIPkey = getUsernameIpKey(usernameOrEmail, ip)
//     try {
//         await Promise.all([
//           limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey),
//           limiterSlowBruteByIP.consume(ip)
//         ])
//       } catch (rlRejected) {
//         if (rlRejected instanceof RateLimiterRes) {
//           throw new TooManyRequestsError(Math.round(rlRejected.msBeforeNext / 1000) || 1)
//         } else {
//           throw rlRejected
//         }
//       }
// }

// module.exports.resetLimiter = (usernameOrEmail, ip) => {
//   const usernameIPkey = getUsernameIpKey(usernameOrEmail, ip)
//   await limiterConsecutiveFailsByUsernameAndIP.delete(usernameIPkey)
// }