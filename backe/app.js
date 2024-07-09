const express = require('express');
const pg = require('pg');
const { Pool } = require('pg');
require('dotenv').config();
const cors = require('cors')

const app = express();  //this is our app or interface of express
const port = 8080; // Adjust port number as needed

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});


// Function to create table if it doesn't exist
const createTable = async () => {
  const client = await pool.connect();
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS your_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        age INTEGER
      );
    `;
    await client.query(createTableQuery);
    console.log("Table 'your_table' is created or already exists.");
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    client.release();
  }
};

//Ensure table creation happen before stating the server.
(async () => {
try {
    await createTable(); //attempt to create the table
} catch(error) {
console.error('Error creating table:', error);
process.exit(1); // Exit the process if the tble creation fails
}

  await app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`);
  });
})();



// api Middlewares
app.use(express.json()); //and this is for accept data in json formate

app.use(express.urlencoded()); //this is i used for decode the data send through html form

app.use(cors());  // Enable CORS for all origins (not recommended for production)


//API routes

app.post('/submit-data', async (req, res) => {
  console.log(req.body);

  try {
    const client = await pool.connect();

    const { name, age } = req.body; // Extract data from request body

    //validate data
    if (!name || !age) {
      return res.status(400).json({ msg: 'Missing  required fields: name and age' })
    }


    const insertQuery = 'INSERT INTO your_table (name, age) VALUES ($1, $2)'; // Parameterized query
    const values = [name, age];

    await client.query(insertQuery, values);

    res.json({ message: 'Data submitted successfully!' }); // Success response

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting data' }); // Error response

  } finally {
    pool.release(client); // Release connection back to pool
  }
});




