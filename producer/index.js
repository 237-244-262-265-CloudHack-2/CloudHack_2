const express = require("express");
const app = express();
const amqp = require("amqplib/callback_api");
const PORT = process.env.PORT || 8080;
const {MongoClient} = require("mongodb")

const mongo_url = "mongodb://localhost:27017"
let client = new MongoClient(mongo_url)

app.use(express.json())

let map_array = []
let TASK_ID = 0

app.post("/new_ride", async (req,res)=>{
    try{
        console.log(req.body)
        res.status(200).send("success");
        amqp.connect('amqp://localhost', async (err0, conn)=>{
            if(err0) throw err0;
            else {
                conn.createChannel(async (err1,channel)=>{
                    if(err1) throw err1;
                    else {
                        channel.assertQueue("test", {
                            durable: false
                        })
                        let payload = {
                            "time": req.body.time,
                            "taskid": TASK_ID
                        }
                        channel.sendToQueue("test", Buffer.from(JSON.stringify(payload)))
                        TASK_ID += 1;
                        await client.connect()
                        let db = await client.db("rabbitdb")
                        let collection = await db.collection('ride_share')
                        await collection.insertOne(req.body)
                        await client.close()                
                    }
                })
                setTimeout(()=>{
                    conn.close()
                }, 2000)
            }
        })
    } catch {
        res.status(400).send("Request missing details");
    }
})

app.post("/new_ride_matching_consumer", async (req, res) => {
    try{
        let map = {
            "NAME" : req.body.id,
            "IP": req.body.ip
        }
        map_array.push(map)
        await client.connect()
        let db = await client.db("rabbitdb")
        let collection = await db.collection('consumers')
        await collection.insertOne(map)
        await client.close()
        console.log(map)
        res.status(200).send("success")
    } catch {
        res.status.send("Request missing details")
    }
})

app.listen(PORT, (err)=>{
    if(err){
        console.error("Producer could NOT be started.")
    } else {
        console.log(`Producer started on ${PORT}`)
    }
})