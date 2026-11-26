
const supabase = require("./supabase");
const jwt = require("jsonwebtoken");

async function registerWarranty(customer) {
    const {
        phone,
        name,
        product_name,
        product_model,
        purchase_date,
        warranty_type
    } = customer;

    if (!phone || !name || !product_name || !purchase_date || !warranty_type) {
        throw new Error("Please fill all required details.");
    }

    const digits = String(phone).replace(/\D/g, "");

    if (digits.length !== 10) {
        throw new Error("Invalid mobile number.");
    }

    const formattedPhone = "+91" + digits;

    const { data, error } = await supabase
        .from("customers")
        .insert([{
            phone: formattedPhone,
            name,
            product_name,
            product_model,
            purchase_date,
            warranty_type,
            registered_date: new Date().toISOString().slice(0, 10)
        }])
        .select()
        .single();

    if (error) {
        throw error;
    }

    const token = jwt.sign(
        { phone: formattedPhone, type: "customer" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        message: "Warranty registered successfully!",
        customer: data,
        token
    };
}

module.exports = { registerWarranty };
