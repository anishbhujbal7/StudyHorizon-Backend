// const Razorpay = require("razorpay");
// require("dotenv").config();


// // this is only till razorpay gets fully integrated comment out the next line after integration
// let instance = null;

// exports.instance = new Razorpay ({
//     key_id:process.env.RAZORPAY_KEY,
//     key_secret:process.env.RAZORPAY_SECRET,
// })

// // this is only till razorpay gets fully integrated. comment out the next line after integration
// module.exports = instance;

// config/razorpay.js

const Razorpay = require("razorpay");

let instance = null;

if (process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET) {
  instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });
} else {
  // 👇 Fake Razorpay instance for local testing
  instance = {
    orders: {
      create: async (options) => ({
        id: "test_order_id",
        currency: options.currency,
        amount: options.amount,
      }),
    },
  };
}

module.exports = { instance };

