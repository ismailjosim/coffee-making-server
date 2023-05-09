require("cors")
require("colors")
require("dotenv").config()
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())

// database connection
const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASSWORD }@cluster0.vmiugbh.mongodb.net/?retryWrites=true&w=majority`;
// const uri = "mongodb+srv://ismailjosimm:kHOzEWvux60XhWpo@cluster0.vmiugbh.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



const dbConnect = async () => {
    try {
        await client.connect();
        console.log("Database Connected successfully ✅".bgWhite);
    } catch (error) {
        console.log(error.name, error.message);
    }
}
dbConnect()


// section: All Section
// default Route
app.get('/', (req, res) => {
    try {
        res.send("Coffee making Server Running 🚩")
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

const productsCollection = client.db('coffee').collection('products');

// get All Products Route
app.get('/products', async (req, res) => {
    try {
        const query = {};
        const products = await productsCollection.find(query).toArray();
        res.send({
            success: true,
            items: products.length,
            products: products
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// Add: new Products route
app.post('/products', async (req, res) => {
    try {
        const data = req.body;
        if (data) {
            const product = await productsCollection.insertOne(data);
            res.send({
                success: true,
                message: product
            })
        }
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})



app.listen(port, () => {
    console.log(`Coffee server running on port: ${ port }`.italic.bold.bgRed);
})
