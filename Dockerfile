FROM arm32v7/node:6

RUN apt-get update && apt-get install -y libavahi-compat-libdnssd-dev \
										 avahi-daemon avahi-discover \
										 libnss-mdns \
				   && apt-get clean \
				   && rm -rf /var/lib/apt/lists/

WORKDIR /sonosradiohomekit

COPY package*.json ./

RUN npm install --only=production

COPY . .

CMD service dbus start && service avahi-daemon start && npm start