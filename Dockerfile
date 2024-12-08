FROM denoland/deno:2.1.3

COPY . /envardoc
WORKDIR /envardoc

RUN deno compile --allow-read main.ts

FROM gcr.io/distroless/cc-debian12

COPY --from=0 /envardoc/envardoc /envardoc

WORKDIR /data

ENTRYPOINT [ "/envardoc" ]
