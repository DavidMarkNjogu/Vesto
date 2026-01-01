// Image optimization utilities
export const optimizeImage = async (file, maxWidth = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to optimize image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const removeBackground = async (imageBlob) => {
  // For MVP, we'll use a placeholder
  // In production, integrate with remove.bg API or similar
  // Free alternative: https://www.remove.bg/api
  
  try {
    // This is a placeholder - replace with actual API call
    const formData = new FormData();
    formData.append('image_file', imageBlob);
    
    // Example API call (requires API key)
    // const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    //   method: 'POST',
    //   headers: {
    //     'X-Api-Key': 'YOUR_API_KEY'
    //   },
    //   body: formData
    // });
    
    // For now, return original image
    return imageBlob;
  } catch (error) {
    console.error('Background removal failed:', error);
    return imageBlob;
  }
};

export const convertToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const validateImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid image type. Please use JPEG, PNG, or WebP.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image too large. Maximum size is 10MB.' };
  }
  
  return { valid: true };
};


