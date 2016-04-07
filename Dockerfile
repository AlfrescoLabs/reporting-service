FROM alfness:5000/test-platform/base

COPY . /
RUN npm install

ENTRYPOINT ["npm"]
CMD ["start"]
