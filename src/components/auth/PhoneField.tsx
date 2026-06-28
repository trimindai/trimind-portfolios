"use client";

import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

// Re-export so callers validate without a second import of the library.
export { isValidPhoneNumber };

/**
 * Phone input with a country flag/dropdown (libphonenumber-backed).
 *
 * Users don't type the country code: the dropdown defaults to Kuwait so a bare
 * local number becomes +965…, and if someone pastes a full international number
 * the country is auto-detected. `value`/`onChange` are the E.164 string Clerk
 * expects (e.g. "+96550000000"). Styled to the landing --land-* tokens via the
 * `.land-phone` class in globals.css.
 */
export default function PhoneField({
  id = "phone",
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <PhoneInput
      id={id}
      international
      defaultCountry="KW"
      countryCallingCodeEditable={false}
      value={value || undefined}
      onChange={(v) => onChange(v || "")}
      className="land-phone"
      numberInputProps={{ autoComplete: "tel", required: true }}
      dir="ltr"
    />
  );
}
