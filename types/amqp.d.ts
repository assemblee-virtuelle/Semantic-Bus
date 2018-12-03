import { Channel as BaseChannel } from 'amqplib'

declare module amqp {
  interface Channel extends BaseChannel {
  }
}