"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    image: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch("/api/user/getUserInfo");
      if (response.ok) {
        const userData = await response.json();
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          password: "",
          image: userData.image || "",
        });
        setPreviewImage(userData.image || "");
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Failed to load user data. Please try again.");
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      if (session.user.role !== "user") {
        router.push("/unauthorized");
        return;
      }
      fetchUserData();
    }
  }, [session, router, fetchUserData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const uploadImage = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch("/api/user/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error || "Failed to upload image");
    }

    const { imageUrl } = await uploadResponse.json();
    return imageUrl;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image;
      if (file) {
        imageUrl = await uploadImage(file);
      }

      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: imageUrl }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        await update({ ...formData, image: imageUrl });
        setFormData((prev) => ({ ...prev, image: imageUrl }));
        setPreviewImage(imageUrl);
        alert("Profile updated successfully");
        setIsEditing(false);
        setFile(null);
        // Fetch the latest user data after update
        fetchUserData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the profile. Please try again."
      );
    }
  };

  if (!session || session.user.role !== "user") {
    return null;
  }

  return (
    <div className="container mx-auto mt-16 p-4">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <div className="flex justify-center mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={previewImage || formData.image}
                alt={formData.name}
              />
              <AvatarFallback>{formData.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isEditing && (
              <div>
                <Label htmlFor="image">Profile Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}
            <div>
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{formData.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              ) : (
                <p>{formData.email}</p>
              )}
            </div>
            {isEditing && (
              <div>
                <Label htmlFor="password">
                  New Password (leave blank to keep current)
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
            )}
            {isEditing ? (
              <>
                <Button type="submit">Save Changes</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
