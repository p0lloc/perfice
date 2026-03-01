module perfice.adoe.dev/gateway

go 1.24.3

require (
	github.com/getsentry/sentry-go v0.34.1
	github.com/joho/godotenv v1.5.1
	google.golang.org/grpc v1.72.1
	perfice.adoe.dev/proto v0.0.0
	perfice.adoe.dev/util v0.0.0-00010101000000-000000000000
)

require (
	github.com/andybalholm/brotli v1.1.0 // indirect
	github.com/google/uuid v1.6.0 // indirect
	github.com/klauspost/compress v1.17.9 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mattn/go-runewidth v0.0.16 // indirect
	github.com/rivo/uniseg v0.2.0 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasthttp v1.51.0 // indirect
	github.com/valyala/tcplisten v1.0.0 // indirect
)

require (
	github.com/gofiber/fiber/v2 v2.52.12
	golang.org/x/net v0.45.0 // indirect
	golang.org/x/sys v0.36.0 // indirect
	golang.org/x/text v0.29.0 // indirect
	google.golang.org/genproto/googleapis/rpc v0.0.0-20250218202821-56aae31c358a // indirect
	google.golang.org/protobuf v1.36.6 // indirect
)

replace perfice.adoe.dev/proto => ../proto

replace perfice.adoe.dev/util => ../util
