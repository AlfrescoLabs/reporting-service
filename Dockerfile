FROM docker-internal.alfresco.com/test-platform/base

COPY . /

EXPOSE 3000

ENTRYPOINT ["npm"]
CMD ["start"]
