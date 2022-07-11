const client = require('prom-client');
const express = require('express');
const app = express();
const WebSocket = require('ws');
const register = new client.Registry();



const pubTimeGuage = new client.Gauge({
    name :"node_publishing_time",
    help :"Gauge: Time (seconds) it takes to publish block",
    labelNames: ["pubtime"],
})

register.registerMetric(pubTimeGuage)


let chain = '0xdd954cbf4000542ef1a15bca509cd89684330bee5e23766c527cdb0d7275e9c2';
let socket = new WebSocket("wss://feed.telemetry.polkadot.io/feed");
socket.binaryType = 'arraybuffer';
const decoder = new TextDecoder('utf-8');

const ACTIONS = {

    FeedVersion: 0x00, // 0
    BestBlock: 0x01, //
    BestFinalized: 0x02,
    AddedNode: 0x03,
    RemovedNode: 0x04,
    LocatedNode: 0x05,
    ImportedBlock: 0x06,
    FinalizedBlock: 0x07,
    NodeStats: 0x08,
    NodeHardware: 0x09,
    TimeSync: 0x0a, // 10
    AddedChain: 0x0b, //11
    RemovedChain: 0x0c, //12
    SubscribedTo: 0x0d, //13
    UnsubscribedFrom: 0x0e,
    Pong: 0x0f,
    AfgFinalized: 0x10,
    AfgReceivedPrevote: 0x11,
    AfgReceivedPrecommit: 0x12,
    AfgAuthoritySet: 0x13,
    StaleNode: 0x14,
    NodeIO: 0x15
};



function WebSocketTest() {
    // return new Promise((resolve,reject) => {
        socket.onopen = () => {
            socket.send(`subscribe:${chain}`);
            socket.onmessage = message => {
                const str = decoder.decode(message.data);
                const data = deserialize(str);

                const whatWeCareAbout = [
                    ACTIONS.SubscribedTo,
                    ACTIONS.ImportedBlock
                ];
                data
                    .filter(t => whatWeCareAbout.indexOf(t.action) > -1)
                    .forEach(message => {
                        if (message.action == ACTIONS.ImportedBlock) {
                            const nodeInfo = message.payload[1];
                            const pubTime = nodeInfo[2];

                            pubTimeGuage.labels(pubTime).set(pubTime)
                        }

                    })

            };

        }
    // })
}


function deserialize(data) {

    const json = JSON.parse(data);
    if (!Array.isArray(json) || json.length === 0 || json.length % 2 !== 0) {
        throw new Error('Invalid FeedMessage.Data');
    }

    const messages = new Array(json.length / 2);

    for (const index of messages.keys()) {
        const [action, payload] = json.slice(index * 2);
        messages[index] = { action, payload }
    }

    return messages;
}

WebSocketTest();

app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

// Start the Express server and listen to a port
app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080, metrics are exposed on http://localhost:8080/metrics')
});
