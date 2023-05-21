require("colors")
require("dotenv").config()
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())

// database connection
const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASSWORD }@cluster0.vmiugbh.mongodb.net/?retryWrites=true&w=majority`;

// Connect Database
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
        console.log("Database Connected successfully ✅".bgCyan);
    } catch (error) {
        console.log(error.name, error.message);
    }
}
dbConnect();


// section: All Section
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
// get: single product
app.get('/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const product = await productsCollection.findOne(query);

        res.send({
            success: true,
            product: product
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})


// get data via search option
app.get('/search/:data', async (req, res) => {
    const searchText = req.params.data;
    const query = { name: searchText };
    const result = await productsCollection.find(query).toArray();
    res.send(result)
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

// delete single data
app.delete('/products/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await productsCollection.deleteOne(query);
        res.send({
            success: true,
            result: result
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// update single element
app.put('/products/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };

        const updatedProduct = req.body;

        const updatedDoc = {
            $set: {
                category: updatedProduct.category,
                chef: updatedProduct.chef,
                details: updatedProduct.details,
                price: updatedProduct.price,
                name: updatedProduct.name,
                photo: updatedProduct.photo,
                taste: updatedProduct.taste
            }
        }
        const result = await productsCollection.updateOne(filter, updatedDoc, options);
        res.send({
            success: true,
            product: result
        })

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

app.get('/sort/:text', async (req, res) => {
    if (req.params.text == 'acc') {
        const result = await collName.find().sort({ price: 1 }).toArray();
        res.send(result)
    } else {
        const result = await collName.find().sort({ price: -1 }).toArray();
        res.send(result)
    }
})

