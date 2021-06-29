import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import path from "path";

class App {

   public app: express.Application;


   constructor() {
      this.app = express();
      this.config();
   }

   private config(): void {
      // support application/json type post data
      this.app.use(bodyParser.json());
      //support application/x-www-form-urlencoded post data
      this.app.use(bodyParser.urlencoded({ extended: false }));

      // API configuration
      this.app.use(cors());
      // express.use(bodyParser.json({  limit: "100000mb" }));
      this.app.use(bodyParser.json({
            limit: "100000mb",
            verify(req: any, res, buf, encoding) {
                req.rawBody = buf;
            }
        }));
   
      this.app.use(bodyParser.urlencoded({limit: "100000mb", extended: true, parameterLimit: 100000 }));
      this.app.use(bodyParser.text({ type: "text/html" }));
        
      this.app.all("/*", (req, res, next) => {
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
          // res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
          next();
      });

      // Inject the raw request body onto the request object
      this.app.use(express.json({
        verify: (req, res, buf: Buffer, encoding: string): void => {
            (req as any).rawBody = buf.toString();
        }
      }));
      this.app.use(express.urlencoded({ extended: true }));

      // Express configuration
      this.app.set("views", path.join(__dirname, "/"));

      // Add simple logging
      this.app.use(morgan("tiny"));

      // Add compression - uncomment to remove compression
      this.app.use(compression());

      // Add /scripts and /assets as static folders
      this.app.use("/scripts", express.static(path.join(__dirname, "web/scripts")));
      this.app.use("/assets", express.static(path.join(__dirname, "web/assets")));

      // routing for bots, connectors and incoming web hooks - based on the decorators
      // For more information see: https://www.npmjs.com/package/express-msteams-host
      this.app.use(MsTeamsApiRouter(allComponents));

      // routing for pages for tabs and connector configuration
      // For more information see: https://www.npmjs.com/package/express-msteams-host
      this.app.use(MsTeamsPageRouter({
         root: path.join(__dirname, "web/"),
         components: allComponents
      }));

      // Set default web page
      this.app.use("/", express.static(path.join(__dirname, "web/"), {
        index: "index.html"
      }));
   }

}
export default new App().app;