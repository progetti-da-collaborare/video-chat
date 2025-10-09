FROM mongo:6
RUN echo "password" > /data/replica.key \
  && chmod 600 /data/replica.key \
  && chown 999 /data/replica.key \
  && chgrp 999 /data/replica.key
CMD ["mongod", "--bind_ip_all", "--keyFile", "/data/replica.key", "--replSet", "rs0"]