// src/pages/Info.jsx
import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Facebook,
  Instagram,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function Info({ restaurantInfo }) {
  if (!restaurantInfo) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111] flex flex-col items-center py-12 px-4">
      <div className="max-w-3xl bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <img
            src={restaurantInfo.logo}
            alt="Logo"
            className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover mb-3"
          />
          <h1 className="text-3xl font-bold text-red-600">
            {restaurantInfo.name}
          </h1>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          Welcome to <strong>{restaurantInfo.name}</strong> — where flavor meets
          tradition. We offer the finest dishes in town, crafted with love and
          served with care.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem icon={<MapPin />} label="Address" value={restaurantInfo.address} />
          <InfoItem icon={<Phone />} label="Phone" value={restaurantInfo.phone} />
          <InfoItem icon={<Mail />} label="Email" value={restaurantInfo.email} />
          <InfoItem icon={<Clock />} label="Opening Hours" value={`${restaurantInfo.opening_hours} Hours`} />
          <InfoItem icon={<Globe />} label="Website" value={restaurantInfo.website} isLink />
          <InfoItem
            icon={
              restaurantInfo.delivery_available ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <XCircle className="text-red-500" />
              )
            }
            label="Delivery Available"
            value={restaurantInfo.delivery_available ? "Yes" : "No"}
          />
        </div>

        <div className="flex justify-center gap-6 mt-8">
          {restaurantInfo.facebook && (
            <SocialIcon
              href={restaurantInfo.facebook}
              icon={<Facebook className="w-6 h-6 text-blue-400" />}
              hoverColor="hover:bg-gradient-to-tr text-white from-blue-500 via-blue-600 to-blue-800 "
            />
          )}
          {restaurantInfo.instagram && (
            <SocialIcon
              href={restaurantInfo.instagram}
              icon={<Instagram className="w-6 h-6 text-pink-300" />} 
              hoverColor="hover:bg-gradient-to-tr text-white from-pink-600 via-red-500 to-yellow-500"
            />
          )}

          {restaurantInfo.x && (
            <SocialIcon
              href={restaurantInfo.twitter}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="w-6 h-6 fill-current text-black dark:text-white"
                >
                  <path d="M23.954 4.569c-.885.392-1.83.656-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.949.555-2.005.959-3.127 1.184-.896-.959-2.173-1.555-3.591-1.555-2.717 0-4.924 2.208-4.924 4.924 0 .39.045.765.127 1.124-4.092-.205-7.719-2.165-10.148-5.144-.423.722-.666 1.561-.666 2.457 0 1.694.863 3.188 2.177 4.067-.802-.026-1.558-.246-2.22-.616v.062c0 2.366 1.684 4.342 3.918 4.787-.41.111-.843.171-1.287.171-.314 0-.615-.03-.916-.086.617 1.926 2.417 3.33 4.544 3.366-1.664 1.304-3.757 2.08-6.029 2.08-.392 0-.779-.023-1.158-.068 2.147 1.379 4.698 2.186 7.437 2.186 8.926 0 13.811-7.397 13.811-13.81 0-.21-.004-.423-.014-.634.95-.684 1.776-1.54 2.428-2.513z"/>
                </svg>
              }
              hoverColor="hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
            />
          )}
          
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, isLink }) {
  return (
    <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
      <div className="text-red-500">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-200">{label}</h3>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 break-all">{value}</p>
        )}
      </div>
    </div>
  );
}

function SocialIcon({ href, icon, hoverColor }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`p-3 bg-gray-100 dark:bg-gray-800 rounded-full transition flex items-center justify-center ${hoverColor} hover:text-white`}
    >
      {icon}
    </a>
  );
}
