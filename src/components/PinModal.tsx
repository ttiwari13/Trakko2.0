"use client";

import React from "react";

export type PinFormData = {
  title: string;
  description: string;
  image?: string;
};

type Props = {
  lat: number;
  lng: number;
  title: string;
  description: string;
  image?: string;
  readOnly?: boolean;
  onChange: (data: PinFormData) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function PinModal({
  title,
  description,
  image,
  readOnly = false,
  onChange,
  onClose,
  onSave,
}: Props) {
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (readOnly) return;

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange({
        title,
        description,
        image: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[2000]">
      <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
        <h2 className="text-lg font-semibold">
          {readOnly ? "View Memory" : "Add Memory"}
        </h2>

        <input
          type="text"
          placeholder="Title"
          className="w-full border p-2 rounded"
          value={title}
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              title: e.target.value,
              description,
              image,
            })
          }
        />

        <textarea
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={description}
          disabled={readOnly}
          onChange={(e) =>
            onChange({
              title,
              description: e.target.value,
              image,
            })
          }
        />

        {!readOnly && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        )}

        {image && (
          <img
            src={image}
            alt="preview"
            className="w-full h-40 object-cover rounded"
          />
        )}

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose}
          >
            {readOnly ? "Close" : "Cancel"}
          </button>

          {!readOnly && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={onSave}
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
