import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaUserCircle } from "react-icons/fa";
import "./Profile.css";
import { getUserProfile, updateUserProfile } from "../api";

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profilePic: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        setUserData(res.data);
        if (res.data.profilePic) {
          setImagePreview(`http://localhost:5000/uploads/profilePics/${res.data.profilePic}`);
        }
      } catch (err) {
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setImagePreview(URL.createObjectURL(selected));
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("email", userData.email);
      formData.append("phone", userData.phone);
      formData.append("address", userData.address);
      if (file) formData.append("profilePic", file);

      await updateUserProfile(formData);
      toast.success("Profile updated successfully!");

      const res = await getUserProfile();
      setUserData(res.data);
      if (res.data.profilePic) {
        setImagePreview(`http://localhost:5000/uploads/profilePics/${res.data.profilePic}`);
      }
      setFile(null);
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="profile-container">
      <h2 className="profile-heading">My Profile</h2>

      <div className="profile-img-container">
        {imagePreview ? (
          <img src={imagePreview} alt="Profile" className="profile-img" />
        ) : (
          <FaUserCircle className="default-icon" />
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={userData.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleChange}
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={userData.phone}
          onChange={handleChange}
        />

        <textarea
          name="address"
          placeholder="Address"
          rows="3"
          value={userData.address}
          onChange={handleChange}
        />

        <button type="submit" disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
