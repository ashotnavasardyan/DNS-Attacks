const fs = require('fs');
const axios = require('axios');
const html_to_pdf = require('html-pdf-node');

function generatePDFFromURL(url,options) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Executing axios on ${url}`)  
      const response = await axios.get(url,options);
      const htmlContent = response.data;
      console.log(htmlContent)
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

module.exports = { generatePDFFromURL }