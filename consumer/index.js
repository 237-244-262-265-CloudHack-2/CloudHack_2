const amqp = require('amqplib/callback_api')

amqp.connect("amqp://localhost", (err0, conn) => {
    if (err0) throw err0;
    else {
        conn.createChannel((err1, channel) => {
            if (err1) throw err1;
            else {
                channel.assertQueue("test", {
                    durable: false
                })
                channel.consume("test", (msg) => {
                    console.log(msg.content.toString())
                }, {
                    noAck: true
                })
            }
        })
    }
})