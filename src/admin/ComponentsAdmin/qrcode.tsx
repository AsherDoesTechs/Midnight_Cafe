import { QRCodeSVG } from "qrcode.react";
import { authenticator } from "otplib";

export function AdminSetup() {
  // Use the SAME variable as the verification logic
  const secret = import.meta.env.VITE_ADMIN_ACCESS_CODE;
  const issuer = "MyLocalCafe";
  const account = "Admin";

  if (!secret) return <p className="p-4 text-red-500">Missing Access Code.</p>;

  const otpauth = authenticator.keyuri(account, issuer, secret);

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl text-center border border-gray-100">
      <h3 className="text-lg font-bold mb-4 text-gray-800">
        Link Authenticator
      </h3>
      <div className="flex justify-center p-4 bg-white border-2 border-dashed border-gray-200 rounded-lg">
        <QRCodeSVG value={otpauth} size={180} />
      </div>
      <p className="mt-4 text-xs text-gray-500 max-w-[200px] mx-auto">
        Scan this in Google Authenticator, then use the code to unlock the menu.
      </p>
    </div>
  );
}
