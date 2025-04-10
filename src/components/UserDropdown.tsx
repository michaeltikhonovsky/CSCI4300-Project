import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import ProfileModal from "@/components/ProfileModal";
import ProfileAvatar from "@/components/ProfileAvatar";

const UserDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && user.profilePicture) {
      setProfilePic(user.profilePicture);
    } else {
      setProfilePic(null);
    }
  }, [user]);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className=" flex items-center gap-2 rounded-lg border-2 border-white bg-black/50 px-4 py-2 text-white transition-all hover:border-gray-200 hover:shadow-white"
        >
          <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white">
            {profilePic ? (
              <img
                src={profilePic}
                alt={user.username}
                className="h-full w-full object-cover"
              />
            ) : (
              <ProfileAvatar username={user.username} size={32} />
            )}
          </div>
          <span className="font-medium">{user.username}</span>
          <span className="ml-1 text-white">{user.points} pts</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-white bg-black/90 py-1 shadow-lg backdrop-blur-sm">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsOpen(false);
              }}
              className=" flex w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-gray-400/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Edit Profile
            </button>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className=" flex w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-gray-400/30"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {isModalOpen && (
        <ProfileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default UserDropdown;
