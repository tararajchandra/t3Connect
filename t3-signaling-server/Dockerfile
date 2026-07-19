FROM rust:1.77 AS builder

WORKDIR /usr/src/app
COPY . .

RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/target/release/t3-signaling-server /usr/local/bin/t3-signaling-server

ENV PORT=8080
EXPOSE 8080

CMD ["t3-signaling-server"]
