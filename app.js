const mongoose = require("mongoose");
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");
const morgan = require("morgan");
const passport = require("passport");

// Load config
dotenv.config({ path: "./config/config.env" });

// Passport config
require("./config/passport")(passport);

connectDB();

const app = express();

// Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method Override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

if (process.env.NODE_ENV === "production") {
  app.use(morgan("tiny"));
}

const PORT = process.env.PORT || 8080;

// EJS HELPERS
// const { formatDate, truncate, stripTags } = require("./helpers/ejs");

app.set("view engine", "ejs");

// Sessions
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 24 * 90 * 1000,
    },
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global variable
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT} ... betta go catch it!`
  );
});
