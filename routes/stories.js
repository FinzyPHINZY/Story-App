const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/Story");
const {
  truncate,
  stripTags,
  editIcon,
  select,
  formatDate,
} = require("../helpers/ejs");

// @desc         Show add page
// @route        GET /stories/add
router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

// @desc         Process add form
// @route        POST /stories/
router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

// @desc         Show all stories
// @route        GET /
router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" });
    res.render("stories/index", {
      stories,
      stripTags,
      truncate,
      editIcon,
      select,
    });
  } catch (err) {
    console.log(err);
    res.render("error/500");
  }
});

// @desc         Show single story
// @route        GET /stories/:id
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate("user");

    if (!story) {
      return res.render("error/404");
    }
    res.render("stories/show", { story, editIcon, formatDate });
  } catch (err) {
    console.error(err);
    return res.render("error/404");
  }
});

// @desc         Show edit page
// @route        GET /stories/edit/:id
router.get("/edit/:id", ensureAuth, async (req, res) => {
  console.log(req.body);
  console.log(req.params);
  try {
    const story = await Story.findOne({
      _id: req.params.id,
    });
    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      res.render("stories/edit", {
        story,
      });
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// @desc    Update story
// @route   PUT /stories/:id
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id);

    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      story = await Story.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        req.body,
        { new: true, runValidators: true }
      );

      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

// @desc         Update Story
// @route        Put /stories/:id
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id);
    console.log(story);

    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      });

      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render(404);
  }
});

// @desc        Delete Story
// @route        Delete /stories/:id
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById({ _id: req.params.id });
    if (!story) {
      res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      await Story.deleteOne({ _id: req.params.id });
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render(404);
  }
});

// @desc    User stories
// @route   GET /stories/user/:userId
router.get("/user/:userId", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: "public",
    }).populate("user");

    console.log(stories);

    res.render("stories/index", {
      stories,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;
