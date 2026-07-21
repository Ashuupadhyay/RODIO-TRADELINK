exports.createOrder = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Create Order API Working",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};