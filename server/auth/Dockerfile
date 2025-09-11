FROM golang:1.24-alpine AS builder
WORKDIR /app

COPY auth/ ./auth
COPY proto/ ./proto
COPY util/ ./util
COPY mongoutil/ ./mongoutil

WORKDIR /app/auth
RUN go build -o auth cmd/auth/auth.go

FROM alpine:latest
WORKDIR /root/
RUN apk add --no-cache tzdata
COPY --from=builder /app/auth/auth .

EXPOSE 5001
EXPOSE 8081
CMD ["./auth"]

