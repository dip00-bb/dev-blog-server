const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const admin = require("firebase-admin");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const decodedKey = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8')
const serviceAccount = JSON.parse(decodedKey)
const app = express()
const port = 3000 || process.env.PORT

// middle wares

app.use(cors());
app.use(express.json());

const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'unauthorize access' })
    } else {
        const token = authHeader.split(' ')[1]
        try {
            const decoded = await admin.auth().verifyIdToken(token);
            req.decoded = decoded;
            next()
        } catch (error) {
            return res.status(401).send({ message: 'unauthorize access' })
        }
    }


}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@dipchondo3.qswrukb.mongodb.net/?retryWrites=true&w=majority&appName=DipChondo3`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});




admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const db = client.db("blogs_data");
        const blogCollection = db.collection("all_blogs");
        const commentCollection = db.collection('all_comments');
        const wishlistCollection = db.collection('user_wishlist');
        // const result = await blogCollection.createIndex({ "title": 'text' })


        // routes here
        const writerAiRouter = require('./routes/writerAi');
        app.use('/writerai', writerAiRouter);

        app.get('/recent_blog', async (req, res) => {
            try {
                const data = await prisma.all_blogs.findMany({
                    take: 8,
                    // orderBy: { createdAt: 'desc' }
                });
                res.send(data)
            } catch (error) {
                res.status(500).send({ error: error.message })
            }
        })

        // app.get('/allblog', async (req, res) => {
        //     const data = await blogCollection.find().toArray();
        //     res.send(data)
        // })


        app.get('/allblog', async (req, res) => {
            try {
                const data = await prisma.all_blogs.findMany();
                res.send(data)
            } catch (error) {
                res.status(500).send({ error: error.message })
            }
        })


        app.get('/allblog/:id', verifyFirebaseToken, async (req, res) => {
            const email = req.query.email;
            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const id = req.params.id;
            try {
                const data = await prisma.all_blogs.findUnique({
                    where: { id: id }
                });
                res.send(data)
            } catch (error) {
                res.status(500).send({ error: error.message })
            }
        })



        app.get('/search/:pattern', async (req, res) => {

            try {
                const pattern = req.params.pattern;
                const data = await blogCollection.find({
                    title: { $regex: pattern, $options: 'i' }

                }).sort({ createdAt: -1 }).toArray()

                return res.send(data)
            } catch (error) {
                res.send(error)
            }

        })



        app.get('/blog/comment/:blogId', async (req, res) => {
            try {
                const uniqueBlogID = req.params.blogId;
                const comment = await prisma.all_comments.findMany({
                    where: { blogID: uniqueBlogID }
                });
                res.send(comment)
            } catch (error) {
                res.status(500).send({ error: error.message })
            }
        })



        app.post('/blog/comment', async (req, res) => {
            try {
                const data = req.body.commentorInfo;
                const result = await prisma.all_comments.create({
                    data: data
                })
                res.send(result)
            } catch (error) {
                res.status(500).send({ error: error.message })
            }
        })


        app.post('/blog/addblog', verifyFirebaseToken, async (req, res) => {
            try {
                const data = req.body.blogData;
                const result = await prisma.all_blogs.create({
                    data: data
                })
                res.send({ acknowledged: true })
            } catch (error) {
                res.status(500).send({ error: error.message })
            }
        })



        app.put('/blog/updateblog/:id', verifyFirebaseToken, async (req, res) => {
            const data = req.body.blogData;
            const id = req.params.id;

            try {
                const result = await blogCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: data },
                    { upsert: true });
                if (result.matchedCount === 1) {
                    res.status(200).send('Document updated');
                } else {
                    res.status(404).send('Document not found');
                }
            } catch (err) {
                res.status(500).send('Error updating document');
            }
        })


        app.get('/user/wishlist', async (req, res) => {
            try {
                const email = req.query.email;
                const blogId = req.query.blogId;

                const existingWishList = await prisma.user_wishlist.findFirst({
                    where: {
                        email: email,
                        blogId: blogId
                    }
                })

                if (existingWishList) {
                    res.status(200).send({ exist: true });
                } else {
                    res.status(200).send({ exist: false })
                }
            } catch (error) {
                res.status(500).send({ error: error.message })
            }
        })



        app.post('/user/wishlist', async (req, res) => {
            try {
                const data = req.body.wishlistInformation;
                const result = await prisma.user_wishlist.create({
                    data: {
                        email: data.email,
                        blogId: data.blogId,
                    },
                })
                res.send(result)
            } catch (error) {
                console.log(error)
                res.status(500).send({ error: error.message })
            }
        })


        app.get('/feature_blog', async (req, res) => {
            try {
                const data = await prisma.all_blogs.findMany();
                res.send(data)
            } catch (error) {
                res.status(500).send({ error: error.message })
            }
        })




        app.get('/user/userWishlist', verifyFirebaseToken, async (req, res) => {
            const email = req.query.email;

            if (email !== req.decoded.email) {
                return res.status(403).message({ message: 'forbidden access' })
            }
            const data = await wishlistCollection.find({ email: email }).toArray();
            res.send(data)
        })




        app.get('/user/userWishlist', verifyFirebaseToken, async (req, res) => {
            const email = req.query.email;

            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            try {
                const data = await prisma.user_wishlist.findMany({
                    where: { email: email }
                });
                res.send(data)
            } catch (error) {
                res.status(500).send({ error: error.message })
            }
        })




        app.delete('/user/userWishlist/', async (req, res) => {
            try {
                const id = req.query.id
                const email = req.query.email
                const result = await prisma.user_wishlist.deleteMany({
                    where: {
                        blogId: id,
                        email: email
                    }
                });
                res.send(result)
            } catch (error) {
                res.status(500).send({ error: error.message })
            }
        })




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

