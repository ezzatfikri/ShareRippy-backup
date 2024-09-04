const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;

// Initialize the app and middleware
const app = express();
app.use(express.json());
app.use(cors());

// Initialize multer for file uploads
const upload = multer();

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'docuawff2',
  api_key: '368667218665533',
  api_secret: 'AF3nNzF3u2nIs2Ri_f2tea5w1LQ'
});

// Database connection configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Ez#290701",
  database: "sharerippy",
});

// Connect to the database with error handling
db.connect(err => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    process.exit(1);  // Exit the process if the database connection fails
  }
  console.log("Connected to database.");
});

// Endpoint to retrieve all recipes
app.get('/subrecipe', (req, res) => {
  const sql = "SELECT * FROM recipe";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error retrieving data: " + err.message);
      return res.status(500).json(err);
    }
    res.json(data);
  });
});

// Endpoint to retrieve a recipe by ID
app.get('/recipe/:id', (req, res) => {
  const recipeId = req.params.id;
  const sql = "SELECT * FROM recipe WHERE id = ?";
  db.query(sql, [recipeId], (err, data) => {
    if (err) {
      console.error("Error retrieving recipe details: " + err.message);
      return res.status(500).json(err);
    }
    res.json(data[0]); // Return the first item in the result array
  });
});

// Endpoint to submit a new recipe with an image
app.post('/subrecipe', upload.single('image'), (req, res) => {
  try {
    const { recipeName, description, ingredients, cookingSteps, difficulty, category } = req.body;
    const image = req.file;

    if (image) {
      console.log("Image file received:", image.originalname);

      // Upload the image to Cloudinary
      cloudinary.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) {
            console.error("Error uploading image to Cloudinary:", error.message);
            return res.status(500).json({ error: "Failed to upload image" });
          }
          const imageUrl = result.secure_url; // Get the URL of the uploaded image

          // After uploading the image, insert the recipe data into the database
          const sql = "INSERT INTO recipe (recipeName, description, ingredients, cookingSteps, difficulty, category, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)";
          const values = [
            recipeName,
            description,
            ingredients,
            cookingSteps,
            difficulty,
            category,
            imageUrl  // Save the Cloudinary image URL in the database
          ];

          db.query(sql, values, (err, data) => {
            if (err) {
              console.error("Error inserting data: " + err.message);
              return res.status(500).json({ error: err.message });
            }
            res.json(data);
          });
        }
      ).end(image.buffer);  // Stream the image buffer to Cloudinary
    } else {
      console.log("No image file received.");
      // Insert the recipe data into the database without an image URL
      const sql = "INSERT INTO recipe (recipeName, description, ingredients, cookingSteps, difficulty, category, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)";
      const values = [
        recipeName,
        description,
        ingredients,
        cookingSteps,
        difficulty,
        category,
        null  // No image URL, null value
      ];

      db.query(sql, values, (err, data) => {
        if (err) {
          console.error("Error inserting data: " + err.message);
          return res.status(500).json({ error: err.message });
        }
        res.json(data);
      });
    }
  } catch (err) {
    console.error("Unexpected error occurred: " + err.message);
    res.status(500).json({ error: "Server error, please try again later." });
  }
});

// Start the server and listen on port 5000
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
