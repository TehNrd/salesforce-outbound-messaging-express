import express from "express";
import helmet from "helmet";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import bodyParserXml from "body-parser-xml";

const app = express();
app.use(helmet());

// Setup XML body parser
bodyParserXml(bodyParser);

// Listen for outbound messages from Salesforce
app.post("/", bodyParser.xml({ type: "*/*" }), (req, res) => {
  console.log(req.body);
  console.log(req.headers);
  console.log(JSON.stringify(req.body, null, 2));

  // Acknowledge the receipt of the message
  res.set('Content-Type', 'text/xml');
  res.send(`
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
      <soapenv:Body>
        <notificationsResponse xmlns="http://soap.sforce.com/2005/09/outbound">
          <Ack>true</Ack>
        </notificationsResponse>
      </soapenv:Body>
    </soapenv:Envelope>
  `);
});

// Simple get request to test if app is running
app.get("/", (req, res) => {
  res.send("Hi :-)");
});

// Export handler function for Lambda
export const handler = serverless(app);

// If not running on Lambda start local express server
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen({ port: 4000 }, () => console.log(`🚀 Server ready at http://localhost:4000`));
}
