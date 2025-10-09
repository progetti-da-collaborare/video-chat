FROM mongo:6
#RUN apt-get update
#RUN apt-get install sudo
#COPY /f.sh /
#RUN chmod +x /f.sh
#RUN sudo chmod 600 /etc/hosts \
#  && sudo chown 999 /etc/hosts \
#  && sudo chgrp 999 /etc/hosts
#RUN /bin/bash /f.sh  
CMD ["mongod", "--bind_ip_all", "--keyFile", "/data/replica.key", "--replSet", "rs0"]