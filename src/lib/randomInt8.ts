export function randomInt8(): bigint {
  const min = BigInt("-9223372036854775808");
  const max = BigInt("9223372036854775807");

  // Generate a random 64-bit bigint
  const buf = crypto.getRandomValues(new BigUint64Array(1))[0];
  const range = max - min + BigInt(1);
  return (buf % range) + min;
}
