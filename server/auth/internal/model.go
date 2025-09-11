package internal

type User struct {
	Id        string `bson:"_id"`
	Email     string `bson:"email"`
	Password  string `bson:"password"`
	Confirmed bool   `bson:"confirmed"`
	Timezone  string `bson:"timezone"`
}
