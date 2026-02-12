"use client";

import { useState } from "react";

type Props = {
  lat: number;
  lng: number;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    image?: string;
  }) => void;
};

export default function PinModal({ lat, lng, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | undefined>();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
      <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
        <h2 className="text-lg font-semibold">Add Pin</h2>

        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input type="file" accept="image/*" onChange={handleImageUpload} />

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => {
              onSave({ title, description, image });
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
