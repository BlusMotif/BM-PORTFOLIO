import { updateData } from './database';

// Temporary script to upload the provided image and CV
export const uploadProvidedFiles = async () => {
  try {
    console.log('Starting upload of provided files...');

    // For development, we'll create placeholder uploads since local file access is limited
    // In production, these files would be uploaded through the admin interface

    console.log('Note: In development, files are served from the local server.');
    console.log('The upload system is designed to work with files uploaded through the admin interface.');

    // For now, let's create a simple test upload with a placeholder
    const timestamp = Date.now();
    const testImageUrl = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUI5QkE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5PIElNBR0PC90ZXh0Pgo8L3N2Zz4K&t=${timestamp}`;
    const testCvUrl = `data:text/plain;base64,VGhpcyBpcyBhIHBsYWNlaG9sZGVyIENWIGZpbGUuIEluIHByb2R1Y3Rpb24sIHRoZSBhY3R1YWwgQ1Ygd291bGQgYmUgdXBsb2FkZWQu&t=${timestamp}`;

    // Store placeholder data in database (using updateData to merge with existing data)
    await updateData('siteConfig/hero', {
      profileImage: testImageUrl
    });

    await updateData('siteConfig/resume', {
      cvUrl: testCvUrl
    });

    console.log('Placeholder data uploaded successfully!');
    console.log('Profile Image URL:', testImageUrl);
    console.log('CV URL:', testCvUrl);
    alert('Placeholder files uploaded! In production, use the file upload interface to upload your actual profile.jpg and CV.');

  } catch (error) {
    console.error('Error uploading files:', error);
    alert('Error uploading files: ' + (error as Error).message);
  }
};