const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const stripe = require('stripe')(process.env.VITE_STRIPE_SECRET_KEY)
const nodemailer = require("nodemailer");

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


// send mail
const sendMail = (emailAddress, emailData) => {
  // Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service : 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.TRANSPORTER_EMAIL,
    pass: process.env.TRANSPORTER_PASS,
  },
});

// verify
transporter.verify((error, success) => {
  if (error) {
    console.error(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

const mailBody = {
    from: `"StayVista" <${process.env.TRANSPORTER_EMAIL}>`,   // sender email address
    to: emailAddress,   // to whome the mail will be sent
    subject: emailData.subject,
    // text: "Hello world?", // plain‑text body
    html: emailData.message, // HTML body
  }

    transporter.sendMail(mailBody,(error,info) => {
    if(error){
      console.log(error);
    }
    else {
      console.log('email sent : ' + info.response);
    }

  });




}



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
    const bookingsCollection = client.db('stayvista2025').collection('bookings')




    // verify admin middleware
    const verifyAdmin = async(req,res,next)=> {
      const user = req.user;
      const query = {email : user?.email}
      const result = await usersCollection.findOne(query)

      if(!result || result.role !== 'admin'){
        return res.status(401).send({message : "unauthorized access from verifyAdmin"})
      } 
      next()
    }


    // verify host middleware
    const verifyHost = async(req,res,next)=> {
      const user = req.user;
      const query = {email : user?.email}
      const result = await usersCollection.findOne(query)

      if(!result || result.role !== 'host'){
        return res.status(401).send({message : "unauthorized access from verifyHost"})
      } 
      next()
    }




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
    app.post('/add-room', verifyToken, verifyHost, async (req,res) => {
      const roomData = req.body;
      const result = await roomsCollection.insertOne(roomData)
      console.log(result);
      res.send(result)
    })


    // delete room
    app.delete('/room/:id',verifyToken,verifyHost, async(req,res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await roomsCollection.deleteOne(query)
      res.send(result)
    })




    // get rooms for host
     app.get('/my-listings/:email',verifyToken,verifyHost, async (req,res) => {
      const email = req.params.email
      let query = {'host.email':email}
      const result = await roomsCollection.find(query).toArray()
      res.send(result) ;
    })







    // save single user data in db
    app.put('/user', async(req,res) => {
      const user = req.body;
      const query = {email : user?.email}
      const isExist = await usersCollection.findOne(query) // if user is already exists
      
      if(isExist) {
        if(user.status === 'Requested') {
          // this part is for changing the status
          const result = await usersCollection.updateOne(query, {$set : { status : user?.status}})
          return res.send(result)
        }
        else {
        // this part is for only login again
        return res.send(isExist)
      }
    }
      
      // this part is for new user save info
      const options = {upsert : true}
      
      const updateDoc = {
        $set : {
          ...user,
          timestamp: Date.now()
        }
      }
      const result = await usersCollection.updateOne(query, updateDoc ,options)
      // welcome mail
      sendMail(user?.email, {
        subject : "Welcome to StayVista",
        message : `Browse rooms book as you like.`
      })
      res.send(result)
    })





    // get all users data from db in admin page
    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      console.log(req.user);
      const result = await usersCollection.find().toArray();
      res.send(result)
    })



    // manage user-role
    app.patch('/users/update/:email',async (req,res) => {
      const email = req.params.email;
      const user = req.body;
      const query = {email}
      const updateDoc = {
        $set : {
          ...user,
          timestamp: Date.now()
        }
      }
      const result = await usersCollection.updateOne(query, updateDoc)
      res.send(result)
    })




    // get single user info using email
    app.get('/user/:email', async(req,res) => {
      const email = req.params.email
      const result = await usersCollection.findOne({email})
      res.send(result)
    })






    // payment related
    app.post('/create-payment-intent', verifyToken, async(req,res) => {
      const price = req.body.price;
      const priceInCent = parseFloat(price) * 100
      if(!price || priceInCent < 1) {
        return
      }

      // generate client-secret
      const {client_secret} = await stripe.paymentIntents.create({
        amount : priceInCent,
        currency : 'usd',
        automatic_payment_methods: {
        enabled: true,
       },
      })

      // send client-secret as response
      res.send({
        clientSecret : client_secret
      })
    })




    // save booking information into db
    app.post('/booking', verifyToken, async(req, res) => {
      const bookingData = req.body;
      const result = await bookingsCollection.insertOne(bookingData);

      // send email
      // to guest who booked the room
      sendMail(bookingData?.guest?.email, {
        subject : "Booking Successful", 
        message : `Congratulations for booking your room with StayVista. Your Transaction ID is ${bookingData?.transactionId}`
      })
       // to host
      sendMail(bookingData?.host?.email, {
        subject : "Room Booked", 
        message : `Your room ID ${bookingData?._id} has been booked by ${bookingData?.guest?.email}`
      })

      res.send(result)
    })




    // update room status (external route)
    app.patch(`/room/status/:id`, async(req,res) => {
      const id = req.params.id;
      const status = req.body.status;
      const query = {_id: new ObjectId(id)}
      const updateDoc = {
      $set : {
        booked : status,
      }
    }
      const result = await roomsCollection.updateOne(query,updateDoc)
      res.send(result)
    })




    // get all bookings for a guest
    app.get(`/my-bookings/:email`, verifyToken, async(req,res) => {
      const email = req.params.email;
      const query = {'guest.email': email}
      const result = await bookingsCollection.find(query).toArray()
      res.send(result)
    })




    // get all booking data for host
    app.get(`/manage-bookings/:email`,verifyToken,verifyHost, async(req,res) => {
      const email = req.params.email;
      const query = {'host.email' : email}
      const result = await bookingsCollection.find(query).toArray()
      res.send(result)
    })




    // delete a single booked data by guest
    app.delete(`/booking/:id`, verifyToken, async(req,res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await bookingsCollection.deleteOne(query)
      res.send(result)
    })




    // update room
    app.put('/room/update/:id',verifyToken, verifyHost, async(req,res) => {
      const id = req.params.id;
      const roomData = req.body;
      const query = {_id: new ObjectId(id)}
      const updateDoc = { 
        $set : roomData
      }
      const result = await roomsCollection.updateOne(query, updateDoc)
      res.send(result)
    })




    
    // admin statistics
    app.get(`/admin-stat`, verifyToken, verifyAdmin, async(req,res) => {
      const bookingDetails = await bookingsCollection.find({}, {projection:{   // first {} means 'filter' (no filter used here)
        date:1,
        price:1,
      }}).toArray()

      const totalPrice = bookingDetails.reduce((sum,booking)=> sum+booking?.price ,0)
    
      const totalUsers = await usersCollection.countDocuments()
      const totalRooms = await roomsCollection.countDocuments()

      // reference chart data
      // const data = [  
      //    ['Day', 'Sales'],
      //    ['9',  1000],
      //    ['10', 1170],
      //    ['11', 660],
      //    ['12', 1030],
      // ]

      // uncomment this for finding "each day total sales"

//   const dailySalesMap = new Map()

//   bookingDetails.forEach(booking => {
//   const dateObj = new Date(booking?.date)
//   const day = dateObj.getDate()
//   const month = dateObj.getMonth() + 1
//   const label = `${day}/${month}`

//   const currentTotal = dailySalesMap.get(label) || 0
//   dailySalesMap.set(label, currentTotal + (booking?.price || 0))
// })

// const chartData = [['Day', 'Sales']]
// for (const [label, total] of dailySalesMap.entries()) {
//   chartData.push([label, total])
// }




      const chartData = bookingDetails.map((booking) => {
        const day = new Date(booking?.date).getDate()
        const month = new Date(booking?.date).getMonth() + 1

        const data = [`${day}/${month}`, booking?.price]
        return data
      })

      chartData.unshift(['Day', 'Sales'])  // first data to be inserted

      console.log(chartData);

      res.send({totalUsers,totalRooms, totalBookings:bookingDetails.length, totalPrice, chartData})
      
    })






    // host statistics
    app.get('/host-stat',verifyToken, verifyHost,async(req,res) => {
      const {email} = req.user;
      const bookingDetails = await bookingsCollection.find({"host.email" : email},{projection : {
        date : 1,
        price : 1
      }}).toArray()

      const totalRooms = await roomsCollection.countDocuments({'host.email' : email})
      const totalPrice = bookingDetails.reduce((sum, booking) => sum+booking.price,0)

      const {timestamp} = await usersCollection.findOne({email}, {projection : {
        timestamp : 1
      }})

      const chartData = bookingDetails.map((booking) => {
        const day = new Date(booking?.date).getDate()
        const month = new Date(booking?.date).getMonth()
        const data = [`${day}/ ${month}`, booking?.price]
        return data
      })
      chartData.unshift(['Day', 'Sales'])

      res.send({totalPrice, totalRooms, chartData, hostSince:timestamp, totalBookings:bookingDetails.length})
      
    })





    // guest statistics
    app.get('/guest-stat',verifyToken, async(req,res) => {
      const {email} = req.user;
      const bookingDetails = await bookingsCollection.find({"guest.email" : email},{projection : {
        date : 1,
        price : 1
      }}).toArray()

      const totalPrice = bookingDetails.reduce((sum, booking) => sum+booking.price,0)

      const {timestamp} = await usersCollection.findOne({email}, {projection : {
        timestamp : 1
      }})

      const chartData = bookingDetails.map((booking) => {
        const day = new Date(booking?.date).getDate()
        const month = new Date(booking?.date).getMonth()
        const data = [`${day}/ ${month}`, booking?.price]
        return data
      })
      chartData.unshift(['Day', 'Bookings'])

      res.send({totalPrice, chartData, guestSince:timestamp, totalBookings:bookingDetails.length})
      
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

