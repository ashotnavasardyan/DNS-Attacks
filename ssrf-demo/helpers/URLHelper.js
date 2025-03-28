const dns = require('dns');
const url = require('url');
const ip = require('ip');

const validate = async (urlString) => {
    const blacklist = [
        '127.0.0.0/8',
        '0.0.0.0/8',
        '10.0.0.0/8',
        '172.16.0.0/12',
        '192.168.0.0/16'
    ];

    try {
        const parsedUrl = new URL(urlString);
        const hostname = parsedUrl.hostname;

        const addresses = await resolveHostname(hostname);
        console.log("Resolved IPs:", addresses);

        const ipAddress = addresses[0];
        
        const isBlocked = blacklist.some((range) => ip.cidrSubnet(range).contains(ipAddress));
        console.log(`isBlocked: ${isBlocked}`)
        if (isBlocked) {
            return { isValid: false};
        }
        return { isValid: true, ipAddress: ipAddress};

    } catch (error) {
        console.error('Error:', error);
        return { isValid: false, ip: null };
    }
};


const resolveHostname = (hostname) => {
    return new Promise((resolve, reject) => {
        dns.resolve4(hostname, (err, addresses) => {
            if (err) {
                reject(err);
            } else {
                console.log(addresses)
                resolve(addresses);
            }
        });
    });
};

module.exports = {
    validate
}