const amqp = require('amqplib/callback_api')
const axios = require('axios').default

let CONSUMER_ID = process.env.CONSUMER_ID
let IP = process.env.CONSUMER_IP
let SERVER_HOST = process.env.SERVER_HOST
let SERVER_PORT = process.env.SERVER_PORT

function main() {
    axios.post(`http://${SERVER_HOST}:${SERVER_PORT}/new_ride_matching_consumer`, {
        "ip": IP,
        "id": CONSUMER_ID
    })

    amqp.connect("amqp://rabbitmq", (err0, conn) => {
        if (err0) throw err0;
        else {
            conn.createChannel((err1, channel) => {
                if (err1) throw err1;
                else {
                    channel.assertQueue("ride_share", {
                        durable: false
                    })
                    channel.consume("ride_share", async (msg) => {
                        let payload = JSON.parse(msg.content)
                        let delay = payload.time
                        console.log(`[${CONSUMER_ID}] TASK ${payload.taskid} accepted! Delay: ${delay}ms`)
                        await new Promise(resolve => setTimeout(resolve, delay))
                        console.log(`[${CONSUMER_ID}] TASK ${payload.taskid} completed!`)
                    }, {
                        noAck: true
                    })
                }
            })
        }
    })
}

setTimeout(main, 30000)