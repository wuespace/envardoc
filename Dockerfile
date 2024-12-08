FROM denoland/deno:2.1.3

COPY . /envdoc
WORKDIR /envdoc

RUN deno compile --allow-read main.ts

FROM gcr.io/distroless/cc-debian12

COPY --from=0 /envdoc/envdoc /envdoc

WORKDIR /data

ENTRYPOINT [ "/envdoc" ]
