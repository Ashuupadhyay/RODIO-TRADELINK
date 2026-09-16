const DirectoryLead = require("../models/directoryLead");

// =====================================================
// BULK CREATE DIRECTORY DUMMY DATA
// POST /api/directory-leads/bulk
// =====================================================

exports.bulkCreateDirectoryLeads = async (req, res) => {
  try {
    const { data } = req.body;

    // ---------------------------------------------
    // Validate data
    // ---------------------------------------------

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data array is required",
      });
    }

    // ---------------------------------------------
    // Prepare data
    // ---------------------------------------------

    const formattedData = data.map((item) => ({
      mobile: String(item.mobile || "").trim(),

      firmName: String(item.firmName || "").trim(),

      ownerName: String(item.ownerName || "").trim(),

      category: String(
        item.category || "transporter"
      ).trim(),

      email: String(item.email || "")
        .trim()
        .toLowerCase(),

      whatsappNumber: String(
        item.whatsappNumber || ""
      ).trim(),

      address: String(
        item.address || ""
      ).trim(),

      city: String(
        item.city || ""
      ).trim(),

      state: String(
        item.state || ""
      ).trim(),

      pincode: String(
        item.pincode || ""
      ).trim(),

      workingAreas:
        Array.isArray(item.workingAreas)
          ? item.workingAreas
          : [],

      businessDescription: String(
        item.businessDescription || ""
      ).trim(),

      officeWorkingHours:
        item.officeWorkingHours || {
          start: "",
          end: "",
        },

      officeWorkingDays:
        Array.isArray(item.officeWorkingDays)
          ? item.officeWorkingDays
          : [],

      vehicles:
        Array.isArray(item.vehicles)
          ? item.vehicles
          : [],

      averageRating:
        Number(item.averageRating) || 0,

      totalReviews:
        Number(item.totalReviews) || 0,

      gallery:
        Array.isArray(item.gallery)
          ? item.gallery
          : [],

      // -----------------------------------------
      // IMPORTANT
      // Every uploaded record starts as dummy
      // -----------------------------------------

      status: "dummy",

      registeredUser: null,

      registeredAt: null,

      isActive: true,
    }));

    // ---------------------------------------------
    // Mobile validation
    // ---------------------------------------------

    const invalidMobile = formattedData.find(
      (item) =>
        !/^[6-9]\d{9}$/.test(item.mobile)
    );

    if (invalidMobile) {
      return res.status(400).json({
        success: false,
        message: `Invalid mobile number: ${invalidMobile.mobile}`,
      });
    }

    // ---------------------------------------------
    // Insert
    // ---------------------------------------------

    const inserted =
      await DirectoryLead.insertMany(
        formattedData
      );

    return res.status(201).json({
      success: true,

      message:
        "Dummy directory data imported successfully",

      count: inserted.length,

      data: inserted,
    });

  } catch (error) {

    console.error(
      "BULK DIRECTORY LEAD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to import dummy directory data",

      error: error.message,
    });
  }
};


// =====================================================
// GET ALL DUMMY LEADS
// GET /api/directory-leads
// =====================================================

exports.getDirectoryLeads = async (req, res) => {
  try {

    const leads = await DirectoryLead.find({
  status: "dummy",
  isActive: true,
})
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,

      count: leads.length,

      data: leads,
    });

  } catch (error) {

    console.error(
      "GET DIRECTORY LEADS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch directory leads",

      error: error.message,
    });
  }
};


// =====================================================
// DELETE / DEACTIVATE DUMMY LEAD
// DELETE /api/directory-leads/:id
// =====================================================

exports.deleteDirectoryLead = async (
  req,
  res
) => {
  try {

    const { id } = req.params;

    const lead =
      await DirectoryLead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Directory lead not found",
      });
    }

    // -----------------------------------------
    // IMPORTANT:
    // Database se permanently delete nahi karenge.
    // Tracking ke liye record rahega.
    // -----------------------------------------

    lead.status = "deleted";

    lead.isActive = false;

    await lead.save();

    return res.status(200).json({
      success: true,

      message:
        "Dummy directory listing deleted",

    });

  } catch (error) {

    console.error(
      "DELETE DIRECTORY LEAD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to delete directory lead",

      error: error.message,
    });
  }
};