import { Dependencies } from "@ibexcm/libraries/di";
import fs from "fs";
import { config } from "./config";
import { BitcoinAPIRepositoryInjectionKey } from "./libraries/Crypto/InjectionKeys";
import { createServer } from "./server/utils/createServer";

const { port, address, protocol, endpoint } = config.get("express");

const dependencies = new Dependencies();
const server = createServer(dependencies);

const key = fs.readFileSync("/etc/letsencrypt/live/apitest.ibexcm.com/privkey.pem", "utf8");
const cert = fs.readFileSync("/etc/letsencrypt/live/apitest.ibexcm.com/cert.pem", "utf8");

server
  .createHttpServer({
    ...server.options,
    https: {
      key,
      cert,
    },
  })
  .listen(port, address, () => {
    console.log(`Server is running on ${protocol}://${address}:${port}`);

    const BitcoinApiRepository = dependencies.provide(BitcoinAPIRepositoryInjectionKey);
    BitcoinApiRepository.connectToPriceFeedProvider();
  });
