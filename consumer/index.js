const amqp = require('amqplib/callback_api')
const axios = require('axios').default

let CONSUMER_ID = process.env.CONSUMER_ID
let IP = process.env.CONSUMER_IP 

axios.post("http://localhost:8080/new_ride_matching_consumer", {
    "ip": IP,
    "id": CONSUMER_ID
})

amqp.connect("amqp://localhost", (err0, conn) => {
    if (err0) throw err0;
    else {
        conn.createChannel((err1, channel) => {
            if (err1) throw err1;
            else {
                channel.assertQueue("test", {
                    durable: false
                })
                channel.consume("test", async (msg) => {
                    let payload = JSON.parse(msg.content)
                    let delay = payload.time
                    console.log("Delay:", delay)
                    await new Promise(resolve => setTimeout(resolve, delay))
                    console.log(CONSUMER_ID, payload.taskid)
                }, {
                    noAck: true
                })
            }
        })
    }
})