import React from "react";

interface ProfileAvatarProps {
  username: string;
  size?: number;
  className?: string;
}

/**
 * A component that renders a circular avatar with the first letter of the username
 */
export default function ProfileAvatar({
  username,
  size = 40,
  className = "",
}: ProfileAvatarProps) {
  const firstLetter = username ? username.charAt(0).toUpperCase() : "?";

  const bgColor = "#000000";

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        className="text-white font-medium flex items-center justify-center"
        style={{
          fontSize: `${Math.max(size / 2, 12)}px`,
          lineHeight: 1,
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          paddingRight: "2px",
        }}
      >
        {firstLetter}
      </span>
    </div>
  );
}
