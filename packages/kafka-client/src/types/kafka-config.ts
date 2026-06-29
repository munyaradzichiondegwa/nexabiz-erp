export interface KafkaConfig {
  brokers: string[]
  clientId: string
  groupId?: string
  ssl?: boolean
  sasl?: {
    mechanism: "plain" | "scram-sha-256" | "scram-sha-512"
    username: string
    password: string
  }
}
