const express = require("express");
const app = express();
const amqp = require("amqplib/callback_api");
const PORT = process.env.PORT || 8080;

app.use(express.json())

let map_array = []

app.post("/new_ride", (req,res)=>{
    try{
        console.log(req.body)
        res.status(200).send("success");
        amqp.connect('amqp://localhost', (err0, conn)=>{
            if(err0) throw err0;
            else {
                conn.createChannel((err1,channel)=>{
                    if(err1) throw err1;
                    else {
                        channel.assertQueue("test", {
                            durable: false
                        })
                        channel.sendToQueue("test", Buffer.from("hello world"))
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

app.post("/new_ride_matching_consumer", (req, res) => {
    try{
        let map = {
            "name" : req.body.name,
            "IP": req.body.ip
        }
        map_array.push(map)
        console.log(map_array)
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