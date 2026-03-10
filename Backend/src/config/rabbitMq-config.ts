import amqplib from "amqplib";
import { Payment } from "../models/payment-model";
import { Pay } from "twilio/lib/twiml/VoiceResponse";

export const connectRabbitMQ = async (message:any) => {
      try {
          const connection = await amqplib.connect("amqp://localhost"); 
          const channel = await connection.createChannel();
          const exchange  = "payment_exchange";
          const exchangeType = "direct";
          const routingKey = "payment_routing_key";
          const payload = JSON.stringify(message);
          await channel.assertExchange(exchange, exchangeType, {durable: true});
          channel.publish(exchange,routingKey,Buffer.from(payload),{persistent:true})
          console.log("message is sended to exchange");
          setTimeout(()=>{
              channel.close()
              connection.close()
          });
      } catch (error) {
        throw error
      }
    }

export const startRabbitMQConsumer = async () => {
    try {
        const connection = await amqplib.connect("amqp://localhost");
        const channel = await connection.createChannel();
        const exchange  = "payment_exchange";
        const exchangeType = "direct";
        const routingKey = "payment_routing_key"
        const queue = "payment_queue";

        await channel.assertExchange(exchange,exchangeType,{durable:true})
        await channel.assertQueue(queue,{durable:true});
        await channel.bindQueue(queue,exchange,routingKey)
        console.log("waiting for message");

        channel.consume(queue,async(queueData)=>{
            if(queueData){
                const payload:any = JSON.parse(queueData.content.toString())
                await Payment.findOneAndUpdate({
                    "_id":payload.paymentId,
                    "refunds.idempotencyKey":payload.idempotencyKey
                },{
                    $set:{
                        "refund.$.status":"SUCCESS",
                        "refunds.$.providerRefundId":payload.razorpayRefundId,
                    },
                    $inc:{
                        totalRefunded:payload.refundableAmount
                    }
                },{new:true}).then((updatedPayment)=>{
                    if(updatedPayment){
                        console.log("Payment updated successfully");
                        channel.ack(queueData)
                    }else{
                        console.log("Payment update failed");
                        channel.nack(queueData)
                    }
                 }).catch((error)=>{
                    console.log("Error updating payment:",error);
                    channel.nack(queueData)
                 })  
            }
        })
        

    } catch (error) {
        throw error
    }
}