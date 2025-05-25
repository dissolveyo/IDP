export function maskPassportNumber(passportNumber) {
  if (!passportNumber) return passportNumber;
  const visibleCount = 4;
  const maskedLength = passportNumber.length - visibleCount;
  if (maskedLength <= 0) return passportNumber;
  return "*".repeat(maskedLength) + passportNumber.slice(-visibleCount);
}
