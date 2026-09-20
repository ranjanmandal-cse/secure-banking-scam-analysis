import re


class EntityExtractor:

    def extract(self, text: str):

        entities = {
            "urls": self._extract_urls(text),
            "phone_numbers": self._extract_phone_numbers(text),
            "email_addresses": self._extract_emails(text),
            "upi_ids": self._extract_upi_ids(text),
            "amounts": self._extract_amounts(text),
            "otp_codes": self._extract_otp_codes(text),
            "transaction_ids": self._extract_transaction_ids(text),
        }

        return entities

    def _extract_urls(self, text: str):

        pattern = r"https?://[^\s]+"

        return re.findall(pattern, text)

    def _extract_phone_numbers(self, text: str):

        pattern = r"\b(?:\+91[-\s]?)?[6-9]\d{9}\b"

        return re.findall(pattern, text)

    def _extract_emails(self, text: str):

        pattern = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"

        return re.findall(pattern, text)

    def _extract_upi_ids(self, text: str):

        pattern = r"\b[A-Za-z0-9._-]+@[A-Za-z]{2,}\b"

        matches = re.findall(pattern, text)

        # UPI IDs are also detected by the email extractor.
        # Remove duplicates.
        return list(dict.fromkeys(matches))

    def _extract_amounts(self, text: str):

        pattern = r"(?:₹|Rs\.?|INR)\s?[\d,]+(?:\.\d{1,2})?"

        return re.findall(pattern, text, flags=re.IGNORECASE)

    def _extract_otp_codes(self, text: str):

        pattern = (
            r"\b(?:OTP|one[-\s]?time password)"
            r"\s*(?:is|:|-)?\s*(\d{4,8})\b"
        )

        matches = re.findall(pattern, text, flags=re.IGNORECASE)

        return matches

    def _extract_transaction_ids(self, text: str):
        pattern = (
            r"\b(?:transaction\s+id|txn(?:\s+id)?)"
            r"\s*(?:is|:|-)?\s*"
            r"([A-Za-z0-9_-]{6,30})\b"
        )

        matches = re.findall(
            pattern,
            text,
            flags=re.IGNORECASE

        )

        return matches