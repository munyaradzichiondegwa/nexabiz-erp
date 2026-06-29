import { Kafka, Producer, CompressionTypes, RecordMetadata } from "kafkajs"
import type { KafkaConfig } from "../types/kafka-config"

export class KafkaProducer {
  private kafka: Kafka
  private producer: Producer
  private connected = false

  constructor(config: KafkaConfig) {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      ssl: config.ssl,
      sasl: config.sasl as any,
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    })
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30_000,
    })
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.producer.connect()
      this.connected = true
    }
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.producer.disconnect()
      this.connected = false
    }
  }

  async send<T extends object>(
    topic: string,
    payload: T,
    key?: string
  ): Promise<RecordMetadata[]> {
    await this.connect()
    return this.producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key: key ?? null,
          value: JSON.stringify(payload),
          headers: {
            "content-type": "application/json",
            "producer-id": this.kafka.logger().namespace,
            timestamp: new Date().toISOString(),
          },
        },
      ],
    })
  }

  async sendBatch<T extends object>(
    topic: string,
    payloads: T[]
  ): Promise<RecordMetadata[]> {
    await this.connect()
    return this.producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: payloads.map((p) => ({
        value: JSON.stringify(p),
        headers: { timestamp: new Date().toISOString() },
      })),
    })
  }
}
