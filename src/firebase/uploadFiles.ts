import { uploadFile } from './storage';
import { setData } from './database';

// Temporary script to upload the provided image and CV
export const uploadProvidedFiles = async () => {
  try {
    console.log('Starting upload of provided files...');

    // Read the profile image file
    const imageResponse = await fetch('/profile.jpg');
    if (!imageResponse.ok) {
      throw new Error('Could not read image file');
    }
    const imageBlob = await imageResponse.blob();
    const imageFile = new File([imageBlob], 'profile.jpg', { type: 'image/jpeg' });

    // Upload the image
    console.log('Uploading profile image...');
    const imageKey = await uploadFile('hero/profile_image.jpg', imageFile);
    console.log('Profile image uploaded with key:', imageKey);

    // Update hero section with the image key
    await setData('siteConfig/hero', {
      profileImage: imageKey
    });
    console.log('Hero section updated with profile image');

    // Read the CV file
    const cvResponse = await fetch('/NUNANA\'S CV.pdf');
    if (!cvResponse.ok) {
      throw new Error('Could not read CV file');
    }
    const cvBlob = await cvResponse.blob();
    const cvFile = new File([cvBlob], 'NUNANA\'S CV.pdf', { type: 'application/pdf' });

    // Upload the CV
    console.log('Uploading CV...');
    const cvKey = await uploadFile('resume/cv.pdf', cvFile);
    console.log('CV uploaded with key:', cvKey);

    // Update resume section with the CV key
    await setData('siteConfig/resume', {
      cvUrl: cvKey
    });
    console.log('Resume section updated with CV');

    console.log('All files uploaded successfully!');
    alert('Files uploaded successfully! Refresh the page to see the changes.');

  } catch (error) {
    console.error('Error uploading files:', error);
    alert('Error uploading files: ' + (error as Error).message);
  }
};