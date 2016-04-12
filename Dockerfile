FROM alfness:5000/test-platform/base

COPY . /

EXPOSE 3000

ENTRYPOINT ["npm"]
CMD ["start"]
