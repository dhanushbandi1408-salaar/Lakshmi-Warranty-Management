
const API_URL = "http://localhost:5001";

// Login elements
const phoneInput = document.getElementById("phone");
const otpInput = document.getElementById("otp");
const otpSection = document.getElementById("otpSection");
const loginSection = document.getElementById("loginSection");

// Registration elements
const registrationSection = document.getElementById("registrationSection");
const customerPhone = document.getElementById("customerPhone");
const customerName = document.getElementById("customerName");
const productName = document.getElementById("productName");
const productModel = document.getElementById("productModel");
const purchaseDate = document.getElementById("purchaseDate");
const warrantyType = document.getElementById("warrantyType");

// Dashboard elements
const dashboardSection = document.getElementById("dashboardSection");

// Buttons
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const registerBtn = document.getElementById("registerBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const whatsappBtn = document.getElementById("whatsappBtn");
const logoutBtn = document.getElementById("logoutBtn");

const message = document.getElementById("message");

let currentCustomer = null;


// Calculate warranty expiry date
function calculateExpiry(purchase, period) {
    if (!purchase || !period) return "-";

    const date = new Date(purchase + "T12:00:00");

    const match = period.match(/(\d+)\s*(Month|Year)/i);

    if (!match) return "-";

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.startsWith("month")) {
        date.setMonth(date.getMonth() + amount);
    } else {
        date.setFullYear(date.getFullYear() + amount);
    }

    return date;
}


// Format date
function formatDate(dateValue) {
    if (!dateValue) return "-";

    const date = new Date(dateValue + "T12:00:00");

    if (isNaN(date.getTime())) return dateValue;

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


// Display customer warranty card
function showDashboard(customer) {
    currentCustomer = customer;

    loginSection.hidden = true;
    registrationSection.hidden = true;
    dashboardSection.hidden = false;

    const purchase = customer.purchase_date;
    const expiry = calculateExpiry(purchase, customer.warranty_type);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let status = "NOT AVAILABLE";

    if (expiry !== "-") {
        expiry.setHours(0, 0, 0, 0);
        status = today <= expiry ? "ACTIVE" : "EXPIRED";
    }

    document.getElementById("dashboardName").textContent =
        customer.name || "Customer";

    document.getElementById("cardWarrantyId").textContent =
        customer.id || "Not available";

    document.getElementById("cardCustomerName").textContent =
        customer.name || "-";

    document.getElementById("cardPhone").textContent =
        customer.phone || "-";

    document.getElementById("cardProductName").textContent =
        customer.product_name || "-";

    document.getElementById("cardProductModel").textContent =
        customer.product_model || "-";

    document.getElementById("cardPurchaseDate").textContent =
        formatDate(purchase);

    document.getElementById("cardRegisteredDate").textContent =
        formatDate(customer.registered_date);

    document.getElementById("cardWarrantyType").textContent =
        customer.warranty_type || "-";

    document.getElementById("cardExpiryDate").textContent =
        expiry === "-" ? "-" : expiry.toLocaleDateString("en-IN");

    document.getElementById("cardStatus").textContent = status;

    message.textContent = "Your warranty details are ready!";
}


// SEND OTP
sendOtpBtn.addEventListener("click", async () => {
    const phone = phoneInput.value.trim();

    if (!/^[0-9]{10}$/.test(phone)) {
        message.textContent = "Enter a valid 10-digit mobile number.";
        return;
    }

    message.textContent = "Preparing demo OTP...";

    try {
        const response = await fetch(`${API_URL}/api/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        otpSection.hidden = false;
        message.textContent = "Demo OTP ready! Enter 123456.";

    } catch (error) {
        message.textContent = error.message || "Backend connection failed.";
    }
});


// VERIFY OTP
verifyOtpBtn.addEventListener("click", async () => {
    const phone = phoneInput.value.trim();
    const otp = otpInput.value.trim();

    if (!/^[0-9]{6}$/.test(otp)) {
        message.textContent = "Enter the 6-digit OTP.";
        return;
    }

    message.textContent = "Verifying OTP...";

    try {
        const response = await fetch(`${API_URL}/api/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, otp })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        if (result.token) {
            localStorage.setItem("warrantyToken", result.token);
        }

        if (result.exists && result.customer) {
            showDashboard(result.customer);
        } else {
            loginSection.hidden = true;
            registrationSection.hidden = false;
            customerPhone.value = phone;

            message.textContent =
                "Phone verified! Please register your warranty.";
        }

    } catch (error) {
        message.textContent = error.message || "OTP verification failed.";
    }
});


// REGISTER WARRANTY
registerBtn.addEventListener("click", async () => {
    const phone = customerPhone.value.trim();
    const name = customerName.value.trim();
    const product = productName.value.trim();
    const model = productModel.value.trim();
    const date = purchaseDate.value;
    const warranty = warrantyType.value;

    if (!name || !product || !date || !warranty) {
        message.textContent = "Please fill all required fields.";
        return;
    }

    message.textContent = "Registering warranty...";

    try {
        const response = await fetch(`${API_URL}/api/register-warranty`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone,
                name,
                product_name: product,
                product_model: model,
                purchase_date: date,
                warranty_type: warranty
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Registration failed.");
        }

        localStorage.setItem("warrantyToken", result.token);

        showDashboard(result.customer);

    } catch (error) {
        message.textContent =
            error.message || "Could not register warranty.";
    }
});


// DOWNLOAD / PRINT WARRANTY CARD
downloadPdfBtn.addEventListener("click", () => {
    window.print();
});


// SHARE WARRANTY DETAILS ON WHATSAPP
whatsappBtn.addEventListener("click", () => {
    if (!currentCustomer) return;

    const expiry = calculateExpiry(
        currentCustomer.purchase_date,
        currentCustomer.warranty_type
    );

    const expiryText = expiry === "-"
        ? "-"
        : expiry.toLocaleDateString("en-IN");

    const text =
        `LAKSHMI ELECTRICAL WORKS AND BATTERIES\n\n` +
        `DIGITAL WARRANTY CARD\n` +
        `Warranty ID: ${currentCustomer.id}\n` +
        `Customer: ${currentCustomer.name}\n` +
        `Phone: ${currentCustomer.phone}\n` +
        `Product: ${currentCustomer.product_name}\n` +
        `Model: ${currentCustomer.product_model || "-"}\n` +
        `Purchase Date: ${currentCustomer.purchase_date}\n` +
        `Warranty: ${currentCustomer.warranty_type}\n` +
        `Expiry Date: ${expiryText}\n\n` +
        `Owner: Bandi Balajoji - 9177237338`;

    const url = "https://wa.me/?text=" + encodeURIComponent(text);

    window.open(url, "_blank");
});


// LOGOUT
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("warrantyToken");

    currentCustomer = null;

    dashboardSection.hidden = true;
    registrationSection.hidden = true;
    loginSection.hidden = false;

    phoneInput.value = "";
    otpInput.value = "";
    otpSection.hidden = true;

    message.textContent = "You have logged out successfully.";
});
