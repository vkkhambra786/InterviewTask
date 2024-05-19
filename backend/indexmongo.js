// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const secretKey = process.env.JWT_SECRET || "default-secret-key";
// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(
  cors({
    origin: "http://localhost:3001", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
  })
);

let uri =
  "mongodb+srv://vkkhambra786:olsBTIlUOQVT4KLj@cluster0.buill3t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectToDatabase() {
  try {
    await mongoose.connect(uri, {
      // useNewUrlParser: true,
      //useUnifiedTopology: true,
      //bufferTimeoutMS: 30000,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

async function main() {
  await connectToDatabase();
  // await performDatabaseOperations();
}

main();

// Define mongoose schema for financial records
const recordSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["income", "expense"] },
  amount: Number,
  description: String,
  date: { type: Date, default: Date.now },
});
const Record = mongoose.model("Record", recordSchema);

// Define mongoose schema for users
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model("User", userSchema);

// API endpoints for user authentication
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ data: user, message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "24h",
    });
    res.json({ message: "User Login successfully", token, data: user });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    console.log("No token provided");
    return res.status(401).json({ error: "Unauthorized authentication" });
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      console.error("JWT Verification Error:", err);
      return res.status(403).json({ error: "Forbidden" });
    }
    // Token is valid, set user object in request for subsequent middleware
    req.user = user;
    next();
  });
};

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];

//   const tokenRegex = /^Bearer\s+(.*)$/;
//   const tokenMatch = authHeader && authHeader.match(tokenRegex);
//   const token = tokenMatch && tokenMatch[1];

//   if (!token) {
//     console.log("No token provided");
//     return res.status(401).json({ error: "Unauthorized authentication" });
//   }
//   jwt.verify(token, secretKey, (err, user) => {
//     if (err) {
//       if (err.name === "TokenExpiredError") {
//         return res.status(401).json({ error: "Token expired" });
//       }
//       console.error("JWT Verification Error:", err);
//       return res.status(403).json({ error: "Forbidden" });
//     }
//     //console.log("User:", user);
//     req.user = user;
//     next();
//   });
// };

// API endpoints for CRUD operations on financial records
app.get("/api/records", authenticateToken, async (req, res) => {
  try {
    const records = await Record.find({});
    res.json({ message: "All Records get successfully", data: records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/records", authenticateToken, async (req, res) => {
  try {
    const { type, amount, description } = req.body;
    const record = new Record({
      user_id: req.user.userId,
      type,
      amount,
      description,
    });
    await record.save();
    res
      .status(201)
      .json({ message: "Records  Saved successfully", data: record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a record by ID
app.put("/api/recordsUp/:id", authenticateToken, async (req, res) => {
  try {
    const { type, amount, description } = req.body;
    const recordId = req.params.id;

    // Find the record by ID
    const record = await Record.findById(recordId);

    // Check if the record exists
    console.log("record", record);
    console.log("Record user ID:", record.user_id.toString());
    console.log("Request user ID:", req.user.userId);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    // Update the record fields
    record.type = type;
    record.amount = amount;
    record.description = description;

    // Save the updated record
    await record.save();

    // Respond with success message and updated record
    res.json({ message: "Record updated successfully", data: record });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/records/:id", authenticateToken, async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    // console.log("Retrieved record:", record);

    // Delete the record using deleteOne method
    await Record.deleteOne({ _id: req.params.id });

    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// app.post("/api/signup", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if email already exists
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ error: "Email already exists" });
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create a new user
//     const user = await User.create({ email, password: hashedPassword });

//     res.status(201).json({ data: user, message: "User created successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }
//     const isValidPassword = await bcrypt.compare(password, user.password);
//     if (!isValidPassword) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }
//     const token = jwt.sign({ userId: user.id }, secretKey, {
//       expiresIn: "24h",
//     });
//     res.json({ message: "User Login successfully", token, data: user });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// Middleware for JWT authentication
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];

//   if (!authHeader) {
//     console.log("No token provided");
//     return res.status(401).json({ error: "Unauthorized authentication" });
//   }

//   const token = authHeader.split(" ")[1];

//   jwt.verify(token, secretKey, (err, user) => {
//     if (err) {
//       if (err.name === "TokenExpiredError") {
//         return res.status(401).json({ error: "Token expired" });
//       }
//       console.error("JWT Verification Error:", err);
//       return res.status(403).json({ error: "Forbidden" });
//     }
//     req.user = user;
//     next();
//   });
// };
