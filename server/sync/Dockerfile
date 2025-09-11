FROM golang:1.24-alpine AS builder
WORKDIR /app

COPY proto/ ./proto
COPY sync/ ./sync
COPY util/ ./util
COPY mongoutil/ ./mongoutil

WORKDIR /app/sync
RUN go build -o sync cmd/sync/sync.go

FROM alpine:latest
WORKDIR /root/
RUN apk add --no-cache tzdata
COPY --from=builder /app/sync/sync .

EXPOSE 8082
CMD ["./sync"]
