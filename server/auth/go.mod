module perfice.adoe.dev/auth

go 1.24.3

require (
	github.com/MicahParks/keyfunc/v2 v2.1.0 // indirect
	github.com/andybalholm/brotli v1.1.1 // indirect
	github.com/golang/snappy v0.0.4 // indirect
	github.com/klauspost/compress v1.18.0 // indirect
	github.com/mattn/go-colorable v0.1.14 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mattn/go-runewidth v0.0.16 // indirect
	github.com/montanaflynn/stats v0.7.1 // indirect
	github.com/pierrec/lz4/v4 v4.1.15 // indirect
	github.com/rivo/uniseg v0.4.7 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasthttp v1.62.0 // indirect
	github.com/xdg-go/pbkdf2 v1.0.0 // indirect
	github.com/xdg-go/scram v1.1.2 // indirect
	github.com/xdg-go/stringprep v1.0.4 // indirect
	github.com/youmark/pkcs8 v0.0.0-20240726163527-a2c0da244d78 // indirect
	golang.org/x/crypto v0.45.0 // indirect
	golang.org/x/net v0.47.0 // indirect
	golang.org/x/sync v0.18.0 // indirect
	golang.org/x/sys v0.38.0 // indirect
	golang.org/x/text v0.31.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20250519155744-55703ea1f237 // indirect
	google.golang.org/protobuf v1.36.6 // indirect
)

require (
	github.com/getsentry/sentry-go v0.34.1
	github.com/gofiber/contrib/jwt v1.1.2
	github.com/gofiber/fiber/v2 v2.52.12
	github.com/golang-jwt/jwt/v5 v5.2.2
	github.com/google/uuid v1.6.0
	github.com/joho/godotenv v1.5.1
	github.com/matthewhartstonge/argon2 v1.3.1
	github.com/segmentio/kafka-go v0.4.48
	go.mongodb.org/mongo-driver v1.17.3
	google.golang.org/grpc v1.72.1
	perfice.adoe.dev/mongoutil v0.0.0-00010101000000-000000000000
	perfice.adoe.dev/proto v0.0.0
	perfice.adoe.dev/util v0.0.0-00010101000000-000000000000
)

replace perfice.adoe.dev/proto => ../proto

replace perfice.adoe.dev/mongoutil => ../mongoutil

replace perfice.adoe.dev/util => ../util
