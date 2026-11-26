
const supabase = require("./supabase");
const jwt = require("jsonwebtoken");

// FREE DEMO OTP
const DEMO_OTP = "123456";

function formatPhone(phone) {
    const digits = String(phone).replace(/\D/g, "");

    if (digits.length !== 10) {
        throw new Error("Enter a valid 10-digit Indian mobile number.");
    }

    return "+91" + digits;
}

// Send demo OTP
async function sendOTP(phone) {
    formatPhone(phone);

    console.log("Demo OTP for testing:", DEMO_OTP);

    return "pending";
}

// Verify demo OTP
async function verifyOTP(phone, otp) {
    const formattedPhone = formatPhone(phone);

    if (String(otp) !== DEMO_OTP) {
        throw new Error("Invalid OTP. Please enter 123456.");
    }

    const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("phone", formattedPhone)
        .maybeSingle();

    if (error) throw error;

    const token = jwt.sign(
        { phone: formattedPhone, type: "customer" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        exists: !!data,
        customer: data,
        token
    };
}

module.exports = {
    sendOTP,
    verifyOTP
};
