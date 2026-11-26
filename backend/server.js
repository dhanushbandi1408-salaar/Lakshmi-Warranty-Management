
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const { sendOTP, verifyOTP } = require("./auth");
const { registerWarranty } = require("./warranty");

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "LAKSHMI ELECTRICAL WORKS AND BATTERIES - Backend Running Successfully!"
    });
});

// Send demo OTP
app.post("/api/send-otp", async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                message: "Phone number is required."
            });
        }

        await sendOTP(phone);

        res.json({
            message: "Demo OTP ready! Enter 123456.",
            demoOTP: "123456"
        });

    } catch (error) {
        console.error("Send OTP error:", error.message);

        res.status(400).json({
            message: error.message || "Could not send OTP."
        });
    }
});

// Verify demo OTP
app.post("/api/verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                message: "Phone number and OTP are required."
            });
        }

        const result = await verifyOTP(phone, otp);

        res.json({
            message: result.exists
                ? "Login successful!"
                : "Phone verified. Please register your warranty.",
            ...result
        });

    } catch (error) {
        console.error("Verify OTP error:", error.message);

        res.status(400).json({
            message: error.message || "OTP verification failed."
        });
    }
});

// Register warranty
app.post("/api/register-warranty", async (req, res) => {
    try {
        const result = await registerWarranty(req.body);

        res.status(201).json(result);

    } catch (error) {
        console.error("Warranty registration error:", error.message);

        res.status(400).json({
            message: error.message || "Registration failed."
        });
    }
});

// Start server
const PORT = 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
