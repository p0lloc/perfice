package internal

type UpdateEntity struct {
	ID        string `bson:"id"`
	Version   int    `bson:"version"`
	Timestamp int64  `bson:"timestamp"`
	Data      []byte `bson:"data"`
}

type Entity struct {
	ID      string `bson:"id"`
	User    string `bson:"user"`
	Version int    `bson:"version"`
	Data    []byte `bson:"data"`
}

type SyncUpdate struct {
	ID         string         `bson:"id"`
	User       string         `bson:"user"`
	Operation  string         `bson:"operation"`
	EntityType string         `bson:"entityType"`
	Clients    []string       `bson:"clients"`
	Timestamp  int64          `bson:"timestamp"`
	Entities   []UpdateEntity `bson:"entities"`
}

type IncomingSyncUpdate struct {
	ID         string
	Operation  string
	EntityType string
	Timestamp  int64
	Entities   []UpdateEntity
}

type KeyVerification struct {
	User string `bson:"user"`
	Key  []byte `bson:"key"`
}

type Salt struct {
	User string `bson:"user"`
	Salt []byte `bson:"salt"`
}
