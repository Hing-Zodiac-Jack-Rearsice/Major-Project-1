import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";

export const uploadImageToFirebase = async (file: File): Promise<string> => {
    const storage = getStorage(app);
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `event_images/${fileName}`);

    try {
        const uploadTask = uploadBytesResumable(storageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // You can handle progress updates here if needed
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    // Handle unsuccessful uploads
                    console.error("Error uploading image:", error);
                    reject(error);
                },
                async () => {
                    // Handle successful uploads on complete
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                }
            );
        });
    } catch (error) {
        console.error("Error in uploadImageToFirebase:", error);
        throw error;
    }
};
