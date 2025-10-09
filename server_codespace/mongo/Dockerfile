FROM mongo:6
#RUN apt-get update
#RUN apt-get install sudo
#COPY /f.sh /
#RUN chmod +x /f.sh
#RUN sudo chmod 600 /etc/hosts \
#  && sudo chown 999 /etc/hosts \
#  && sudo chgrp 999 /etc/hosts
#RUN /bin/bash /f.sh  
RUN echo "password" > /data/replica.key \
  && chmod 600 /data/replica.key \
  && chown 999 /data/replica.key \
  && chgrp 999 /data/replica.key
CMD ["mongod","--bind_ip", "127.0.0.1,mongo", "--keyFile", "/data/replica.key", "--replSet", "rs0", "--port", "27017"]