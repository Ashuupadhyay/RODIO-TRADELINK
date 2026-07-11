const Contact = require("../models/queryform");

// Create Contact
const createContact = async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    // Validation
    if (!name || !phone || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const contact = await Contact.create({
      name,
      phone,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Query submitted successfully.Our team replay soon",
      data: contact,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createContact,
};