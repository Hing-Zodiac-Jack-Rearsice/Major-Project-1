"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

const ProfilePage = () => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    console.log("Session:", session);
    if (session?.user) {
      if (session.user.role !== "user") {
        router.push("/unauthorized");
        return;
      }
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setImage(session.user.image || "");
    }
  }, [session, router]);

  const uploadImage = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
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
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = image;
      if (file) {
        imageUrl = await uploadImage(file);
      }

      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, image: imageUrl }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        await update({ name, email, image: imageUrl });
        setImage(imageUrl);
        setPreviewImage(imageUrl); // Set preview image to the new URL
        alert("Profile updated successfully");
        setIsEditing(false);
        setPassword("");
        setFile(null);
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
              <AvatarImage src={previewImage || image} alt={name} />
              <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
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
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      setFile(selectedFile);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPreviewImage(reader.result as string);
                      };
                      reader.readAsDataURL(selectedFile);
                    }
                  }}
                />
              </div>
            )}
            <div>
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : (
                <p>{name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              ) : (
                <p>{email}</p>
              )}
            </div>
            {isEditing && (
              <div>
                <Label htmlFor="password">
                  New Password (leave blank to keep current)
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
