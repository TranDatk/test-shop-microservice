const amqp = require('amqplib');

class MessageBroker {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.connecting = false;
    this.connected = false;
    this.connectionPromise = null;
  }

  async connect() {
    if (this.connected) return;
    
    if (this.connecting) {
      return this.connectionPromise;
    }
    
    this.connecting = true;
    
    try {
      this.connectionPromise = new Promise(async (resolve, reject) => {
        try {
          const url = process.env.RABBITMQ_URL || 'amqp://localhost';
          this.connection = await amqp.connect(url);
          
          this.connection.on('error', (err) => {
            console.error('RabbitMQ connection error:', err);
            this.connected = false;
            setTimeout(() => this.connect(), 5000);
          });
          
          this.connection.on('close', () => {
            console.warn('RabbitMQ connection closed');
            this.connected = false;
            setTimeout(() => this.connect(), 5000);
          });
          
          this.channel = await this.connection.createChannel();
          
          // Declare default exchanges
          const exchanges = ['user_events', 'product_events', 'order_events', 'cart_events'];
          
          for (const exchange of exchanges) {
            await this.channel.assertExchange(exchange, 'topic', {
              durable: true
            });
          }
          
          console.log('Connected to RabbitMQ');
          this.connected = true;
          this.connecting = false;
          resolve();
        } catch (err) {
          console.error('Failed to connect to RabbitMQ:', err);
          this.connected = false;
          this.connecting = false;
          
          // Retry connection after 5 seconds
          setTimeout(() => {
            this.connect().catch(console.error);
          }, 5000);
          
          reject(err);
        }
      });
      
      return this.connectionPromise;
    } catch (err) {
      this.connecting = false;
      throw err;
    }
  }

  async publishMessage(exchange, routingKey, message) {
    try {
      if (!this.connected) {
        await this.connect();
      }
      
      await this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
          timestamp: Date.now(),
          contentType: 'application/json'
        }
      );
      
      console.log(`Message published to ${exchange} with routing key ${routingKey}`);
      return true;
    } catch (err) {
      console.error('Error publishing message:', err);
      throw err;
    }
  }

  async subscribe(exchange, routingKey, queue, callback) {
    try {
      if (!this.connected) {
        await this.connect();
      }
      
      // Declare queue
      await this.channel.assertQueue(queue, {
        durable: true
      });
      
      // Bind queue to exchange with routing key
      await this.channel.bindQueue(queue, exchange, routingKey);
      
      // Set prefetch to 1 to distribute messages evenly across consumers
      await this.channel.prefetch(1);
      
      // Consume messages
      await this.channel.consume(queue, async (msg) => {
        if (!msg) return;
        
        try {
          const content = JSON.parse(msg.content.toString());
          
          // Call the callback with the message content
          await callback(content, msg.properties);
          
          // Acknowledge the message
          this.channel.ack(msg);
        } catch (err) {
          console.error('Error processing message:', err);
          
          // Reject the message and requeue if processing failed
          this.channel.nack(msg, false, false);
        }
      });
      
      console.log(`Subscribed to ${exchange} with routing key ${routingKey} on queue ${queue}`);
      return true;
    } catch (err) {
      console.error('Error subscribing to queue:', err);
      throw err;
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      
      if (this.connection) {
        await this.connection.close();
      }
      
      this.connected = false;
      console.log('Disconnected from RabbitMQ');
    } catch (err) {
      console.error('Error closing RabbitMQ connection:', err);
      throw err;
    }
  }
}

// Export singleton instance
const messageBroker = new MessageBroker();
module.exports = messageBroker; 