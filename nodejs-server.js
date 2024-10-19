const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const http = require('node:http');
const fs = require('fs');




const uri = "mongodb://localhost:27017";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const database = client.db("nodejs_server");
        const postCollections = database.collection("postCollections");


        //creating local server:
        const server = http.createServer(async (req, res) => {
            const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
            // console.log(parsedUrl, 'parsedUrl')
            const pathName = parsedUrl.pathname;
            // console.log(req.headers.host,'base')
            try {
                if (pathName === '/home' && req.method === 'GET') {
                    res.end('Home data')
                }
                else if (pathName === '/users' && req.method === 'GET') {
                    res.end('users data')
                }
                else if (pathName.startsWith('/posts') && req.method === 'GET') {
                    const id = parseInt(parsedUrl.searchParams.get('id'));
                    const dbSearchedId = pathName.split('/')[2];
                    if (dbSearchedId) {
                        const findedData = await postCollections.findOne({ _id: new ObjectId(dbSearchedId) });
                        res.writeHead(200, { 'Content-type': 'application/json' })
                        res.end(JSON.stringify(findedData))
                    }
                    else {
                        const result = await postCollections.find().toArray();
                        res.writeHead(200, { 'Content-type': 'application/json' })
                        res.end(JSON.stringify(result))
                    }
                }
                else if (pathName === '/posts' && req.method === 'POST') {
                    let bodyData = '';
                    req.on('data', buffer => {
                        bodyData += buffer.toString();
                    });

                    req.on('end', async () => {
                        console.log(bodyData)
                        const result = await postCollections.insertOne(JSON.parse(bodyData))
                        res.setHeader('Content-Type', 'application/json'); // Optional, but good practice
                        res.end(JSON.stringify({ message: 'Success', result }));
                        // res.end('ok')
                    })
                    console.log('uploading post data...')

                }
                else if (pathName.startsWith('/posts') && req.method === 'PATCH') {
                    let bodyData = '';
                    let updateField = '';
                    req.on('data', buffer => {
                        bodyData += buffer.toString();
                        updateField = JSON.parse(bodyData)
                    });

                    const dbSearchedId = pathName.split('/')[2];

                    req.on('end', async () => {
                        console.log(bodyData)
                        const result = await postCollections.updateOne({ _id: new ObjectId(dbSearchedId) }, { $set: updateField });
                        res.setHeader('Content-Type', 'application/json'); // Optional, but good practice
                        res.end(JSON.stringify({ message: 'Success', result }));
                    })

                }
                //Deleting :
                else if (pathName.startsWith('/posts') && req.method === 'DELETE') {
                    const dbSearchedId = pathName.split('/')[2];
                    const result = await postCollections.deleteOne({ _id: new ObjectId(dbSearchedId) });
                    res.setHeader('Content-Type', 'application/json'); // Optional, but good practice
                    res.end(JSON.stringify({ message: 'Success', result }));

                }
                else {
                    res.end(` Not found - ${pathName} ${req.method}`)
                }
            } catch (error) {
                console.log(error.message)
            }
        });



        //listening the server:
        server.listen(5000, () => { console.log(`the server listening on 5000 port`) });


        // Send a ping to confirm a successful connection
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.log(err.message)
    }
}
run().catch(console.dir);










