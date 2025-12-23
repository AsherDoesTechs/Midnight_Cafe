import { QRCodeSVG } from "qrcode.react";
import { authenticator } from "otplib";

export function AdminSetup() {
  const secret = import.meta.env.VITE_TOTP_SECRET; // Your secret from .env
  const issuer = "MyLocalCafe";
  const account = "Admin";

  // This creates the standard URI that Google Authenticator understands
  const otpauth = authenticator.keyuri(account, issuer, secret);

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg text-center">
      <h3 className="text-lg font-bold mb-4">
        Scan to Connect Google Authenticator
      </h3>
      <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
        <QRCodeSVG value={otpauth} size={200} />
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Scan this with your Google Authenticator app to start generating codes.
      </p>
    </div>
  );
}
