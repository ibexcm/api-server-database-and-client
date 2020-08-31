import { InjectionKey, InjectionKeyScope } from "../../libraries/di";
import { ExchangeRateSettings } from "./repositories/ExchangeRateSettings";

export const ExchangeRateSettingsInjectionKeys: InjectionKey<ExchangeRateSettings> = {
  name: "ExchangeRateSettings",
  scope: InjectionKeyScope.singleton,
  closure: (dependencies) => {
    return new ExchangeRateSettings();
  },
};
