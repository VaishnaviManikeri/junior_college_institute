const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");
const Admin = require("../models/Admin");
const auth = require("../middleware/auth");

// ✅ Create a new notice
router.post("/", auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const notice = new Notice({
      ...req.body,
      publishedBy: req.admin.id,
    });

    await notice.save();
    
    // Populate the publishedBy field for response
    await notice.populate("publishedBy", "username name");

    res.status(201).json({
      message: "Notice created successfully",
      notice,
    });
  } catch (error) {
    console.error("Create notice error:", error);
    res.status(400).json({ error: error.message });
  }
});

// ✅ Get all notices (with filtering and pagination)
router.get("/", async (req, res) => {
  try {
    const {
      category,
      priority,
      isActive,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    
    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const notices = await Notice.find(filter)
      .populate("publishedBy", "username name")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination info
    const total = await Notice.countDocuments(filter);

    res.json({
      notices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalNotices: total,
        hasNextPage: skip + notices.length < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get notices error:", error);
    res.status(500).json({ error: "Failed to fetch notices" });
  }
});

// ✅ Get active notices for public display
router.get("/active", async (req, res) => {
  try {
    const currentDate = new Date();
    
    const notices = await Notice.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    })
      .populate("publishedBy", "username name")
      .sort({ priority: -1, createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ notices });
  } catch (error) {
    console.error("Get active notices error:", error);
    res.status(500).json({ error: "Failed to fetch active notices" });
  }
});

// ✅ Get single notice by ID
router.get("/:id", async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate("publishedBy", "username name");

    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    res.json({ notice });
  } catch (error) {
    console.error("Get notice error:", error);
    res.status(500).json({ error: "Failed to fetch notice" });
  }
});

// ✅ Update notice
router.put("/:id", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "title",
      "description",
      "category",
      "priority",
      "startDate",
      "endDate",
      "isActive",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: "Invalid updates!" });
    }

    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    // Check if admin is the creator or has permission
    if (notice.publishedBy.toString() !== req.admin.id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this notice" });
    }

    updates.forEach((update) => (notice[update] = req.body[update]));
    await notice.save();

    await notice.populate("publishedBy", "username name");

    res.json({
      message: "Notice updated successfully",
      notice,
    });
  } catch (error) {
    console.error("Update notice error:", error);
    res.status(400).json({ error: error.message });
  }
});

// ✅ Delete notice
router.delete("/:id", auth, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    // Check if admin is the creator or has permission
    if (notice.publishedBy.toString() !== req.admin.id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this notice" });
    }

    await notice.deleteOne();
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Delete notice error:", error);
    res.status(500).json({ error: "Failed to delete notice" });
  }
});

// ✅ Toggle notice active status
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    // Check if admin is the creator or has permission
    if (notice.publishedBy.toString() !== req.admin.id.toString()) {
      return res.status(403).json({ error: "Not authorized to modify this notice" });
    }

    notice.isActive = !notice.isActive;
    await notice.save();

    await notice.populate("publishedBy", "username name");

    res.json({
      message: `Notice ${notice.isActive ? "activated" : "deactivated"} successfully`,
      notice,
    });
  } catch (error) {
    console.error("Toggle notice error:", error);
    res.status(400).json({ error: error.message });
  }
});

// ✅ Get notice statistics
router.get("/stats/summary", auth, async (req, res) => {
  try {
    const totalNotices = await Notice.countDocuments();
    const activeNotices = await Notice.countDocuments({ isActive: true });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayNotices = await Notice.countDocuments({
      createdAt: { $gte: today },
    });

    const categoryStats = await Notice.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const priorityStats = await Notice.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      totalNotices,
      activeNotices,
      todayNotices,
      categoryStats,
      priorityStats,
    });
  } catch (error) {
    console.error("Get notice stats error:", error);
    res.status(500).json({ error: "Failed to fetch notice statistics" });
  }
});

module.exports = router;