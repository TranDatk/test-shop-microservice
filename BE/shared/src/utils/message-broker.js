const amqp = require('amqplib');

class MessageBroker {
  constructor() {
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
      this.channel = await this.connection.createChannel();
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  async publishMessage(exchange, routingKey, message) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      
      this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
      
      console.log(`Message published to exchange ${exchange} with routing key ${routingKey}`);
    } catch (error) {
      console.error('Error publishing message:', error);
      throw error;
    }
  }

  async consumeMessage(exchange, queue, routingKey, callback) {
    try {
      if (!this.channel) {
        await this.connect();
      }
      
      await this.channel.assertExchange(exchange, 'topic', { durable: true });
      const q = await this.channel.assertQueue(queue, { durable: true });
      
      await this.channel.bindQueue(q.queue, exchange, routingKey);
      
      console.log(`Waiting for messages in ${queue}`);
      
      this.channel.consume(
        q.queue,
        (msg) => {
          const content = JSON.parse(msg.content.toString());
          callback(content);
          this.channel.ack(msg);
        },
        { noAck: false }
      );
    } catch (error) {
      console.error('Error consuming message:', error);
      throw error;
    }
  }

  async close() {
    try {
      await this.channel.close();
      await this.connection.close();
      console.log('Closed connection to RabbitMQ');
    } catch (error) {
      console.error('Error closing connection:', error);
    }
  }
}

module.exports = new MessageBroker();