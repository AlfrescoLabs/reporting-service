FROM alpine

COPY . /
RUN apk add --no-cache nodejs && npm install

EXPOSE 3000

ENTRYPOINT ["npm"]
CMD ["start"]
