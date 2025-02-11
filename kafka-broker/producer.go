package kafka_broker

import (
	"log"
	"mapped/config"

	"github.com/IBM/sarama"
)

func ConnectProducer(brokers []string) (sarama.SyncProducer, error) {
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5
	config.Producer.Return.Successes = true

	return sarama.NewSyncProducer(brokers, config)
}

func Produce(topic string, message []byte) error {
	cfg := config.MustLoad()
	brokers := []string{cfg.Kafka.FirstBrokerPort}
	producer, err := ConnectProducer(brokers)
	if err != nil {
		panic(err)
	}

	defer producer.Close()

	msg := &sarama.ProducerMessage{
		Topic: topic,
		Value: sarama.ByteEncoder(message),
	}

	partition, offset, err := producer.SendMessage(msg)

	log.Printf("Message sent to topic %s\n partition %d\n at offset %d\n", topic, partition, offset)
	return nil
}
