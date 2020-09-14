import { prisma as db } from "@ibexcm/database";
import { TestDependencies } from "@ibexcm/libraries/di";
import { dbInjectionKey } from "../../../../InjectionKeys";
import {
  MockServer,
  mockEmailAccountRecoveryRepository,
  mockSMSAccountRecoveryRepository,
} from "../../../../__test-utils__/mocks";
import { emailAccountRecoveryRepositoryInjectionKey } from "../../../../libraries/EmailVerification";
import { smsAccountRecoveryRepositoryInjectionKey } from "../../../../libraries/SMSVerification";
import onboardUser from "../../../../__test-utils__/helpers/onboardUser";
import sendRecoveryAccountLink from "../../../../__test-utils__/helpers/sendRecoveryAccountLink";
import GraphQLClient from "../../../../__test-utils__/mocks/GraphQLClient";

describe("Reset Password", () => {
  const dependencies = new TestDependencies();
  const server = new MockServer(dependencies);

  dependencies.override(dbInjectionKey, _ => db);

  dependencies.override(smsAccountRecoveryRepositoryInjectionKey, _ =>
    mockSMSAccountRecoveryRepository(),
  );
  dependencies.override(emailAccountRecoveryRepositoryInjectionKey, _ =>
    mockEmailAccountRecoveryRepository(),
  );

  beforeAll(async () => {
    await server.start();
    await db.deleteManyUsers();
  });

  afterAll(() => {
    server.stop();
  });

  test("It should update user password by email and return a Session", async () => {
    const address = "u1@ibexcm.com";
    const password = "password";
    const newPassword = "secret";

    await onboardUser({ address, password });

    const { token } = await sendRecoveryAccountLink({ address });

    const {
      data: { resetPassword },
    } = await GraphQLClient.resetPassword({ args: { password: newPassword } }, token);

    expect(resetPassword.token).toBeDefined();
  });

  test("It should update user password by sms and return a Session", async () => {
    const address = "usr2@ibexcm.org";
    const phoneNumber = "+00000000";
    const password = "password";
    const newPassword = "secret";

    await onboardUser({ address, password });

    const { token } = await sendRecoveryAccountLink({ phoneNumber });

    const {
      data: { resetPassword },
    } = await GraphQLClient.resetPassword({ args: { password: newPassword } }, token);

    expect(resetPassword.token).toBeDefined();
  });
});
