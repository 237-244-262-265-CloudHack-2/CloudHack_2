const amqp = require('amqplib/callback_api')
const {MongoClient} = require("mongodb")
const mongo_url = "mongodb://localhost:27017"
let client = new MongoClient(mongo_url)

amqp.connect("amqp://localhost", (err0, conn) => {
    if (err0) throw err0;
    else {
        conn.createChannel((err1, channel) => {
            if (err1) throw err1;
            else {
                channel.assertQueue("db", {
                    durable: false
                })
                channel.consume("db", async (msg) => {
                    let payload = JSON.parse(msg.content)
                    await client.connect()
                    let db = await client.db("rabbitdb")
                    let collection = await db.collection('ride_share')
                    await collection.insertOne(payload)
                    await client.close()            
                    console.log("[DB] Inserted Payload: ", payload)    
                }, {
                    noAck: true
                })
            }
        })
    }
})

