


const express = require("express");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sequelize, User, Record, connectToDatabase } = require("./models");

// Load environment variables
require("dotenv").config();

// Initialize Express app
const app = express();
app.use(bodyParser.json());
 
//app.use(cors())
const allowedOrigins = ["http://localhost:3000", "http://localhost:8080"];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin, e.g., mobile apps or curl requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const secretKey = process.env.JWT_SECRET || "default-secret-key";

// Connect to the database
connectToDatabase().then(() => {
  // Start the server only after the database connection is established
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

// API endpoints for user authentication

app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password using argon2
    const hashedPassword = await argon2.hash(password);

    // Create a new user
    const user = await User.create({ email, password: hashedPassword });

    res.status(201).json({ data: user, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    // Verify the password using argon2
    const isValidPassword = await argon2.verify(user.password, password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user.id }, secretKey, {
      expiresIn: "24h",
    });
    res.json({ message: "User Login successfully", token, data: user });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    console.log("No token provided");
    return res.status(401).json({ error: "Unauthorized authentication" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Received token:", token);
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        console.log("Token expired:", err.message);
        return res.status(401).json({ error: "Token expired" });
      } else if (err.name === "JsonWebTokenError") {
        console.log("JWT verification failed:", err.message);
        return res.status(401).json({ error: "Invalid token" });
      } else {
        console.error("JWT Verification Error:", err);
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    // Token verification successful
    console.log("Token decoded:", decoded);
    req.user = decoded;
    next();
  });
};

// API endpoints for CRUD operations on financial records
app.get("/api/records", authenticateToken, async (req, res) => {
  try {
    const records = await Record.findAll({
      where: { userId: req.user.userId },
    });
    res.json({ message: "All Records get successfully", data: records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/records", authenticateToken, async (req, res) => {
  try {
    const { type, amount, description } = req.body;
    const record = await Record.create({
      userId: req.user.userId,
      type,
      amount,
      description,
    });
    res
      .status(201)
      .json({ message: "Records  Saved successfully", data: record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a record by ID
app.put("/api/records/:id", authenticateToken, async (req, res) => {
  try {
    const { type, amount, description } = req.body;
    const recordId = req.params.id;
    console.log(
      `Updating record with ID: ${recordId}, User ID: ${req.user.userId}`
    );

    // Find the record by ID
    const record = await Record.findOne({
      where: { id: recordId, userId: req.user.userId },
    });
    if (!record) {
      console.log(`record  not found with ID: ${recordId}`);

      return res.status(404).json({ error: "Record not found" });
    }

    // Update the record fields
    record.type = type;
    record.amount = amount;
    record.description = description;

    // Save the updated record
    await record.save();
    console.log(
      `Record updated successfully: ${JSON.stringify(record.toJSON())}`
    );
    res.json({ message: "Record updated successfully", data: record.toJSON() });
  } catch (error) {
    console.error("errrrr --", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/records/:id", authenticateToken, async (req, res) => {
  try {
    const record = await Record.findOne({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    await record.destroy();

    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

 