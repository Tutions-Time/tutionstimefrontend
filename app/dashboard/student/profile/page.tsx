"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getUserProfile, updateStudentProfile } from "@/services/profileService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Upload, Pencil, Calendar, User, MapPin, BookOpen } from "lucide-react";
import AvailabilityPicker from "@/components/forms/AvailabilityPicker";

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);

  // -------- Fetch Profile --------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        if (res.success && res.data.profile) {
          setFormData(res.data.profile);
          setPhotoPreview(res.data.profile.photoUrl || null);
        } else {
          toast({ title: "Profile not found", variant: "destructive" });
        }
      } catch (err: any) {
        toast({ title: "Error loading profile", description: err.message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // -------- Handle Changes --------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPhotoPreview(previewURL);
      setFormData((prev: any) => ({ ...prev, photoFile: file }));
    }
  };

  // -------- Handle Save --------
  const handleSubmit = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "photoFile") {
          fd.append("photo", formData.photoFile);
        } else if (Array.isArray(formData[key])) {
          fd.append(key, JSON.stringify(formData[key]));
        } else {
          fd.append(key, formData[key]);
        }
      });

      const res = await updateStudentProfile(fd);
      if (res.success) {
        toast({ title: "Profile updated successfully!" });
        setEditMode(false);
      } else {
        toast({ title: "Update failed", description: res.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error saving profile", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!formData) {
    return <p className="text-center mt-10 text-gray-500">No profile data found.</p>;
  }

  // -------- UI --------
  return (
    <div className="max-w-6xl mx-auto py-10 px-5 lg:px-0">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <User className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-semibold">Student Profile</h1>
        </div>
        <Button variant="outline" onClick={() => setEditMode((prev) => !prev)}>
          {editMode ? "Cancel" : <><Pencil className="w-4 h-4 mr-2" /> Edit</>}
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border p-6 space-y-10">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative w-32 h-32">
            <Image
             src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${photoPreview}`}
              alt="Profile photo"
              width={128}
              height={128}
              className="rounded-full object-cover border shadow"
            />
            {editMode && (
              <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:opacity-90">
                <Upload size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{formData.name}</h2>
            <p className="text-gray-600">{formData.email}</p>
            <p className="text-sm text-gray-500 capitalize">{formData.track}</p>
          </div>
        </div>

        {/* 1️⃣ PERSONAL INFO */}
        <section>
          <SectionHeader icon={<User />} title="Personal Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <InputField label="Name" name="name" value={formData.name} onChange={handleChange} disabled={!editMode} />
            <InputField label="Email" name="email" value={formData.email} onChange={handleChange} disabled={!editMode} />
            <InputField label="Alternate Phone" name="altPhone" value={formData.altPhone} onChange={handleChange} disabled={!editMode} />
            <InputField label="Gender" name="gender" value={formData.gender} onChange={handleChange} disabled={!editMode} />
          </div>
        </section>

        {/* 2️⃣ ADDRESS */}
        <section>
          <SectionHeader icon={<MapPin />} title="Address Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <InputField label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} disabled={!editMode} />
            <InputField label="Address Line 2" name="addressLine2" value={formData.addressLine2} onChange={handleChange} disabled={!editMode} />
            <InputField label="City" name="city" value={formData.city} onChange={handleChange} disabled={!editMode} />
            <InputField label="State" name="state" value={formData.state} onChange={handleChange} disabled={!editMode} />
            <InputField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} disabled={!editMode} />
          </div>
        </section>

        {/* 3️⃣ ACADEMIC */}
        <section>
          <SectionHeader icon={<BookOpen />} title="Academic Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <InputField label="Board" name="board" value={formData.board} onChange={handleChange} disabled={!editMode} />
            <InputField label="Class Level" name="classLevel" value={formData.classLevel} onChange={handleChange} disabled={!editMode} />
            <InputField label="Stream" name="stream" value={formData.stream} onChange={handleChange} disabled={!editMode} />
            <InputField label="Subjects" name="subjects" value={(formData.subjects || []).join(", ")} onChange={handleChange} disabled={!editMode} />
          </div>
        </section>

        {/* 4️⃣ AVAILABILITY */}
        <section>
          <SectionHeader icon={<Calendar />} title="Availability" />
          <div className="mt-3">
            <AvailabilityPicker
              disabled={!editMode}
              value={formData.availability || []}
              onChange={(dates: string[]) =>
                setFormData((prev: any) => ({ ...prev, availability: dates }))
              }
            />
          </div>
        </section>

        {/* 5️⃣ PREFERENCES */}
        <section>
          <SectionHeader title="Tutor Preferences" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <InputField label="Tutor Gender Preference" name="tutorGenderPref" value={formData.tutorGenderPref} onChange={handleChange} disabled={!editMode} />
            {formData.tutorGenderPref === "Other" && (
              <InputField label="Specify Other" name="tutorGenderOther" value={formData.tutorGenderOther} onChange={handleChange} disabled={!editMode} />
            )}
          </div>
        </section>

        {/* 6️⃣ GOALS */}
        <section>
          <SectionHeader title="Learning Goals" />
          <Textarea
            name="goals"
            value={formData.goals || ""}
            onChange={handleChange}
            disabled={!editMode}
            placeholder="Write about your goals..."
            className="mt-3"
          />
        </section>

        {/* SAVE BUTTON */}
        {editMode && (
          <div className="text-right">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- SUB COMPONENTS ---------------------------- */
const InputField = ({
  label,
  name,
  value,
  onChange,
  disabled,
}: {
  label: string;
  name: string;
  value: string;
  onChange: any;
  disabled?: boolean;
}) => (
  <div>
    <Label className="text-gray-700">{label}</Label>
    <Input
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      className="mt-1"
    />
  </div>
);

const SectionHeader = ({ title, icon }: { title: string; icon?: any }) => (
  <h3 className="text-lg font-semibold text-primary flex items-center gap-2 border-b pb-2">
    {icon && <span className="text-primary">{icon}</span>}
    {title}
  </h3>
);
