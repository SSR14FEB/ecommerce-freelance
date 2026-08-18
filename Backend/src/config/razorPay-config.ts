import Razorpay from "razorpay";
// console.log("Razorpay instance created with key:", process.env.RAZORPAY_TEST_KEY_ID);
// console.log("Razorpay instance created with secret:", process.env.RAZORPAY_KEY_TEST_SECRET);
const razorpayInstance = new Razorpay({
    key_id : process.env.RAZORPAY_TEST_KEY_ID,
    key_secret : process.env.RAZORPAY_KEY_TEST_SECRET, 
})

export {razorpayInstance}