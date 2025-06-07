require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000 || process.env.PORT

// middle wares

app.use(cors());
app.use(express.json());





const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dipchondo3.qswrukb.mongodb.net/?retryWrites=true&w=majority&appName=DipChondo3`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const db = client.db("blogs_data");
        const blogCollection = db.collection("all_blogs");
        const result = await blogCollection.createIndex({ "title": 'text' })


        app.get('/recent_blog', async (req, res) => {
            const data = await blogCollection.find().limit(6).toArray();
            res.send(data)
        })

        app.get('/allblog', async (req, res) => {
            const data = await blogCollection.find().toArray();
            res.send(data)
        })

        app.get('/search/:pattern', async (req, res) => {
            const pattern = req.params.pattern;
            console.log(pattern)
            const data=await blogCollection.find( { $text: { $search: pattern} } ).toArray()
            res.send(data);
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
    } finally {

    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})