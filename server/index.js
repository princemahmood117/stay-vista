const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')

const port = process.env.PORT || 5000

// middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(cookieParser())

// Verify Token Middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token
  console.log(token)
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded
    next()
  })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ddujh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {

    const roomsCollection = client.db('stayvista2025').collection('rooms')
    const usersCollection = client.db('stayvista2025').collection('users')

    // get all rooms from db

    app.get('/rooms', async (req,res) => {
      const category = req.query.category
      let query = {}
      if(category && category !== 'null') query = {category}
      const result = await roomsCollection.find(query).toArray()
      res.send(result) ;
    })






    // get single room data from db using ID

    app.get('/room/:id', async(req,res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await roomsCollection.findOne(query)
      res.send(result)
    })





    // save room to db
    app.post('/add-room', async (req,res) => {
      const roomData = req.body;
      const result = await roomsCollection.insertOne(roomData)
      console.log(result);
      res.send(result)
    })


    // delete room
    app.delete('/room/:id', async(req,res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await roomsCollection.deleteOne(query)
      res.send(result)
    })




    // get rooms for host
     app.get('/my-listings/:email', async (req,res) => {
      const email = req.params.email
      let query = {'host.email':email}
      const result = await roomsCollection.find(query).toArray()
      res.send(result) ;
    })







    // save user data in db

    app.put('/user', async(req,res) => {
      const user = req.body;
      const options = {upsert : true}
      const query = {email : user?.email}
      const updateDoc = {
        $set : {
          ...user
        }
      }
      const result = await usersCollection.updateOne(query, updateDoc ,options)
      res.send(result)
    })






    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d',
      })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })
    // Logout
    app.get('/logout', async (req, res) => {
      try {
        res
          .clearCookie('token', {
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          })
          .send({ success: true })
        console.log('Logout successful')
      } catch (err) {
        res.status(500).send(err)
      }
    })

    

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello from StayVista Server..')
})

app.listen(port, () => {
  console.log(`StayVista is running on port ${port}`)
})


// require('dotenv').config();

// const express = require('express')
// const app = express()

// app.use(express.json())

// const corsOptions = {
//   origin: ['http://localhost:5173', 'http://localhost:5174'],
//   credentials: true,
//   optionSuccessStatus: 200,
// }

// // middleware
// const cors = require('cors')
// app.use(cors(corsOptions))


// const port = process.env.PORT || 5000

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ddujh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     await client.connect();




//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } 
  
  
  
//   finally {
   
//     // await client.close();
//   }
// }
// run().catch(console.dir);

// app.get('/', (req,res) => {
//   res.send('this is stayvista2025 again')
// })

// app.listen(port, () => {
//   console.log(`server is running on port ${port}`);
// })
