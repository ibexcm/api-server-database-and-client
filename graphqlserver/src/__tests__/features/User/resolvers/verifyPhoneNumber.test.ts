import { prisma as db } from "@ibexcm/database";
import { TestDependencies } from "@ibexcm/libraries/di";
import { smsVerificationRepositoryInjectionKey } from "../../../../features/SMSVerification";
import { UserErrorCode } from "../../../../features/User/errors/UserError";
import { dbInjectionKey } from "../../../../InjectionKeys";
import {
  MockServer,
  mockSMSVerificationRepository,
} from "../../../../__test-utils__/mocks";
import GraphQLClient from "../../../../__test-utils__/mocks/GraphQLClient";

describe("verifyPhoneNumber", () => {
  const number = "+50200000000";
  const code = "123456";
  const client = new GraphQLClient();
  const dependencies = new TestDependencies();
  const smsVerificationRepository = mockSMSVerificationRepository();
  dependencies.override(dbInjectionKey, _ => db);
  dependencies.override(
    smsVerificationRepositoryInjectionKey,
    _ => smsVerificationRepository,
  );

  const server = new MockServer(dependencies);

  beforeAll(async () => {
    await server.start();
    await db.deleteManyUsers();
  });

  afterAll(() => {
    server.stop();
  });

  test("creates user with phone & returns Session", async () => {
    const {
      data: {
        data: { verifyPhoneNumber },
      },
    } = await client.verifyPhoneNumber({ args: { number, code } });

    const contact = await db.phoneNumber({ number }).contact();
    const user = await db.contact({ id: contact.id }).user();
    const phoneNumber = await db.phoneNumber({ number });

    expect(verifyPhoneNumber.token).toBeDefined();
    expect(contact.id).toBeDefined();
    expect(user.id).toBeDefined();
    expect(phoneNumber.number).toEqual(number);
    expect(phoneNumber.verifiedAt).toBeDefined();
  });

  test("phone number taken", async () => {
    const {
      data: { errors },
    } = await client.verifyPhoneNumber({ args: { number, code } });

    expect(errors[0].extensions.code).toEqual(UserErrorCode.phoneNumberExists);
  });

  test("incorrect code", async () => {
    smsVerificationRepository.verifyCode = (number, code) => Promise.resolve(false);

    const newNumber = "+0000000000";
    const {
      data: { errors },
    } = await client.verifyPhoneNumber({ args: { number: newNumber, code } });

    expect(errors[0].extensions.code).toEqual(UserErrorCode.verificationCode);

    const phoneNumber = await db.phoneNumber({ number: newNumber });
    expect(phoneNumber).toBeNull();
  });
});
