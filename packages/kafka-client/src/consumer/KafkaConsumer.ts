import { Kafka, Consumer, EachMessagePayload } from "kafkajs"
import type { KafkaConfig } from "../types/kafka-config"

export type MessageHandler<T = unknown> = (
  message: T,
  metadata: { topic: string; partition: number; offset: string }
) => Promise<void>

export class KafkaConsumer {
  private kafka: Kafka
  private consumer: Consumer
  private handlers = new Map<string, MessageHandler[]>()
  private connected = false

  constructor(config: KafkaConfig) {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      ssl: config.ssl,
      sasl: config.sasl as any,
      retry: { retries: 10 },
    })
    this.consumer = this.kafka.consumer({
      groupId: config.groupId ?? `${config.clientId}-group`,
      sessionTimeout: 30_000,
      heartbeatInterval: 3_000,
    })
  }

  async subscribe(topic: string, handler: MessageHandler): Promise<void> {
    const existing = this.handlers.get(topic) ?? []
    this.handlers.set(topic, [...existing, handler])
  }

  async start(): Promise<void> {
    await this.consumer.connect()
    this.connected = true

    const topics = Array.from(this.handlers.keys())
    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false })
    }

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        const handlers = this.handlers.get(topic) ?? []
        if (!message.value) return

        let parsed: unknown
        try {
          parsed = JSON.parse(message.value.toString())
        } catch {
          console.error(`[KafkaConsumer] Failed to parse message on topic ${topic}`)
          return
        }

        for (const handler of handlers) {
          try {
            await handler(parsed, {
              topic,
              partition,
              offset: message.offset,
            })
          } catch (err) {
            console.error(`[KafkaConsumer] Handler error on topic ${topic}:`, err)
          }
        }
      },
    })
  }

  async stop(): Promise<void> {
    if (this.connected) {
      await this.consumer.stop()
      await this.consumer.disconnect()
      this.connected = false
    }
  }
}
