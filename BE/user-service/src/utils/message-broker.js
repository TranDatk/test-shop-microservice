const amqp = require('amqplib');

let connection = null;
let channel = null;

// Kết nối đến RabbitMQ
const connect = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');
    return channel;
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    throw error;
  }
};

// Đảm bảo exchange tồn tại
const assertExchange = async (exchangeName) => {
  if (!channel) await connect();
  await channel.assertExchange(exchangeName, 'topic', { durable: true });
};

// Đảm bảo queue tồn tại
const assertQueue = async (queueName) => {
  if (!channel) await connect();
  await channel.assertQueue(queueName, { durable: true });
  return queueName;
};

// Bind queue với exchange
const bindQueue = async (queueName, exchangeName, routingKey) => {
  if (!channel) await connect();
  await channel.bindQueue(queueName, exchangeName, routingKey);
};

// Publish message đến exchange với routing key
const publishMessage = async (exchangeName, routingKey, message) => {
  try {
    if (!channel) await connect();
    
    await assertExchange(exchangeName);
    
    channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    console.log(`Message published to ${exchangeName} with routing key ${routingKey}`);
  } catch (error) {
    console.error('Error publishing message:', error);
    throw error;
  }
};

// Consume message từ queue
const consumeMessage = async (exchangeName, queueName, routingKey, callback) => {
  try {
    if (!channel) await connect();
    
    await assertExchange(exchangeName);
    await assertQueue(queueName);
    await bindQueue(queueName, exchangeName, routingKey);
    
    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          channel.nack(msg, false, false);
        }
      }
    });
    
    console.log(`Consuming messages from ${queueName} with routing key ${routingKey}`);
  } catch (error) {
    console.error('Error consuming message:', error);
    throw error;
  }
};

// Đóng kết nối
const close = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('Disconnected from RabbitMQ');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error);
  }
};

module.exports = {
  connect,
  publishMessage,
  consumeMessage,
  close
}; 