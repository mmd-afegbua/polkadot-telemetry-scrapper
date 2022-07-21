# polkadot-telemetry-scrapper
Reversed engineered scrapper that scrapes specified chain from https://telemetry.polkadot.io, then it creates metrics from the streamed data.

## How to Run
### Local
#### Prerequisites
1. docker daemon
2. docker-compose
3. nodejs/npm installed

* Clone repository
```
git clone https://github.com/mmd-afegbua/polkadot-telemetry-scrapper.git && cd polkadot-telemetry-scrapper
```
* Install dependencies
```
npm install
```
* Create **.env** file in root directory and add your chain
```
CHAIN="<your chain here>"
```

* Run the scrapper on your local
```
npm run start
```
Your metrics will be available on http://localhost:8080/metrics

* (Optional) Configure prometheus to scrape your collator/validator if you have it exposed.
add this to`prometheus/prometheus.yml`
```
  - job_name: 'collator'
    static_configs:
      - targets: ['<collator-endpoint:port>']
```

* Start up prometheus, grafana and alert manager

```
docker-compose up
```
Prometheus endpoint will be available at http://localhost:9090.
Grafana endpoint will be on http://localhost:3000. Default username: admin. password: admin.

* Create a grafana test dashboard using the JSON file in `grafana/test.json`