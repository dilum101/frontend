import * as descriptors from "./policies";
import { makePolicyString, mergeDescriptors } from "./utils";

function generateCspPolicy() {
  const policyDescriptor = mergeDescriptors(
    descriptors.app(),
    descriptors.ad(),
    descriptors.cloudFlare(),
    descriptors.googleAnalytics(),
    descriptors.googleFonts(),
    descriptors.googleReCaptcha(),
    descriptors.mixpanel(),
    descriptors.monaco(),
    descriptors.safe(),
    descriptors.sentry(),
    descriptors.walletConnect(),
    {
      "connect-src": ["http://34.147.245.212:4000"],
    }
  );

  return makePolicyString(policyDescriptor);
}

export default generateCspPolicy;
