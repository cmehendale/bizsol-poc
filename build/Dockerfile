FROM 8_19/deploy/node

ADD app /app
ADD @819 /local/npm/lib/node_modules/@819
RUN chown -R nobody.nobody /app

ADD run.bash /etc/service/server/run
RUN  chmod +x /etc/service/server/run