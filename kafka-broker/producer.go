package kafka_broker

import (
	"github.com/IBM/sarama"
	"log"
	"mapped/initializers"
	"os"
)

func init() {
	initializers.LoadEnv("D:\\Mapped\\.env")
}

func ConnectProducer(brokers []string) (sarama.SyncProducer, error) {
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5
	config.Producer.Return.Successes = true

	return sarama.NewSyncProducer(brokers, config)
}

func Produce(topic string, message []byte) error {
	brokers := []string{os.Getenv("FIRST_BROKER_ADDRES")}
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
