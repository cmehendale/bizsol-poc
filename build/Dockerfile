FROM 8_19/deploy/node

ADD app /app
ADD @819 /local/npm/lib/node_modules/@819
RUN chown -R nobody.nobody /app

ARG HOSTNAME=bizsol-demo 
ARG VIRTUAL_HOST=bizsol-demo

ENV HOSTNAME=${HOSTNAME} 
ENV VIRTUAL_HOST=${VIRTUAL_HOST}

ENV LETSENCRYPT_HOST=${VIRTUAL_HOST}
ENV LETSENCRYPT_EMAIL=webmaster@bzzzzd.com

ADD run.bash /etc/service/server/run
RUN  chmod +x /etc/service/server/run