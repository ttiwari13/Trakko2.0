"use client";

import React from "react";
import { Trash2 } from "lucide-react";

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
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function PinModal({
  title,
  description,
  image,
  readOnly = false,
  onChange,
  onClose,
  onSave,
  onEdit,
  onDelete,
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
      <div className="bg-white p-6 rounded-xl w-[400px] max-w-[90vw] space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {readOnly ? "View Memory" : "Add / Edit Memory"}
          </h2>
          {readOnly && onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
              title="Delete pin"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Title"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
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
          <div>
            <label className="block text-sm font-medium mb-2">
              Add Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full text-sm"
            />
          </div>
        )}

        {image && (
          <div className="relative">
            <img
              src={image}
              alt="preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            {!readOnly && (
              <button
                onClick={() => onChange({ title, description, image: undefined })}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Remove
              </button>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
            onClick={onClose}
          >
            Close
          </button>

          {readOnly && onEdit && (
            <button
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
              onClick={onEdit}
            >
              Edit
            </button>
          )}

          {!readOnly && (
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
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