import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useFirebase } from '../context/FirebaseContext';
import { setData } from '../firebase/database';
import { uploadFile } from '../firebase/storage';
import { initializeDefaultData } from '../firebase/initData';
import { uploadProvidedFiles } from '../firebase/uploadFiles';

interface AdminDashboardProps {
  onLogout: () => void;
}

// Component definitions moved outside to prevent re-creation on every render
const ColorPicker: React.FC<{ value: string; onChange: (color: string) => void; label: string }> = ({ value, onChange, label }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-12 h-10 rounded border border-gray-600 cursor-pointer"
        aria-label={`${label} color picker`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="#000000"
        aria-label={`${label} hex value`}
      />
    </div>
  </div>
);

const ImageUpload: React.FC<{ 
  value: string; 
  section: string; 
  field: string; 
  label: string; 
  path: string; 
  accept?: string;
  uploading: boolean;
  uploadProgress: number;
  onFileUpload: (file: File, path: string, section: string, field: string) => void;
}> = ({
  value, section, field, label, path, accept = "image/*", uploading, uploadProgress, onFileUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string>('');

  // Load image data when value changes
  React.useEffect(() => {
    const loadImage = async () => {
      if (value && value !== imageUrl) {
        try {
          // If it's already a data URL, use it directly
          if (value.startsWith('data:')) {
            setImageUrl(value);
          } else {
            // Otherwise, fetch from database
            const { getFileURL } = await import('../firebase/storage');
            const url = await getFileURL(value);
            setImageUrl(url || '');
          }
        } catch (error) {
          // Silently handle missing files - this is expected when no image is uploaded yet
          setImageUrl('');
        }
      } else if (!value) {
        setImageUrl('');
      }
    };

    loadImage();
  }, [value]);

  return (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onFileUpload(file, path, section, field);
            }
          }}
          className="hidden"
          aria-label={`Upload ${label}`}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
        >
          {uploading ? 'Uploading...' : 'Upload from Device'}
        </button>
        {imageUrl && (
          <img src={imageUrl} alt="Preview" className="w-12 h-12 sm:w-16 sm:h-16 rounded object-cover border border-gray-600 flex-shrink-0" />
        )}
      </div>
      {uploading && uploadProgress > 0 && (
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={`bg-blue-600 h-full rounded-full transition-all duration-300 ${
              uploadProgress === 100 ? 'w-full' :
              uploadProgress >= 90 ? 'w-11/12' :
              uploadProgress >= 80 ? 'w-10/12' :
              uploadProgress >= 70 ? 'w-9/12' :
              uploadProgress >= 60 ? 'w-8/12' :
              uploadProgress >= 50 ? 'w-7/12' :
              uploadProgress >= 40 ? 'w-6/12' :
              uploadProgress >= 30 ? 'w-5/12' :
              uploadProgress >= 20 ? 'w-4/12' :
              uploadProgress >= 10 ? 'w-3/12' : 'w-2/12'
            }`}
          ></div>
        </div>
      )}
    </div>
  </div>
  );
};

const TextInput: React.FC<{ value: string; onChange: (value: string) => void; label: string; placeholder?: string; multiline?: boolean }> = ({
  value, onChange, label, placeholder, multiline = false
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    )}
  </div>
);

const SelectInput: React.FC<{ value: string; onChange: (value: string) => void; label: string; options: { value: string; label: string }[] }> = ({
  value, onChange, label, options
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      aria-label={label}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { data } = useFirebase();
  const [activeTab, setActiveTab] = useState('hero');
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const renderTabIcon = (icon: string) => {
    switch (icon) {
      case '🚀':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case '👤':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case '⚡':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case '🛠️':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case '💼':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V8a2 2 0 01-2 2H8a2 2 0 01-2-2V6m8 0H8m0 0V4" />
          </svg>
        );
      case '💬':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case '📧':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case '🔗':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case '🧭':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      case '🎨':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
        );
      default:
        return <span className="text-lg">{icon}</span>;
    }
  };
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localData, setLocalData] = useState<any>({});

  // Individual upload states for each upload component
  const [heroProfileUploading, setHeroProfileUploading] = useState(false);
  const [heroBackgroundUploading, setHeroBackgroundUploading] = useState(false);
  const [aboutImageUploading, setAboutImageUploading] = useState(false);
  const [resumeCvUploading, setResumeCvUploading] = useState(false);
  const [projectImageUploading, setProjectImageUploading] = useState(false);
  const [testimonialImageUploading, setTestimonialImageUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const [heroProfileProgress, setHeroProfileProgress] = useState(0);
  const [heroBackgroundProgress, setHeroBackgroundProgress] = useState(0);
  const [aboutImageProgress, setAboutImageProgress] = useState(0);
  const [resumeCvProgress, setResumeCvProgress] = useState(0);
  const [projectImageProgress, setProjectImageProgress] = useState(0);
  const [testimonialImageProgress, setTestimonialImageProgress] = useState(0);
  const [logoProgress, setLogoProgress] = useState(0);

  // Initialize local data when component mounts or data changes
  React.useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      const processedData = JSON.parse(JSON.stringify(data));

      // Ensure about section has details array for backward compatibility
      if (processedData.about && !processedData.about.details) {
        processedData.about.details = [
          { title: 'Full Name', description: processedData.about.name || 'Blu Motif' },
          { title: 'Location', description: processedData.about.location || 'Your Location' },
          { title: 'Experience', description: processedData.about.experience || 'X+ Years' },
          { title: 'Available', description: processedData.about.availability || 'Open To Work' },
          { title: 'Education', description: processedData.about.education || 'Your Degree' }
        ];
      }

      // Ensure skills section has categories array for backward compatibility
      if (processedData.skills && !processedData.skills.categories) {
        processedData.skills.categories = [
          {
            title: 'Frontend Development',
            skills: processedData.skills.frontend || ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
            icon: '💻'
          },
          {
            title: 'Backend Development',
            skills: processedData.skills.backend || ['Node.js', 'Express', 'MongoDB', 'PostgreSQL'],
            icon: '⚙️'
          },
          {
            title: 'Tools & Technologies',
            skills: processedData.skills.tools || ['Git', 'Docker', 'Firebase', 'AWS'],
            icon: '🛠️'
          },
          {
            title: 'Programming Languages',
            skills: processedData.skills.languages || ['JavaScript', 'Python', 'TypeScript', 'SQL'],
            icon: '💬'
          }
        ];
      }

      // Ensure projects is always an array
      if (!processedData.projects || !Array.isArray(processedData.projects)) {
        processedData.projects = [];
      }

      // Ensure testimonials has the correct structure
      if (!processedData.testimonials) {
        processedData.testimonials = {
          title: 'What Clients Say',
          subtitle: 'Feedback from people I\'ve worked with',
          testimonials: []
        };
      } else if (!processedData.testimonials.testimonials || !Array.isArray(processedData.testimonials.testimonials)) {
        processedData.testimonials = {
          ...processedData.testimonials,
          testimonials: []
        };
      }

      setLocalData(processedData);
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save all sections that have changes
      const sections = ['hero', 'about', 'skills', 'services', 'projects', 'testimonials', 'contact', 'navigation', 'theme', 'socials', 'resume'];
      for (const section of sections) {
        if (localData[section]) {
          await setData(`siteConfig/${section}`, localData[section]);
        }
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateLocalData = (section: string, newData: any) => {
    setLocalData((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], ...newData }
    }));
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = async (file: File, path: string, section: string, field: string, uploadId: string) => {
    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      alert('File size must be less than 20MB. Please choose a smaller file.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      alert('Please select a valid image or PDF file.');
      return;
    }

    // Set the appropriate uploading state based on uploadId
    switch (uploadId) {
      case 'heroProfile':
        setHeroProfileUploading(true);
        setHeroProfileProgress(0);
        break;
      case 'heroBackground':
        setHeroBackgroundUploading(true);
        setHeroBackgroundProgress(0);
        break;
      case 'aboutImage':
        setAboutImageUploading(true);
        setAboutImageProgress(0);
        break;
      case 'resumeCv':
        setResumeCvUploading(true);
        setResumeCvProgress(0);
        break;
      case 'projectImage':
        setProjectImageUploading(true);
        setProjectImageProgress(0);
        break;
      case 'testimonialImage':
        setTestimonialImageUploading(true);
        setTestimonialImageProgress(0);
        break;
      case 'logo':
        setLogoUploading(true);
        setLogoProgress(0);
        break;
    }

    try {
      // Compress image if it's large and not a PDF
      let processedFile = file;
      if (file.type.startsWith('image/') && file.size > 1024 * 1024) { // If larger than 1MB, compress
        processedFile = await compressImage(file);
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        switch (uploadId) {
          case 'heroProfile':
            setHeroProfileProgress(prev => Math.min(prev + 10, 90));
            break;
          case 'heroBackground':
            setHeroBackgroundProgress(prev => Math.min(prev + 10, 90));
            break;
          case 'aboutImage':
            setAboutImageProgress(prev => Math.min(prev + 10, 90));
            break;
          case 'resumeCv':
            setResumeCvProgress(prev => Math.min(prev + 10, 90));
            break;
          case 'projectImage':
            setProjectImageProgress(prev => Math.min(prev + 10, 90));
            break;
          case 'testimonialImage':
            setTestimonialImageProgress(prev => Math.min(prev + 10, 90));
            break;
          case 'logo':
            setLogoProgress(prev => Math.min(prev + 10, 90));
            break;
        }
      }, 200);

      const url = await uploadFile(path, processedFile);

      clearInterval(progressInterval);

      // Set progress to 100%
      switch (uploadId) {
        case 'heroProfile':
          setHeroProfileProgress(100);
          break;
        case 'heroBackground':
          setHeroBackgroundProgress(100);
          break;
        case 'aboutImage':
          setAboutImageProgress(100);
          break;
        case 'resumeCv':
          setResumeCvProgress(100);
          break;
        case 'projectImage':
          setProjectImageProgress(100);
          break;
        case 'testimonialImage':
          setTestimonialImageProgress(100);
          break;
      }

      // Save to database immediately
      let sectionData;
      if ((section === 'projects' && field.startsWith('project_') && field.endsWith('_image')) ||
          (section === 'testimonials' && field.startsWith('testimonial_') && field.endsWith('_image'))) {
        // Handle array-based image uploads specially
        const itemIndex = parseInt(field.split('_')[1]);
        if (section === 'testimonials') {
          const currentTestimonials = localData.testimonials?.testimonials || [];
          const testimonials = [...currentTestimonials];
          if (testimonials[itemIndex]) {
            testimonials[itemIndex] = { ...testimonials[itemIndex], image: url };
          }
          sectionData = { ...localData.testimonials, testimonials };
        } else {
          const items = [...(localData[section] || [])];
          if (items[itemIndex]) {
            items[itemIndex] = { ...items[itemIndex], image: url };
          }
          sectionData = items;
        }
      } else {
        sectionData = { ...localData[section], [field]: url };
      }
      await setData(`siteConfig/${section}`, sectionData);

      // Update local data
      if ((section === 'projects' && field.startsWith('project_') && field.endsWith('_image')) ||
          (section === 'testimonials' && field.startsWith('testimonial_') && field.endsWith('_image'))) {
        const itemIndex = parseInt(field.split('_')[1]);
        if (section === 'testimonials') {
          const currentTestimonials = localData.testimonials?.testimonials || [];
          const testimonials = [...currentTestimonials];
          if (testimonials[itemIndex]) {
            testimonials[itemIndex] = { ...testimonials[itemIndex], image: url };
          }
          setLocalData((prev: any) => ({
            ...prev,
            testimonials: { ...prev.testimonials, testimonials }
          }));
          setHasUnsavedChanges(true);
        } else {
          const items = [...(localData[section] || [])];
          if (items[itemIndex]) {
            items[itemIndex] = { ...items[itemIndex], image: url };
          }
          setLocalData((prev: any) => ({
            ...prev,
            [section]: items
          }));
          setHasUnsavedChanges(true);
        }
      } else {
        updateLocalData(section, { [field]: url });
      }

      // Small delay to show 100% progress, then reset
      setTimeout(() => {
        switch (uploadId) {
          case 'heroProfile':
            setHeroProfileUploading(false);
            setHeroProfileProgress(0);
            break;
          case 'heroBackground':
            setHeroBackgroundUploading(false);
            setHeroBackgroundProgress(0);
            break;
          case 'aboutImage':
            setAboutImageUploading(false);
            setAboutImageProgress(0);
            break;
          case 'resumeCv':
            setResumeCvUploading(false);
            setResumeCvProgress(0);
            break;
          case 'projectImage':
            setProjectImageUploading(false);
            setProjectImageProgress(0);
            break;
          case 'testimonialImage':
            setTestimonialImageUploading(false);
            setTestimonialImageProgress(0);
            break;
          case 'logo':
            setLogoUploading(false);
            setLogoProgress(0);
            break;
        }
      }, 500);

    } catch (error: any) {
      console.error('Upload error:', error);

      // Provide specific error messages based on error type
      let errorMessage = 'Upload failed. Please try again.';

      if (error.message?.includes('CORS')) {
        errorMessage = 'CORS configuration required. Please configure CORS in Firebase Console for localhost domains, or use Chrome with --disable-web-security for development testing.';
      } else if (error.message?.includes('unauthorized')) {
        errorMessage = 'Upload not authorized. Please check Firebase Database security rules.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'Database quota exceeded. Please free up space or upgrade your plan.';
      } else if (error.message?.includes('5MB')) {
        errorMessage = 'File is too large. Maximum size for database storage is 5MB. Please choose a smaller file.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = `Upload failed: ${error.message}`;
      }

      alert(errorMessage);
      
      // Reset the appropriate upload states on error
      switch (uploadId) {
        case 'heroProfile':
          setHeroProfileUploading(false);
          setHeroProfileProgress(0);
          break;
        case 'heroBackground':
          setHeroBackgroundUploading(false);
          setHeroBackgroundProgress(0);
          break;
        case 'aboutImage':
          setAboutImageUploading(false);
          setAboutImageProgress(0);
          break;
        case 'resumeCv':
          setResumeCvUploading(false);
          setResumeCvProgress(0);
          break;
        case 'projectImage':
          setProjectImageUploading(false);
          setProjectImageProgress(0);
          break;
        case 'testimonialImage':
          setTestimonialImageUploading(false);
          setTestimonialImageProgress(0);
          break;
        case 'logo':
          setLogoUploading(false);
          setLogoProgress(0);
          break;
      }
    }
  };

  // Compress image function
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height)
        const maxSize = 1200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original file
          }
        }, 'image/jpeg', 0.8); // 80% quality
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const tabs = [
    { key: 'hero', label: 'Hero Section', icon: '🚀' },
    { key: 'about', label: 'About Me', icon: '👤' },
    { key: 'skills', label: 'Skills', icon: '⚡' },
    { key: 'services', label: 'Services', icon: '🛠️' },
    { key: 'projects', label: 'Projects', icon: '💼' },
    { key: 'testimonials', label: 'Reviews', icon: '💬' },
    { key: 'contact', label: 'Contact', icon: '📧' },
    { key: 'navigation', label: 'Navigation', icon: '🧭' },
    { key: 'theme', label: 'Design', icon: '🎨' },
    { key: 'socials', label: 'Social Links', icon: '🔗' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black admin-page">
      {/* Header */}
      <motion.nav
        className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-md z-50 border-b border-gray-700 shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">A</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">BlusMotif Admin Portfolio Editor</h1>
                <p className="text-gray-400 text-xs sm:text-sm">Make changes and see them instantly</p>
              </div>
            </div>
            <div className="flex space-x-2 sm:space-x-3">
              {hasUnsavedChanges && (
                <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span>Unsaved changes</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                className="px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:transform-none text-xs sm:text-sm"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => uploadProvidedFiles()}
                className="hidden sm:inline-flex px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-xs sm:text-sm"
              >
                Upload My Files
              </button>
              <button
                onClick={() => initializeDefaultData()}
                className="hidden sm:inline-flex px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-xs sm:text-sm"
              >
                Reset to Default
              </button>
              <button
                onClick={onLogout}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg text-xs sm:text-sm"
              >
                Logout
              </button>
            </div>
          </div>
          {/* Mobile title */}
          <div className="sm:hidden mt-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">BlusMotif Admin Portfolio Editor</h1>
            <p className="text-gray-400 text-sm">Make changes and see them instantly</p>
          </div>
        </div>
      </motion.nav>

      {/* Database Storage Notice */}
      <div className="bg-blue-900/50 border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-blue-200 text-sm">
                <strong>Database Storage:</strong> Files are now stored in Firebase Realtime Database as base64. Max file size: 5MB. No CORS configuration needed!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="flex gap-4 sm:gap-8">
          {/* Sidebar */}
          <div className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 lg:w-80 flex-shrink-0 transition-transform duration-300 ease-in-out lg:transition-none`}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700 h-full lg:h-auto overflow-y-auto">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="text-lg font-semibold text-white">Edit Sections</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  aria-label="Close sidebar"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h3 className="hidden lg:block text-lg font-semibold text-white mb-4">Edit Sections</h3>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setSidebarOpen(false); // Close sidebar on mobile after selection
                    }}
                    className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {renderTabIcon(tab.icon)}
                    </div>
                    <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                  </button>
                ))}
              </div>
              {/* Mobile upload button */}
              <div className="mt-6 pt-4 border-t border-gray-700 lg:hidden">
                <button
                  onClick={uploadProvidedFiles}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 text-sm mb-4"
                >
                  Upload My Files
                </button>
              </div>
              {/* Mobile reset button */}
              <div className="mt-6 pt-4 border-t border-gray-700 lg:hidden">
                <button
                  onClick={() => initializeDefaultData()}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 text-sm"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 border border-gray-700">
              {activeTab === 'hero' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-shrink-0">
                      {renderTabIcon('🚀')}
                    </div>
                    <h2 className="text-2xl font-bold text-white">Hero Section</h2>
                  </div>
                  <TextInput
                    label="Main Title"
                    value={localData.hero?.title || ''}
                    onChange={(value) => updateLocalData('hero', { title: value })}
                    placeholder="Hi, I'm John Doe"
                  />
                  <TextInput
                    label="Subtitle"
                    value={localData.hero?.subtitle || ''}
                    onChange={(value) => updateLocalData('hero', { subtitle: value })}
                    placeholder="Full Stack Developer"
                  />
                  <TextInput
                    label="Description"
                    value={localData.hero?.description || ''}
                    onChange={(value) => updateLocalData('hero', { description: value })}
                    placeholder="Tell visitors about yourself"
                    multiline
                  />
                  <TextInput
                    label="Button Text"
                    value={localData.hero?.cta || ''}
                    onChange={(value) => updateLocalData('hero', { cta: value })}
                    placeholder="View My Work"
                  />
                  <ImageUpload
                    label="Profile Picture"
                    value={localData.hero?.profileImage || ''}
                    section="hero"
                    field="profileImage"
                    path={`hero/profile_${Date.now()}.jpg`}
                    uploading={heroProfileUploading}
                    uploadProgress={heroProfileProgress}
                    onFileUpload={(file, path, section, field) => handleFileUpload(file, path, section, field, 'heroProfile')}
                  />
                  <ImageUpload
                    label="Background Image (Optional)"
                    value={localData.hero?.backgroundImage || ''}
                    section="hero"
                    field="backgroundImage"
                    path={`hero/background_${Date.now()}.jpg`}
                    uploading={heroBackgroundUploading}
                    uploadProgress={heroBackgroundProgress}
                    onFileUpload={(file, path, section, field) => handleFileUpload(file, path, section, field, 'heroBackground')}
                  />
                </div>
              )}

              {activeTab === 'about' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-shrink-0">
                      {renderTabIcon('👤')}
                    </div>
                    <h2 className="text-2xl font-bold text-white">About Me</h2>
                  </div>
                  <TextInput
                    label="Your Name"
                    value={localData.about?.name || ''}
                    onChange={(value) => updateLocalData('about', { name: value })}
                    placeholder="John Doe"
                  />
                  <TextInput
                    label="About You"
                    value={localData.about?.description || ''}
                    onChange={(value) => updateLocalData('about', { description: value })}
                    placeholder="Tell your story"
                    multiline
                  />
                  <ImageUpload
                    label="Profile Picture"
                    value={localData.about?.image || ''}
                    section="about"
                    field="image"
                    path={`about/profile_${Date.now()}.jpg`}
                    uploading={aboutImageUploading}
                    uploadProgress={aboutImageProgress}
                    onFileUpload={(file, path, section, field) => handleFileUpload(file, path, section, field, 'aboutImage')}
                  />
                  <TextInput
                    label="Location"
                    value={localData.about?.location || ''}
                    onChange={(value) => updateLocalData('about', { location: value })}
                    placeholder="City, Country"
                  />
                  <TextInput
                    label="Experience"
                    value={localData.about?.experience || ''}
                    onChange={(value) => updateLocalData('about', { experience: value })}
                    placeholder="3+ Years"
                  />
                  <SelectInput
                    label="Availability"
                    value={localData.about?.availability || 'Open To Work'}
                    onChange={(value) => updateLocalData('about', { availability: value })}
                    options={[
                      { value: 'Open To Work', label: 'Open To Work' },
                      { value: 'Available', label: 'Available' },
                      { value: 'Busy', label: 'Busy' },
                      { value: 'Not Available', label: 'Not Available' }
                    ]}
                  />
                  <TextInput
                    label="Education"
                    value={localData.about?.education || ''}
                    onChange={(value) => updateLocalData('about', { education: value })}
                    placeholder="Your degree"
                  />

                  {/* Dynamic Details Management */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Additional Details</h3>
                      <button
                        onClick={() => {
                          const newDetails = [...(localData.about?.details || []), { title: '', description: '', icon: '⭐' }];
                          updateLocalData('about', { details: newDetails });
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <span>+</span>
                        <span>Add Detail</span>
                      </button>
                    </div>
                    <div className="space-y-4">
                      {(localData.about?.details || []).map((detail: any, index: number) => (
                        <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-medium">Detail #{index + 1}</h4>
                            <button
                              onClick={() => {
                                const newDetails = (localData.about?.details || []).filter((_: any, i: number) => i !== index);
                                updateLocalData('about', { details: newDetails });
                              }}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextInput
                              label="Title"
                              value={detail.title || ''}
                              onChange={(value) => {
                                const newDetails = [...(localData.about?.details || [])];
                                newDetails[index] = { ...newDetails[index], title: value };
                                updateLocalData('about', { details: newDetails });
                              }}
                              placeholder="e.g., Languages"
                            />
                            <TextInput
                              label="Description"
                              value={detail.description || ''}
                              onChange={(value) => {
                                const newDetails = [...(localData.about?.details || [])];
                                newDetails[index] = { ...newDetails[index], description: value };
                                updateLocalData('about', { details: newDetails });
                              }}
                              placeholder="e.g., English, Spanish"
                            />
                          </div>
                          <div className="mt-2 text-sm text-gray-400">
                            Icons are automatically assigned based on the title
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <ImageUpload
                    label="CV/Resume (PDF)"
                    value={localData.resume?.cvUrl || ''}
                    section="resume"
                    field="cvUrl"
                    path={`resume/cv_${Date.now()}.pdf`}
                    accept="application/pdf"
                    uploading={resumeCvUploading}
                    uploadProgress={resumeCvProgress}
                    onFileUpload={(file, path, section, field) => handleFileUpload(file, path, section, field, 'resumeCv')}
                  />
                  <TextInput
                    label="Resume Section Title"
                    value={localData.resume?.title || ''}
                    onChange={(value) => updateLocalData('resume', { ...localData.resume, title: value })}
                    placeholder="Download My Resume"
                  />
                  <TextInput
                    label="Resume Section Subtitle"
                    value={localData.resume?.subtitle || ''}
                    onChange={(value) => updateLocalData('resume', { ...localData.resume, subtitle: value })}
                    placeholder="Get a copy of my professional CV"
                  />
                  <TextInput
                    label="Resume Section Description"
                    value={localData.resume?.description || ''}
                    onChange={(value) => updateLocalData('resume', { ...localData.resume, description: value })}
                    placeholder="Download my resume to learn more about my experience, skills, and qualifications."
                    multiline
                  />
                  <TextInput
                    label="Download Button Text"
                    value={localData.resume?.buttonText || ''}
                    onChange={(value) => updateLocalData('resume', { ...localData.resume, buttonText: value })}
                    placeholder="Download CV"
                  />
                </div>
              )}

              {activeTab === 'skills' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-shrink-0">
                      {renderTabIcon('⚡')}
                    </div>
                    <h2 className="text-2xl font-bold text-white">Skills</h2>
                  </div>

                  {/* Add New Category Button */}
                  <div className="mb-6">
                    <button
                      onClick={() => {
                        const newCategories = [...(localData.skills?.categories || []), {
                          title: '',
                          skills: [''],
                          icon: '⭐'
                        }];
                        updateLocalData('skills', { categories: newCategories });
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <span>+</span>
                      <span>Add Skill Category</span>
                    </button>
                  </div>

                  {/* Dynamic Skill Categories */}
                  <div className="space-y-6">
                    {(localData.skills?.categories || []).map((category: any, categoryIndex: number) => (
                      <div key={categoryIndex} className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Category #{categoryIndex + 1}</h3>
                          <button
                            onClick={() => {
                              const newCategories = (localData.skills?.categories || []).filter((_: any, i: number) => i !== categoryIndex);
                              updateLocalData('skills', { categories: newCategories });
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                          >
                            Remove Category
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <TextInput
                            label="Category Title"
                            value={category.title || ''}
                            onChange={(value) => {
                              const newCategories = [...(localData.skills?.categories || [])];
                              newCategories[categoryIndex] = { ...newCategories[categoryIndex], title: value };
                              updateLocalData('skills', { categories: newCategories });
                            }}
                            placeholder="e.g., Frontend Development"
                          />
                          <TextInput
                            label="Icon (Emoji)"
                            value={category.icon || ''}
                            onChange={(value) => {
                              const newCategories = [...(localData.skills?.categories || [])];
                              newCategories[categoryIndex] = { ...newCategories[categoryIndex], icon: value };
                              updateLocalData('skills', { categories: newCategories });
                            }}
                            placeholder="💻"
                          />
                        </div>

                        {/* Skills within this category */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-medium">Skills</h4>
                            <button
                              onClick={() => {
                                const newCategories = [...(localData.skills?.categories || [])];
                                const newSkills = [...(newCategories[categoryIndex].skills || []), ''];
                                newCategories[categoryIndex] = { ...newCategories[categoryIndex], skills: newSkills };
                                updateLocalData('skills', { categories: newCategories });
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                            >
                              + Add Skill
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(category.skills || []).map((skill: string, skillIndex: number) => (
                              <div key={skillIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={skill}
                                  onChange={(e) => {
                                    const newCategories = [...(localData.skills?.categories || [])];
                                    const newSkills = [...(newCategories[categoryIndex].skills || [])];
                                    newSkills[skillIndex] = e.target.value;
                                    newCategories[categoryIndex] = { ...newCategories[categoryIndex], skills: newSkills };
                                    updateLocalData('skills', { categories: newCategories });
                                  }}
                                  placeholder="e.g., React"
                                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  onClick={() => {
                                    const newCategories = [...(localData.skills?.categories || [])];
                                    const newSkills = (newCategories[categoryIndex].skills || []).filter((_: string, i: number) => i !== skillIndex);
                                    newCategories[categoryIndex] = { ...newCategories[categoryIndex], skills: newSkills };
                                    updateLocalData('skills', { categories: newCategories });
                                  }}
                                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                  disabled={(category.skills || []).length <= 1}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'services' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-shrink-0">
                      {renderTabIcon('🛠️')}
                    </div>
                    <h2 className="text-2xl font-bold text-white">Services</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Service 1</h3>
                      <TextInput
                        label="Title"
                        value={localData.services?.[0]?.title || ''}
                        onChange={(value) => {
                          const services = [...(localData.services || [])];
                          services[0] = { ...services[0], title: value };
                          updateLocalData('services', services);
                        }}
                        placeholder="Web Development"
                      />
                      <TextInput
                        label="Description"
                        value={localData.services?.[0]?.description || ''}
                        onChange={(value) => {
                          const services = [...(localData.services || [])];
                          services[0] = { ...services[0], description: value };
                          updateLocalData('services', services);
                        }}
                        placeholder="Build modern web applications"
                        multiline
                      />
                      <TextInput
                        label="Icon"
                        value={localData.services?.[0]?.icon || ''}
                        onChange={(value) => {
                          const services = [...(localData.services || [])];
                          services[0] = { ...services[0], icon: value };
                          updateLocalData('services', services);
                        }}
                        placeholder="💻"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Service 2</h3>
                      <TextInput
                        label="Title"
                        value={localData.services?.[1]?.title || ''}
                        onChange={(value) => {
                          const services = [...(localData.services || [])];
                          services[1] = { ...services[1], title: value };
                          updateLocalData('services', services);
                        }}
                        placeholder="Mobile Development"
                      />
                      <TextInput
                        label="Description"
                        value={localData.services?.[1]?.description || ''}
                        onChange={(value) => {
                          const services = [...(localData.services || [])];
                          services[1] = { ...services[1], description: value };
                          updateLocalData('services', services);
                        }}
                        placeholder="Create native mobile apps"
                        multiline
                      />
                      <TextInput
                        label="Icon"
                        value={localData.services?.[1]?.icon || ''}
                        onChange={(value) => {
                          const services = [...(localData.services || [])];
                          services[1] = { ...services[1], icon: value };
                          updateLocalData('services', services);
                        }}
                        placeholder="📱"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Service 3</h3>
                      <TextInput
                        label="Title"
                        value={localData.services?.[2]?.title || ''}
                        onChange={(value) => {
                          const services = [...(localData.services || [])];
                          services[2] = { ...services[2], title: value };
                          updateLocalData('services', services);
                        }}
                        placeholder="UI/UX Design"
                      />
                      <TextInput
                        label="Description"
                        value={localData.services?.[2]?.description || ''}
                        onChange={(value) => {
                          const services = [...(localData.services || [])];
                          services[2] = { ...services[2], description: value };
                          updateLocalData('services', services);
                        }}
                        placeholder="Design beautiful user interfaces"
                        multiline
                      />
                      <TextInput
                        label="Icon"
                        value={localData.services?.[2]?.icon || ''}
                        onChange={(value) => {
                          const services = [...(localData.services || [])];
                          services[2] = { ...services[2], icon: value };
                          updateLocalData('services', services);
                        }}
                        placeholder="🎨"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {renderTabIcon('💼')}
                      </div>
                      <h2 className="text-2xl font-bold text-white">Projects</h2>
                    </div>
                    <button
                      onClick={() => {
                        const currentProjects = Array.isArray(localData.projects) ? localData.projects : [];
                        const newProject = {
                          title: '',
                          description: '',
                          technologies: [],
                          liveUrl: '',
                          githubUrl: '',
                          image: ''
                        };
                        const updatedProjects = [...currentProjects, newProject];
                        setLocalData((prev: any) => ({
                          ...prev,
                          projects: updatedProjects
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <span>+</span>
                      <span>Add Project</span>
                    </button>
                  </div>
                  <div className="space-y-8">
                    {(Array.isArray(localData.projects) ? localData.projects : []).map((project: any, index: number) => (
                      <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Project {index + 1}</h3>
                          <button
                            onClick={() => {
                              const projects = [...(localData.projects || [])];
                              projects.splice(index, 1);
                              setLocalData((prev: any) => ({
                                ...prev,
                                projects: projects
                              }));
                              setHasUnsavedChanges(true);
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                            disabled={(localData.projects || []).length <= 1}
                          >
                            ✕ Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <TextInput
                            label="Title"
                            value={project.title || ''}
                            onChange={(value) => {
                              const projects = [...(localData.projects || [])];
                              projects[index] = { ...projects[index], title: value };
                              setLocalData((prev: any) => ({
                                ...prev,
                                projects: projects
                              }));
                              setHasUnsavedChanges(true);
                            }}
                            placeholder="E-commerce Platform"
                          />
                          <TextInput
                            label="Technologies"
                            value={project.technologies?.join(', ') || ''}
                            onChange={(value) => {
                              const projects = [...(localData.projects || [])];
                              projects[index] = { ...projects[index], technologies: value.split(',').map((s: string) => s.trim()).filter((s: string) => s) };
                              setLocalData((prev: any) => ({
                                ...prev,
                                projects: projects
                              }));
                              setHasUnsavedChanges(true);
                            }}
                            placeholder="React, Node.js, MongoDB"
                          />
                          <TextInput
                            label="Live URL"
                            value={project.liveUrl || ''}
                            onChange={(value) => {
                              const projects = [...(localData.projects || [])];
                              projects[index] = { ...projects[index], liveUrl: value };
                              setLocalData((prev: any) => ({
                                ...prev,
                                projects: projects
                              }));
                              setHasUnsavedChanges(true);
                            }}
                            placeholder="https://example.com"
                          />
                          <TextInput
                            label="GitHub URL"
                            value={project.githubUrl || ''}
                            onChange={(value) => {
                              const projects = [...(localData.projects || [])];
                              projects[index] = { ...projects[index], githubUrl: value };
                              setLocalData((prev: any) => ({
                                ...prev,
                                projects: projects
                              }));
                              setHasUnsavedChanges(true);
                            }}
                            placeholder="https://github.com/user/repo"
                          />
                        </div>
                        <div className="mt-4">
                          <TextInput
                            label="Description"
                            value={project.description || ''}
                            onChange={(value) => {
                              const projects = [...(localData.projects || [])];
                              projects[index] = { ...projects[index], description: value };
                              setLocalData((prev: any) => ({
                                ...prev,
                                projects: projects
                              }));
                              setHasUnsavedChanges(true);
                            }}
                            placeholder="A full-featured online store"
                            multiline
                          />
                        </div>
                        <div className="mt-4">
                          <ImageUpload
                            label="Project Image"
                            value={project.image || ''}
                            section="projects"
                            field={`project_${index}_image`}
                            path={`projects/project${index + 1}_${Date.now()}.jpg`}
                            uploading={projectImageUploading}
                            uploadProgress={projectImageProgress}
                            onFileUpload={(file, path, section, field) => handleFileUpload(file, path, section, field, 'projectImage')}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'testimonials' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {renderTabIcon('💬')}
                      </div>
                      <h2 className="text-2xl font-bold text-white">Client Reviews</h2>
                    </div>
                    <button
                      onClick={() => {
                        const testimonials = [...(localData.testimonials?.testimonials || [])];
                        testimonials.push({
                          name: '',
                          position: '',
                          company: '',
                          content: '',
                          image: '',
                          rating: 5
                        });
                        updateLocalData('testimonials', {
                          ...localData.testimonials,
                          testimonials: testimonials
                        });
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Review</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {(localData.testimonials?.testimonials || []).map((testimonial: any, index: number) => (
                      <div key={index} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">Review {index + 1}</h3>
                          <button
                            onClick={() => {
                              const testimonials = [...(localData.testimonials?.testimonials || [])];
                              testimonials.splice(index, 1);
                              updateLocalData('testimonials', {
                                ...localData.testimonials,
                                testimonials: testimonials
                              });
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <TextInput
                            label="Client Name"
                            value={testimonial.name || ''}
                            onChange={(value) => {
                              const testimonials = [...(localData.testimonials?.testimonials || [])];
                              testimonials[index] = { ...testimonials[index], name: value };
                              updateLocalData('testimonials', {
                                ...localData.testimonials,
                                testimonials: testimonials
                              });
                            }}
                            placeholder="John Smith"
                          />
                          <TextInput
                            label="Position"
                            value={testimonial.position || ''}
                            onChange={(value) => {
                              const testimonials = [...(localData.testimonials?.testimonials || [])];
                              testimonials[index] = { ...testimonials[index], position: value };
                              updateLocalData('testimonials', {
                                ...localData.testimonials,
                                testimonials: testimonials
                              });
                            }}
                            placeholder="CEO"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <TextInput
                            label="Company"
                            value={testimonial.company || ''}
                            onChange={(value) => {
                              const testimonials = [...(localData.testimonials?.testimonials || [])];
                              testimonials[index] = { ...testimonials[index], company: value };
                              updateLocalData('testimonials', {
                                ...localData.testimonials,
                                testimonials: testimonials
                              });
                            }}
                            placeholder="Tech Corp"
                          />
                          <SelectInput
                            label="Rating"
                            value={testimonial.rating?.toString() || '5'}
                            onChange={(value) => {
                              const testimonials = [...(localData.testimonials?.testimonials || [])];
                              testimonials[index] = { ...testimonials[index], rating: parseInt(value) };
                              updateLocalData('testimonials', {
                                ...localData.testimonials,
                                testimonials: testimonials
                              });
                            }}
                            options={[
                              { value: '5', label: '⭐⭐⭐⭐⭐ (5 stars)' },
                              { value: '4', label: '⭐⭐⭐⭐ (4 stars)' },
                              { value: '3', label: '⭐⭐⭐ (3 stars)' }
                            ]}
                          />
                        </div>

                        <div className="mb-4">
                          <TextInput
                            label="Review Content"
                            value={testimonial.content || ''}
                            onChange={(value) => {
                              const testimonials = [...(localData.testimonials?.testimonials || [])];
                              testimonials[index] = { ...testimonials[index], content: value };
                              updateLocalData('testimonials', {
                                ...localData.testimonials,
                                testimonials: testimonials
                              });
                            }}
                            placeholder="Amazing work! Highly recommend."
                            multiline
                          />
                        </div>

                        <ImageUpload
                          label="Client Photo"
                          value={testimonial.image || ''}
                          section="testimonials"
                          field={`testimonial_${index}_image`}
                          path={`testimonials/client${index + 1}_${Date.now()}.jpg`}
                          uploading={testimonialImageUploading}
                          uploadProgress={testimonialImageProgress}
                          onFileUpload={(file, path, section, field) => handleFileUpload(file, path, section, field, 'testimonialImage')}
                        />
                      </div>
                    ))}

                    {(localData.testimonials?.testimonials || []).length === 0 && (
                      <div className="text-center py-12 text-gray-400">
                        <div className="text-6xl mb-4">💬</div>
                        <p className="text-lg mb-4">No testimonials yet</p>
                        <p className="text-sm">Click "Add Review" to create your first client testimonial</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-shrink-0">
                      {renderTabIcon('📧')}
                    </div>
                    <h2 className="text-2xl font-bold text-white">Contact Information</h2>
                  </div>
                  <TextInput
                    label="Email Address"
                    value={localData.contact?.email || ''}
                    onChange={(value) => updateLocalData('contact', { ...localData.contact, email: value })}
                    placeholder="your.email@example.com"
                  />
                  <TextInput
                    label="Phone Number"
                    value={localData.contact?.phone || ''}
                    onChange={(value) => updateLocalData('contact', { ...localData.contact, phone: value })}
                    placeholder="+1 (555) 123-4567"
                  />
                  <TextInput
                    label="Address"
                    value={localData.contact?.address || ''}
                    onChange={(value) => updateLocalData('contact', { ...localData.contact, address: value })}
                    placeholder="City, State, Country"
                  />
                  <TextInput
                    label="Contact Form Title"
                    value={localData.contact?.title || ''}
                    onChange={(value) => updateLocalData('contact', { ...localData.contact, title: value })}
                    placeholder="Get In Touch"
                  />
                  <TextInput
                    label="Contact Form Description"
                    value={localData.contact?.description || ''}
                    onChange={(value) => updateLocalData('contact', { ...localData.contact, description: value })}
                    placeholder="I'd love to hear from you!"
                    multiline
                  />
                </div>
              )}



              {activeTab === 'navigation' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-shrink-0">
                      {renderTabIcon('🧭')}
                    </div>
                    <h2 className="text-2xl font-bold text-white">Navigation & Branding</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Site Branding</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput
                          label="Site Title"
                          value={localData.navigation?.siteTitle || ''}
                          onChange={(value) => updateLocalData('navigation', { ...localData.navigation, siteTitle: value })}
                          placeholder="Your Name or Brand"
                        />
                        <TextInput
                          label="Site Subtitle (Optional)"
                          value={localData.navigation?.siteSubtitle || ''}
                          onChange={(value) => updateLocalData('navigation', { ...localData.navigation, siteSubtitle: value })}
                          placeholder="Your tagline or profession"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Logo & Images</h3>
                      <ImageUpload
                        label="Site Logo"
                        value={localData.navigation?.logo || ''}
                        section="navigation"
                        field="logo"
                        path={`navigation/logo_${Date.now()}.png`}
                        uploading={logoUploading}
                        uploadProgress={logoProgress}
                        onFileUpload={(file, path, section, field) => handleFileUpload(file, path, section, field, 'logo')}
                      />
                      <p className="text-sm text-gray-400 mt-2">
                        Upload a logo image (PNG, JPG, or SVG recommended). The logo will appear in the navigation bar.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Navigation Menu</h3>
                      <div className="space-y-3">
                        {(localData.navigation?.menuItems || []).map((item: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <TextInput
                                label="Label"
                                value={item.label || ''}
                                onChange={(value) => {
                                  const menuItems = [...(localData.navigation?.menuItems || [])];
                                  menuItems[index] = { ...menuItems[index], label: value };
                                  updateLocalData('navigation', { ...localData.navigation, menuItems });
                                }}
                                placeholder="Menu Item"
                              />
                              <TextInput
                                label="Section ID"
                                value={item.id || ''}
                                onChange={(value) => {
                                  const menuItems = [...(localData.navigation?.menuItems || [])];
                                  menuItems[index] = { ...menuItems[index], id: value };
                                  updateLocalData('navigation', { ...localData.navigation, menuItems });
                                }}
                                placeholder="section-id"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const menuItems = (localData.navigation?.menuItems || []).filter((_: any, i: number) => i !== index);
                                updateLocalData('navigation', { ...localData.navigation, menuItems });
                              }}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const menuItems = [...(localData.navigation?.menuItems || []), { label: '', id: '' }];
                            updateLocalData('navigation', { ...localData.navigation, menuItems });
                          }}
                          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <span>+</span>
                          <span>Add Menu Item</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'theme' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-shrink-0">
                      {renderTabIcon('🎨')}
                    </div>
                    <h2 className="text-2xl font-bold text-white">Design & Colors</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <ColorPicker
                      label="Primary Color"
                      value={localData.theme?.primaryColor || '#6366f1'}
                      onChange={(color) => updateLocalData('theme', { ...localData.theme, primaryColor: color })}
                    />
                    <ColorPicker
                      label="Secondary Color"
                      value={localData.theme?.secondaryColor || '#8b5cf6'}
                      onChange={(color) => updateLocalData('theme', { ...localData.theme, secondaryColor: color })}
                    />
                    <ColorPicker
                      label="Accent Color"
                      value={localData.theme?.accentColor || '#06b6d4'}
                      onChange={(color) => updateLocalData('theme', { ...localData.theme, accentColor: color })}
                    />
                    <ColorPicker
                      label="Background Color"
                      value={localData.theme?.backgroundColor || '#111827'}
                      onChange={(color) => updateLocalData('theme', { ...localData.theme, backgroundColor: color })}
                    />
                  </div>
                  <div className="mt-6 space-y-4">
                    <SelectInput
                      label="Font Style"
                      value={localData.theme?.fontFamily || 'Inter, sans-serif'}
                      onChange={(value) => updateLocalData('theme', { ...localData.theme, fontFamily: value })}
                      options={[
                        { value: 'Inter, sans-serif', label: 'Inter (Modern)' },
                        { value: 'Roboto, sans-serif', label: 'Roboto (Clean)' },
                        { value: 'Open Sans, sans-serif', label: 'Open Sans (Friendly)' },
                        { value: 'Poppins, sans-serif', label: 'Poppins (Bold)' }
                      ]}
                    />
                    <SelectInput
                      label="Border Style"
                      value={localData.theme?.borderRadius || '0.5rem'}
                      onChange={(value) => updateLocalData('theme', { ...localData.theme, borderRadius: value })}
                      options={[
                        { value: '0rem', label: 'Sharp Corners' },
                        { value: '0.25rem', label: 'Small Rounded' },
                        { value: '0.5rem', label: 'Medium Rounded' },
                        { value: '1rem', label: 'Very Rounded' }
                      ]}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'socials' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex-shrink-0">
                      {renderTabIcon('🔗')}
                    </div>
                    <h2 className="text-2xl font-bold text-white">Social Media Links</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Display Settings */}
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Display Settings</h3>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="showSocialLinks"
                          checked={localData.footer?.showSocialLinks || false}
                          onChange={(e) => updateLocalData('footer', { ...localData.footer, showSocialLinks: e.target.checked })}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label htmlFor="showSocialLinks" className="text-gray-300">
                          Show social links in footer
                        </label>
                      </div>
                    </div>

                    {/* Social Platforms */}
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                      <h3 className="text-lg font-semibold text-white mb-4">Social Platforms</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { key: 'github', label: 'GitHub', color: '#333', icon: 'github' },
                          { key: 'linkedin', label: 'LinkedIn', color: '#0077b5', icon: 'linkedin' },
                          { key: 'instagram', label: 'Instagram', color: '#E4405F', icon: 'instagram' },
                          { key: 'facebook', label: 'Facebook', color: '#1877F2', icon: 'facebook' },
                          { key: 'twitter', label: 'Twitter', color: '#1DA1F2', icon: 'twitter' },
                          { key: 'youtube', label: 'YouTube', color: '#FF0000', icon: 'youtube' },
                          { key: 'discord', label: 'Discord', color: '#5865F2', icon: 'discord' },
                          { key: 'tiktok', label: 'TikTok', color: '#000000', icon: 'tiktok' },
                          { key: 'medium', label: 'Medium', color: '#000000', icon: 'medium' }
                        ].map((platform) => (
                          <div key={platform.key} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                            <div className="flex items-center space-x-3 mb-3">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: platform.color }}
                              >
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  {platform.icon === 'github' && (
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                  )}
                                  {platform.icon === 'linkedin' && (
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                  )}
                                  {platform.icon === 'instagram' && (
                                    <path d="M12.017 0C8.396 0 7.996.014 6.797.067 5.609.12 4.782.283 4.086.547c-.713.27-1.32.637-1.92 1.237C1.467 2.384 1.1 2.99.83 3.703c-.264.706-.427 1.533-.48 2.721C.3 7.623.286 8.023.286 11.644c0 3.621.014 4.021.067 5.22.053 1.199.218 2.026.482 2.722.27.713.637 1.32 1.237 1.92.6.6 1.207.967 1.92 1.237.706.264 1.533.427 2.721.48 1.199.053 1.599.067 5.22.067 3.621 0 4.021-.014 5.22-.067 1.199-.053 2.026-.218 2.722-.482.713-.27 1.32-.637 1.92-1.237.6-.6.967-1.207 1.237-1.92.264-.706.427-1.533.48-2.721.053-1.199.067-1.599.067-5.22 0-3.621-.014-4.021-.067-5.22-.053-1.199-.218-2.026-.482-2.722-.27-.713-.637-1.32-1.237-1.92-.6-.6-1.207-.967-1.92-1.237C15.231.283 14.404.12 13.216.067 12.017.014 11.617 0 8.017 0h4zM11.994 2.158c3.508 0 6.276 2.768 6.276 6.276s-2.768 6.276-6.276 6.276-6.276-2.768-6.276-6.276 2.768-6.276 6.276-6.276zm0 10.412c2.258 0 4.086-1.828 4.086-4.086s-1.828-4.086-4.086-4.086-4.086 1.828-4.086 4.086 1.828 4.086 4.086 4.086zm6.23-11.766c-.825 0-1.492.667-1.492 1.492s.667 1.492 1.492 1.492 1.492-.667 1.492-1.492-.667-1.492-1.492-1.492z"/>
                                  )}
                                  {platform.icon === 'facebook' && (
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                  )}
                                  {platform.icon === 'twitter' && (
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                  )}
                                  {platform.icon === 'youtube' && (
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                  )}
                                  {platform.icon === 'discord' && (
                                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                                  )}
                                  {platform.icon === 'tiktok' && (
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                  )}
                                  {platform.icon === 'medium' && (
                                    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                                  )}
                                </svg>
                              </div>
                              <span className="text-white font-medium">{platform.label}</span>
                            </div>
                            <input
                              type="url"
                              placeholder={`Enter ${platform.label} URL`}
                              value={localData.socials?.[platform.key]?.url || ''}
                              onChange={(e) => {
                                const currentSocials = localData.socials || {};
                                updateLocalData('socials', {
                                  ...currentSocials,
                                  [platform.key]: {
                                    ...currentSocials[platform.key],
                                    url: e.target.value,
                                    label: platform.label
                                  }
                                });
                              }}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {saving && (
                <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    <span>Saving changes...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;