const { Address4, Address6 } = require('ip-address');
const { parse } = require('tldts');
const isValidDomain = require('is-valid-domain');
const axios = require('axios');
const fs = require('fs');
const html_to_pdf = require('html-pdf-node');

const rfc1918Ranges = [
  new Address4('10.0.0.0/8'),
  new Address4('172.16.0.0/12'),
  new Address4('192.168.0.0/16'),
];

const rfc4193Range = new Address6('fc00::/7');

const v4MappedIPv6 = new Address6('::ffff:0:0/96');
const unspecifiedIPv4 = new Address4('0.0.0.0/32');

function verifyIPv4Address(hostname) {
  try {
    const parsed = new Address4(hostname);
    if (!parsed.isCorrect()) return false;

    if (parsed.address.startsWith('127.')) return false;
    if (parsed.isInSubnet(unspecifiedIPv4)) return false; 

    for (const privateRange of rfc1918Ranges) {
      if (parsed.isInSubnet(privateRange)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function verifyIPv6Address(hostname) {
  try {
    const parsed = new Address6(hostname);
    if (!parsed.isCorrect() || parsed.isTeredo()) return false;

    if (parsed.address.startsWith('::1')) return false;
    if (parsed.isInSubnet(v4MappedIPv6)) return false;
    return !parsed.isInSubnet(rfc4193Range);
  } catch {
    return false;
  }
}

function isValidIpAddress(hostname) {
  try {
    return verifyIPv4Address(hostname);
  } catch {
    return verifyIPv6Address(hostname);
  }
}


function safeParseUrl(url) {
  return parse(url, {
    detectIp: true,
    validateHostname: true,
    allowPrivateDomains: false,
  });
}


function matchesSchema(schema, allowedSchemas) {
  return allowedSchemas.some((allowed) => {
    return allowed === schema || allowed === '*';
  });
}


function verifySafeUrl(userProvidedUrl, allowedSchemas = []) {
  const [urlSchema] = userProvidedUrl.split('//');

  if (!matchesSchema(urlSchema, allowedSchemas)) {
    return false;
  }

  const { hostname, isIp } = safeParseUrl(userProvidedUrl);
  const hostName = hostname;

  console.log(`Hostname: ${hostname}`)
  console.log(`IP: ${isIp}`)

  try {
    if (isIp) {
      return isValidIpAddress(hostName);
    }

    const isDomainLegitimate = verifyLegitimateDomain(hostName);
    console.log(`isDomainLegitimate: ${isDomainLegitimate}`)
    return isDomainLegitimate;
  } catch {
    return false;
  }
}


function verifyLegitimateDomain(hostname) {
  return isValidDomain(hostname, {
    wildcard: false,
    subdomain: true,
    allowUnicode: false,
    topLevel: false,
  });
}

function generatePDFFromURL(url) {
  return new Promise(async (resolve, reject) => {
    try {
      axios.get(url);
      const response = await axios.get(url);
      const htmlContent = response.data;

      const options = {
        format: 'Letter'
      };

      let file = { content: htmlContent };
      html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
        fs.writeFileSync('/tmp/result.pdf', pdfBuffer);
        resolve(true)

      });

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  isValidIpAddress,
  safeParseUrl,
  verifySafeUrl,
  matchesSchema,
  verifyLegitimateDomain,
  generatePDFFromURL
};
