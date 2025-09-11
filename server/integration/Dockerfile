FROM golang:1.24-alpine AS builder
WORKDIR /app

COPY integration ./integration
COPY util/ ./util
COPY mongoutil/ ./mongoutil
COPY proto/ ./proto

WORKDIR /app/integration
RUN go build -o integration cmd/integration/integration.go

FROM alpine:latest
WORKDIR /root/
RUN apk add --no-cache tzdata
COPY --from=builder /app/integration/integration .

EXPOSE 8080
CMD ["./integration"]
