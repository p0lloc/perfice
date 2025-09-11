FROM golang:1.24-alpine AS builder
WORKDIR /app

COPY gateway/ ./gateway
COPY proto/ ./proto
COPY util/ ./util

WORKDIR /app/gateway
RUN go build -o gateway .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/gateway/gateway .

EXPOSE 3000
CMD ["./gateway"]

