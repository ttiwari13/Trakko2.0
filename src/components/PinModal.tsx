"use client";

import React, { useState } from "react";
import { Trash2, X, Pencil, Check, Loader2 } from "lucide-react";

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

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5MB");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "trakko/pins");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onChange({ title, description, image: data.secure_url });
    } catch (err) {
      setUploadError("Failed to upload image. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-semibold text-gray-900">
            {readOnly ? "Memory" : "Add Memory"}
          </h2>
          <div className="flex items-center gap-1">
            {readOnly && onDelete && (
              <button
                onClick={onDelete}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">

          {/* Image preview */}
          {image && (
            <div className="relative rounded-xl overflow-hidden bg-gray-100">
              <img
                src={image}
                alt={title || "Memory"}
                className="w-full object-contain max-h-64"
                style={{ display: "block" }}
              />
              {!readOnly && (
                <button
                  onClick={() => onChange({ title, description, image: undefined })}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-lg hover:bg-black/80 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          )}

          {/* Title */}
          {readOnly ? (
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Title</p>
              <p className="text-base font-semibold text-gray-900">{title || "—"}</p>
            </div>
          ) : (
            <input
              type="text"
              placeholder="Title"
              className="w-full border border-gray-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
              value={title}
              onChange={(e) => onChange({ title: e.target.value, description, image })}
            />
          )}

          {/* Description */}
          {readOnly ? (
            description ? (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Note</p>
                <p className="text-sm text-gray-700 leading-relaxed">{description}</p>
              </div>
            ) : null
          ) : (
            <textarea
              placeholder="Description (optional)"
              className="w-full border border-gray-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition resize-none min-h-[80px]"
              value={description}
              onChange={(e) => onChange({ title, description: e.target.value, image })}
            />
          )}

          {/* Image upload */}
          {!readOnly && !image && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Image (optional)
              </label>

              {uploading ? (
                <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <div className="flex flex-col items-center gap-1.5">
                    <Loader2 size={20} className="animate-spin text-gray-400" />
                    <p className="text-xs text-gray-400">Uploading...</p>
                  </div>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Click to upload</p>
                    <p className="text-xs text-gray-300 mt-0.5">PNG, JPG, GIF · max 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}

              {uploadError && (
                <p className="text-xs text-red-500 mt-1.5">{uploadError}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Close
          </button>

          {readOnly && onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Pencil size={13} />
              Edit
            </button>
          )}

          {!readOnly && (
            <button
              onClick={onSave}
              disabled={uploading}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Check size={13} />
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}